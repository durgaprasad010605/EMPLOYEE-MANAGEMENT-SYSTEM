import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  FileText,
  Clock,
  CalendarOff,
  Bell,
  User,
  LogOut,
  Briefcase,
  History,
} from 'lucide-react';
import '../styles/sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHr = user?.role === 'HR';

  const hrNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Progress Reports', path: '/progress-reports', icon: FileText },
    { name: 'Extension Requests', path: '/extension-requests', icon: Clock },
    { name: 'Leave Requests', path: '/leaves', icon: CalendarOff },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const employeeNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'My Projects', path: '/projects', icon: FolderKanban },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'My Work History', path: '/work-history', icon: History },
    { name: 'Extension Requests', path: '/extension-requests', icon: Clock },
    { name: 'My Leaves', path: '/leaves', icon: CalendarOff },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
  ];

  const items = isHr ? hrNavItems : employeeNavItems;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Briefcase size={22} color="#3b82f6" />
        </div>
        <div className="sidebar-brand">
          <span className="sidebar-title">Employee Portal</span>
          <span className="sidebar-subtitle">{isHr ? 'HR Administration' : 'Employee Workspace'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} className="sidebar-icon" />
              <span className="sidebar-link-text">{item.name}</span>
              {item.badge > 0 && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-preview">
          <div className="user-info-wrapper">
            <div className="user-avatar-initials">
              {(user?.displayName || user?.username || 'U').substring(0, 2).toUpperCase()}
            </div>
            <div className="user-text-info">
              <span className="user-name">{user?.displayName || user?.username || 'User'}</span>
              <span className={`user-role-badge ${isHr ? 'role-hr' : 'role-emp'}`}>
                {user?.role || 'USER'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="logout-btn"
            title="Sign out"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
