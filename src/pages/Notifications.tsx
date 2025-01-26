import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BellIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/v1/notifications');
        setNotifications(response.data);
      } catch (err) {
        setError('Failed to fetch notifications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`http://localhost:8000/api/v1/notifications/${id}/read`);
      setNotifications(notifications.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      ));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/notifications/${id}`);
      setNotifications(notifications.filter(notification => notification.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-8">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="flex items-center space-x-2">
          <BellIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs">
            {notifications.filter(n => !n.isRead).length}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card transition-all duration-200 ${
                !notification.isRead ? 'border-l-4 border-primary-600' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {notification.type === 'info' && (
                    <BellIcon className="h-6 w-6 text-blue-500" />
                  )}
                  {notification.type === 'warning' && (
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                  )}
                  {notification.type === 'success' && (
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  )}
                  {notification.type === 'error' && (
                    <XCircleIcon className="h-6 w-6 text-red-500" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
