import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../notifications/NotificationBell';
import ProfileModal from '../profile/ProfileModal';
import { MessageCircle, LogOut, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm transition-shadow duration-300 hover:shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/chat" 
              className="flex items-center gap-2 group transition-transform duration-200 hover:scale-105"
            >
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg group-hover:shadow-lg group-hover:shadow-primary-200 transition-all duration-200">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                ChatApp
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <NotificationBell />

              <div className="relative group">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 group-hover:shadow-md"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm group-hover:scale-110 transition-transform duration-200">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                    {user?.username}
                  </span>
                </button>
              </div>

              <button
                onClick={logout}
                className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 animate-spin" style={{ animationDuration: '0.3s' }} />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white animate-slide-down">
            <div className="px-4 py-4 space-y-2">
              <button
                onClick={() => {
                  setShowProfileModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 active:bg-primary-100 transition-all duration-200"
              >
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Profile</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 active:bg-red-100 text-red-600 transition-all duration-200 font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </>
  );
};

export default Navbar;