import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import { useNotifications } from '../context/NotificationContext';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Bell,
  CheckCheck,
  CalendarCheck,
  CalendarOff,
  CheckSquare,
  AlertCircle,
  TrendingUp,
  FolderKanban,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';

const Notifications = () => {
  const navigate = useNavigate();
  const { refreshNotifications } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'UNREAD'

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getAll();
      if (res && res.success) {
        // Backend returns { success: true, data: { notifications: [...], unreadCount: n } }
        let list = [];
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (res.data && Array.isArray(res.data.notifications)) {
          list = res.data.notifications;
        }
        setNotifications(list);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
      setError(err.errorMessage || err.response?.data?.message || 'Failed to load notifications from server.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        Array.isArray(prev) ? prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)) : []
      );
      if (refreshNotifications) refreshNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        Array.isArray(prev) ? prev.map((n) => ({ ...n, isRead: true })) : []
      );
      if (refreshNotifications) refreshNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleClickNotification = async (n) => {
    if (!n.isRead && !n.read) {
      await handleMarkAsRead(n.id, { stopPropagation: () => {} });
    }
    if (n.link) {
      navigate(n.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'LEAVE':
        return <CalendarOff size={18} color="#f59e0b" />;
      case 'ATTENDANCE':
        return <CalendarCheck size={18} color="#10b981" />;
      case 'TASK':
        return <CheckSquare size={18} color="#2563eb" />;
      case 'PROJECT':
        return <FolderKanban size={18} color="#8b5cf6" />;
      case 'PERFORMANCE':
        return <TrendingUp size={18} color="#ec4899" />;
      default:
        return <Bell size={18} color="#64748b" />;
    }
  };

  const safeList = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeList.filter((n) => !n.isRead && !n.read).length;

  const filteredNotifications = safeList.filter((n) => {
    const isRead = !!(n.isRead || n.read);
    if (filter === 'UNREAD') return !isRead;
    return true;
  });

  return (
    <div style={{ padding: '1.75rem', maxWidth: '850px', margin: '0 auto' }}>
      <PageHeader
        title="Notifications"
        subtitle="Operational alerts, task schedules, leave updates, and team activity"
        icon={Bell}
        actions={
          unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <CheckCheck size={16} />
              <span>Mark All as Read</span>
            </button>
          )
        }
      />

      {/* Error Banner with Retry */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              color: '#991b1b',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setFilter('ALL')}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: filter === 'ALL' ? '#2563eb' : '#e2e8f0',
            color: filter === 'ALL' ? '#ffffff' : '#475569',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          All ({safeList.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: filter === 'UNREAD' ? '#2563eb' : '#e2e8f0',
            color: filter === 'UNREAD' ? '#ffffff' : '#475569',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching notifications..." />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'UNREAD' ? 'No unread notifications' : 'All caught up!'}
          description={
            filter === 'UNREAD'
              ? 'You have read all your notifications.'
              : 'You do not have any notifications at the moment.'
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredNotifications.map((n) => {
            const isRead = !!(n.isRead || n.read);
            return (
              <div
                key={n.id}
                onClick={() => handleClickNotification(n)}
                style={{
                  backgroundColor: isRead ? '#ffffff' : '#f0f7ff',
                  border: isRead ? '1px solid #e2e8f0' : '1px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getIcon(n.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '2px',
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        fontWeight: isRead ? '600' : '700',
                        color: '#1e293b',
                      }}
                    >
                      {n.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {n.createdAt
                        ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Recent'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>
                    {n.message}
                  </p>
                </div>

                {!isRead && (
                  <button
                    onClick={(e) => handleMarkAsRead(n.id, e)}
                    title="Mark as read"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#2563eb',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <CheckCircle2 size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
