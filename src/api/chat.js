import axiosInstance from './axios';

export const chatAPI = {
  sendMessage: (data) => axiosInstance.post('/chat/send/', data),
  
  getConversations: () => axiosInstance.get('/chat/conversations/'),
  
  getMessageHistory: (userId) => axiosInstance.get(`/chat/history/${userId}/`),
};