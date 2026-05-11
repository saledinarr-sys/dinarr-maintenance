import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PhoneShell from '../../components/staff/PhoneShell';
import { CATEGORY_ICONS } from '../../components/ui/Icon';
import { MapPin, Camera, X } from '../../components/ui/Icon';
import { useApp } from '../../context/AppContext';
import { useTickets } from '../../hooks/useTickets';
import { useStorage } from '../../hooks/useStorage';
import type { CategoryId, TicketPriority } from '../../types';
import { CATEGORY_LABEL, CATEGORY_COLOR, PRIORITY_LABEL } from '../../types';

const CATS: CategoryId[] = ['electric', 'plumb', 'aircon', 'medical', 'it', 'furn'];
const PRIOS: TicketPriority[] = ['low', 'mid', 'high', 'crit'];
const SLA: Record<TicketPriority, number> = { low: 48, mid: 24, high: 12, crit: 2 };

const PRIO_COLOR: Record<TicketPriority, string> = {
  low: 'var(--ink-3)',
  mid: 'var(--brand)',
  high: 'var(--warn)',
  crit: 'var(--crit)',
};

const Section: React.FC<{ num: number; title: string; children: React.ReactNode }> = ({ num, title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%', background: 'var(--brand)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>{num}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-1)' }}>{title}</div>
    </div>
    {children}
  </div>
);

const StaffNewPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useApp();
  const { createTicket, updatePhotoUrls } = useTickets();
  const { uploadPhotos, uploading } = useStorage();

  const [name, setName] = useState(user?.name ?? '');
  const [dept, setDept] = useState(user?.department ?? '');
  const [phone, setPhone] = useState('');
  const [cat, setCat] = useState<CategoryId | ''>((params.get('cat') as CategoryId) ?? '');
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
      const newTicket = await createTicket({
        category_id: cat,
        priority,
        title: title.trim(),
        where_loc: location.trim(),
        reporter_name: name.trim() || (user?.name ?? 'ไม่ระบุ'),
        reporter_role: dept.trim() || (user?.department ?? 'ไม่ระบุ'),
        sla_hours: SLA[priority],
        description: desc.trim(),
      }, name.trim() || (user?.name ?? 'ไม่ระบุ'));

      if (files.length > 0) {
        try {
          const urls = await uploadPhotos(files, newTicket.id);
          if (urls.length > 0) {
            // Update Supabase
            const { supabase: sb } = await import('../../lib/supabase');
            await sb.from('tickets').update({ photo_urls: urls }).eq('id', newTicket.id);
            // Update local cache so photos show immediately on detail page
            updatePhotoUrls(newTicket.id, urls);
          }
        } catch { /* storage unavailable — ticket still saved without photos */ }
      }

      navigate('/staff/list');
    } catch {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
      setSubmitting(false);
    }
  };

  return (
    <PhoneShell title="แจ้งซ่อมใหม่" showBack>
      <form onSubmit={handleSubmit}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div className="dn-card" style={{ padding: '24px 24px 8px' }}>
                {/* Section 1 */}
                <Section num={1} title="ข้อมูลผู้แจ้ง">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อ-นามสกุล *" required />
                    <input className="input" value={dept} onChange={e => setDept(e.target.value)} placeholder="แผนก / ตำแหน่ง" />
                    <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="เบอร์โทรศัพท์" type="tel" />
                  </div>
                </Section>

                {/* Section 2 */}
                <Section num={2} title="ประเภทงาน *">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {CATS.map(c => {
                      const Icon = CATEGORY_ICONS[c];
                      const selected = cat === c;
                      return (
                        <button key={c} type="button" onClick={() => setCat(c)} style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                          padding: '14px 6px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                          background: selected ? CATEGORY_COLOR[c] + '18' : 'var(--surface-2)',
                          border: `2px solid ${selected ? CATEGORY_COLOR[c] : 'var(--border)'}`,
                          fontFamily: 'inherit', transition: 'all .15s',
                        }}>
                          <Icon size={22} stroke={selected ? CATEGORY_COLOR[c] : 'var(--ink-3)'} />
                          <span style={{ fontSize: 11, fontWeight: 500, color: selected ? CATEGORY_COLOR[c] : 'var(--ink-3)', textAlign: 'center', lineHeight: 1.3 }}>
                            {CATEGORY_LABEL[c]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Section>

                {/* Section 3 */}
                <Section num={3} title="หัวข้อปัญหา *">
                  <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="เช่น แอร์ห้อง ICU ไม่เย็น" required />
                </Section>

                {/* Section 4 */}
                <Section num={4} title="รายละเอียด">
                  <textarea className="input" value={desc} onChange={e => setDesc(e.target.value)}
                    placeholder="อธิบายปัญหาเพิ่มเติม..." rows={4} />
                </Section>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="dn-card" style={{ padding: '24px 24px 8px' }}>
                {/* Section 5 */}
                <Section num={5} title="สถานที่ *">
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--ink-3)' } as React.CSSProperties} />
                    <input className="input" value={location} onChange={e => setLocation(e.target.value)}
                      placeholder="เช่น อาคาร A · ชั้น 2 · ห้องตรวจ" required style={{ paddingLeft: 38 }} />
                  </div>
                </Section>

                {/* Section 6 */}
                <Section num={6} title="ระดับความเร่งด่วน">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {PRIOS.map(p => (
                      <label key={p} style={{
                        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                        borderRadius: 'var(--r-md)', border: `2px solid ${priority === p ? PRIO_COLOR[p] : 'var(--border)'}`,
                        background: priority === p ? PRIO_COLOR[p] + '10' : 'var(--surface-2)',
                        cursor: 'pointer', transition: 'all .15s',
                      }}>
                        <input type="radio" name="priority" value={p} checked={priority === p}
                          onChange={() => setPriority(p)} style={{ display: 'none' }} />
                        <div style={{ display: 'flex', gap: 3 }}>
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{
                              width: 4, height: 16, borderRadius: 2,
                              background: i <= (p === 'low' ? 1 : p === 'mid' ? 2 : p === 'high' ? 3 : 4)
                                ? PRIO_COLOR[p] : 'var(--border-strong)',
                            }} />
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: priority === p ? PRIO_COLOR[p] : 'var(--ink-2)' }}>
                            {PRIORITY_LABEL[p]}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>SLA {SLA[p]} ชั่วโมง</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </Section>

                {/* Section 7 */}
                <Section num={7} title="ภาพถ่าย (ถ้ามี)">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {previews.map((url, i) => (
                      <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                        <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => removeFile(i)} style={{
                          position: 'absolute', top: 3, right: 3, width: 22, height: 22, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <X size={12} stroke="#fff" />
                        </button>
                      </div>
                    ))}
                    <label style={{
                      width: 80, height: 80, borderRadius: 'var(--r-md)', border: '1.5px dashed var(--border-strong)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', background: 'var(--surface-2)', gap: 4,
                    }}>
                      <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
                      <Camera size={20} stroke="var(--ink-4)" />
                      <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>เพิ่มรูป</span>
                    </label>
                  </div>
                </Section>
              </div>

              {/* Submit */}
              <button type="submit" className="btn btn-primary"
                style={{ width: '100%', height: 52, fontSize: 16, fontWeight: 600, borderRadius: 'var(--r-lg)' }}
                disabled={submitting || uploading || !cat || !title.trim() || !location.trim()}>
                {submitting || uploading ? 'กำลังส่ง...' : 'ส่งคำขอแจ้งซ่อม'}
              </button>
            </div>

          </div>
        </div>
      </form>
    </PhoneShell>
  );
};

export default StaffNewPage;
