import React from 'react';
import { EditProfileForm } from '../components/profile/EditProfileForm';

const EditProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-semibold mb-6">Profil bearbeiten</h1>
          <EditProfileForm />
        </div>
      </main>
    </div>
  );
};

export default EditProfilePage;
