import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">User Profile</h1>
        <div className="bg-dark-800 rounded-lg p-8">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-xl font-semibold">
                {user?.username?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.username || 'User'}</h2>
              <p className="text-gray-400">@{user?.username}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-lg">Profile management coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;