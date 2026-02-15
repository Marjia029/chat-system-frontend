import React, { createContext, useEffect, useRef, useState, useCallback } from 'react';
import { getAccessToken, getUser } from '../utils/storage';
import { cryptoUtils } from '../utils/crypto';
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

  // Helper: Decrypt a message safely
  const processIncomingMessage = useCallback((message) => {
    // If not encrypted or no content, return as is
    if (!message.is_encrypted || !message.content) return message;

    try {
      const currentUser = getUser();
      const storedSecretKey = localStorage.getItem(`secretKey_${currentUser.id}`);

      if (!storedSecretKey) return message;

      // Logic: If THEY sent it, we use THEIR public key (sender_public_key) + OUR secret key.
      // If WE sent it (echo), we handle that inside onmessage usually, but if we need to decrypt
      // an echo, we would need the recipient's public key (which might not be in the message payload).
      if (message.sender_id !== currentUser.id && message.sender_public_key) {
        const decrypted = cryptoUtils.decrypt(
          message.content,
          message.sender_public_key,
          storedSecretKey
        );

        if (decrypted) {
          return {
            ...message,
            content: decrypted,
            is_encrypted: false
          };
        }
      }
    } catch (e) {
      console.error("Decryption failed:", e);
    }
    return message;
  }, []);

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
          let message = data.message;
          const currentUser = getUser();
          const isOwnMessage = message.sender_id === currentUser.id;

          // 1. Decrypt if it's from someone else
          if (!isOwnMessage) {
            message = processIncomingMessage(message);
          }

          setMessages((prev) => {
            const conversationUserId = isOwnMessage ? message.recipient_id : message.sender_id;
            const existingMessages = prev[conversationUserId] || [];

            // 2. ECHO HANDLING (CRITICAL FIX)
            // If this is an echo of our own message, it will arrive Encrypted.
            // We likely already have the Plaintext version in our state (optimistic update).
            // We must MATCH them and KEEP the Plaintext content.

            if (isOwnMessage) {
              // Find the optimistic message (it has a large timestamp ID or matches content)
              // We primarily check if we have an unencrypted message that looks like this one
              const optimisticMatch = existingMessages.find(m =>
                m.sender_id === currentUser.id &&
                !m.is_encrypted && // Local is plaintext
                (m.id > 1000000000000 || m.content === message.content) // Temp ID or content match
              );

              if (optimisticMatch) {
                // Update the ID/Timestamp from server, but KEEP local Plaintext Content
                return {
                  ...prev,
                  [conversationUserId]: existingMessages.map(m => {
                    if (m.id === optimisticMatch.id) {
                      return {
                        ...message, // Take real ID and server data
                        content: m.content, // <--- PRESERVE PLAINTEXT
                        is_encrypted: false // Keep marked as decrypted
                      };
                    }
                    return m;
                  })
                };
              }
            }

            // Standard Add (if no duplicate found)
            const exists = existingMessages.some(m => m.id === message.id);
            if (exists) return prev;

            return {
              ...prev,
              [conversationUserId]: [...existingMessages, message],
            };
          });
        }
        else if (data.type === 'notification') {
          setNotifications((prev) => {
            const exists = prev.some(n => n.id === data.notification.id);
            if (exists) return prev;
            return [data.notification, ...prev];
          });
          toast.success(data.notification.message);
        }
      };

      ws.onerror = (error) => console.error('WebSocket error:', error);

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };
    } catch (error) {
      console.error('Connection failed:', error);
    }
  }, [isAuthenticated, processIncomingMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const sendMessage = useCallback((recipientId, content, recipientPublicKey, fileData = null) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const currentUser = getUser();
    const storedSecretKey = localStorage.getItem(`secretKey_${currentUser.id}`);

    // 1. Prepare Encryption
    let finalContent = content;
    let isEncrypted = false;
    const canEncrypt = !!(recipientPublicKey && storedSecretKey);

    if (canEncrypt && content) {
      const encrypted = cryptoUtils.encrypt(content, recipientPublicKey, storedSecretKey);
      if (encrypted) {
        finalContent = encrypted;
        isEncrypted = true;
      }
    }

    // 2. Optimistic Update (Immediate UI Feedback with PLAINTEXT)
    const tempId = Date.now();
    const optimisticMessage = {
      id: tempId,
      sender_id: currentUser.id,
      recipient_id: recipientId,
      content: content, // <--- Store Plaintext locally!
      message_type: fileData ? fileData.message_type : 'text',
      timestamp: new Date().toISOString(),
      is_read: false,
      is_encrypted: false, // <--- Mark as not encrypted for UI
      file_url: fileData ? fileData.file_data : null,
      file_name: fileData?.file_name
    };

    setMessages((prev) => ({
      ...prev,
      [recipientId]: [...(prev[recipientId] || []), optimisticMessage]
    }));

    // 3. Send Network Payload (ENCRYPTED)
    const payload = {
      type: 'chat_message',
      recipient_id: recipientId,
      content: finalContent, // <--- Send Encrypted
      message_type: fileData ? fileData.message_type : 'text',
      is_encrypted: isEncrypted,
      ...(fileData && {
        file_data: fileData.file_data,
        file_name: fileData.file_name,
        file_type: fileData.file_type
      })
    };

    wsRef.current.send(JSON.stringify(payload));

  }, []);

  const openChat = useCallback((userId) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'open_chat', chat_with: userId }));
    }
  }, []);

  const closeChat = useCallback((userId) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'close_chat', chat_with: userId }));
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUserId) connect();
    else disconnect();
    return () => disconnect();
  }, [isAuthenticated, currentUserId, connect, disconnect]);

  return (
    <WebSocketContext.Provider value={{
      isConnected, messages, setMessages, notifications,
      sendMessage, openChat, closeChat, setCurrentUserId, processIncomingMessage
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};