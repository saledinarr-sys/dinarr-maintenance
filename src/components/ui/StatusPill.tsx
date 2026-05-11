import React from 'react';
import type { TicketStatus } from '../../types';
import { STATUS_LABEL } from '../../types';

interface Props {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

const DOT_COLOR: Record<TicketStatus, string> = {
  new: '#2B7CE9',
  progress: '#E08A1E',
  done: '#2BA672',
};

const StatusPill: React.FC<Props> = ({ status, size = 'md' }) => (
  <span className={`dn-pill pill-${status}`} style={size === 'sm' ? { fontSize: 11, height: 20, padding: '0 8px' } : {}}>
    <span className="dot" style={{ background: DOT_COLOR[status] }} />
    {STATUS_LABEL[status]}
  </span>
);

export default StatusPill;
