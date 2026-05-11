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

const PRIO_BAR: Record<TicketPriority, number> = { low: 1, mid: 2, high: 3, crit: 4 };

function useIsMobile() {
  const [v, set] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => set(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return v;
}

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
  const isMobile = useIsMobile();

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
      const reporterName = name.trim() || user?.name || 'ไม่ระบุชื่อ';
      const reporterRole = dept.trim() || user?.department || '';
      const newTicket = await createTicket({
        category_id: cat,
        priority,
        title: title.trim(),
        where_loc: location.trim(),
        reporter_name: reporterName,
        reporter_role: reporterRole,
        sla_hours: SLA[priority],
        description: desc.trim(),
      }, reporterName);

      if (files.length > 0) {
        try {
          const urls = await uploadPhotos(files, newTicket.id);
          if (urls.length > 0) {
            const { supabase: sb } = await import('../../lib/supabase');
            await sb.from('tickets').update({ photo_urls: urls }).eq('id', newTicket.id);
            updatePhotoUrls(newTicket.id, urls);
          }
        } catch { /* storage unavailable */ }
      }

      navigate('/staff/list');
    } catch {
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
      setSubmitting(false);
    }
  };

  const isValid = !!cat && !!title.trim() && !!location.trim();
  const submitBtn = (
    <button type="submit" className="btn btn-primary"
      style={{ width: '100%', height: 52, fontSize: 16, fontWeight: 600, borderRadius: 'var(--r-lg)' }}
      disabled={submitting || uploading || !isValid}>
      {submitting || uploading ? 'กำลังส่ง...' : 'ส่งคำขอแจ้งซ่อม'}
    </button>
  );

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <PhoneShell title="แจ้งซ่อมใหม่" showBack>
        <form onSubmit={handleSubmit} style={{ paddingBottom: 100 }}>

          {/* Section 1 — ผู้แจ้ง */}
          <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 16px 4px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
              1 · ข้อมูลผู้แจ้ง
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อ-นามสกุล *" />
              <input className="input" value={dept} onChange={e => setDept(e.target.value)} placeholder="แผนก / ตำแหน่ง" />
              <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="เบอร์โทรศัพท์" type="tel" style={{ marginBottom: 12 }} />
            </div>
          </div>

          {/* Section 2 — ประเภทงาน */}
          <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 16px 4px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
              2 · ประเภทงาน *
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
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
                    <Icon size={24} stroke={selected ? CATEGORY_COLOR[c] : 'var(--ink-3)'} />
                    <span style={{ fontSize: 11, fontWeight: 500, color: selected ? CATEGORY_COLOR[c] : 'var(--ink-3)', textAlign: 'center', lineHeight: 1.3 }}>
                      {CATEGORY_LABEL[c]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3 — หัวข้อ + รายละเอียด */}
          <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 16px 4px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
              3 · ปัญหา
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="หัวข้อปัญหา เช่น แอร์ไม่เย็น *" required />
              <textarea className="input" value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="รายละเอียดเพิ่มเติม..." rows={3} style={{ resize: 'none' }} />
            </div>
          </div>

          {/* Section 4 — สถานที่ */}
          <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 16px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
              4 · สถานที่ *
            </div>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--ink-3)' } as React.CSSProperties} />
              <input className="input" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="อาคาร · ชั้น · ห้อง" required style={{ paddingLeft: 38 }} />
            </div>
          </div>

          {/* Section 5 — ความเร่งด่วน (chips) */}
          <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 16px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
              5 · ความเร่งด่วน
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {PRIOS.map(p => {
                const active = priority === p;
                return (
                  <button key={p} type="button" onClick={() => setPriority(p)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                    borderRadius: 'var(--r-md)', cursor: 'pointer', fontFamily: 'inherit',
                    border: `2px solid ${active ? PRIO_COLOR[p] : 'var(--border)'}`,
                    background: active ? PRIO_COLOR[p] + '10' : 'var(--surface-2)',
                    transition: 'all .15s',
                  }}>
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          width: 3, height: 14, borderRadius: 2,
                          background: i <= PRIO_BAR[p] ? PRIO_COLOR[p] : 'var(--border-strong)',
                        }} />
                      ))}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: active ? PRIO_COLOR[p] : 'var(--ink-2)' }}>
                        {PRIORITY_LABEL[p]}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>SLA {SLA[p]} ชม.</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6 — ภาพถ่าย */}
          <div style={{ background: 'var(--surface)', padding: '16px 16px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
              6 · ภาพถ่าย (ถ้ามี)
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {previews.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: 76, height: 76, borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
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
                width: 76, height: 76, borderRadius: 'var(--r-md)', border: '1.5px dashed var(--border-strong)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', background: 'var(--surface-2)', gap: 4,
              }}>
                <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
                <Camera size={22} stroke="var(--ink-4)" />
                <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>เพิ่มรูป</span>
              </label>
            </div>
          </div>

          {/* Fixed submit bar */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
            background: 'var(--surface)', borderTop: '1px solid var(--border)',
            padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          }}>
            {/* Validation hint */}
            {!isValid && (
              <div style={{ fontSize: 11, color: 'var(--ink-4)', textAlign: 'center', marginBottom: 8 }}>
                {!cat ? '⚡ เลือกประเภทงาน' : !title.trim() ? '✏️ ใส่หัวข้อปัญหา' : '📍 ระบุสถานที่'}
              </div>
            )}
            {submitBtn}
          </div>

        </form>
      </PhoneShell>
    );
  }

  /* ── DESKTOP: 2-column ── */
  return (
    <PhoneShell title="แจ้งซ่อมใหม่" showBack>
      <form onSubmit={handleSubmit}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

            {/* Left */}
            <div className="dn-card" style={{ padding: '24px 24px 8px' }}>
              <Section num={1} title="ข้อมูลผู้แจ้ง">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="ชื่อ-นามสกุล *" required />
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

              <Section num={3} title="หัวข้อปัญหา *">
                <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="เช่น แอร์ห้อง ICU ไม่เย็น" required />
              </Section>

              <Section num={4} title="รายละเอียด">
                <textarea className="input" value={desc} onChange={e => setDesc(e.target.value)}
                  placeholder="อธิบายปัญหาเพิ่มเติม..." rows={4} />
              </Section>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="dn-card" style={{ padding: '24px 24px 8px' }}>
                <Section num={5} title="สถานที่ *">
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--ink-3)' } as React.CSSProperties} />
                    <input className="input" value={location} onChange={e => setLocation(e.target.value)}
                      placeholder="เช่น อาคาร A · ชั้น 2 · ห้องตรวจ" required style={{ paddingLeft: 38 }} />
                  </div>
                </Section>

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
                              background: i <= PRIO_BAR[p] ? PRIO_COLOR[p] : 'var(--border-strong)',
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

              {submitBtn}
            </div>

          </div>
        </div>
      </form>
    </PhoneShell>
  );
};

export default StaffNewPage;
