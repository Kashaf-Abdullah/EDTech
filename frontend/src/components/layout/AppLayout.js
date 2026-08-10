import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Sidebar.css';
import './Topbar.css';
import './NotificationBell.css';
import './AppLayout.css';

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="app-main">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
