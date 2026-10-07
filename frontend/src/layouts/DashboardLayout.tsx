import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  BookMarked,
  CalendarDays,
  Bell,
  User,
  Settings,
  ShieldCheck,
  Library,
  LogOut,
  Search,
  Menu,
  X,
  CreditCard,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const DashboardLayout: React.FC = () => {
  const { user, logout, isAdminOrLibrarian } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [quickSearch, setQuickSearch] = useState('');

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Fetch unread notifications count
  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then((res) => {
          if (res.success && res.data) {
            setUnreadNotifs(res.data.unread_count || 0);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/books?search=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch('');
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SK';

  return (
    <div className="app-container">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.4)',
            zIndex: 35,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logo.svg" alt="LIBRIXA Logo" className="sidebar-logo" />
          <div className="sidebar-brand">
            <span className="sidebar-brand-name">LIBRIXA</span>
            <span className="sidebar-brand-tagline">Smart Library</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="btn-ghost"
            style={{ marginLeft: 'auto', display: 'none' }}
            id="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* Section: Overview */}
          <div className="nav-section">
            <span className="nav-section-title">Overview</span>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* Section: Library */}
          <div className="nav-section">
            <span className="nav-section-title">Library</span>
            <NavLink
              to="/books"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <BookOpen size={18} />
              <span>Book Catalog</span>
            </NavLink>
            <NavLink
              to="/borrowed"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <BookMarked size={18} />
              <span>My Borrowed Books</span>
            </NavLink>
            <NavLink
              to="/reservations"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Layers size={18} />
              <span>Reservations</span>
            </NavLink>
            <NavLink
              to="/fines"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <CreditCard size={18} />
              <span>Fines</span>
            </NavLink>
            <NavLink
              to="/calendar"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <CalendarDays size={18} />
              <span>Calendar</span>
            </NavLink>
          </div>

          {/* Section: Communication */}
          <div className="nav-section">
            <span className="nav-section-title">Communication</span>
            <NavLink
              to="/notifications"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Bell size={18} />
              <span>Notifications</span>
              {unreadNotifs > 0 && <span className="nav-badge">{unreadNotifs}</span>}
            </NavLink>
          </div>

          {/* Section: Account */}
          <div className="nav-section">
            <span className="nav-section-title">Account</span>
            <NavLink
              to="/profile"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <User size={18} />
              <span>Profile</span>
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>
          </div>

          {/* Section: Administration (Staff only) */}
          {isAdminOrLibrarian && (
            <div className="nav-section">
              <span className="nav-section-title">Administration</span>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <ShieldCheck size={18} />
                <span>Admin Dashboard</span>
              </NavLink>
              <NavLink
                to="/admin/books"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Library size={18} />
                <span>Book Management</span>
              </NavLink>
              <NavLink
                to="/admin/borrowings"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <BookMarked size={18} />
                <span>Borrow Management</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Student'}
            </p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role || 'student'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            style={{ color: 'var(--text-muted)', padding: 6, borderRadius: 'var(--radius-sm)' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn-ghost"
              style={{ padding: 8, display: 'inline-flex' }}
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>

            <form onSubmit={handleQuickSearchSubmit} className="topbar-search">
              <Search size={16} className="topbar-search-icon" />
              <input
                type="text"
                placeholder="Search catalog by title, author, or ISBN..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
              />
            </form>
          </div>

          <div className="topbar-right">
            <div className="status-indicator">
              <span className="status-dot" />
              <span>Library Open</span>
            </div>

            <NavLink to="/notifications" className="topbar-action-btn" title="Notifications">
              <Bell size={18} />
              {unreadNotifs > 0 && <span className="topbar-badge-dot" />}
            </NavLink>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                className="user-profile-badge"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="avatar">{initials}</div>
                <div className="user-badge-info">
                  <span className="user-badge-name">{user?.name || 'Shivanand K'}</span>
                  <span className="user-badge-role">{user?.role || 'Student'}</span>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" style={{ marginRight: 4 }} />
              </div>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: 200,
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '6px 0',
                    zIndex: 50,
                  }}
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <NavLink
                    to="/profile"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 16px',
                      fontSize: '0.875rem',
                      color: 'var(--navy)',
                    }}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </NavLink>
                  <NavLink
                    to="/settings"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 16px',
                      fontSize: '0.875rem',
                      color: 'var(--navy)',
                    }}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </NavLink>
                  <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '4px 0' }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 16px',
                      fontSize: '0.875rem',
                      color: 'var(--danger)',
                      width: '100%',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
