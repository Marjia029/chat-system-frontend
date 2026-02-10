import axiosInstance from './axios';

export const chatAPI = {
  // sendMessage is removed because you now send everything via WebSocket
  
  getConversations: (page = 1, search = '') => 
    axiosInstance.get(`/chat/conversations/?page=${page}&search=${search}`),
  
  getMessageHistory: (userId) => axiosInstance.get(`/chat/history/${userId}/`),
};