import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import { chatAPI } from '../../api/chat';
import MessageBubble from './MessageBubble';
import MediaMessageBubble from './MediaMessageBubble';
import MessageInput from './MessageInput';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatWindow = ({ selectedUser, onBack, onMessageSent, onChatOpened }) => {
  const { user } = useAuth();
  const { messages, setMessages, sendMessage, isConnected, openChat, closeChat } = useWebSocket();
  const [localMessages, setLocalMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  useEffect(() => {
    if (!selectedUser) return;

    setLocalMessages([]);

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await chatAPI.getMessageHistory(selectedUser.user_id);
        setLocalMessages(response.data);
        
        if (onChatOpened) {
          onChatOpened();
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    if (isConnected) {
      openChat(selectedUser.user_id);
    }

    return () => {
      if (isConnected) {
        closeChat(selectedUser.user_id);
      }
    };
  }, [selectedUser?.user_id, isConnected, openChat, closeChat]);

  useEffect(() => {
    if (!selectedUser) return;

    if (messages[selectedUser.user_id]) {
      const newMessages = messages[selectedUser.user_id];
      
      setLocalMessages((prev) => {
        const existingIds = new Set(prev.map(msg => msg.id));
        const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
        
        if (uniqueNewMessages.length > 0) {
          return [...prev, ...uniqueNewMessages];
        }
        
        return prev;
      });
    }
  }, [messages, selectedUser?.user_id]);

  const determineMessageType = (file) => {
    if (!file) return 'text';
    
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const handleSendMessage = async (content, file) => {
    if ((!content.trim() && !file) || !isConnected) {
      if (!isConnected) toast.error('Not connected to chat server');
      return;
    }

    setSending(true);

    try {
      if (file) {
        // 1. Read file as Base64 string
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = () => {
          const base64Data = reader.result; // This string contains "data:image/png;base64,..."
          
          // 2. Send directly via WebSocket
          // The keys must match what consumers.py expects (file_data, file_name, etc.)
          const messagePayload = {
            type: 'chat_message',
            recipient_id: selectedUser.user_id,
            content: content,
            message_type: determineMessageType(file),
            file_data: base64Data, 
            file_name: file.name,
            file_type: file.type
          };

          // Use your WebSocket hook's send function
          // Ensure your useWebSocket hook allows sending a raw object
          sendMessage(messagePayload); // You might need to adjust this depending on your hook implementation
          
          if (onMessageSent) onMessageSent();
          setSending(false);
        };

        reader.onerror = (error) => {
          console.error('Error reading file:', error);
          toast.error('Failed to process file');
          setSending(false);
        };
      } else {
        // Standard text message
        sendMessage(selectedUser.user_id, content);
        if (onMessageSent) onMessageSent();
        setSending(false);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      setSending(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Chat Selected</h3>
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {selectedUser.user_username?.[0]?.toUpperCase() || 'U'}
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">{selectedUser.user_username}</h2>
              <p className="text-sm text-gray-500">{selectedUser.user_email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 custom-scrollbar"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : localMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-sm text-gray-400">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {localMessages.map((message) => (
              message.message_type === 'text' ? (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={String(message.sender_id) === String(user?.id)}
                />
              ) : (
                <MediaMessageBubble
                  key={message.id}
                  message={message}
                  isOwn={String(message.sender_id) === String(user?.id)}
                />
              )
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={handleSendMessage} disabled={!isConnected || sending} />

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-2 text-center">
          <p className="text-sm text-yellow-800">
            Reconnecting to chat server...
          </p>
        </div>
      )}

      {/* Sending Status */}
      {sending && (
        <div className="bg-blue-50 border-t border-blue-200 px-4 py-2 text-center">
          <p className="text-sm text-blue-800">
            Sending file...
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;