import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PhoneShell from '../../components/staff/PhoneShell';
import StatusPill from '../../components/ui/StatusPill';
import PriorityChip from '../../components/ui/PriorityChip';
import Timeline from '../../components/ui/Timeline';
import { CATEGORY_ICONS, MapPin, Clock, Phone, CheckCircle, X } from '../../components/ui/Icon';
import { useTicket, useTickets } from '../../hooks/useTickets';
import { useTicketEvents } from '../../hooks/useTicketEvents';
import { useTechnician } from '../../hooks/useTechnicians';
import { useApp } from '../../context/AppContext';
import type { Ticket, TicketStatus } from '../../types';
import { CATEGORY_LABEL, CATEGORY_COLOR } from '../../types';

/* ─── Photo Lightbox ─── */
const PhotoLightbox: React.FC<{
  urls: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}> = ({ urls, index, onClose, onPrev, onNext }) => (
  <div
    style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    onClick={onClose}
  >
    {/* Close */}
    <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <X size={20} stroke="#fff" />
    </button>

    {/* Counter */}
    <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
      {index + 1} / {urls.length}
    </div>

    {/* Prev */}
    {urls.length > 1 && (
      <button onClick={e => { e.stopPropagation(); onPrev(); }} style={{ position: 'absolute', left: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: '#fff', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
    )}

    {/* Image */}
    <img
      src={urls[index]}
      onClick={e => e.stopPropagation()}
      style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
    />

    {/* Next */}
    {urls.length > 1 && (
      <button onClick={e => { e.stopPropagation(); onNext(); }} style={{ position: 'absolute', right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: '#fff', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
    )}
  </div>
);

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
    <span style={{ fontSize: 13, color: 'var(--ink-3)', flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500, textAlign: 'right' }}>{value}</span>
  </div>
);

/* ─── Confirm Close Dialog ─── */
const ConfirmDoneDialog: React.FC<{
  onConfirm: () => void;
  onClose: () => void;
  saving: boolean;
}> = ({ onConfirm, onClose, saving }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    onClick={onClose}>
    <div style={{ background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 360, padding: '28px 24px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
      onClick={e => e.stopPropagation()}>
      <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
        <X size={18} stroke="var(--ink-3)" />
      </button>
      <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-1)', marginBottom: 8 }}>ยืนยันปิดงาน?</div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 24, lineHeight: 1.6 }}>
        งานนี้จะถูกบันทึกเป็น<br />
        <strong style={{ color: 'var(--ok)' }}>เสร็จสิ้น</strong>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button className="btn" onClick={onClose}
          style={{ padding: '9px 24px', fontSize: 13, color: 'var(--ink-3)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          ยกเลิก
        </button>
        <button className="btn btn-primary" onClick={onConfirm} disabled={saving}
          style={{ padding: '9px 24px', fontSize: 13, background: 'var(--ok)', border: 'none' }}>
          {saving ? 'กำลังบันทึก...' : 'ยืนยัน'}
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */

const StaffDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useApp();
  const { ticket: fetchedTicket, loading } = useTicket(id ?? '');
  const { events } = useTicketEvents(id ?? '');
  const { updateStatus } = useTickets();

  const [ticket, setLocalTicket] = useState<Ticket | null>(null);
  useEffect(() => { if (fetchedTicket) setLocalTicket(fetchedTicket); }, [fetchedTicket]);

  const { technician } = useTechnician(ticket?.assigned_tech_id ?? '');
  const [confirmDone, setConfirmDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (loading) return <PhoneShell title="กำลังโหลด..." showBack><div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-4)' }}>กำลังโหลด...</div></PhoneShell>;
  if (!ticket) return <PhoneShell title="ไม่พบข้อมูล" showBack><div style={{ padding: 24 }}>ไม่พบคำขอนี้</div></PhoneShell>;

  const CatIcon = CATEGORY_ICONS[ticket.category_id];
  const catColor = CATEGORY_COLOR[ticket.category_id];
  const actorName = user?.name ?? 'เจ้าหน้าที่';
  const isStaff = user?.role === 'staff';
  const isAdmin = user?.role === 'admin';

  const applyStatus = async (newStatus: TicketStatus) => {
    setSaving(true);
    const updated: Ticket = { ...ticket, status: newStatus };
    await updateStatus({ ticketId: ticket.id, status: newStatus, actorName });
    setLocalTicket(updated);
    setSaving(false);
    setConfirmDone(false);
  };

  return (
    <PhoneShell title={ticket.id} showBack>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Status + Priority */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <StatusPill status={ticket.status} />
        <PriorityChip priority={ticket.priority} />
      </div>

      {/* Title */}
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-1)', marginBottom: 16, lineHeight: 1.3 }}>
        {ticket.title}
      </div>

      {/* Info card */}
      <div className="dn-card" style={{ padding: '0 16px', marginBottom: 16 }}>
        <Row label="ประเภท" value={
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: catColor }}>
            <CatIcon size={14} stroke={catColor} />
            {CATEGORY_LABEL[ticket.category_id]}
          </span>
        } />
        <Row label="สถานที่" value={
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={12} />
            {ticket.where_loc}
          </span>
        } />
        <Row label="ผู้แจ้ง" value={`${ticket.reporter_name} · ${ticket.reporter_role}`} />
        {technician && <Row label="ช่างที่รับผิดชอบ" value={<span style={{ color: 'var(--brand)', fontWeight: 600 }}>{technician.name}</span>} />}
        <Row label="วันที่แจ้ง" value={new Date(ticket.created_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>SLA</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}>
            <Clock size={12} />
            {ticket.sla_hours} ชั่วโมง
          </span>
        </div>
      </div>

      {/* Description */}
      {ticket.description && (
        <div className="dn-card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 8 }}>รายละเอียด</div>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>{ticket.description}</div>
        </div>
      )}

      {/* Photos */}
      {ticket.photo_urls.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 8 }}>ภาพถ่าย ({ticket.photo_urls.length})</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ticket.photo_urls.map((url, i) => (
              <div key={i} onClick={() => setLightboxIdx(i)} style={{ cursor: 'zoom-in', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border)', transition: 'opacity .15s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                <img src={url} style={{ width: 80, height: 80, objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <PhotoLightbox
          urls={ticket.photo_urls}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx(i => (i! - 1 + ticket.photo_urls.length) % ticket.photo_urls.length)}
          onNext={() => setLightboxIdx(i => (i! + 1) % ticket.photo_urls.length)}
        />
      )}

      {/* Timeline */}
      {events.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 12 }}>ประวัติการดำเนินการ</div>
          <Timeline events={events} />
        </div>
      )}

      {/* ── STAFF ACTIONS ── */}
      {isStaff && ticket.status === 'new' && (
        <button className="btn btn-primary" onClick={() => applyStatus('progress')} disabled={saving}
          style={{ width: '100%', height: 48, fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
          🔧 เริ่มดำเนินการ
        </button>
      )}

      {isStaff && ticket.status === 'progress' && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <button className="btn" onClick={() => applyStatus('new')} disabled={saving}
            style={{ flex: 1, height: 44, fontSize: 14, fontWeight: 600, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--ink-3)', borderRadius: 'var(--r-lg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
            ← ย้อนกลับ
          </button>
          <button className="btn" onClick={() => applyStatus('done')} disabled={saving}
            style={{ flex: 2, height: 44, fontSize: 14, fontWeight: 600, background: 'var(--ok)', color: '#fff', border: 'none', borderRadius: 'var(--r-lg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'inherit' }}>
            ✅ เสร็จสิ้น
          </button>
        </div>
      )}

      {/* Rating */}
      {ticket.status === 'done' && !ticket.rating && (
        <button onClick={() => navigate(`/staff/ticket/${ticket.id}/rate`)}
          className="btn btn-primary" style={{ width: '100%', marginBottom: 8 }}>
          <CheckCircle size={18} stroke="#fff" />
          ประเมินการซ่อม
        </button>
      )}

      {ticket.status === 'done' && ticket.rating && (
        <div className="dn-card" style={{ padding: 16, textAlign: 'center', background: 'var(--ok-soft)', border: '1px solid var(--ok)', marginBottom: 8 }}>
          <div style={{ fontSize: 13, color: '#1B6F4D', fontWeight: 500 }}>⭐ คะแนนของคุณ: {ticket.rating}/5</div>
        </div>
      )}

      {/* ── ADMIN ACTION ── */}
      {isAdmin && ticket.status !== 'done' && (
        <button onClick={() => setConfirmDone(true)}
          style={{ width: '100%', height: 48, fontSize: 15, fontWeight: 600, marginBottom: 8, background: 'var(--ok)', color: '#fff', border: 'none', borderRadius: 'var(--r-lg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}>
          <CheckCircle size={18} stroke="#fff" />
          ปิดงาน / ตรวจรับงานเสร็จ
        </button>
      )}

      {/* Phone */}
      {technician && ticket.status !== 'done' && (
        <a href={`tel:${technician.phone}`} className="btn btn-ghost"
          style={{ width: '100%', textDecoration: 'none', justifyContent: 'center', marginBottom: 8 }}>
          <Phone size={16} />
          โทรช่าง ({technician.name})
        </a>
      )}

      {confirmDone && (
        <ConfirmDoneDialog saving={saving} onConfirm={() => applyStatus('done')} onClose={() => setConfirmDone(false)} />
      )}
      </div>
    </PhoneShell>
  );
};

export default StaffDetailPage;
