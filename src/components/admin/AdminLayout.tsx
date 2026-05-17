/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ChartBar, List, Wrench, Settings } from '../ui/Icon';
import Sidebar from './Sidebar';
import { useDarkMode } from '../../hooks/useDarkMode';

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
  const { dark, toggle } = useDarkMode();

  /* ── DESKTOP ── */
  if (!isMobile) {
    return (
      <div className="admin-layout dn">
        <Sidebar darkToggle={
          <button onClick={toggle} title={dark ? 'โหมดสว่าง' : 'โหมดมืด'}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-pill)', cursor: 'pointer', padding: '6px 12px',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 14,
              color: 'var(--ink-2)', width: '100%', justifyContent: 'center',
            }}>
            {dark ? '☀️ โหมดสว่าง' : '🌙 โหมดมืด'}
          </button>
        } />
        <div style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
          <Outlet />
        </div>
      </div>
    );
  }

  /* ── MOBILE ── */
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh' }}>

      {/* Phone-shell container — centered, max 430px */}
      <div className="phone-root dn" style={{ overflow: 'visible' }}>

        {/* Scrollable content */}
        <div className="no-scrollbar" style={{
          flex: 1, overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 80,
        } as React.CSSProperties}>
          <Outlet />
        </div>

        {/* Bottom tab bar — same style as PhoneShell */}
        <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430, zIndex: 20,
        }}>
          {NAV.map(item => {
            const active = location.pathname === item.path ||
              (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 3, padding: '8px 0',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 10,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--brand)' : 'var(--ink-4)',
                }}>
                <item.icon size={20} stroke={active ? 'var(--brand)' : 'var(--ink-4)'} />
                {item.label}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default AdminLayout;
