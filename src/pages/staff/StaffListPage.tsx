import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneShell from '../../components/staff/PhoneShell';
import { useTickets } from '../../hooks/useTickets';
import { useApp } from '../../context/AppContext';
import PriorityChip from '../../components/ui/PriorityChip';
import { CATEGORY_ICONS, Clock } from '../../components/ui/Icon';
import { CATEGORY_COLOR, CATEGORY_LABEL } from '../../types';
import type { TicketStatus, Ticket } from '../../types';

type KanbanCol = 'new' | 'progress' | 'done';

const COLUMNS: { key: KanbanCol; label: string; emoji: string; color: string; bg: string }[] = [
  { key: 'new',      label: 'รับเรื่อง',  emoji: '🆕', color: '#2B7CE9', bg: '#EEF4FD' },
  { key: 'progress', label: 'ดำเนินการ',  emoji: '🔧', color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'done',     label: 'เสร็จ',      emoji: '✅', color: '#10B981', bg: '#ECFDF5' },
];

function slaRemaining(createdAt: string, slaHours: number) {
  const diff = new Date(createdAt).getTime() + slaHours * 3600000 - Date.now();
  if (diff <= 0) return { text: 'เกินเวลา', overdue: true };
  const h = Math.floor(diff / 3600000);
  return { text: h > 0 ? `${h} ชม.` : `${Math.floor(diff / 60000)} นาที`, overdue: false };
}

/* ─── Ticket card with quick status button ─── */
const KanbanCard: React.FC<{
  ticket: Ticket;
  colKey: KanbanCol;
  isStaff: boolean;
  onNavigate: () => void;
  onStatusChange: (t: Ticket, s: TicketStatus) => void;
}> = ({ ticket, colKey, isStaff, onNavigate, onStatusChange }) => {
  const CatIcon = CATEGORY_ICONS[ticket.category_id];
  const catColor = CATEGORY_COLOR[ticket.category_id];
  const sla = ticket.status !== 'done' ? slaRemaining(ticket.created_at, ticket.sla_hours) : null;

  return (
    <div className="dn-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Main content — click to detail */}
      <div onClick={onNavigate} style={{ padding: '13px 14px 10px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--ink-4)', background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 5 }}>
            {ticket.id}
          </span>
          <PriorityChip priority={ticket.priority} showLabel={false} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)', marginBottom: 6, lineHeight: 1.35 }}>
          {ticket.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: catColor + '15', borderRadius: 20, padding: '3px 8px' }}>
            <CatIcon size={11} stroke={catColor} />
            <span style={{ fontSize: 11, color: catColor, fontWeight: 600 }}>{CATEGORY_LABEL[ticket.category_id]}</span>
          </div>
          {sla && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: sla.overdue ? 'var(--crit)' : 'var(--ink-4)' }}>
              <Clock size={11} stroke={sla.overdue ? 'var(--crit)' : 'var(--ink-4)'} />
              {sla.text}
            </div>
          )}
        </div>
      </div>

      {/* Quick status buttons — staff only, not on done */}
      {isStaff && colKey !== 'done' && (
        <div style={{ borderTop: '1px solid var(--border)', display: 'flex' }}>
          {colKey === 'new' && (
            <button
              onClick={e => { e.stopPropagation(); onStatusChange(ticket, 'progress'); }}
              style={{ flex: 1, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#F59E0B', fontFamily: 'inherit' }}>
              🔧 เริ่มดำเนินการ
            </button>
          )}
          {colKey === 'progress' && (
            <>
              <button
                onClick={e => { e.stopPropagation(); onStatusChange(ticket, 'new'); }}
                style={{ flex: 1, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', fontFamily: 'inherit', borderRight: '1px solid var(--border)' }}>
                ← ย้อนกลับ
              </button>
              <button
                onClick={e => { e.stopPropagation(); onStatusChange(ticket, 'done'); }}
                style={{ flex: 1, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#10B981', fontFamily: 'inherit' }}>
                ✅ เสร็จสิ้น
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════ */

const StaffListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const { tickets, loading, updateStatus } = useTickets();
  const [activeCol, setActiveCol] = useState<KanbanCol>('new');

  const isStaff = user?.role === 'staff';
  const col = COLUMNS.find(c => c.key === activeCol)!;
  const colTickets = tickets.filter(t => t.status === activeCol);

  const handleStatusChange = async (ticket: Ticket, newStatus: TicketStatus) => {
    await updateStatus({
      ticketId: ticket.id,
      status: newStatus,
      actorName: user?.name ?? 'เจ้าหน้าที่',
    });
  };

  return (
    <PhoneShell title="คำขอ" noPad>

      {/* Kanban tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        {COLUMNS.map(c => {
          const count = tickets.filter(t => t.status === c.key).length;
          const isActive = c.key === activeCol;
          return (
            <button key={c.key} onClick={() => setActiveCol(c.key)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 3, padding: '12px 4px 10px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit',
                borderBottom: `2.5px solid ${isActive ? c.color : 'transparent'}`,
                transition: 'border-color .15s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 13 }}>{c.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? c.color : 'var(--ink-3)' }}>
                  {c.label}
                </span>
              </div>
              <div style={{
                minWidth: 20, height: 20, borderRadius: 10,
                background: isActive ? c.color : 'var(--surface-2)',
                color: isActive ? '#fff' : 'var(--ink-4)',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 6px',
              }}>
                {count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div style={{ padding: '12px 16px 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--ink-4)', padding: '48px 0' }}>กำลังโหลด...</div>
        ) : colTickets.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 20px', marginTop: 8,
            color: col.color + '99', fontSize: 13, fontWeight: 500,
            border: `1.5px dashed ${col.color}40`, borderRadius: 14,
            background: col.bg + '60',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{col.emoji}</div>
            ไม่มีคำขอในหมวดนี้
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {colTickets.map(t => (
              <KanbanCard
                key={t.id}
                ticket={t}
                colKey={activeCol}
                isStaff={isStaff}
                onNavigate={() => navigate(`/staff/ticket/${t.id}`)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

    </PhoneShell>
  );
};

export default StaffListPage;
