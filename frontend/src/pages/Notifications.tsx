import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Check, Clock, BookOpen, AlertCircle, Info, Bookmark } from 'lucide-react';
import api from '../services/api';
import { NotificationItem } from '../types';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/Toast';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { showToast } = useToast();

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to retrieve notifications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      showToast('Notification marked as read', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error updating notification', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error updating notifications', 'error');
    }
  };

  const getIcon = (title: string) => {
    if (title.toLowerCase().includes('due')) return <Clock size={18} color="var(--warning)" />;
    if (title.toLowerCase().includes('returned')) return <Check size={18} color="var(--success)" />;
    if (title.toLowerCase().includes('reservation')) return <Bookmark size={18} color="var(--primary)" />;
    return <Info size={18} color="var(--primary)" />;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Notification Center</h1>
            <p className="page-subtitle">
              System alerts, loan due reminders, reservation updates, and academic notifications.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={<CheckCheck size={16} />}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Checking notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} />}
          title="No Notifications"
          description="Your inbox is clear! Any updates about due dates or book waitlists will appear here."
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n, idx) => {
              const isUnread = n.is_read === 0;
              return (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '18px 24px',
                    backgroundColor: isUnread ? 'rgba(79, 70, 229, 0.03)' : 'var(--surface)',
                    borderBottom: idx !== notifications.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', gap: 16, flex: 1, marginRight: 16 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        backgroundColor: isUnread ? 'var(--primary-light)' : 'var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {getIcon(n.title)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h4
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: isUnread ? 700 : 600,
                            color: 'var(--navy)',
                          }}
                        >
                          {n.title}
                        </h4>
                        {isUnread && (
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary)',
                            }}
                          />
                        )}
                      </div>

                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 6 }}>
                        {n.message}
                      </p>

                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                        {n.created_at}
                      </span>
                    </div>
                  </div>

                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(n.id)}
                      style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
