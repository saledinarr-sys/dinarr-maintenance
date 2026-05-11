import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ChartBar, List, Wrench, Settings } from '../ui/Icon';
import Sidebar from './Sidebar';

export function useIsMobileAdmin() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isMobile;
}

const NAV = [
  { path: '/admin/dashboard', icon: ChartBar, label: 'Dashboard' },
  { path: '/admin/board',     icon: List,     label: 'Board' },
  { path: '/admin/technicians', icon: Wrench, label: 'ช่าง' },
  { path: '/admin/settings',  icon: Settings, label: 'ตั้งค่า' },
];

const AdminLayout: React.FC = () => {
  const isMobile = useIsMobileAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  /* ── DESKTOP ── */
  if (!isMobile) {
    return (
      <div className="admin-layout dn">
        <Sidebar />
        <div style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
          <Outlet />
        </div>
      </div>
    );
  }

  /* ── MOBILE ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <Outlet />
        <div style={{ height: 80 }} /> {/* bottom tab clearance */}
      </div>

      {/* Frosted glass bottom tab bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        display: 'flex', alignItems: 'stretch',
      } as React.CSSProperties}>
        {NAV.map(item => {
          const active = location.pathname === item.path ||
            (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 3, padding: '10px 0 8px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 11,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--brand)' : 'var(--ink-4)',
              }}>
              <item.icon size={22} stroke={active ? 'var(--brand)' : 'var(--ink-4)'} />
              {item.label}
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default AdminLayout;
