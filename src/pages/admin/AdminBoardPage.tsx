import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import PriorityChip from '../../components/ui/PriorityChip';
import MobileAdminTopBar from '../../components/admin/MobileAdminTopBar';
import { useIsMobileAdmin } from '../../components/admin/AdminLayout';
import { Plus } from '../../components/ui/Icon';
import type { TicketStatus } from '../../types';
import { STATUS_LABEL, CATEGORY_COLOR, CATEGORY_LABEL } from '../../types';
import { CATEGORY_ICONS } from '../../components/ui/Icon';

const COLUMNS: { status: TicketStatus; color: string; bg: string; emoji: string }[] = [
  { status: 'new',      color: '#2B7CE9', bg: '#EEF4FD', emoji: '🆕' },
  { status: 'progress', color: '#F59E0B', bg: '#FFFBEB', emoji: '🔧' },
  { status: 'done',     color: '#10B981', bg: '#ECFDF5', emoji: '✅' },
];

const PRIORITY_BORDER: Record<string, string> = {
  crit: '#EF4444', high: '#F59E0B', mid: '#2B7CE9', low: '#D1D5DB',
};

const AdminBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobileAdmin();
  const { tickets, loading } = useTickets();
  const [activeStatus, setActiveStatus] = useState<TicketStatus>('new');

  const totalActive = tickets.filter(t => t.status !== 'done').length;

  /* ── MOBILE — filter tabs + single column ── */
  if (isMobile) {
    const col = COLUMNS.find(c => c.status === activeStatus)!;
    const colTickets = tickets.filter(t => t.status === activeStatus);

    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <MobileAdminTopBar
          title="Kanban"
          subtitle="ภาพรวมคิวงานซ่อม"
          action={
            <button className="btn btn-primary" onClick={() => navigate('/admin/new')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', fontSize: 13, borderRadius: 'var(--r-md)' }}>
              <Plus size={14} stroke="#fff" />แจ้ง
            </button>
          }
        />

        {/* Status filter tabs */}
        <div className="no-scrollbar" style={{
          display: 'flex', gap: 8, padding: '12px 16px 6px',
          overflowX: 'auto', WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}>
          {COLUMNS.map(c => {
            const count = tickets.filter(t => t.status === c.status).length;
            const isActive = c.status === activeStatus;
            return (
              <button key={c.status} onClick={() => setActiveStatus(c.status)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', borderRadius: 999, flexShrink: 0,
                  background: isActive ? c.bg : 'var(--surface)',
                  border: `1px solid ${isActive ? c.color + '80' : 'var(--border)'}`,
                  color: isActive ? c.color : 'var(--ink-4)',
                  fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
                  cursor: 'pointer',
                }}>
                <span style={{ fontSize: 13 }}>{c.emoji}</span>
                {STATUS_LABEL[c.status]}
                <span style={{
                  background: isActive ? '#fff' : 'var(--surface-2)',
                  color: isActive ? c.color : 'var(--ink-4)',
                  fontSize: 10.5, fontWeight: 700,
                  minWidth: 18, height: 18, padding: '0 5px',
                  borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Card list */}
        <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--ink-4)', padding: '48px 0', fontSize: 14 }}>กำลังโหลด...</div>
          ) : colTickets.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: col.color + '80', fontSize: 13,
              border: `1.5px dashed ${col.color}40`, borderRadius: 12, marginTop: 8 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{col.emoji}</div>
              ไม่มีงานในสถานะนี้
            </div>
          ) : colTickets.map(t => {
            const CatIcon = CATEGORY_ICONS[t.category_id];
            const catColor = CATEGORY_COLOR[t.category_id];
            const borderColor = PRIORITY_BORDER[t.priority] ?? '#D1D5DB';
            return (
              <div key={t.id}
                onClick={() => navigate(`/staff/ticket/${t.id}`)}
                style={{
                  background: 'var(--surface)', borderRadius: 12,
                  padding: '14px 14px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                  borderLeft: `3px solid ${borderColor}`,
                  border: '1px solid var(--border)',
                  borderLeftWidth: 3, borderLeftColor: borderColor,
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 10.5, fontFamily: 'monospace', color: 'var(--ink-4)', background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 5, fontWeight: 700, letterSpacing: 0.4 }}>
                    {t.id}
                  </span>
                  <PriorityChip priority={t.priority} showLabel={false} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)', lineHeight: 1.4, marginBottom: 10 }}>
                  {t.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: catColor + '15', borderRadius: 'var(--r-pill)', padding: '3px 8px' }}>
                    <CatIcon size={11} stroke={catColor} />
                    <span style={{ fontSize: 10.5, color: catColor, fontWeight: 600 }}>{CATEGORY_LABEL[t.category_id]}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--ink-4)', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.where_loc.split('·')[0]?.trim()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && totalActive > 0 && (
          <div style={{ padding: '0 16px 16px', fontSize: 12, color: 'var(--ink-4)', textAlign: 'right' }}>
            งานค้างอยู่ทั้งหมด {totalActive} รายการ
          </div>
        )}
      </div>
    );
  }

  /* ── DESKTOP — 5-column kanban ── */
  return (
    <div className="admin-page" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-1)' }}>Kanban Board</div>
          <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>ภาพรวมคิวงานซ่อมทั้งหมด</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--ink-4)', padding: '48px 0', fontSize: 15 }}>กำลังโหลด...</div>
      ) : (
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
          {COLUMNS.map(col => {
            const colTickets = tickets.filter(t => t.status === col.status);
            return (
              <div key={col.status} style={{ minWidth: 268, maxWidth: 268, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ borderRadius: '12px 12px 0 0', background: col.bg, border: `1.5px solid ${col.color}40`, borderBottom: 'none', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15 }}>{col.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: col.color, flex: 1 }}>{STATUS_LABEL[col.status]}</span>
                  <div style={{ minWidth: 24, height: 24, borderRadius: 12, background: col.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                    {colTickets.length}
                  </div>
                </div>
                <div style={{ background: col.bg + '80', border: `1.5px solid ${col.color}40`, borderTop: `2px solid ${col.color}`, borderRadius: '0 0 12px 12px', padding: '10px 10px 12px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80 }}>
                  {colTickets.map(t => {
                    const CatIcon = CATEGORY_ICONS[t.category_id];
                    const catColor = CATEGORY_COLOR[t.category_id];
                    const borderColor = PRIORITY_BORDER[t.priority] ?? '#D1D5DB';
                    return (
                      <div key={t.id} onClick={() => navigate(`/staff/ticket/${t.id}`)}
                        style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: `3px solid ${borderColor}`, transition: 'transform .12s, box-shadow .12s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--ink-4)', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>{t.id}</span>
                          <PriorityChip priority={t.priority} showLabel={false} />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-1)', lineHeight: 1.4, marginBottom: 10 }}>{t.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: catColor + '15', borderRadius: 'var(--r-pill)', padding: '3px 8px' }}>
                            <CatIcon size={11} stroke={catColor} />
                            <span style={{ fontSize: 10, color: catColor, fontWeight: 600 }}>{CATEGORY_LABEL[t.category_id]}</span>
                          </div>
                          <span style={{ fontSize: 10, color: 'var(--ink-4)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.where_loc.split('·')[0]?.trim()}</span>
                        </div>
                      </div>
                    );
                  })}
                  {colTickets.length === 0 && (
                    <div style={{ padding: '20px 0', textAlign: 'center', color: col.color + '80', fontSize: 12, border: `1.5px dashed ${col.color}40`, borderRadius: 8 }}>ไม่มีงาน</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && totalActive > 0 && (
        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-4)', textAlign: 'right' }}>
          งานที่ยังค้างอยู่ทั้งหมด {totalActive} รายการ
        </div>
      )}
    </div>
  );
};

export default AdminBoardPage;
