import React from 'react';
import { Logo } from '../ui/Icon';

interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const MobileAdminTopBar: React.FC<Props> = ({ title, action }) => (
  <div style={{
    height: 56,
    display: 'flex', alignItems: 'center',
    padding: '0 16px',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    gap: 10, flexShrink: 0,
    position: 'sticky', top: 0, zIndex: 10,
  }}>
    <Logo size={28} />
    <div style={{ flex: 1, fontSize: 16, fontWeight: 600, color: 'var(--ink-1)' }}>{title}</div>
    {action && <div style={{ flexShrink: 0 }}>{action}</div>}
  </div>
);

export default MobileAdminTopBar;
