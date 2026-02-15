import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import { chatAPI } from '../../api/chat';
import { cryptoUtils } from '../../utils/crypto'; // Import crypto
import MessageBubble from './MessageBubble';
import MediaMessageBubble from './MediaMessageBubble';
import MessageInput from './MessageInput';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatWindow = ({ selectedUser, onBack, onMessageSent, onChatOpened }) => {
  const { user } = useAuth();
  const { messages, sendMessage, isConnected, openChat, closeChat } = useWebSocket();
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages]);

  // 1. Fetch and Decrypt History
  useEffect(() => {
    if (!selectedUser) return;
    setDisplayedMessages([]); // Clear previous chat

    const fetchAndDecrypt = async () => {
      setLoading(true);
      try {
        const response = await chatAPI.getMessageHistory(selectedUser.user_id);
        const rawMessages = response.data;

        const storedSecretKey = localStorage.getItem(`secretKey_${user?.id}`);

        // Decrypt history
        const decryptedHistory = rawMessages.map(msg => {
          if (!msg.is_encrypted || !msg.content || !storedSecretKey) return msg;

          try {
            // Logic:
            // If WE sent it (sender_id == user.id), we used recipient's public key to encrypt.
            //    Shared Secret = MyPriv * TheirPub.
            // If THEY sent it, they used our public key.
            //    Shared Secret = TheirPub * MyPriv.
            // Result: The shared secret is the SAME. We just need 'Their' public key.

            const theirPublicKey = selectedUser.public_key;

            if (theirPublicKey) {
              const decrypted = cryptoUtils.decrypt(msg.content, theirPublicKey, storedSecretKey);
              if (decrypted) {
                return { ...msg, content: decrypted, is_encrypted: false };
              }
            }
          } catch (e) { console.error("History decryption error", e); }
          return msg;
        });

        setDisplayedMessages(decryptedHistory);
        if (onChatOpened) onChatOpened();

      } catch (error) {
        console.error('Failed to fetch messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchAndDecrypt();

    if (isConnected) openChat(selectedUser.user_id);
    return () => { if (isConnected) closeChat(selectedUser.user_id); };
  }, [selectedUser?.user_id, isConnected]);

  // 2. Sync with WebSocket Messages (Live Updates)
  useEffect(() => {
    if (!selectedUser || !messages[selectedUser.user_id]) return;

    const liveMessages = messages[selectedUser.user_id];

    setDisplayedMessages(prev => {
      // Merge live messages into history
      // We use a Map to prevent duplicates based on ID
      const msgMap = new Map(prev.map(m => [m.id, m]));

      liveMessages.forEach(m => {
        msgMap.set(m.id, m);
      });

      // Convert back to array and sort by timestamp
      return Array.from(msgMap.values()).sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
      );
    });
  }, [messages, selectedUser?.user_id]);

  const determineMessageType = (file) => {
    if (!file) return 'text';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const handleSendMessage = async (content, file) => {
    if ((!content.trim() && !file) || !isConnected) return;
    setSending(true);

    try {
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          sendMessage(
            selectedUser.user_id,
            content,
            selectedUser.public_key,
            {
              file_data: reader.result,
              file_name: file.name,
              file_type: file.type,
              message_type: determineMessageType(file)
            }
          );
          if (onMessageSent) onMessageSent();
          setSending(false);
        };
      } else {
        sendMessage(selectedUser.user_id, content, selectedUser.public_key);
        if (onMessageSent) onMessageSent();
        setSending(false);
      }
    } catch (error) {
      toast.error('Failed to send');
      setSending(false);
    }
  };

  if (!selectedUser) return <div className="flex-1 bg-gray-50" />;

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="lg:hidden"><ArrowLeft className="w-5 h-5" /></button>
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
            {selectedUser.user_username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{selectedUser.user_username}</h2>
            <p className="text-sm text-gray-500">{selectedUser.user_email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center h-full items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
        ) : displayedMessages.length === 0 ? (
          <div className="text-center mt-20 text-gray-500">No messages yet. Say hello!</div>
        ) : (
          <>
            {displayedMessages.map((msg) => (
              msg.message_type === 'text' ?
                <MessageBubble key={msg.id} message={msg} isOwn={String(msg.sender_id) === String(user?.id)} /> :
                <MediaMessageBubble key={msg.id} message={msg} isOwn={String(msg.sender_id) === String(user?.id)} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <MessageInput onSendMessage={handleSendMessage} disabled={!isConnected || sending} />
    </div>
  );
};

export default ChatWindow;