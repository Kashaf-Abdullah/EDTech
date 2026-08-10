import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../redux/slices/notificationSlice';

const TYPE_ICON = { payment:'💳', enrollment:'📚', course:'🎓', session:'📅', tutor:'👨‍🏫', system:'🔔' };

export default function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useSelector(s => s.notification);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    dispatch(fetchNotifications());
    const interval = setInterval(() => dispatch(fetchNotifications()), 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleClick = (n) => {
    if (!n.isRead) dispatch(markAsRead(n._id));
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="notif-bell-btn" onClick={() => setOpen(!open)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={() => dispatch(markAllAsRead())}>Mark all read</button>
            )}
          </div>
          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet</div>
            ) : notifications.map(n => (
              <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`} onClick={() => handleClick(n)}>
                <div className="notif-icon">{TYPE_ICON[n.type] || '🔔'}</div>
                <div className="notif-body">
                  <div className="notif-title-row">
                    <strong>{n.title}</strong>
                    {!n.isRead && <span className="notif-dot" />}
                  </div>
                  <p>{n.message}</p>
                  <small>{timeAgo(n.createdAt)}</small>
                </div>
                <button className="notif-delete" onClick={(e) => { e.stopPropagation(); dispatch(deleteNotification(n._id)); }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
