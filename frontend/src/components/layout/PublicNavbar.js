import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './PublicNavbar.css';

export default function PublicNavbar() {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const goToApp = () => {
    navigate(user.role === 'admin' ? '/admin' : user.role === 'tutor' ? '/tutor/dashboard' : '/dashboard');
  };

  return (
    <header className="pub-nav">
      <div className="pub-nav-inner">
        <Link to="/" className="pub-nav-brand">
          <span className="pub-nav-mark">E</span> EduPak
        </Link>

        <button className="pub-nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        </button>

        <nav className={`pub-nav-links ${open ? 'open' : ''}`}>
          <Link to="/courses" onClick={() => setOpen(false)}>Courses</Link>
          <Link to="/tutors" onClick={() => setOpen(false)}>Tutors</Link>
          {user && <Link to="/entry-tests" onClick={() => setOpen(false)}>Entry Tests</Link>}
          {!user ? (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="pub-nav-login">Login</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="pub-nav-cta">Get Started</Link>
            </>
          ) : (
            <button className="pub-nav-cta" onClick={goToApp}>Go to Dashboard</button>
          )}
        </nav>
      </div>
    </header>
  );
}
