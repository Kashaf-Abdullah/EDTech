import React from 'react';
import './EmptyState.css';

export default function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h4>{title}</h4>
      {subtitle && <p>{subtitle}</p>}
      {action}
    </div>
  );
}
