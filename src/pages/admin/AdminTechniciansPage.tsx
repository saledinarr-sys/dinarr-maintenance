import React, { useState } from 'react';
import { useTechnicians } from '../../hooks/useTechnicians';
import { CATEGORY_ICONS, Search, Plus, Edit2, Trash2, X } from '../../components/ui/Icon';
import MobileAdminTopBar from '../../components/admin/MobileAdminTopBar';
import { useIsMobileAdmin } from '../../components/admin/AdminLayout';
import type { CategoryId, TechStatus, Technician } from '../../types';
import { CATEGORY_COLOR, CATEGORY_LABEL, TECH_STATUS_LABEL } from '../../types';

const STATUS_DOT: Record<string, string> = { free: 'var(--ok)', busy: 'var(--brand)', off: 'var(--ink-4)' };
const TEAMS: { label: string; value: CategoryId | 'all' }[] = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'ไฟฟ้า', value: 'electric' },
  { label: 'ประปา', value: 'plumb' },
  { label: 'แอร์', value: 'aircon' },
  { label: 'เครื่องมือแพทย์', value: 'medical' },
  { label: 'IT', value: 'it' },
  { label: 'อาคาร', value: 'furn' },
];
const TEAM_OPTIONS: { label: string; value: CategoryId }[] = TEAMS.slice(1) as { label: string; value: CategoryId }[];
const STATUS_OPTIONS: { label: string; value: TechStatus }[] = [
  { label: 'พร้อมรับงาน', value: 'free' },
  { label: 'กำลังทำงาน', value: 'busy' },
  { label: 'ไม่พร้อม', value: 'off' },
];

type TechForm = {
  name: string; role: string; team: CategoryId;
  phone: string; extension: string; status: TechStatus;
};
const EMPTY_FORM: TechForm = { name: '', role: '', team: 'electric', phone: '', extension: '', status: 'free' };

