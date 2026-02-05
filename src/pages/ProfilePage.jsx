import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import { User, Mail, Phone, MapPin, Globe, Calendar } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="card">
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{user?.username}</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Information
              </h2>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bio</p>
                    <p className="text-gray-900">
                      {user?.profile?.bio || 'No bio provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">
                      {user?.profile?.phone_number || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-gray-900">
                      {user?.profile?.location || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Website</p>
                    <p className="text-gray-900">
                      {user?.profile?.website || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Date of Birth
                    </p>
                    <p className="text-gray-900">
                      {user?.profile?.date_of_birth || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;