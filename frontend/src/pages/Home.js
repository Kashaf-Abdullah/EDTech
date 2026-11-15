import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-inner">
          <span className="home-eyebrow">Pakistan's learning platform</span>
          <h1 className="home-headline">
            Learn from tutors who<br /><span className="home-headline-accent">actually get you.</span>
          </h1>
          <p className="home-sub">
            Affordable courses in Urdu &amp; English. Pay how you already do — JazzCash, EasyPaisa, or bank transfer.
          </p>
          <div className="home-cta-row">
            <Link to="/courses" className="home-btn-primary">Browse Courses</Link>
            <Link to="/register" className="home-btn-ghost">Become a Tutor</Link>
          </div>
        </div>
        <div className="home-hero-art" aria-hidden="true">
          <div className="hero-card hero-card-1">
            <div className="hero-card-avatar" />
            <div className="hero-card-lines"><span /><span /></div>
          </div>
          <div className="hero-card hero-card-2">
            <div className="hero-progress-ring"><span>78%</span></div>
            <div className="hero-card-lines"><span /><span /></div>
          </div>
          <div className="hero-card hero-card-3">🏆 Certificate earned</div>
        </div>
      </section>

      <section className="home-features">
        <div className="home-features-inner">
          {[
            { icon: '🎓', title: 'Expert Tutors', desc: 'Verified, approved tutors across every subject.' },
            { icon: '💳', title: 'Easy Payment', desc: 'JazzCash, EasyPaisa, or bank transfer.' },
            { icon: '📜', title: 'Certificates', desc: 'Earn a verifiable certificate after every course.' },
            { icon: '🔴', title: 'Live Sessions', desc: 'Book 1-on-1 time with your favourite tutor.' },
          ].map(f => (
            <div key={f.title} className="home-feature-card">
              <div className="home-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
