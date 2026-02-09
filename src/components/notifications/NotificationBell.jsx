import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { notificationAPI } from '../../api/notifications';
import { formatRelativeTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const { notifications, setNotifications } = useWebSocket();
  const [showDropdown, setShowDropdown] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0); // Renamed from unreadCount
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    // FIX: Count based on 'is_seen', not 'is_read'
    const count = notifications.filter((n) => !n.is_seen).length;
    setUnseenCount(count);
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleBellClick = async () => {
    const isOpening = !showDropdown;
    setShowDropdown(isOpening);

    // FIX: If opening, mark as SEEN (removes red dot, keeps blue background)
    if (isOpening && unseenCount > 0) {
      try {
        await notificationAPI.markAllAsSeen();
        // Update local state: set is_seen=true for all, but leave is_read alone
        setNotifications((prev) => 
          prev.map((n) => ({ ...n, is_seen: true }))
        );
      } catch (error) {
        console.error('Failed to mark notifications as seen');
      }
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unseenCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {unseenCount > 9 ? '9+' : unseenCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {/* Optional: Add a button to manually mark all as READ (turn grey) */}
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleMarkAsRead(notification.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatRelativeTime(notification.created_at)}
                      </p>
                    </div>
                    {/* Blue dot stays until clicked (is_read) */}
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;