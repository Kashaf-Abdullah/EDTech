import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NotificationBell from './NotificationBell';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard', '/courses': 'Browse Courses', '/my-courses': 'My Courses',
  '/certificates': 'Certificates', '/sessions': 'My Sessions', '/chat': 'Messages',
  '/community': 'Community', '/profile': 'My Profile',
  '/tutor/dashboard': 'Dashboard', '/tutor/profile': 'My Profile', '/tutor/sessions': 'Sessions',
  '/tutor/earnings': 'Earnings', '/tutor/courses/create': 'Create Course',
  '/admin': 'Dashboard', '/admin/tutors': 'Tutor Management', '/admin/courses': 'Course Management',
  '/admin/payments': 'Payments', '/admin/users': 'User Management', '/admin/revenue': 'Revenue',
  '/admin/settings': 'Platform Settings',
};

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const { user } = useSelector(s => s.auth);
  const title = PAGE_TITLES[location.pathname] || 'EduPak';

  return (
    <header className="app-topbar">
      <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-actions">
        <NotificationBell />
        <div className="topbar-avatar">
          {user?.profilePic
            ? <img src={user.profilePic} alt="" />
            : <span>{user?.name?.[0]}</span>}
        </div>
      </div>
    </header>
  );
}