/* ─── Edit / Add Modal ─── */
const TechModal: React.FC<{
  title: string;
  form: TechForm;
  onChange: (f: TechForm) => void;
  onSave: () => void;
  onClose: () => void;
}> = ({ title, form, onChange, onSave, onClose }) => {
  const set = (k: keyof TechForm, v: string) => onChange({ ...form, [k]: v });
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 480,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        padding: 24,
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink-1)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} stroke="var(--ink-3)" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', display: 'block', marginBottom: 5 }}>ชื่อ-นามสกุล</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="นายสมชาย ใจดี" />
          </div>
          {/* Role */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', display: 'block', marginBottom: 5 }}>ตำแหน่ง / ความเชี่ยวชาญ</label>
            <input className="input" value={form.role} onChange={e => set('role', e.target.value)} placeholder="ช่างไฟฟ้าอาวุโส" />
          </div>
          {/* Team + Status in row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', display: 'block', marginBottom: 5 }}>ทีม</label>
              <select className="input" value={form.team} onChange={e => set('team', e.target.value)}
                style={{ background: 'var(--surface)', color: 'var(--ink-1)' }}>
                {TEAM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', display: 'block', marginBottom: 5 }}>สถานะ</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value as TechStatus)}
                style={{ background: 'var(--surface)', color: 'var(--ink-1)' }}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          {/* Phone + Ext in row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', display: 'block', marginBottom: 5 }}>เบอร์โทร</label>
              <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="081-234-5678" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', display: 'block', marginBottom: 5 }}>ต่อภายใน</label>
              <input className="input" value={form.extension} onChange={e => set('extension', e.target.value)} placeholder="101" />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onClose}
            style={{ padding: '9px 20px', fontSize: 13, color: 'var(--ink-3)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            ยกเลิก
          </button>
          <button className="btn btn-primary" onClick={onSave}
            style={{ padding: '9px 20px', fontSize: 13 }}
            disabled={!form.name.trim()}>
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Delete Confirm Dialog ─── */
const DeleteConfirm: React.FC<{
  name: string;
  onConfirm: () => void;
  onClose: () => void;
}> = ({ name, onConfirm, onClose }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16,
  }} onClick={onClose}>
    <div style={{
      background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 380,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      padding: '28px 24px', textAlign: 'center',
    }} onClick={e => e.stopPropagation()}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-1)', marginBottom: 8 }}>ลบรายชื่อช่าง?</div>
      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 24, lineHeight: 1.6 }}>
        ต้องการลบ <strong style={{ color: 'var(--ink-1)' }}>{name}</strong> ออกจากระบบ?<br />
        การกระทำนี้ไม่สามารถย้อนกลับได้
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button className="btn" onClick={onClose}
          style={{ padding: '9px 24px', fontSize: 13, color: 'var(--ink-3)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          ยกเลิก
        </button>
        <button className="btn" onClick={onConfirm}
          style={{ padding: '9px 24px', fontSize: 13, background: '#EF4444', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', cursor: 'pointer', fontFamily: 'inherit' }}>
          ลบ
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */

const AdminTechniciansPage: React.FC = () => {
  const isMobile = useIsMobileAdmin();
  const { technicians, loading, addTechnician, updateTechnician, deleteTechnician } = useTechnicians();
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState<CategoryId | 'all'>('all');

  /* modal state */
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TechForm>(EMPTY_FORM);
  const [deletingTech, setDeletingTech] = useState<Technician | null>(null);

  const openAdd = () => { setForm(EMPTY_FORM); setEditingId(null); setModalMode('add'); };
  const openEdit = (tech: Technician) => {
    setForm({ name: tech.name, role: tech.role, team: tech.team, phone: tech.phone, extension: tech.extension, status: tech.status });
    setEditingId(tech.id);
    setModalMode('edit');
  };
  const closeModal = () => { setModalMode(null); setEditingId(null); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (modalMode === 'add') {
      await addTechnician({ name: form.name, role: form.role, team: form.team, phone: form.phone, extension: form.extension });
    } else if (modalMode === 'edit' && editingId) {
      await updateTechnician(editingId, form);
    }
    closeModal();
  };

  const handleDelete = async () => {
    if (deletingTech) {
      await deleteTechnician(deletingTech.id);
      setDeletingTech(null);
    }
  };

  const filtered = technicians.filter(t => {
    const matchSearch = !search || t.name.includes(search) || t.role.includes(search);
    const matchTeam = teamFilter === 'all' || t.team === teamFilter;
    return matchSearch && matchTeam;
  });

  const freeCount = technicians.filter(t => t.status === 'free').length;
  const busyCount = technicians.filter(t => t.status === 'busy').length;
  const avgRating = technicians.length > 0 ? (technicians.reduce((s, t) => s + t.rating, 0) / technicians.length).toFixed(1) : '-';

  const kpis = [
    { label: 'ช่างทั้งหมด', value: technicians.length, color: 'var(--ink-1)' },
    { label: 'พร้อมรับงาน', value: freeCount, color: 'var(--ok)' },
    { label: 'กำลังทำงาน', value: busyCount, color: 'var(--brand)' },
    { label: 'คะแนนเฉลี่ย', value: avgRating, color: '#F6A11E' },
  ];

  /* ── MOBILE — card list ── */
  if (isMobile) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <MobileAdminTopBar
          title="ทีมช่างซ่อม"
          subtitle="จัดการและติดตามสถานะช่างซ่อม"
          action={
            <button className="btn btn-primary" onClick={openAdd}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', fontSize: 13, borderRadius: 'var(--r-md)' }}>
              <Plus size={14} stroke="#fff" />เพิ่มช่าง
            </button>
          }
        />

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* 2×2 stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {kpis.map((kpi, i) => (
              <div key={i} className="dn-card" style={{ padding: 14 }}>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginBottom: 6 }}>{kpi.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', pointerEvents: 'none' } as React.CSSProperties} />
            <input className="input" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, ทีม..." style={{ paddingLeft: 36 }} />
          </div>

          {/* Team filter chips */}
          <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {TEAMS.map(t => (
              <button key={t.value} onClick={() => setTeamFilter(t.value)}
                style={{
                  padding: '6px 12px', borderRadius: 999, flexShrink: 0,
                  border: `1.5px solid ${teamFilter === t.value ? 'var(--brand)' : 'var(--border-strong)'}`,
                  background: teamFilter === t.value ? 'var(--brand-soft)' : 'var(--surface)',
                  color: teamFilter === t.value ? 'var(--brand-2)' : 'var(--ink-3)',
                  fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tech cards */}
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--ink-4)', padding: '32px 0' }}>กำลังโหลด...</div>
          ) : filtered.map(tech => {
            const CatIcon = CATEGORY_ICONS[tech.team];
            const catColor = CATEGORY_COLOR[tech.team];
            return (
              <div key={tech.id} className="dn-card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: catColor + '18', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 700, color: catColor,
                  }}>
                    {tech.name.slice(-2, -1)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)' }}>{tech.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 1 }}>{tech.role}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: STATUS_DOT[tech.status] }} />
                        <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{TECH_STATUS_LABEL[tech.status]}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 12 }}>
                      <CatIcon size={12} stroke={catColor} />
                      <span style={{ color: catColor, fontWeight: 500 }}>{CATEGORY_LABEL[tech.team]}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 12 }}>
                      <span style={{ color: 'var(--ink-3)' }}>งานที่รับ <strong style={{ color: 'var(--brand)' }}>{tech.active_jobs}</strong></span>
                      <span style={{ color: 'var(--ink-3)' }}>เสร็จ <strong style={{ color: 'var(--ok)' }}>{tech.completed_jobs}</strong></span>
                      <span style={{ color: '#F6A11E', fontWeight: 700 }}>⭐ {tech.rating.toFixed(1)}</span>
                    </div>
                    {tech.phone && (
                      <a href={`tel:${tech.phone}`} style={{ display: 'block', marginTop: 8, fontSize: 13, color: 'var(--brand)', fontFamily: 'monospace', textDecoration: 'none' }}>
                        {tech.phone}
                      </a>
                    )}
                    {/* Edit / Delete */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button onClick={() => openEdit(tech)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--ink-2)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Edit2 size={13} stroke="var(--brand)" />แก้ไข
                      </button>
                      <button onClick={() => setDeletingTech(tech)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 0', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Trash2 size={13} stroke="#EF4444" />ลบ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        </div>

        {/* Modals */}
        {modalMode && (
          <TechModal
            title={modalMode === 'add' ? 'เพิ่มช่างซ่อม' : 'แก้ไขข้อมูลช่าง'}
            form={form} onChange={setForm}
            onSave={handleSave} onClose={closeModal}
          />
        )}
        {deletingTech && (
          <DeleteConfirm name={deletingTech.name} onConfirm={handleDelete} onClose={() => setDeletingTech(null)} />
        )}
      </div>
    );
  }

  /* ── DESKTOP — table ── */
  return (
    <div className="admin-page" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-1)' }}>ทีมช่างซ่อม</div>
          <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>จัดการและติดตามสถานะช่างซ่อม</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 13 }}>
          <Plus size={15} stroke="#fff" />เพิ่มช่างซ่อม
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {kpis.map((kpi, i) => (
          <div key={i} className="dn-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 8 }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--ink-4)' } as React.CSSProperties} />
          <input className="input" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ, ทีม..." style={{ paddingLeft: 36, height: 40 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TEAMS.map(t => (
            <button key={t.value} onClick={() => setTeamFilter(t.value)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--r-pill)', flexShrink: 0,
                border: `1.5px solid ${teamFilter === t.value ? 'var(--brand)' : 'var(--border-strong)'}`,
                background: teamFilter === t.value ? 'var(--brand-soft)' : 'var(--surface)',
                color: teamFilter === t.value ? 'var(--brand-2)' : 'var(--ink-3)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dn-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              {['ช่าง', 'ทีม', 'สถานะ', 'งานที่รับ', 'เสร็จแล้ว', 'คะแนน', 'เวลาเฉลี่ย', 'เบอร์โทร', ''].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--ink-4)' }}>กำลังโหลด...</td></tr>
            ) : filtered.map(tech => {
              const CatIcon = CATEGORY_ICONS[tech.team];
              const catColor = CATEGORY_COLOR[tech.team];
              return (
                <tr key={tech.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: catColor + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: catColor, flexShrink: 0 }}>
                        {tech.name.slice(-2, -1)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)' }}>{tech.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{tech.role}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CatIcon size={13} stroke={catColor} />
                      <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{CATEGORY_LABEL[tech.team]}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_DOT[tech.status] }} />
                      <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{TECH_STATUS_LABEL[tech.status]}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: 'var(--brand)', textAlign: 'center' }}>{tech.active_jobs}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: 'var(--ok)', textAlign: 'center' }}>{tech.completed_jobs}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#F6A11E' }}>⭐ {tech.rating.toFixed(1)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink-3)' }}>{tech.avg_time_hours} ชม.</td>
                  <td style={{ padding: '12px 16px' }}>
                    <a href={`tel:${tech.phone}`} style={{ fontSize: 13, color: 'var(--brand)', textDecoration: 'none', fontFamily: 'monospace' }}>{tech.phone}</a>
                  </td>
                  {/* Action buttons */}
                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(tech)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--brand)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Edit2 size={12} stroke="var(--brand)" />แก้ไข
                      </button>
                      <button onClick={() => setDeletingTech(tech)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Trash2 size={12} stroke="#EF4444" />ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modalMode && (
        <TechModal
          title={modalMode === 'add' ? 'เพิ่มช่างซ่อม' : 'แก้ไขข้อมูลช่าง'}
          form={form} onChange={setForm}
          onSave={handleSave} onClose={closeModal}
        />
      )}
      {deletingTech && (
        <DeleteConfirm name={deletingTech.name} onConfirm={handleDelete} onClose={() => setDeletingTech(null)} />
      )}
    </div>
  );
};

export default AdminTechniciansPage;
