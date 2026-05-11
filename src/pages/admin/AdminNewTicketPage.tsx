import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_ICONS, MapPin, Camera, X } from '../../components/ui/Icon';
import { useTickets } from '../../hooks/useTickets';
import { useStorage } from '../../hooks/useStorage';
import { getSettings } from '../../hooks/useSettings';
import type { CategoryId, TicketPriority } from '../../types';
import { CATEGORY_LABEL, CATEGORY_COLOR, PRIORITY_LABEL } from '../../types';

const CATS: CategoryId[] = ['electric', 'plumb', 'aircon', 'medical', 'it', 'furn'];
const PRIOS: TicketPriority[] = ['low', 'mid', 'high', 'crit'];
const PRIO_COLOR: Record<TicketPriority, string> = {
  low: 'var(--ink-3)', mid: 'var(--brand)', high: 'var(--warn)', crit: 'var(--crit)',
};

const Section: React.FC<{ num: number; title: string; children: React.ReactNode }> = ({ num, title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', background: 'var(--brand)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0,
      }}>{num}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)' }}>{title}</div>
    </div>
    {children}
  </div>
);

const AdminNewTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { createTicket } = useTickets();
  const { uploadPhotos, uploading } = useStorage();

  const [name, setName] = useState('');
  const [dept, setDept] = useState('');
  const [phone, setPhone] = useState('');
  const [cat, setCat] = useState<CategoryId | ''>('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('low');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => previews.forEach(URL.revokeObjectURL);
  }, [previews]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cat || !title.trim() || !location.trim()) return;
    setSubmitting(true);
    try {
      const sla = getSettings().sla;
      const newTicket = await createTicket({
        category_id: cat,
        priority,
        title: title.trim(),
        where_loc: location.trim(),
        reporter_name: name.trim() || 'Admin',
        reporter_role: dept.trim() || 'ผู้ดูแลระบบ',
        sla_hours: sla[priority],
        description: desc.trim(),
      }, name.trim() || 'Admin');

      if (files.length > 0) {
        const urls = await uploadPhotos(files, newTicket.id);
        if (urls.length > 0) {
          const { supabase } = await import('../../lib/supabase');
          await supabase.from('tickets').update({ photo_urls: urls }).eq('id', newTicket.id);
        }
      }
      navigate('/admin/board');
    } catch {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)', cursor: 'pointer', color: 'var(--ink-2)',
              fontSize: 13, fontFamily: 'inherit', padding: '7px 14px', fontWeight: 500,
            }}>
            ← กลับ
          </button>
          <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-1)' }}>แจ้งซ่อมใหม่</div>
            <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>กรอกรายละเอียดเพื่อสร้างคำขอ</div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--brand-soft)', borderRadius: 'var(--r-pill)',
          padding: '6px 14px',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)' }} />
          <span style={{ fontSize: 12, color: 'var(--brand-2)', fontWeight: 600 }}>ระบบแจ้งซ่อม</span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, maxWidth: 900 }}>
          {/* Left column */}
          <div>
            <Section num={1} title="ข้อมูลผู้แจ้ง">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อ-นามสกุล *" />
                <input className="input" value={dept} onChange={e => setDept(e.target.value)} placeholder="แผนก / ตำแหน่ง" />
                <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="เบอร์โทรศัพท์" type="tel" />
              </div>
            </Section>

            <Section num={2} title="ประเภทงาน *">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {CATS.map(c => {
                  const Icon = CATEGORY_ICONS[c];
                  const selected = cat === c;
                  return (
                    <button key={c} type="button" onClick={() => setCat(c)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        padding: '12px 6px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                        background: selected ? CATEGORY_COLOR[c] + '18' : 'var(--surface)',
                        border: `2px solid ${selected ? CATEGORY_COLOR[c] : 'var(--border)'}`,
                        fontFamily: 'inherit', transition: 'all .15s',
                      }}>
                      <Icon size={20} stroke={selected ? CATEGORY_COLOR[c] : 'var(--ink-3)'} />
                      <span style={{ fontSize: 11, fontWeight: 500, color: selected ? CATEGORY_COLOR[c] : 'var(--ink-3)', textAlign: 'center' }}>
                        {CATEGORY_LABEL[c]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section num={3} title="หัวข้อปัญหา *">
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="เช่น แอร์ห้อง ICU ไม่เย็น" />
            </Section>

            <Section num={4} title="รายละเอียด">
              <textarea className="input" value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="อธิบายปัญหาเพิ่มเติม..." rows={4} />
            </Section>
          </div>

          {/* Right column */}
          <div>
            <Section num={5} title="สถานที่ *">
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' } as React.CSSProperties} />
                <input className="input" value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="เช่น อาคาร A · ชั้น 2 · ห้องตรวจ" style={{ paddingLeft: 38 }} />
              </div>
            </Section>

            <Section num={6} title="ระดับความเร่งด่วน">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PRIOS.map(p => (
                  <label key={p} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 'var(--r-md)', border: `2px solid ${priority === p ? PRIO_COLOR[p] : 'var(--border)'}`,
                    background: priority === p ? PRIO_COLOR[p] + '10' : 'var(--surface)',
                    cursor: 'pointer', transition: 'all .15s',
                  }}>
                    <input type="radio" name="priority" value={p} checked={priority === p} onChange={() => setPriority(p)} style={{ display: 'none' }} />
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          width: 4, height: 14, borderRadius: 2,
                          background: i <= (p === 'low' ? 1 : p === 'mid' ? 2 : p === 'high' ? 3 : 4) ? PRIO_COLOR[p] : 'var(--border-strong)',
                        }} />
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: priority === p ? PRIO_COLOR[p] : 'var(--ink-2)' }}>{PRIORITY_LABEL[p]}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>SLA {getSettings().sla[p]} ชั่วโมง</div>
                    </div>
                  </label>
                ))}
              </div>
            </Section>

            <Section num={7} title="ภาพถ่าย (ถ้ามี)">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {previews.map((url, i) => (
                  <div key={i} style={{ position: 'relative', width: 72, height: 72, borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                    <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => removeFile(i)}
                      style={{
                        position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <X size={12} stroke="#fff" />
                    </button>
                  </div>
                ))}
                <label style={{
                  width: 72, height: 72, borderRadius: 'var(--r-md)', border: '1.5px dashed var(--border-strong)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', background: 'var(--surface-2)', gap: 4,
                }}>
                  <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
                  <Camera size={18} stroke="var(--ink-4)" />
                  <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>เพิ่มรูป</span>
                </label>
              </div>
            </Section>

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', height: 52, fontSize: 16, fontWeight: 600, borderRadius: 'var(--r-lg)' }}
              disabled={submitting || uploading || !cat || !title.trim() || !location.trim()}>
              {submitting || uploading ? 'กำลังส่ง...' : 'ส่งคำขอแจ้งซ่อม'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminNewTicketPage;
