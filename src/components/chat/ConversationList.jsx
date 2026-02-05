import React, { useEffect, useState } from 'react';
import { chatAPI } from '../../api/chat';
import { formatRelativeTime } from '../../utils/formatters';
import { Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const ConversationList = ({ onSelectUser, selectedUserId, refreshTrigger }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, [refreshTrigger]); // Refresh when trigger changes

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await chatAPI.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Conversations</h3>
            <p className="text-sm text-gray-500">
              Start a new conversation by selecting a user
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.user_id}
              onClick={() => onSelectUser(conversation)}
              className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100 hover:bg-gray-50 ${
                selectedUserId === conversation.user_id ? 'bg-primary-50' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {conversation.user_username[0]?.toUpperCase()}
                </div>
                {conversation.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {conversation.unread_count}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {conversation.user_username}
                  </h3>
                  {conversation.last_message_time && (
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(conversation.last_message_time)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conversation.last_message || 'No messages yet'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;