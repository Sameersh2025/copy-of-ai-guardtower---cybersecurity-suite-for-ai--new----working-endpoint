
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { User, UserRole } from '../types';
import { UserPlus, ShieldCheck, Code, Eye, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import UserModal from '../components/modals/UserModal';

const AccessControl: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const handleInviteClick = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setOpenActionMenu(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser(userId);
    }
    setOpenActionMenu(null);
  };

  const handleSaveUser = (userData: Omit<User, 'id' | 'lastActive'>, userId?: string) => {
    if (userId) {
      updateUser(userId, userData);
    } else {
      addUser(userData);
    }
    handleCloseModal();
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };


  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return <Badge color="red">Admin</Badge>;
      case 'Developer':
        return <Badge color="blue">Developer</Badge>;
      case 'Viewer':
        return <Badge color="gray">Viewer</Badge>;
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return <ShieldCheck className="w-5 h-5 text-red-400" />;
      case 'Developer':
        return <Code className="w-5 h-5 text-blue-400" />;
      case 'Viewer':
        return <Eye className="w-5 h-5 text-gray-400" />;
    }
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Access Control</h1>
          <button 
            onClick={handleInviteClick}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Invite User
          </button>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Members</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 sm:pl-6">User</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Last Active</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900/50">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full" src={`https://i.pravatar.cc/40?u=${user.id}`} alt={`${user.name}'s avatar`} />
                        <div className="ml-4">
                          <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <span>{getRoleBadge(user.role)}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{user.lastActive}</td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                       <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenActionMenu(openActionMenu === user.id ? null : user.id)}
                            className="p-1 rounded-full text-gray-400 hover:text-gray-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-blue-500"
                          >
                            <span className="sr-only">Open options for {user.name}</span>
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {openActionMenu === user.id && (
                             <div
                              className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10"
                              role="menu"
                              aria-orientation="vertical"
                            >
                              <div className="py-1" role="none">
                                <button
                                  onClick={() => handleEditClick(user)}
                                  className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white"
                                  role="menuitem"
                                >
                                  <Edit className="w-4 h-4 mr-3" />
                                  Edit User
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(user.id)}
                                  className="w-full text-left flex items-center px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-red-400 dark:hover:text-red-300"
                                  role="menuitem"
                                >
                                  <Trash2 className="w-4 h-4 mr-3" />
                                  Delete User
                                </button>
                              </div>
                            </div>
                          )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      {isModalOpen && (
        <UserModal
            onClose={handleCloseModal}
            onSave={handleSaveUser}
            userToEdit={editingUser}
        />
      )}
    </>
  );
};

export default AccessControl;