import axiosInstance from './axios';

export const notificationAPI = {
  getNotifications: () => axiosInstance.get('/notifications/'),
  
  markAsRead: (notificationId) => 
    axiosInstance.post(`/notifications/${notificationId}/read/`),
  
  markAllAsRead: () => axiosInstance.post('/notifications/mark-all-read/'),
};