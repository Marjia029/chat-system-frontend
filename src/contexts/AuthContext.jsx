import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { setTokens, clearTokens, getUser, setUser as saveUser, isAuthenticated as checkAuth } from '../utils/storage';
import { cryptoUtils } from '../utils/crypto';
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

      // Fetch user profile to get ID and public key status
      const profileResponse = await authAPI.getProfile();
      let userData = profileResponse.data;

      // E2EE: Key Persistence Handling
      // 1. Check if we have a pending key from registration (waiting for ID)
      const pendingKey = localStorage.getItem(`pending_secretKey_${email}`);

      if (pendingKey) {
        // We just registered on this device, so we save the key permanently now that we have the ID
        localStorage.setItem(`secretKey_${userData.id}`, pendingKey);
        localStorage.removeItem(`pending_secretKey_${email}`); // Cleanup
      }

      // 2. Check if we have the valid key for this user
      const currentKey = localStorage.getItem(`secretKey_${userData.id}`);

      if (!currentKey && userData.public_key) {
        // WARN: User has a public key on server but no private key on this device.
        // They cannot decrypt old messages. 
        // We do NOT overwrite the key here automatically, as that destroys their identity.
        console.warn("Private key missing for this device. Old messages will be unreadable.");
        toast("New device detected. Previous encrypted messages may be unreadable.", { icon: '⚠️' });
      }
      else if (!currentKey && !userData.public_key) {
        // Rare edge case: User has no keys at all (legacy account?). Generate now.
        const keys = await cryptoUtils.generateKeyPair();
        localStorage.setItem(`secretKey_${userData.id}`, keys.secretKey);
        await authAPI.updateProfile({ public_key: keys.publicKey });
        userData.public_key = keys.publicKey;
      }

      setUser(userData);
      saveUser(userData);
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
      // 1. Generate Key Pair (Client-Side)
      const keys = await cryptoUtils.generateKeyPair();

      // 2. Attach Public Key to Registration Data
      const registrationData = {
        ...data,
        public_key: keys.publicKey
      };

      // 3. Send to Backend
      await authAPI.register(registrationData);

      // 4. Save Private Key Temporarily
      // We don't have the User ID yet, so we map it to the email.
      // We will "adopt" this key into the User ID slot during the first Login.
      localStorage.setItem(`pending_secretKey_${data.email}`, keys.secretKey);

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