import React from 'react';
import type { Ticket } from '../../types';
import StatusPill from '../ui/StatusPill';
import PriorityChip from '../ui/PriorityChip';
import { CATEGORY_ICONS } from '../ui/Icon';
import { CATEGORY_COLOR } from '../../types';
import { Clock } from '../ui/Icon';

interface Props {
  ticket: Ticket;
  onClick?: () => void;
}

function slaRemaining(createdAt: string, slaHours: number): string {
  const deadline = new Date(createdAt).getTime() + slaHours * 3600 * 1000;
  const diff = deadline - Date.now();
  if (diff <= 0) return 'เกินเวลา';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `เหลือ ${h} ชม.`;
  return `เหลือ ${m} นาที`;
}

function isOverdue(createdAt: string, slaHours: number): boolean {
  return Date.now() > new Date(createdAt).getTime() + slaHours * 3600 * 1000;
}

const TicketRow: React.FC<Props> = ({ ticket, onClick }) => {
  const CatIcon = CATEGORY_ICONS[ticket.category_id];
  const overdue = ticket.status !== 'done' && isOverdue(ticket.created_at, ticket.sla_hours);
  const isCrit = ticket.priority === 'crit';

  return (
    <div onClick={onClick} className="dn-card" style={{
      padding: '14px 16px', cursor: onClick ? 'pointer' : 'default',
      borderLeft: isCrit ? '3px solid var(--crit)' : undefined,
      transition: 'box-shadow .15s',
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = 'var(--shadow-2)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = '')}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--r-md)', flexShrink: 0,
          background: CATEGORY_COLOR[ticket.category_id] + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: CATEGORY_COLOR[ticket.category_id],
        }}>
          <CatIcon size={18} stroke={CATEGORY_COLOR[ticket.category_id]} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'monospace' }}>{ticket.id}</span>
            <StatusPill status={ticket.status} size="sm" />
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {ticket.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>{ticket.where_loc}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <PriorityChip priority={ticket.priority} />
            {ticket.status !== 'done' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: overdue ? 'var(--crit)' : 'var(--ink-4)' }}>
                <Clock size={12} stroke={overdue ? 'var(--crit)' : 'var(--ink-4)'} />
                {slaRemaining(ticket.created_at, ticket.sla_hours)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketRow;
