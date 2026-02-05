import axiosInstance from './axios';

export const authAPI = {
  register: (data) => axiosInstance.post('/accounts/register/', data),
  
  verifyOTP: (data) => axiosInstance.post('/accounts/verify-otp/', data),
  
  resendOTP: (data) => axiosInstance.post('/accounts/resend-otp/', data),
  
  login: (data) => axiosInstance.post('/accounts/login/', data),
  
  refreshToken: (refreshToken) => 
    axiosInstance.post('/accounts/token/refresh/', { refresh: refreshToken }),
  
  passwordResetRequest: (email) => 
    axiosInstance.post('/accounts/password-reset/', { email }),
  
  passwordResetConfirm: (data) => 
    axiosInstance.post('/accounts/password-reset/confirm/', data),
  
  getProfile: () => axiosInstance.get('/accounts/profile/'),
  
  updateProfile: (data) => axiosInstance.patch('/accounts/profile/update/', data),
  
  getUsers: () => axiosInstance.get('/accounts/users/'),
};