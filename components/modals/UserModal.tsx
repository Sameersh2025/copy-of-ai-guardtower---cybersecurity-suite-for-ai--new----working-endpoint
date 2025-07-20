
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import Card from '../ui/Card';
import { X } from 'lucide-react';

interface UserModalProps {
  onClose: () => void;
  onSave: (user: Omit<User, 'id' | 'lastActive'>, id?: string) => void;
  userToEdit: User | null;
  showRoleField?: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ onClose, onSave, userToEdit, showRoleField = true }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Developer');

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setRole(userToEdit.role);
    }
  }, [userToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      // In a real app, use better validation feedback
      alert('Name and Email are required.');
      return;
    }
    onSave({ name, email, role }, userToEdit?.id);
  };

  const isEditing = !!userToEdit;
  const roles: UserRole[] = ['Admin', 'Developer', 'Viewer'];

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <Card className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {isEditing ? 'Edit User' : 'Invite New User'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Jane Doe"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="jane.doe@example.com"
                required
              />
            </div>
            {showRoleField && (
                <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                </div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
              >
                {isEditing ? 'Save Changes' : 'Invite User'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UserModal;