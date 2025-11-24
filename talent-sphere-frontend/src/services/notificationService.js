import io from 'socket.io-client';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

class NotificationService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    if (!token) {
      token = localStorage.getItem('token') || localStorage.getItem('candidateToken');
    }

    if (!token) {
      console.warn('No authentication token found for notifications');
      return;
    }

    this.socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to notification service');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification service');
    });

    this.socket.on('new_notification', (notification) => {
      this.notifyListeners('new_notification', notification);
    });

    this.socket.on('notification_updated', (data) => {
      this.notifyListeners('notification_updated', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  async markAsRead(notificationId) {
    if (this.socket) {
      this.socket.emit('mark_notification_read', { notificationId });
    }

    const token = localStorage.getItem('token') || localStorage.getItem('candidateToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async getNotifications(page = 1, limit = 20, unreadOnly = false) {
    const token = localStorage.getItem('token') || localStorage.getItem('candidateToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        params: { page, limit, unreadOnly },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async getUnreadCount() {
    const token = localStorage.getItem('token') || localStorage.getItem('candidateToken');
    if (!token) {
      return 0;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  async markAllAsRead() {
    const token = localStorage.getItem('token') || localStorage.getItem('candidateToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/api/notifications/mark-all-read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId) {
    const token = localStorage.getItem('token') || localStorage.getItem('candidateToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async getPreferences() {
    const token = localStorage.getItem('token') || localStorage.getItem('candidateToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  async updatePreferences(preferences) {
    const token = localStorage.getItem('token') || localStorage.getItem('candidateToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/api/notifications/preferences`, preferences, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  async resetPreferences() {
    const token = localStorage.getItem('token') || localStorage.getItem('candidateToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/notifications/preferences/reset`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting notification preferences:', error);
      throw error;
    }
  }

  async getFilteredNotifications(filters = {}, page = 1, limit = 20) {
    const token = localStorage.getItem('token') || localStorage.getItem('candidateToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const params = {
        page,
        limit,
        ...filters
      };

      const response = await axios.get(`${API_BASE_URL}/api/notifications/filtered`, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered notifications:', error);
      throw error;
    }
  }

  async archiveNotification(notificationId) {
    const token = localStorage.getItem('token') || localStorage.getItem('candidateToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/api/notifications/${notificationId}/archive`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  }

  async bulkArchive(notificationIds) {
    const token = localStorage.getItem('token') || localStorage.getItem('candidateToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/api/notifications/bulk/archive`, {
        notificationIds
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk archiving notifications:', error);
      throw error;
    }
  }

  async getStats() {
    const token = localStorage.getItem('token') || localStorage.getItem('candidateToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }

  async sendTestNotification() {
    const token = localStorage.getItem('token') || localStorage.getItem('candidateToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/notifications/test`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }
}

const notificationService = new NotificationService();

export default notificationService;