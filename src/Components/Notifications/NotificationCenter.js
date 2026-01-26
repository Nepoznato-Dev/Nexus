import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Trash2, MessageCircle, Check } from 'lucide-react';

const NOTIFICATIONS_KEY = 'nexus_notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    // Reduced polling from 1s to 5s for better performance
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
      setNotifications(stored);
      setUnreadCount(stored.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      // Initialize with empty array on corruption
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const addNotification = (notification) => {
    try {
      const stored = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
      const newNotif = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        read: false,
        ...notification
      };
      stored.unshift(newNotif);
      // Keep only last 50 notifications
      const trimmed = stored.slice(0, 50);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));
      loadNotifications();
      return newNotif;
    } catch (err) {
      console.error('Failed to add notification:', err);
    }
  };

  const markAsRead = (id) => {
    try {
      const stored = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
      const updated = stored.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
      const updated = stored.map(n => ({ ...n, read: true }));
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = (id) => {
    try {
      const stored = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
      const filtered = stored.filter(n => n.id !== id);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
      loadNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearAll = () => {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
      loadNotifications();
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };
}

export function NotificationToast({ notification, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'message': return <MessageCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 100 }}
      onClick={onDismiss}
      className="bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg p-4 shadow-2xl cursor-pointer hover:bg-black/95 transition-colors max-w-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-cyan-400">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm mb-1">{notification.title}</h4>
          <p className="text-white/70 text-sm line-clamp-2">{notification.body}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function NotificationCenter({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead, onDelete, onClearAll }) {
  if (!isOpen) return null;

  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-black/95 border border-white/20 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Notifications</h2>
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={onMarkAllAsRead}
                    className="px-3 py-1.5 text-sm text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={onClearAll}
                    className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    Clear all
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="flex-1 overflow-y-auto p-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto mb-4 text-white/20" />
                <p className="text-white/50">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border transition-colors ${
                      notif.read
                        ? 'bg-white/5 border-white/5'
                        : 'bg-cyan-500/10 border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 ${notif.read ? 'text-white/40' : 'text-cyan-400'}`}>
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`font-semibold text-sm ${notif.read ? 'text-white/60' : 'text-white'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-xs text-white/40 flex-shrink-0">
                            {formatTime(notif.timestamp)}
                          </span>
                        </div>
                        <p className={`text-sm ${notif.read ? 'text-white/40' : 'text-white/70'}`}>
                          {notif.body}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!notif.read && (
                          <button
                            onClick={() => onMarkAsRead(notif.id)}
                            className="p-1.5 text-cyan-400 hover:bg-cyan-500/20 rounded transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(notif.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
