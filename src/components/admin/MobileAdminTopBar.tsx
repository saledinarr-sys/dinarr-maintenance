import React from 'react';

interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const MobileAdminTopBar: React.FC<Props> = ({ title, subtitle, action }) => (
  <div style={{
    padding: '20px 16px 14px',
    background: 'var(--bg)',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
    gap: 12,
  }}>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-1)', lineHeight: 1.15 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>{subtitle}</div>}
    </div>
    {action && <div style={{ flexShrink: 0 }}>{action}</div>}
  </div>
);

export default MobileAdminTopBar;
