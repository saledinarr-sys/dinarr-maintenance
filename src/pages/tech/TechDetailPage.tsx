import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PhoneShell from '../../components/staff/PhoneShell';
import StatusPill from '../../components/ui/StatusPill';
import PriorityChip from '../../components/ui/PriorityChip';
import Timeline from '../../components/ui/Timeline';
import { CATEGORY_ICONS, MapPin, Clock, Phone, Edit } from '../../components/ui/Icon';
import { useTicket } from '../../hooks/useTickets';
import { useTicketEvents } from '../../hooks/useTicketEvents';
import { CATEGORY_LABEL, CATEGORY_COLOR } from '../../types';

const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
    <span style={{ fontSize: 13, color: 'var(--ink-3)', flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500, textAlign: 'right' }}>{value}</span>
  </div>
);

const TechDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ticket, loading } = useTicket(id ?? '');
  const { events } = useTicketEvents(id ?? '');

  if (loading) return <PhoneShell title="กำลังโหลด..." showBack role="tech"><div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-4)' }}>กำลังโหลด...</div></PhoneShell>;
  if (!ticket) return <PhoneShell title="ไม่พบข้อมูล" showBack role="tech"><div style={{ padding: 24 }}>ไม่พบงานนี้</div></PhoneShell>;

  const CatIcon = CATEGORY_ICONS[ticket.category_id];
  const catColor = CATEGORY_COLOR[ticket.category_id];

  return (
    <PhoneShell title={ticket.id} showBack role="tech">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <StatusPill status={ticket.status} />
        <PriorityChip priority={ticket.priority} />
      </div>

      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-1)', marginBottom: 16, lineHeight: 1.3 }}>
        {ticket.title}
      </div>

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>SLA</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}>
            <Clock size={12} />
            {ticket.sla_hours} ชั่วโมง
          </span>
        </div>
      </div>

      {ticket.description && (
        <div className="dn-card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 8 }}>รายละเอียด</div>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>{ticket.description}</div>
        </div>
      )}

      {ticket.photo_urls.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 8 }}>ภาพถ่าย</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ticket.photo_urls.map((url, i) => (
              <img key={i} src={url} style={{ width: 80, height: 80, borderRadius: 'var(--r-md)', objectFit: 'cover', border: '1px solid var(--border)' }} />
            ))}
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 12 }}>ประวัติการดำเนินการ</div>
          <Timeline events={events} />
        </div>
      )}

      {ticket.status !== 'done' && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <a href={`tel:${ticket.reporter_name}`} className="btn btn-ghost" style={{ flex: 1, textDecoration: 'none' }}>
            <Phone size={16} />
            โทรผู้แจ้ง
          </a>
          <button className="btn btn-primary" style={{ flex: 2 }}
            onClick={() => navigate(`/tech/ticket/${ticket.id}/update`)}>
            <Edit size={16} stroke="#fff" />
            อัปเดตสถานะ
          </button>
        </div>
      )}
    </PhoneShell>
  );
};

export default TechDetailPage;
