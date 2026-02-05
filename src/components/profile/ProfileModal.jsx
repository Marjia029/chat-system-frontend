import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { X, User, Mail, Phone, MapPin, Globe, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileModal = ({ onClose }) => {
  const { user, updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    bio: user?.profile?.bio || '',
    phone_number: user?.profile?.phone_number || '',
    location: user?.profile?.location || '',
    website: user?.profile?.website || '',
    date_of_birth: user?.profile?.date_of_birth || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateUserProfile(formData);
    setLoading(false);
    
    if (result.success) {
      setEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{user?.username}</h3>
            <p className="text-gray-600">{user?.email}</p>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4" />
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!editing}
                className="input-field resize-none"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={!editing}
                className="input-field"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={!editing}
                className="input-field"
                placeholder="New York, USA"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Globe className="w-4 h-4" />
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                disabled={!editing}
                className="input-field"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4" />
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                disabled={!editing}
                className="input-field"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {editing ? (
                <>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        bio: user?.profile?.bio || '',
                        phone_number: user?.profile?.phone_number || '',
                        location: user?.profile?.location || '',
                        website: user?.profile?.website || '',
                        date_of_birth: user?.profile?.date_of_birth || '',
                      });
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="btn-primary w-full"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;