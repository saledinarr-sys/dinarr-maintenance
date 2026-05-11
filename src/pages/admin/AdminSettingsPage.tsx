import React, { useState } from 'react';
import { useSettings, getSettings } from '../../hooks/useSettings';
import type { TicketPriority } from '../../types';
import { PRIORITY_LABEL } from '../../types';

const PRIO_COLOR: Record<TicketPriority, string> = {
  low: 'var(--ink-3)', mid: 'var(--brand)', high: 'var(--warn)', crit: 'var(--crit)',
};

const SectionCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="dn-card" style={{ padding: 24, marginBottom: 16 }}>
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-1)' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 3 }}>{subtitle}</div>}
    </div>
    {children}
  </div>
);

const FieldGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 6 }}>{label}</div>
    {children}
  </div>
);

const AdminSettingsPage: React.FC = () => {
  const { settings, save } = useSettings();
  const [toast, setToast] = useState('');

  // Section A — Profile
  const [adminName, setAdminName] = useState(settings.adminName);
  const [adminTitle, setAdminTitle] = useState(settings.adminTitle);

  // Section B — Password
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Section C — SLA (stored as hours; unit per row for display/input)
  type SlaUnit = 'hours' | 'days';
  const initUnit = (h: number): SlaUnit => (h >= 24 && h % 24 === 0 ? 'days' : 'hours');
  const initVal = (h: number): string => (h >= 24 && h % 24 === 0 ? String(h / 24) : String(h));

  const [slaLow,  setSlaLow]  = useState(initVal(settings.sla.low));
  const [slaMid,  setSlaMid]  = useState(initVal(settings.sla.mid));
  const [slaHigh, setSlaHigh] = useState(initVal(settings.sla.high));
  const [slaCrit, setSlaCrit] = useState(initVal(settings.sla.crit));
  const [unitLow,  setUnitLow]  = useState<SlaUnit>(initUnit(settings.sla.low));
  const [unitMid,  setUnitMid]  = useState<SlaUnit>(initUnit(settings.sla.mid));
  const [unitHigh, setUnitHigh] = useState<SlaUnit>(initUnit(settings.sla.high));
  const [unitCrit, setUnitCrit] = useState<SlaUnit>(initUnit(settings.sla.crit));

  const toHours = (val: string, unit: SlaUnit) => {
    const n = parseInt(val, 10);
    return isNaN(n) || n < 1 ? null : unit === 'days' ? n * 24 : n;
  };

  // Section D — Org
  const [orgName, setOrgName] = useState(settings.orgName);
  const [orgDept, setOrgDept] = useState(settings.orgDept);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const saveProfile = () => {
    if (!adminName.trim()) return;
    save({ adminName: adminName.trim(), adminTitle: adminTitle.trim() });
    showToast('บันทึกโปรไฟล์แล้ว ✓');
  };

  const savePassword = () => {
    setPwdError('');
    const current = getSettings().password;
    if (curPwd !== current) { setPwdError('รหัสผ่านปัจจุบันไม่ถูกต้อง'); return; }
    if (newPwd.length < 4) { setPwdError('รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร'); return; }
    if (newPwd !== confirmPwd) { setPwdError('รหัสผ่านใหม่ไม่ตรงกัน'); return; }
    save({ password: newPwd });
    setCurPwd(''); setNewPwd(''); setConfirmPwd('');
    showToast('เปลี่ยนรหัสผ่านแล้ว ✓');
  };

  const saveSla = () => {
    const low  = toHours(slaLow,  unitLow);
    const mid  = toHours(slaMid,  unitMid);
    const high = toHours(slaHigh, unitHigh);
    const crit = toHours(slaCrit, unitCrit);
    if (low === null || mid === null || high === null || crit === null) return;
    save({ sla: { low, mid, high, crit } });
    showToast('บันทึก SLA แล้ว ✓');
  };

  const saveOrg = () => {
    if (!orgName.trim()) return;
    save({ orgName: orgName.trim(), orgDept: orgDept.trim() });
    showToast('บันทึกข้อมูลองค์กรแล้ว ✓');
  };

  type SlaRow = {
    prio: TicketPriority; label: string;
    val: string; set: (v: string) => void;
    unit: SlaUnit; setUnit: (u: SlaUnit) => void;
  };
  const slaRows: SlaRow[] = [
    { prio: 'crit', label: PRIORITY_LABEL['crit'], val: slaCrit, set: setSlaCrit, unit: unitCrit, setUnit: setUnitCrit },
    { prio: 'high', label: PRIORITY_LABEL['high'], val: slaHigh, set: setSlaHigh, unit: unitHigh, setUnit: setUnitHigh },
    { prio: 'mid',  label: PRIORITY_LABEL['mid'],  val: slaMid,  set: setSlaMid,  unit: unitMid,  setUnit: setUnitMid  },
    { prio: 'low',  label: PRIORITY_LABEL['low'],  val: slaLow,  set: setSlaLow,  unit: unitLow,  setUnit: setUnitLow  },
  ];

  return (
    <div className="admin-page" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-1)' }}>ตั้งค่า</div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>จัดการการตั้งค่าระบบ</div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: 'var(--ok)', color: '#fff',
          padding: '10px 20px', borderRadius: 'var(--r-md)',
          fontSize: 13, fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
          animation: 'fadeIn .15s ease',
        }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900 }}>
        {/* Left column */}
        <div>
          {/* A — Admin Profile */}
          <SectionCard title="A · โปรไฟล์ Admin" subtitle="ชื่อและตำแหน่งที่แสดงใน Sidebar">
            <FieldGroup label="ชื่อ Admin">
              <input className="input" value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="ชื่อ Admin" />
            </FieldGroup>
            <FieldGroup label="ตำแหน่ง / แผนก">
              <input className="input" value={adminTitle} onChange={e => setAdminTitle(e.target.value)} placeholder="เช่น หัวหน้าฝ่าย" />
            </FieldGroup>
            <button className="btn btn-primary" style={{ width: '100%', height: 42, fontSize: 13, fontWeight: 600 }}
              onClick={saveProfile} disabled={!adminName.trim()}>
              บันทึกโปรไฟล์
            </button>
          </SectionCard>

          {/* B — Password */}
          <SectionCard title="B · เปลี่ยนรหัสผ่าน" subtitle="รหัสผ่านสำหรับเข้าสู่ระบบ Admin">
            <FieldGroup label="รหัสผ่านปัจจุบัน">
              <input className="input" type="password" value={curPwd} onChange={e => { setCurPwd(e.target.value); setPwdError(''); }} placeholder="••••••••" />
            </FieldGroup>
            <FieldGroup label="รหัสผ่านใหม่">
              <input className="input" type="password" value={newPwd} onChange={e => { setNewPwd(e.target.value); setPwdError(''); }} placeholder="อย่างน้อย 4 ตัวอักษร" />
            </FieldGroup>
            <FieldGroup label="ยืนยันรหัสผ่านใหม่">
              <input className="input" type="password" value={confirmPwd} onChange={e => { setConfirmPwd(e.target.value); setPwdError(''); }} placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง" />
            </FieldGroup>
            {pwdError && (
              <div style={{ fontSize: 12, color: 'var(--crit)', marginBottom: 12, background: 'var(--crit-soft)', padding: '8px 12px', borderRadius: 'var(--r-md)' }}>
                {pwdError}
              </div>
            )}
            <button className="btn btn-primary" style={{ width: '100%', height: 42, fontSize: 13, fontWeight: 600 }}
              onClick={savePassword} disabled={!curPwd || !newPwd || !confirmPwd}>
              เปลี่ยนรหัสผ่าน
            </button>
          </SectionCard>
        </div>

        {/* Right column */}
        <div>
          {/* C — SLA */}
          <SectionCard title="C · SLA ค่าเริ่มต้น" subtitle="ระยะเวลาดำเนินการ (ชั่วโมง) สำหรับแต่ละระดับความเร่งด่วน">
            {slaRows.map(({ prio, label, val, set, unit, setUnit }) => (
              <FieldGroup key={prio} label={label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: PRIO_COLOR[prio],
                  }} />
                  <input className="input" type="number" min="1" value={val}
                    onChange={e => set(e.target.value)}
                    style={{ flex: 1, minWidth: 0 }} />
                  {/* Unit toggle */}
                  <div style={{ display: 'flex', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                    {(['hours', 'days'] as SlaUnit[]).map(u => (
                      <button key={u} type="button"
                        onClick={() => setUnit(u)}
                        style={{
                          padding: '0 10px', height: 36, border: 'none', cursor: 'pointer',
                          fontSize: 12, fontFamily: 'inherit', fontWeight: u === unit ? 600 : 400,
                          background: u === unit ? 'var(--brand)' : 'var(--surface)',
                          color: u === unit ? '#fff' : 'var(--ink-3)',
                          transition: 'all .12s',
                        }}>
                        {u === 'hours' ? 'ชม.' : 'วัน'}
                      </button>
                    ))}
                  </div>
                </div>
              </FieldGroup>
            ))}
            <button className="btn btn-primary" style={{ width: '100%', height: 42, fontSize: 13, fontWeight: 600, marginTop: 4 }}
              onClick={saveSla}>
              บันทึก SLA
            </button>
          </SectionCard>

          {/* D — Org */}
          <SectionCard title="D · ข้อมูลองค์กร" subtitle="ชื่อองค์กรและแผนกที่แสดงในระบบ">
            <FieldGroup label="ชื่อองค์กร / ระบบ">
              <input className="input" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="เช่น Dinarr" />
            </FieldGroup>
            <FieldGroup label="แผนก / คำอธิบาย">
              <input className="input" value={orgDept} onChange={e => setOrgDept(e.target.value)} placeholder="เช่น ระบบแจ้งซ่อม" />
            </FieldGroup>
            <button className="btn btn-primary" style={{ width: '100%', height: 42, fontSize: 13, fontWeight: 600 }}
              onClick={saveOrg} disabled={!orgName.trim()}>
              บันทึกข้อมูลองค์กร
            </button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
