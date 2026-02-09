import React, { createContext, useEffect, useRef, useState, useCallback } from 'react';
import { getAccessToken } from '../utils/storage';
import toast from 'react-hot-toast';

export const WebSocketContext = createContext();

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/chat/';

export const WebSocketProvider = ({ children, isAuthenticated }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!isAuthenticated) return;

    const token = getAccessToken();
    if (!token) return;

    try {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat_message') {
          const message = data.message;
          
          // For the sender, use recipient_id as the key
          // For the recipient, use sender_id as the key
          // This ensures messages show up in the correct conversation
          
          setMessages((prev) => {
            // Determine which user this conversation is with
            let conversationUserId;
            
            // If we sent this message, the conversation is with the recipient
            if (message.sender_id === currentUserId) {
              conversationUserId = message.recipient_id;
            } else {
              // If we received this message, the conversation is with the sender
              conversationUserId = message.sender_id;
            }
            
            const existingMessages = prev[conversationUserId] || [];
            
            // Check if message already exists (prevent duplicates)
            const messageExists = existingMessages.some(m => m.id === message.id);
            
            if (messageExists) {
              return prev;
            }
            
            return {
              ...prev,
              [conversationUserId]: [...existingMessages, message],
            };
          });
        } else if (data.type === 'notification') {
          setNotifications((prev) => {
            // Check if notification already exists
            const exists = prev.some(n => n.id === data.notification.id);
            if (exists) return prev;
            
            return [data.notification, ...prev];
          });
          
          // Show toast notification
          toast.success(data.notification.message, {
            duration: 3000,
          });
        } else if (data.type === 'open_chat_ack') {
          console.log('Chat opened with user:', data.chat_with);
        } else if (data.type === 'close_chat_ack') {
          console.log('Chat closed with user:', data.chat_with);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [isAuthenticated, currentUserId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const sendMessage = useCallback((arg1, arg2) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // NEW LOGIC: Check if arg1 is a full message object (used for file uploads)
      if (typeof arg1 === 'object' && arg1 !== null && arg1.type) {
        wsRef.current.send(JSON.stringify(arg1));
      } else {
        // OLD LOGIC: Standard text message (recipientId, content)
        wsRef.current.send(JSON.stringify({
          type: 'chat_message',
          recipient_id: arg1,
          content: arg2,
        }));
      }
    }
  }, []);

  const openChat = useCallback((userId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'open_chat',
        chat_with: userId,
      }));
    }
  }, []);

  const closeChat = useCallback((userId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'close_chat',
        chat_with: userId,
      }));
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUserId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, currentUserId]);

  const value = {
    isConnected,
    messages,
    setMessages,
    notifications,
    setNotifications,
    sendMessage,
    openChat,
    closeChat,
    setCurrentUserId,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};