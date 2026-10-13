import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  Calendar,
  ChevronDown,
  User,
  LogOut,
  Settings as SettingsIcon,
} from 'lucide-react';
import '../styles/navbar.css';

const TopNavbar = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotificationMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const initials = (user?.displayName || user?.username || 'U').substring(0, 2).toUpperCase();

  return (
    <header className="top-navbar">
      <div className="navbar-left"></div>

      <div className="navbar-right">
        <div className="navbar-date">
          <Calendar size={15} />
          <span>{formattedDate}</span>
        </div>

        {/* Notification Bell */}
        <div className="icon-btn-wrapper" ref={notifRef}>
          <button
            className="nav-icon-btn"
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
          </button>

          {showNotificationMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications && notifications.length > 0 ? (
                  notifications.map((n) => {
                    const isRead = n.isRead || n.read;
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          setShowNotificationMenu(false);
                          navigate('/notifications');
                        }}
                        style={{
                          padding: '10px 14px',
                          borderBottom: '1px solid #f8fafc',
                          cursor: 'pointer',
                          backgroundColor: isRead ? '#ffffff' : '#f0f9ff',
                          transition: 'background 0.15s',
                        }}
                      >
                        <div style={{ fontWeight: '600', fontSize: '0.825rem', color: '#0f172a' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          {n.message}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No notifications
                  </div>
                )}
              </div>
              <div
                onClick={() => {
                  setShowNotificationMenu(false);
                  navigate('/notifications');
                }}
                style={{
                  padding: '10px',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#2563eb',
                  borderTop: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  backgroundColor: '#fafbfc',
                }}
              >
                View all notifications
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="icon-btn-wrapper" ref={userMenuRef}>
          <div
            className="navbar-user-menu"
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ cursor: 'pointer' }}
          >
            <div className="navbar-avatar-initials">
              {initials}
            </div>
            <div className="navbar-user-details">
              <span className="navbar-user-name">{user?.displayName || user?.username || 'User'}</span>
              <span className="navbar-user-role">{user?.role || 'USER'}</span>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </div>

          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '190px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                zIndex: 100,
                padding: '6px',
              }}
            >
              <div
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/profile');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#0f172a',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <User size={15} />
                <span>My Profile</span>
              </div>
              <div
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#0f172a',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <SettingsIcon size={15} />
                <span>Settings</span>
              </div>
              <div
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  navigate('/login');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#ef4444',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
