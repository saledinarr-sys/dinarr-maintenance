import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PhoneShell from '../../components/staff/PhoneShell';
import { Camera, X } from '../../components/ui/Icon';
import { useTicket, useTickets } from '../../hooks/useTickets';
import { useStorage } from '../../hooks/useStorage';
import { useApp } from '../../context/AppContext';
import { useTechnicians } from '../../hooks/useTechnicians';
import type { TicketStatus } from '../../types';
import { supabase } from '../../lib/supabase';

interface StatusOption {
  value: TicketStatus;
  label: string;
  color: string;
  bg: string;
}

const OPTIONS: StatusOption[] = [
  { value: 'progress', label: 'กำลังดำเนินการ', color: 'var(--warn)', bg: 'var(--warn-soft)' },
  { value: 'done',     label: 'ซ่อมเสร็จแล้ว',  color: 'var(--ok)',  bg: 'var(--ok-soft)'  },
];

const TechUpdatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ticket } = useTicket(id ?? '');
  const { updateStatus } = useTickets();
  const { uploadPhotos, uploading } = useStorage();
  const { user } = useApp();

  const { technicians } = useTechnicians();

  const [newStatus, setNewStatus] = useState<TicketStatus | ''>('');
  const [assignedTechId, setAssignedTechId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles(prev => [...prev, ...selected]);
    setPreviews(prev => [...prev, ...selected.map(f => URL.createObjectURL(f))]);
  };

  const removeFile = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setFiles(prev => prev.filter((_, j) => j !== i));
    setPreviews(prev => prev.filter((_, j) => j !== i));
  };

  const handleSubmit = async () => {
    if (!newStatus || !id) return;
    setSubmitting(true);
    try {
      await updateStatus({
        ticketId: id,
        status: newStatus,
        actorName: user?.name ?? 'ช่าง',
        detail: notes.trim() || undefined,
        ticket: ticket ?? undefined,
      });

      // Save assigned technician when status = progress
      if (newStatus === 'progress' && assignedTechId) {
        await supabase.from('tickets').update({ assigned_tech_id: assignedTechId }).eq('id', id);
      }

      // Upload photos best-effort — never block navigation
      if (files.length > 0) {
        try {
          const urls = await uploadPhotos(files, id);
          if (urls.length > 0 && ticket) {
            await supabase.from('tickets').update({
              photo_urls: [...ticket.photo_urls, ...urls],
            }).eq('id', id);
          }
        } catch { /* storage unavailable — skip */ }
      }

      navigate(`/tech/ticket/${id}`);
    } catch {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
      setSubmitting(false);
    }
  };

  return (
    <PhoneShell title="อัปเดตสถานะ" showBack role="tech">
      {ticket && (
        <div className="dn-card" style={{ padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'monospace' }}>{ticket.id}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-1)', marginTop: 4 }}>{ticket.title}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{ticket.where_loc}</div>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 12 }}>เปลี่ยนสถานะเป็น</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {OPTIONS.map(opt => (
            <label key={opt.value} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              borderRadius: 'var(--r-md)', cursor: 'pointer',
              border: `2px solid ${newStatus === opt.value ? opt.color : 'var(--border)'}`,
              background: newStatus === opt.value ? opt.bg : 'var(--surface)',
              transition: 'all .15s',
            }}>
              <input type="radio" name="status" value={opt.value} checked={newStatus === opt.value}
                onChange={() => setNewStatus(opt.value)} style={{ display: 'none' }} />
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${newStatus === opt.value ? opt.color : 'var(--border-strong)'}`,
                background: newStatus === opt.value ? opt.color : 'transparent',
              }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: newStatus === opt.value ? opt.color : 'var(--ink-2)' }}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Technician selector — shown only when status = progress */}
      {newStatus === 'progress' && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 8 }}>
            มอบหมายช่าง
          </div>
          <select
            value={assignedTechId}
            onChange={e => setAssignedTechId(e.target.value)}
            className="input"
            style={{ width: '100%' }}
          >
            <option value="">— เลือกช่าง —</option>
            {technicians.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.role}
                {t.status === 'free' ? ' ✅' : t.status === 'busy' ? ' 🔧' : ' 🔴'}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 8 }}>บันทึกจากช่าง</div>
        <textarea className="input" value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="เช่น ตรวจพบบอร์ดควบคุมเสีย กำลังเปลี่ยนชิ้นส่วน..." rows={3} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 8 }}>ภาพถ่ายก่อน/หลัง</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {previews.map((url, i) => (
            <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
              <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button type="button" onClick={() => removeFile(i)}
                style={{ position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={12} stroke="#fff" />
              </button>
            </div>
          ))}
          <label style={{ width: 80, height: 80, borderRadius: 'var(--r-md)', border: '1.5px dashed var(--border-strong)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--surface-2)', gap: 4 }}>
            <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
            <Camera size={20} stroke="var(--ink-4)" />
            <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>เพิ่มรูป</span>
          </label>
        </div>
      </div>

      <button className="btn btn-primary"
        style={{ width: '100%', height: 52, fontSize: 16, fontWeight: 600 }}
        onClick={handleSubmit}
        disabled={!newStatus || submitting || uploading}>
        {submitting || uploading ? 'กำลังบันทึก...' : 'บันทึกการอัปเดต'}
      </button>
    </PhoneShell>
  );
};

export default TechUpdatePage;
