import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo, ChartBar, List, Wrench, Settings, Logout } from '../ui/Icon';
import { useApp } from '../../context/AppContext';
import { getSettings } from '../../hooks/useSettings';

const NAV = [
  { path: '/admin/dashboard', icon: ChartBar, label: 'Dashboard' },
  { path: '/admin/board', icon: List, label: 'งานทั้งหมด' },
  { path: '/admin/technicians', icon: Wrench, label: 'ช่างซ่อม' },
  { path: '/admin/settings', icon: Settings, label: 'ตั้งค่า' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useApp();

  return (
    <div style={{
      width: 232, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logo size={32} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-1)' }}>{getSettings().orgName || 'Dinarr'}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{getSettings().orgDept || 'ระบบแจ้งซ่อม'}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
        {NAV.map(item => {
          const active = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 12px', borderRadius: 'var(--r-md)', marginBottom: 2,
                background: active ? 'var(--brand-soft)' : 'transparent',
                color: active ? 'var(--brand)' : 'var(--ink-3)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: active ? 600 : 400,
                transition: 'all .15s',
              }}
              onMouseEnter={e => !active && (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
            >
              <item.icon size={18} stroke={active ? 'var(--brand)' : 'var(--ink-3)'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User profile */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--ok-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--ok)', flexShrink: 0,
          }}>
            {(getSettings().adminName ?? user?.name ?? 'A').charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {getSettings().adminName || user?.name || 'Admin'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{getSettings().adminTitle || 'หัวหน้าฝ่าย'}</div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '8px 12px', borderRadius: 'var(--r-md)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--ink-3)', fontSize: 13, fontFamily: 'inherit',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--crit-soft)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Logout size={16} />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
