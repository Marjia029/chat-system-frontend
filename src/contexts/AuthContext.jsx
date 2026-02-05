import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { setTokens, clearTokens, getUser, setUser as saveUser, isAuthenticated as checkAuth } from '../utils/storage';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());

  useEffect(() => {
    // Check if user is authenticated on mount
    const initAuth = async () => {
      if (checkAuth()) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
          saveUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access, refresh } = response.data;
      
      setTokens(access, refresh);
      
      // Fetch user profile
      const profileResponse = await authAPI.getProfile();
      setUser(profileResponse.data);
      saveUser(profileResponse.data);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (data) => {
    try {
      await authAPI.register(data);
      toast.success('Registration successful! Please check your email for OTP.');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.email?.[0] || 
                          error.response?.data?.username?.[0] ||
                          'Registration failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const verifyOTP = async (email, otp, purpose = 'registration') => {
    try {
      await authAPI.verifyOTP({ email, otp, purpose });
      toast.success('Email verified successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'OTP verification failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resendOTP = async (email, purpose = 'registration') => {
    try {
      await authAPI.resendOTP({ email, purpose });
      toast.success('OTP has been resent to your email');
      return { success: true };
    } catch (error) {
      toast.error('Failed to resend OTP');
      return { success: false };
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  const updateUserProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data.user);
      saveUser(response.data.user);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      toast.error('Failed to update profile');
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    verifyOTP,
    resendOTP,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};