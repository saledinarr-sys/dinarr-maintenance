import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneShell from '../../components/staff/PhoneShell';
import TicketRow from '../../components/shared/TicketRow';
import { useTickets } from '../../hooks/useTickets';
import { useApp } from '../../context/AppContext';
import type { TicketStatus } from '../../types';

const FILTERS: { label: string; value: TicketStatus | 'all' }[] = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'รอรับ', value: 'new' },
  { label: 'กำลังทำ', value: 'progress' },
  { label: 'เสร็จแล้ว', value: 'done' },
];

const TechQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const { tickets, loading } = useTickets(user?.tech_id ? { assigned_tech_id: user.tech_id } : undefined);
  const [filter, setFilter] = useState<TicketStatus | 'all'>('all');

  const filtered = filter === 'all'
    ? tickets
    : tickets.filter(t => t.status === filter);

  const todayCount = tickets.filter(t => {
    const d = new Date(t.created_at);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  }).length;
  const critCount = tickets.filter(t => t.priority === 'crit' && t.status !== 'done').length;
  const doneCount = tickets.filter(t => t.status === 'done').length;

  return (
    <PhoneShell title={`งานของ${user?.name ?? 'ช่าง'}`} role="tech" showBell>
      {/* Stats strip */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'วันนี้', value: todayCount, color: 'var(--brand)' },
          { label: 'ฉุกเฉิน', value: critCount, color: 'var(--crit)' },
          { label: 'เสร็จแล้ว', value: doneCount, color: 'var(--ok)' },
        ].map(s => (
          <div key={s.label} className="dn-card" style={{ flex: 1, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--r-pill)', flexShrink: 0,
              border: `1.5px solid ${filter === f.value ? 'var(--brand)' : 'var(--border-strong)'}`,
              background: filter === f.value ? 'var(--brand-soft)' : 'var(--surface)',
              color: filter === f.value ? 'var(--brand-2)' : 'var(--ink-3)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--ink-4)', padding: '32px 0' }}>กำลังโหลด...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--ink-4)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div>ไม่มีงานค้างอยู่</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(t => (
            <TicketRow key={t.id} ticket={t} onClick={() => navigate(`/tech/ticket/${t.id}`)} />
          ))}
        </div>
      )}
    </PhoneShell>
  );
};

export default TechQueuePage;
