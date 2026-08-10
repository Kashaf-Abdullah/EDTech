import React from 'react';
import './StatCard.css';

// A dashboard stat tile. Pass `progress` (0-100) to render the signature ring instead of a plain icon.
export default function StatCard({ icon, label, value, color = 'primary', progress }) {
  return (
    <div className="stat-card">
      {progress !== undefined ? (
        <div className="stat-ring" style={{ background: `conic-gradient(var(--color-${color}) ${progress}%, var(--color-surface-alt) 0)` }}>
          <span>{progress}%</span>
        </div>
      ) : (
        <div className={`stat-icon stat-icon-${color}`}>{icon}</div>
      )}
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
