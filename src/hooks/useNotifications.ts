import { create } from 'zustand';
import { api } from '../lib/axios';
import { socket } from '../lib/socket';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  readAt: string | null;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
}

export const useNotifications = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/notifications');
      const notifications = response.data;
      const unreadCount = notifications.filter((n: Notification) => !n.readAt).length;
      set({ notifications, unreadCount });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error fetching notifications' });
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      await get().fetchNotifications();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error marking notification as read' });
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all');
      await get().fetchNotifications();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error marking all notifications as read' });
    }
  },

  subscribeToNotifications: () => {
    socket.on('notification', (notification: Notification) => {
      set(state => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      }));

      // Show push notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/notification-icon.png'
        });
      }
    });

    // Request push notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  },

  unsubscribeFromNotifications: () => {
    socket.off('notification');
  }
}));