import React, { useEffect, useState, useRef, useCallback } from 'react';
import { chatAPI } from '../../api/chat';
import { formatRelativeTime } from '../../utils/formatters';
import { Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const ConversationList = ({ onSelectUser, selectedUserId, refreshTrigger }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debounce ref for search
  const searchTimeout = useRef(null);

  // Infinite Scroll Observer
  const observer = useRef();
  const lastConversationRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Reset list when refreshTrigger changes
  useEffect(() => {
    setPage(1);
    // The fetch will happen in the next useEffect because page changed to 1
    // But if page was ALREADY 1, we need to force a fetch:
    if (page === 1) {
       fetchConversations(1, searchQuery, true);
    }
  }, [refreshTrigger]);

  // Fetch when Page changes
  useEffect(() => {
    fetchConversations(page, searchQuery, page === 1);
  }, [page]);

  const fetchConversations = async (pageNum, search, isRefresh = false) => {
    setLoading(true);
    try {
      const response = await chatAPI.getConversations(pageNum, search);
      
      // Handle DRF Paginated Response
      const newConversations = response.data.results || response.data || [];
      const nextLink = response.data.next;

      setConversations(prev => {
        if (isRefresh) return newConversations;
        
        // Prevent duplicates
        const existingIds = new Set(prev.map(c => c.user_id));
        const uniqueNew = newConversations.filter(c => !existingIds.has(c.user_id));
        return [...prev, ...uniqueNew];
      });

      setHasMore(!!nextLink);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce API call
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    searchTimeout.current = setTimeout(() => {
      setPage(1); // Reset to page 1 to trigger new search
      fetchConversations(1, query, true); // Force refresh
    }, 500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search Bar - Sticky */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {conversations.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No results found' : 'No Conversations'}
            </h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Try a different search term' : 'Start a new conversation by selecting a user'}
            </p>
          </div>
        ) : (
          conversations.map((conversation, index) => {
            const isLastElement = conversations.length === index + 1;

            return (
              <div
                ref={isLastElement ? lastConversationRef : null}
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
            );
          })
        )}
        
        {/* Loading Spinner at Bottom */}
        {loading && (
          <div className="p-4 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;