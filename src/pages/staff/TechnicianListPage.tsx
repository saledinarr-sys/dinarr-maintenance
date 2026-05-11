import React, { useState } from 'react';
import PhoneShell from '../../components/staff/PhoneShell';
import { CATEGORY_ICONS, Phone, Plus, X } from '../../components/ui/Icon';
import { useTechnicians } from '../../hooks/useTechnicians';
import type { CategoryId } from '../../types';
import { TECH_STATUS_LABEL, CATEGORY_COLOR, CATEGORY_LABEL } from '../../types';

const STATUS_DOT: Record<string, string> = { free: 'var(--ok)', busy: 'var(--brand)', off: 'var(--ink-4)' };
const TEAMS: { label: string; value: CategoryId }[] = [
  { label: 'ไฟฟ้า', value: 'electric' },
  { label: 'ประปา', value: 'plumb' },
  { label: 'แอร์', value: 'aircon' },
  { label: 'เครื่องมือแพทย์', value: 'medical' },
  { label: 'IT', value: 'it' },
  { label: 'อาคาร', value: 'furn' },
];

const EMPTY = { name: '', team: 'electric' as CategoryId, role: '', phone: '', extension: '' };

const TechnicianListPage: React.FC = () => {
  const { technicians, loading, addTechnician } = useTechnicians();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    setSaving(true);
    await addTechnician(form);
    setSaving(false);
    setShowModal(false);
    setForm(EMPTY);
  };

  const addBtn = (
    <button onClick={() => setShowModal(true)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', display: 'flex', padding: 4 }}>
      <Plus size={22} stroke="var(--brand)" />
    </button>
  );

  return (
    <PhoneShell title="ช่างซ่อม" rightAction={addBtn}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--ink-4)', padding: '32px 0' }}>กำลังโหลด...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {technicians.map(tech => {
            const CatIcon = CATEGORY_ICONS[tech.team];
            const catColor = CATEGORY_COLOR[tech.team];
            return (
              <div key={tech.id} className="dn-card" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: catColor + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: catColor, flexShrink: 0,
                  }}>
                    {tech.name.charAt(tech.name.length > 2 ? tech.name.length - 2 : 0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tech.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_DOT[tech.status] }} />
                        <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{TECH_STATUS_LABEL[tech.status]}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <CatIcon size={12} stroke={catColor} />
                      <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{tech.role}</span>
                    </div>
                    {(tech.rating > 0 || tech.completed_jobs > 0) && (
                      <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                        {tech.rating > 0 && <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>⭐ {tech.rating.toFixed(1)}</span>}
                        {tech.completed_jobs > 0 && <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>ทำเสร็จ {tech.completed_jobs} งาน</span>}
                        {tech.avg_time_hours > 0 && <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>เฉลี่ย {tech.avg_time_hours} ชม.</span>}
                      </div>
                    )}
                  </div>
                </div>
                {tech.status !== 'off' && (
                  <a href={`tel:${tech.phone}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      marginTop: 12, padding: '8px 0', borderRadius: 'var(--r-md)',
                      background: 'var(--brand-soft)', color: 'var(--brand-2)',
                      fontSize: 13, fontWeight: 500, textDecoration: 'none',
                    }}>
                    <Phone size={14} stroke="var(--brand-2)" />
                    โทร {tech.phone}{tech.extension ? ` (ต่อ ${tech.extension})` : ''}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); setForm(EMPTY); } }}>
          <div style={{
            width: '100%', maxWidth: 480, margin: '0 16px',
            background: 'var(--surface)', borderRadius: 'var(--r-lg)',
            padding: '24px 24px 28px',
            boxShadow: 'var(--shadow-2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink-1)' }}>เพิ่มช่างซ่อม</div>
              <button onClick={() => { setShowModal(false); setForm(EMPTY); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--ink-4)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 6 }}>ชื่อ-นามสกุล *</div>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="เช่น นายสมศักดิ์ ทำงาน" />
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 6 }}>ทีม *</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TEAMS.map(t => (
                    <button key={t.value} onClick={() => setForm(f => ({ ...f, team: t.value }))}
                      style={{
                        padding: '6px 12px', borderRadius: 'var(--r-pill)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                        border: `1.5px solid ${form.team === t.value ? 'var(--brand)' : 'var(--border-strong)'}`,
                        background: form.team === t.value ? 'var(--brand-soft)' : 'var(--surface)',
                        color: form.team === t.value ? 'var(--brand-2)' : 'var(--ink-3)',
                        fontWeight: form.team === t.value ? 600 : 400,
                      }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 6 }}>ตำแหน่ง</div>
                <input className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  placeholder={`เช่น ช่าง${CATEGORY_LABEL[form.team]}`} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 2 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 6 }}>เบอร์โทร *</div>
                  <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="08X-XXX-XXXX" type="tel" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 6 }}>เบอร์ต่อ</div>
                  <input className="input" value={form.extension} onChange={e => setForm(f => ({ ...f, extension: e.target.value }))}
                    placeholder="101" />
                </div>
              </div>
            </div>

            <button className="btn btn-primary"
              style={{ width: '100%', height: 50, fontSize: 15, fontWeight: 600, marginTop: 24 }}
              onClick={handleAdd}
              disabled={!form.name.trim() || !form.phone.trim() || saving}>
              {saving ? 'กำลังบันทึก...' : 'เพิ่มช่าง'}
            </button>
          </div>
        </div>
      )}
      </div>
    </PhoneShell>
  );
};

export default TechnicianListPage;
