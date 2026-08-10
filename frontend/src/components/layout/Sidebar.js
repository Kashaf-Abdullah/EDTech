import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';

const STUDENT_LINKS = [
  { to: '/dashboard',    label: 'Dashboard',     icon: 'grid' },
  { to: '/courses',      label: 'Browse Courses',icon: 'search' },
  { to: '/my-courses',   label: 'My Courses',    icon: 'book' },
  { to: '/certificates', label: 'Certificates',  icon: 'award' },
  { to: '/sessions',     label: 'Sessions',      icon: 'calendar' },
  { to: '/entry-tests',  label: 'Entry Tests',   icon: 'clipboard' },
  { to: '/chat',         label: 'Messages',      icon: 'message' },
  { to: '/community',    label: 'Community',     icon: 'globe' },
  { to: '/profile',      label: 'Profile',       icon: 'user' },
];
const TUTOR_LINKS = [
  { to: '/tutor/dashboard', label: 'Dashboard', icon: 'grid' },
  { to: '/tutor/courses/create', label: 'Create Course', icon: 'plus' },
  { to: '/tutor/profile',   label: 'Profile',   icon: 'user' },
  { to: '/tutor/sessions',  label: 'Sessions',  icon: 'calendar' },
  { to: '/tutor/earnings',  label: 'Earnings',  icon: 'wallet' },
  { to: '/chat',            label: 'Messages',  icon: 'message' },
  { to: '/community',       label: 'Community', icon: 'globe' },
];
const ADMIN_LINKS = [
  { to: '/admin',          label: 'Dashboard', icon: 'grid' },
  { to: '/admin/tutors',   label: 'Tutors',    icon: 'graduation' },
  { to: '/admin/courses',  label: 'Courses',   icon: 'book' },
  { to: '/admin/payments', label: 'Payments',  icon: 'card' },
  { to: '/admin/entry-tests', label: 'Entry Tests', icon: 'clipboard' },
  { to: '/admin/users',    label: 'Users',     icon: 'users' },
  { to: '/admin/revenue',  label: 'Revenue',   icon: 'chart' },
  { to: '/admin/settings', label: 'Settings',  icon: 'settings' },
  { to: '/chat',           label: 'Messages',  icon: 'message' },
  { to: '/community',      label: 'Community', icon: 'globe' },
];

// Each icon is rendered as its own small component (not stored as raw JSX in an
// object literal) — this avoids the parser ambiguity that bare <>...</> fragments
// can cause when used as object values in some Babel/Flow parser configurations.
function IconSvg({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

  switch (name) {
    case 'grid':
      return <svg {...common}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>;
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
    case 'book':
      return <svg {...common}><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z" /></svg>;
    case 'award':
      return <svg {...common}><circle cx="12" cy="8" r="5" /><path d="M8.5 12.5L7 22l5-3 5 3-1.5-9.5" /></svg>;
    case 'calendar':
      return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></svg>;
    case 'message':
      return <svg {...common}><path d="M21 11.5a8.5 8.5 0 1 1-3.8-7.1L21 3l-1 4.3a8.4 8.4 0 0 1 1 4.2z" /></svg>;
    case 'globe':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><line x1="3" y1="12" x2="21" y2="12" /><path d="M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" /></svg>;
    case 'user':
      return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
    case 'plus':
      return <svg {...common}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
    case 'wallet':
      return <svg {...common}><rect x="3" y="6" width="18" height="13" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="16" y1="14" x2="18" y2="14" /></svg>;
    case 'clipboard':
      return <svg {...common}><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M8 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1" /></svg>;
    case 'graduation':
      return <svg {...common}><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M5 10v6c0 1.5 3 3 7 3s7-1.5 7-3v-6" /></svg>;
    case 'card':
      return <svg {...common}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>;
    case 'users':
      return <svg {...common}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M15 14c2.4 0 5 1.8 5 6" /></svg>;
    case 'chart':
      return <svg {...common}><line x1="4" y1="20" x2="4" y2="10" /><line x1="10" y1="20" x2="10" y2="4" /><line x1="16" y1="20" x2="16" y2="13" /><line x1="22" y1="20" x2="2" y2="20" /></svg>;
    case 'settings':
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
    case 'logout':
      return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="9" /></svg>;
  }
}

export default function Sidebar({ mobileOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(s => s.auth);
  const { unreadCount } = useSelector(s => s.notification);

  const links = user?.role === 'student' ? STUDENT_LINKS
              : user?.role === 'tutor'   ? TUTOR_LINKS
              : user?.role === 'admin'   ? ADMIN_LINKS
              : [];

  const doLogout = () => { dispatch(logout()); navigate('/login'); };
  const isActive = (to) => location.pathname === to;

  return (
    <React.Fragment>
      {mobileOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">E</span>
          <span className="sidebar-brand-text">EduPak</span>
        </div>

        <div className="sidebar-user">
          <img src={user?.profilePic || 'https://placehold.co/40'} alt="" className="sidebar-user-pic" />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`sidebar-link ${isActive(l.to) ? 'active' : ''}`} onClick={onClose}>
              <IconSvg name={l.icon} />
              <span>{l.label}</span>
              {l.to === '/chat' && unreadCount > 0 && <span className="sidebar-dot" />}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link sidebar-logout" onClick={doLogout}>
            <IconSvg name="logout" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </React.Fragment>
  );
}