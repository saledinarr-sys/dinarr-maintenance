import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo, Home, List, Plus, User, Wrench, ChevronLeft, Bell, Settings } from '../ui/Icon';

interface Tab {
  path: string;
  icon: React.FC<{ size?: number; stroke?: string }>;
  label: string;
}

const STAFF_TABS: Tab[] = [
  { path: '/staff/home', icon: Home, label: 'หน้าแรก' },
  { path: '/staff/list', icon: List, label: 'คำขอ' },
  { path: '/staff/new', icon: Plus, label: 'แจ้งซ่อม' },
  { path: '/staff/technicians', icon: Wrench, label: 'ช่าง' },
];

const TECH_TABS: Tab[] = [
  { path: '/tech/queue', icon: List, label: 'งาน' },
  { path: '/tech/me', icon: User, label: 'ฉัน' },
];

interface Props {
  title?: string;
  showBack?: boolean;
  showBell?: boolean;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  role?: 'staff' | 'tech';
  noPad?: boolean;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

const PhoneShell: React.FC<Props> = ({ title, showBack, showBell, rightAction, children, role = 'staff', noPad }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const tabs = role === 'tech' ? TECH_TABS : STAFF_TABS;
  const currentPath = location.pathname;

  const isActive = (path: string) =>
    currentPath === path || (path !== '/staff/home' && path !== '/tech/queue' && currentPath.startsWith(path));

  /* ── DESKTOP LAYOUT ── */
  if (!isMobile) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Sidebar */}
        <div style={{
          width: 220, flexShrink: 0, background: 'var(--surface)',
          borderRight: '1px solid var(--border)', display: 'flex',
          flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', marginBottom: 32 }}>
            <Logo size={32} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-1)' }}>Dinarr</div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>ระบบแจ้งซ่อม</div>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px', flex: 1 }}>
            {tabs.map(tab => {
              const active = isActive(tab.path);
              return (
                <button key={tab.path} onClick={() => navigate(tab.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                    borderRadius: 'var(--r-md)', background: active ? 'var(--brand-soft)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    color: active ? 'var(--brand-2)' : 'var(--ink-3)', transition: 'background .15s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                  <tab.icon size={18} stroke={active ? 'var(--brand)' : 'var(--ink-3)'} />
                  <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Admin link */}
          <div style={{ padding: '20px 20px 12px 32px', borderTop: '1px solid var(--border)' }}>
            <button onClick={() => navigate('/admin-login')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: 'var(--ink-4)', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0',
              }}>
              <Settings size={14} stroke="var(--ink-4)" />
              เข้าสู่ระบบผู้ดูแล
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top bar */}
          <div style={{
            height: 60, display: 'flex', alignItems: 'center', padding: '0 28px',
            background: 'var(--surface)', borderBottom: '1px solid var(--border)',
            gap: 12, position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
          }}>
            {showBack && (
              <button onClick={() => navigate(-1)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                color: 'var(--brand)', display: 'flex', alignItems: 'center',
              }}>
                <ChevronLeft size={22} />
              </button>
            )}
            <div style={{ flex: 1, fontSize: 18, fontWeight: 700, color: 'var(--ink-1)' }}>
              {title ?? 'Dinarr'}
            </div>
            {showBell && (
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex', padding: 4 }}>
                <Bell size={20} />
              </button>
            )}
            {rightAction}
          </div>

          {/* Page content */}
          <div style={{ flex: 1, padding: noPad ? 0 : '28px 32px', overflowY: 'auto' }}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  /* ── MOBILE LAYOUT ── */
  return (
    <div className="phone-root dn">
      {/* Header */}
      <div style={{
        height: 56, display: 'flex', alignItems: 'center', padding: '0 16px',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        gap: 8, flexShrink: 0, position: 'sticky', top: 0, zIndex: 10,
      }}>
        {showBack ? (
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginLeft: -4, color: 'var(--brand)', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={22} />
          </button>
        ) : (
          <Logo size={28} />
        )}
        <div style={{ flex: 1 }}>
          {title && <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-1)' }}>{title}</div>}
          {!title && !showBack && <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-1)' }}>Dinarr</div>}
        </div>
        {showBell && (
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', display: 'flex', padding: 4 }}>
            <Bell size={20} />
          </button>
        )}
        {rightAction}
      </div>

      {/* Content */}
      <div className="no-scrollbar" style={{
        flex: 1, overflowY: 'auto',
        padding: noPad ? 0 : '16px 16px 80px',
      }}>
        {children}
      </div>

      {/* Tab bar */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center',
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430, zIndex: 20,
      }}>
        {tabs.map(tab => {
          const active = isActive(tab.path);
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0',
                color: active ? 'var(--brand)' : 'var(--ink-4)',
              }}>
              <tab.icon size={20} stroke={active ? 'var(--brand)' : 'var(--ink-4)'} />
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, fontFamily: 'inherit' }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PhoneShell;
