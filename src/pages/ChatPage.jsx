import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import { Users, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUser, setSelectedUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [showUsersList, setShowUsersList] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [conversationRefreshTrigger, setConversationRefreshTrigger] = useState(0);
  const lastRefreshTime = useRef(0);
  const refreshDebounceTimer = useRef(null);
  
  const { messages, setCurrentUserId } = useWebSocket();

  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
    }
  }, [user, setCurrentUserId]);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Restore selected conversation from URL on page load/refresh
  useEffect(() => {
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');
    const email = searchParams.get('email');

    if (userId && username && email) {
      setSelectedUser({
        user_id: parseInt(userId),
        user_username: username,
        user_email: email,
      });
      setShowChatOnMobile(true);
    }
  }, []);

  // Refresh conversation list when new messages arrive (debounced)
  useEffect(() => {
    // Clear existing timer
    if (refreshDebounceTimer.current) {
      clearTimeout(refreshDebounceTimer.current);
    }

    // Only refresh if enough time has passed (prevent infinite loops)
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime.current;
    
    // Don't refresh more than once every 2 seconds
    if (timeSinceLastRefresh < 2000) {
      return;
    }

    // Debounce the refresh
    refreshDebounceTimer.current = setTimeout(() => {
      lastRefreshTime.current = Date.now();
      setConversationRefreshTrigger(prev => prev + 1);
    }, 1000);

    return () => {
      if (refreshDebounceTimer.current) {
        clearTimeout(refreshDebounceTimer.current);
      }
    };
  }, [messages]);

  const fetchAllUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      setAllUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowChatOnMobile(true);
    setShowUsersList(false);

    // Save to URL for persistence across refresh
    setSearchParams({
      userId: user.user_id.toString(),
      username: user.user_username,
      email: user.user_email,
    });
  };

  const handleBackToList = () => {
    setShowChatOnMobile(false);
    // Don't clear selectedUser to maintain selection
    // Just clear URL params on mobile
    if (window.innerWidth < 1024) {
      setSearchParams({});
    }
  };

  const handleMessageSent = () => {
    // Refresh conversation list when a message is sent
    const now = Date.now();
    if (now - lastRefreshTime.current >= 1000) {
      lastRefreshTime.current = now;
      setConversationRefreshTrigger(prev => prev + 1);
    }
  };

  const handleChatOpened = () => {
    // Refresh conversation list when a chat is opened (messages marked as read)
    // Use a delay to ensure backend has processed the read status
    setTimeout(() => {
      const now = Date.now();
      if (now - lastRefreshTime.current >= 1000) {
        lastRefreshTime.current = now;
        setConversationRefreshTrigger(prev => prev + 1);
      }
    }, 500);
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Sidebar - Conversations */}
        <div
          className={`${
            showChatOnMobile ? 'hidden' : 'flex'
          } lg:flex flex-col w-full lg:w-80 xl:w-96 border-r border-gray-200 bg-white`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <button
              onClick={() => setShowUsersList(!showUsersList)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Browse all users"
            >
              <Users className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Show either conversations or all users */}
          {showUsersList ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 mb-2">All Users</h2>
                <p className="text-sm text-gray-600">
                  Select a user to start a conversation
                </p>
              </div>

              {allUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <Users className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">No users available</p>
                </div>
              ) : (
                allUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() =>
                      handleSelectUser({
                        user_id: user.id,
                        user_email: user.email,
                        user_username: user.username,
                      })
                    }
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.username[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {user.username}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    </div>
                  </div>
                ))
              )}

              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowUsersList(false)}
                  className="w-full btn-secondary"
                >
                  Back to Conversations
                </button>
              </div>
            </div>
          ) : (
            <ConversationList
              onSelectUser={handleSelectUser}
              selectedUserId={selectedUser?.user_id}
              refreshTrigger={conversationRefreshTrigger}
            />
          )}
        </div>

        {/* Main Chat Area */}
        <div
          className={`${
            showChatOnMobile ? 'flex' : 'hidden'
          } lg:flex flex-1 flex-col`}
        >
          <ChatWindow 
            selectedUser={selectedUser} 
            onBack={handleBackToList}
            onMessageSent={handleMessageSent}
            onChatOpened={handleChatOpened}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;