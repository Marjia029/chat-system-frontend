import axiosInstance from './axios';

export const chatAPI = {
  // sendMessage is removed because you now send everything via WebSocket
  
  getConversations: () => axiosInstance.get('/chat/conversations/'),
  
  getMessageHistory: (userId) => axiosInstance.get(`/chat/history/${userId}/`),
};