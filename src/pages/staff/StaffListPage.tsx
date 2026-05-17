import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneShell from '../../components/staff/PhoneShell';
import { useTickets } from '../../hooks/useTickets';
import { useApp } from '../../context/AppContext';
import PriorityChip from '../../components/ui/PriorityChip';
import { CATEGORY_ICONS, Clock, User } from '../../components/ui/Icon';
import { useTechnicians } from '../../hooks/useTechnicians';
import { CATEGORY_COLOR, CATEGORY_LABEL } from '../../types';
import type { TicketStatus, Ticket, Technician } from '../../types';

type KanbanCol = 'new' | 'progress' | 'done';

const AssignTechDialog: React.FC<{
  technicians: Technician[];
  selectedId: string;
  onChange: (id: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  saving: boolean;
}> = ({ technicians, selectedId, onChange, onConfirm, onClose, saving }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    onClick={onClose}>
    <div style={{ background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 380, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
      onClick={e => e.stopPropagation()}>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-1)', marginBottom: 4 }}>🔧 มอบหมายช่าง</div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>เลือกช่างที่รับผิดชอบงานนี้</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, maxHeight: 280, overflowY: 'auto' }}>
        {technicians.map(t => (
          <label key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
            borderRadius: 'var(--r-md)', cursor: 'pointer',
            border: `2px solid ${selectedId === t.id ? 'var(--brand)' : 'var(--border)'}`,
            background: selectedId === t.id ? 'var(--brand-soft)' : 'var(--surface-2)',
            transition: 'all .15s',
          }}>
            <input type="radio" name="assignTech" checked={selectedId === t.id}
              onChange={() => onChange(t.id)} style={{ display: 'none' }} />
            <div style={{
              width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${selectedId === t.id ? 'var(--brand)' : 'var(--border-strong)'}`,
              background: selectedId === t.id ? 'var(--brand)' : 'transparent',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: selectedId === t.id ? 'var(--brand)' : 'var(--ink-1)' }}>{t.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{t.role} · {t.status === 'free' ? '✅ ว่าง' : t.status === 'busy' ? '🔧 กำลังทำงาน' : '🔴 หยุดงาน'}</div>
            </div>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '10px', fontSize: 13, color: 'var(--ink-3)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', cursor: 'pointer', fontFamily: 'inherit' }}>
          ยกเลิก
        </button>
        <button onClick={onConfirm} disabled={saving || !selectedId}
          style={{ flex: 2, padding: '10px', fontSize: 13, fontWeight: 600, background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 'var(--r-lg)', cursor: selectedId ? 'pointer' : 'not-allowed', opacity: !selectedId ? 0.5 : 1, fontFamily: 'inherit' }}>
          {saving ? 'กำลังบันทึก...' : 'เริ่มดำเนินการ'}
        </button>
      </div>
    </div>
  </div>
);

const COLUMNS: { key: KanbanCol; label: string; color: string; bg: string; border: string }[] = [
  { key: 'new',      label: 'รับเรื่อง',  color: '#2B7CE9', bg: '#F0F5FF', border: '#BFCFF8' },
  { key: 'progress', label: 'ดำเนินการ',  color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  { key: 'done',     label: 'เสร็จแล้ว',  color: '#059669', bg: '#F0FDF4', border: '#86EFAC' },
];

function slaRemaining(createdAt: string, slaHours: number) {
  const diff = new Date(createdAt).getTime() + slaHours * 3600000 - Date.now();
  if (diff <= 0) return { text: 'เกินเวลา', overdue: true };
  const h = Math.floor(diff / 3600000);
  return { text: h > 0 ? `${h} ชม.` : `${Math.floor(diff / 60000)} นาที`, overdue: false };
}

function useIsMobile() {
  const [v, set] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => set(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return v;
}

const KanbanCard: React.FC<{
  ticket: Ticket;
  colKey: KanbanCol;
  isStaff: boolean;
  techName?: string;
  onNavigate: () => void;
  onStatusChange: (t: Ticket, s: TicketStatus) => void;
}> = ({ ticket, colKey, isStaff, techName, onNavigate, onStatusChange }) => {
  const CatIcon = CATEGORY_ICONS[ticket.category_id];
  const catColor = CATEGORY_COLOR[ticket.category_id];
  const sla = ticket.status !== 'done' ? slaRemaining(ticket.created_at, ticket.sla_hours) : null;

  return (
    <div className="dn-card" style={{ padding: 0, overflow: 'hidden', transition: 'box-shadow .15s' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-2)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>

      <div onClick={onNavigate} style={{ padding: '12px 14px 10px', cursor: 'pointer' }}>
        {/* ID + Priority */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--ink-4)', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>
            {ticket.id}
          </span>
          <PriorityChip priority={ticket.priority} showLabel={false} />
        </div>

        {/* Title */}
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-1)', marginBottom: 8, lineHeight: 1.4 }}>
          {ticket.title}
        </div>

        {/* Reporter + Tech */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--ink-4)' }}>
            <User size={10} stroke="var(--ink-4)" />
            <span>{ticket.reporter_name}</span>
            {ticket.reporter_role && <span style={{ color: 'var(--ink-5, var(--ink-4))' }}>· {ticket.reporter_role}</span>}
          </div>
          {techName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--brand)' }}>
              <span>🔧</span>
              <span style={{ fontWeight: 600 }}>{techName}</span>
            </div>
          )}
        </div>

        {/* Category + SLA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: catColor + '15', borderRadius: 20, padding: '2px 7px' }}>
            <CatIcon size={10} stroke={catColor} />
            <span style={{ fontSize: 10, color: catColor, fontWeight: 600 }}>{CATEGORY_LABEL[ticket.category_id]}</span>
          </div>
          {sla && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: sla.overdue ? 'var(--crit)' : 'var(--ink-4)' }}>
              <Clock size={10} stroke={sla.overdue ? 'var(--crit)' : 'var(--ink-4)'} />
              {sla.text}
            </div>
          )}
        </div>
      </div>

      {/* Quick action buttons */}
      {isStaff && colKey !== 'done' && (
        <div style={{ borderTop: '1px solid var(--border)', display: 'flex' }}>
          {colKey === 'new' && (
            <button onClick={e => { e.stopPropagation(); onStatusChange(ticket, 'progress'); }}
              style={{ flex: 1, padding: '7px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#D97706', fontFamily: 'inherit' }}>
              🔧 เริ่มดำเนินการ
            </button>
          )}
          {colKey === 'progress' && (
            <>
              <button onClick={e => { e.stopPropagation(); onStatusChange(ticket, 'new'); }}
                style={{ flex: 1, padding: '7px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500, color: 'var(--ink-3)', fontFamily: 'inherit', borderRight: '1px solid var(--border)' }}>
                ← ย้อนกลับ
              </button>
              <button onClick={e => { e.stopPropagation(); onStatusChange(ticket, 'done'); }}
                style={{ flex: 1, padding: '7px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#059669', fontFamily: 'inherit' }}>
                ✅ เสร็จสิ้น
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const StaffListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const { tickets, loading, updateStatus, refetch } = useTickets();
  const { technicians } = useTechnicians();
  const [activeCol, setActiveCol] = useState<KanbanCol>('new');
  const [assignTicket, setAssignTicket] = useState<Ticket | null>(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [saving, setSaving] = useState(false);
  const isMobile = useIsMobile();
  const isStaff = user?.role === 'staff';

  const getTechName = (techId: string | null): string | undefined =>
    techId ? technicians.find(t => t.id === techId)?.name : undefined;

  const handleStatusChange = async (ticket: Ticket, newStatus: TicketStatus) => {
    if (newStatus === 'progress') {
      setAssignTicket(ticket);
      setSelectedTechId('');
      return;
    }
    await updateStatus({ ticketId: ticket.id, status: newStatus, actorName: user?.name ?? 'เจ้าหน้าที่', ticket });
  };

  const handleConfirmAssign = async () => {
    if (!assignTicket) return;
    setSaving(true);
    const techName = selectedTechId ? technicians.find(t => t.id === selectedTechId)?.name : undefined;
    await updateStatus({
      ticketId: assignTicket.id, status: 'progress',
      actorName: user?.name ?? 'เจ้าหน้าที่',
      ticket: assignTicket, techName,
      assigned_tech_id: selectedTechId || undefined,
    });
    setSaving(false);
    setAssignTicket(null);
    refetch();
  };

  /* ── DESKTOP: 3-column kanban ── */
  if (!isMobile) {
    return (
      <PhoneShell title="คำขอ" noPad>
        <div style={{ padding: '20px 28px', maxWidth: 1100, margin: '0 auto' }}>
          {/* 3 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, alignItems: 'start' }}>
            {COLUMNS.map(col => {
              const colTickets = tickets.filter(t => t.status === col.key);
              return (
                <div key={col.key}>
                  {/* Column header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                    padding: '8px 12px', borderRadius: 'var(--r-md)',
                    background: col.bg, border: `1px solid ${col.border}`,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: col.color, flex: 1 }}>{col.label}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: '#fff',
                      background: col.color, borderRadius: 20, padding: '1px 8px',
                    }}>{colTickets.length}</span>
                  </div>

                  {/* Cards */}
                  {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--ink-4)', padding: '24px 0', fontSize: 13 }}>กำลังโหลด...</div>
                  ) : colTickets.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '24px 12px', borderRadius: 'var(--r-md)',
                      border: `1.5px dashed ${col.border}`, color: col.color + '80',
                      fontSize: 12, background: col.bg + '80',
                    }}>
                      ไม่มีคำขอ
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {colTickets.map(t => (
                        <KanbanCard key={t.id} ticket={t} colKey={col.key} isStaff={isStaff}
                          techName={getTechName(t.assigned_tech_id)}
                          onNavigate={() => navigate(`/staff/ticket/${t.id}`)}
                          onStatusChange={handleStatusChange} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      {assignTicket && (
        <AssignTechDialog technicians={technicians} selectedId={selectedTechId}
          onChange={setSelectedTechId} onConfirm={handleConfirmAssign}
          onClose={() => setAssignTicket(null)} saving={saving} />
      )}
      </PhoneShell>
    );
  }

  /* ── MOBILE: tabbed single column ── */
  const col = COLUMNS.find(c => c.key === activeCol)!;
  const colTickets = tickets.filter(t => t.status === activeCol);

  return (
    <PhoneShell title="คำขอ" noPad>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        {COLUMNS.map(c => {
          const count = tickets.filter(t => t.status === c.key).length;
          const isActive = c.key === activeCol;
          return (
            <button key={c.key} onClick={() => setActiveCol(c.key)} style={{
              flex: 1, padding: '10px 4px 9px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', borderBottom: `2.5px solid ${isActive ? c.color : 'transparent'}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            }}>
              <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? c.color : 'var(--ink-3)' }}>
                {c.label}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, minWidth: 20, height: 18, borderRadius: 10,
                background: isActive ? c.color : 'var(--surface-2)',
                color: isActive ? '#fff' : 'var(--ink-4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ padding: '12px 16px 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--ink-4)', padding: '48px 0' }}>กำลังโหลด...</div>
        ) : colTickets.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px', marginTop: 8,
            color: col.color + '99', fontSize: 13, fontWeight: 500,
            border: `1.5px dashed ${col.border}`, borderRadius: 14, background: col.bg,
          }}>
            ไม่มีคำขอในหมวดนี้
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {colTickets.map(t => (
              <KanbanCard key={t.id} ticket={t} colKey={activeCol} isStaff={isStaff}
                techName={getTechName(t.assigned_tech_id)}
                onNavigate={() => navigate(`/staff/ticket/${t.id}`)}
                onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>

      {assignTicket && (
        <AssignTechDialog technicians={technicians} selectedId={selectedTechId}
          onChange={setSelectedTechId} onConfirm={handleConfirmAssign}
          onClose={() => setAssignTicket(null)} saving={saving} />
      )}
    </PhoneShell>
  );
};

export default StaffListPage;
