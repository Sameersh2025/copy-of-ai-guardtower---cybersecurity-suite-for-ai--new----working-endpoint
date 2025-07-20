
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAppContext } from '../context/AppContext';
import { Mail, ShieldCheck, Calendar, Edit } from 'lucide-react';
import UserModal from '../components/modals/UserModal';
import { User } from '../types';
import { Navigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { currentUser, updateUser } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!currentUser) {
    // This should not happen if routing is correct, but it's a good safeguard.
    return <Navigate to="/login" replace />;
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Badge color="red">Admin</Badge>;
      case 'Developer':
        return <Badge color="blue">Developer</Badge>
      default:
        return <Badge color="gray">Viewer</Badge>;
    }
  };

  const handleSaveProfile = (userData: Omit<User, 'id' | 'lastActive'>) => {
    if (!currentUser) return;
    updateUser(currentUser.id, userData);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <Card className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center sm:flex-row sm:items-start text-center sm:text-left">
            <img
              className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-700 mb-4 sm:mb-0 sm:mr-6"
              src={`https://i.pravatar.cc/150?u=${currentUser.id}`}
              alt={`${currentUser.name}'s avatar`}
            />
            <div className="flex-grow">
              <div className="flex items-center justify-center sm:justify-start space-x-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h2>
                {getRoleBadge(currentUser.role)}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{currentUser.email}</p>
              
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                 <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Mail className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-500" />
                    <span>{currentUser.email}</span>
                 </div>
                 <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <ShieldCheck className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-500" />
                    <span>Role: {currentUser.role}</span>
                 </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Calendar className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-500" />
                    <span>Last Active: {currentUser.lastActive}</span>
                 </div>
              </div>

              <div className="mt-6 flex justify-center sm:justify-end">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                  </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {isModalOpen && currentUser && (
        <UserModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProfile}
          userToEdit={currentUser}
          showRoleField={false} // User cannot edit their own role from this page
        />
      )}
    </>
  );
};

export default Profile;