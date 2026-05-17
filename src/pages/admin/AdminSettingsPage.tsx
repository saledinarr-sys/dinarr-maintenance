import React, { useState } from 'react';
import { useSettings, getSettings } from '../../hooks/useSettings';
import { useIsMobileAdmin } from '../../components/admin/AdminLayout';
import MobileAdminTopBar from '../../components/admin/MobileAdminTopBar';
import { supabase } from '../../lib/supabase';
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
  const isMobile = useIsMobileAdmin();
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

  // Section E — Telegram
  const [tgEnabled, setTgEnabled] = useState(settings.telegramEnabled);
  const [tgToken, setTgToken] = useState(settings.telegramBotToken);
  const [tgChatId, setTgChatId] = useState(settings.telegramChatId);
  const [tgTesting, setTgTesting] = useState(false);

  // Section F — Clear Data
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearInput, setClearInput] = useState('');
  const [clearing, setClearing] = useState(false);

  const clearAllData = async () => {
    if (clearInput !== 'ลบทั้งหมด') return;
    setClearing(true);
    try {
      await supabase.from('ratings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('ticket_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('tickets').delete().neq('id', 'NONE');
      setShowClearConfirm(false);
      setClearInput('');
      showToast('✅ ล้างข้อมูลทั้งหมดแล้ว');
    } catch {
      showToast('❌ เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
    setClearing(false);
  };

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

  const saveTelegram = () => {
    save({ telegramEnabled: tgEnabled, telegramBotToken: tgToken.trim(), telegramChatId: tgChatId.trim() });
    showToast('บันทึกการตั้งค่า Telegram แล้ว ✓');
  };

  const testTelegram = async () => {
    if (!tgToken.trim() || !tgChatId.trim()) return;
    setTgTesting(true);
    try {
      const res = await fetch(`https://api.telegram.org/bot${tgToken.trim()}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId.trim(),
          text: `✅ <b>ทดสอบการเชื่อมต่อ Dinarr</b>\n\nการตั้งค่า Telegram สำเร็จแล้ว!\nแจ้งเตือนจะส่งมาที่นี่โดยอัตโนมัติ 🎉\n\nพิมพ์ /help เพื่อดูคำสั่งที่ใช้ได้`,
          parse_mode: 'HTML',
        }),
      });
      const data = await res.json() as { ok: boolean };
      if (data.ok) showToast('ส่งข้อความทดสอบสำเร็จ ✓');
      else showToast('ส่งไม่สำเร็จ — ตรวจสอบ Token และ Chat ID');
    } catch {
      showToast('เกิดข้อผิดพลาด — ตรวจสอบ Token อีกครั้ง');
    }
    setTgTesting(false);
  };

  const registerWebhook = async () => {
    if (!tgToken.trim()) return;
    const appUrl = import.meta.env.VITE_APP_URL as string | undefined ?? window.location.origin;
    const webhookUrl = `${appUrl}/api/telegram-webhook`;
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${tgToken.trim()}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
      );
      const data = await res.json() as { ok: boolean; description?: string };
      if (data.ok) showToast('ลงทะเบียน Webhook สำเร็จ ✓ Bot รับคำสั่งได้แล้ว');
      else showToast(`ลงทะเบียนไม่สำเร็จ: ${data.description ?? 'ไม่ทราบสาเหตุ'}`);
    } catch {
      showToast('เกิดข้อผิดพลาด — ตรวจสอบ Token');
    }
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

  /* ── shared section blocks ── */
  const sectionA = (
    <SectionCard title="โปรไฟล์ Admin" subtitle="ชื่อและตำแหน่งที่แสดงใน Sidebar">
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
  );

  const sectionB = (
    <SectionCard title="เปลี่ยนรหัสผ่าน" subtitle="รหัสผ่านสำหรับเข้าสู่ระบบ Admin">
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
  );

  const sectionC = (
    <SectionCard title="SLA ค่าเริ่มต้น" subtitle="ระยะเวลาดำเนินการสำหรับแต่ละระดับความเร่งด่วน">
      {slaRows.map(({ prio, label, val, set, unit, setUnit }) => (
        <FieldGroup key={prio} label={label}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: PRIO_COLOR[prio] }} />
            <input className="input" type="number" min="1" value={val}
              onChange={e => set(e.target.value)}
              style={{ flex: 1, minWidth: 0 }} />
            <div style={{ display: 'flex', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
              {(['hours', 'days'] as SlaUnit[]).map(u => (
                <button key={u} type="button" onClick={() => setUnit(u)}
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
  );

  const sectionD = (
    <SectionCard title="ข้อมูลองค์กร" subtitle="ชื่อองค์กรและแผนกที่แสดงในระบบ">
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
  );

  const sectionE = (
    <SectionCard title="Telegram แจ้งเตือน" subtitle="รับการแจ้งเตือนทุกขั้นตอนผ่าน Telegram Bot">
      {/* Enable toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
        padding: '12px 14px', background: tgEnabled ? 'var(--brand-soft)' : 'var(--surface-2)',
        borderRadius: 'var(--r-md)', border: `1.5px solid ${tgEnabled ? 'var(--brand)' : 'var(--border)'}`,
        transition: 'all .15s',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: tgEnabled ? 'var(--brand-2)' : 'var(--ink-2)' }}>
            {tgEnabled ? '🔔 เปิดการแจ้งเตือน' : '🔕 ปิดการแจ้งเตือน'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>
            {tgEnabled ? 'จะส่งแจ้งเตือนทุกครั้งที่มีการเปลี่ยนสถานะ' : 'ไม่มีการส่งแจ้งเตือน'}
          </div>
        </div>
        <button type="button" onClick={() => setTgEnabled(v => !v)}
          style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: tgEnabled ? 'var(--brand)' : 'var(--ink-5, #ccc)',
            position: 'relative', flexShrink: 0, transition: 'background .2s',
          }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 3, transition: 'left .2s',
            left: tgEnabled ? 23 : 3,
          }} />
        </button>
      </div>

      <FieldGroup label="Bot Token">
        <input className="input" type="password" value={tgToken}
          onChange={e => setTgToken(e.target.value)}
          placeholder="1234567890:AAF..." />
      </FieldGroup>
      <FieldGroup label="Chat ID">
        <input className="input" value={tgChatId}
          onChange={e => setTgChatId(e.target.value)}
          placeholder="-100123456789 หรือ @username" />
      </FieldGroup>

      {/* How-to hint */}
      <div style={{ fontSize: 11.5, color: 'var(--ink-4)', background: 'var(--surface-2)',
        padding: '10px 12px', borderRadius: 'var(--r-md)', marginBottom: 14, lineHeight: 1.6 }}>
        📌 วิธีสร้าง Bot: เปิด Telegram → ค้นหา <b>@BotFather</b> → พิมพ์ <code>/newbot</code> → คัดลอก Token<br />
        📌 วิธีหา Chat ID: ค้นหา <b>@userinfobot</b> → กด Start → คัดลอกตัวเลข <b>Id</b>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button className="btn" style={{ flex: 1, height: 42, fontSize: 13, fontWeight: 600,
          background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--ink-2)' }}
          onClick={testTelegram}
          disabled={!tgToken.trim() || !tgChatId.trim() || tgTesting}>
          {tgTesting ? 'กำลังส่ง...' : '🔔 ทดสอบส่ง'}
        </button>
        <button className="btn btn-primary" style={{ flex: 2, height: 42, fontSize: 13, fontWeight: 600 }}
          onClick={saveTelegram}>
          บันทึก
        </button>
      </div>

      {/* Webhook registration */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>
          รับคำสั่งจาก Telegram
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginBottom: 10, lineHeight: 1.5 }}>
          กด "ลงทะเบียน" เพื่อให้ Bot รับคำสั่งได้ เช่น พิมพ์ <code>/status</code> แล้ว Bot ตอบกลับรายการงานค้างทันที
        </div>
        <button className="btn" style={{ width: '100%', height: 40, fontSize: 13, fontWeight: 600,
          background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--brand)' }}
          onClick={registerWebhook}
          disabled={!tgToken.trim()}>
          🔗 ลงทะเบียน Webhook (ทำครั้งเดียว)
        </button>
        <div style={{ fontSize: 11, color: 'var(--ink-5, var(--ink-4))', marginTop: 6 }}>
          คำสั่งที่ใช้ได้: <code>/status</code> · <code>/new</code> · <code>/progress</code> · <code>/help</code>
        </div>
      </div>
    </SectionCard>
  );

  /* ── Toast ── */
  const toastEl = toast ? (
    <div style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: 'var(--ok)', color: '#fff',
      padding: '10px 20px', borderRadius: 'var(--r-md)',
      fontSize: 13, fontWeight: 600,
      boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
      whiteSpace: 'nowrap',
    }}>
      {toast}
    </div>
  ) : null;

  const sectionF = (
    <SectionCard title="⚠️ โซนอันตราย" subtitle="การกระทำนี้ไม่สามารถย้อนกลับได้">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-1)' }}>ล้างข้อมูลทั้งหมด</div>
          <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>ลบตั๋วซ่อม, timeline และการให้คะแนนทั้งหมด เริ่มระบบใหม่</div>
        </div>
        <button onClick={() => { setShowClearConfirm(true); setClearInput(''); }}
          style={{ padding: '8px 18px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--crit)', background: 'none', color: 'var(--crit)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          🗑️ ล้างข้อมูล
        </button>
      </div>

      {/* Confirm Dialog */}
      {showClearConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setShowClearConfirm(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, width: '100%', maxWidth: 380, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 8 }}>⚠️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-1)', textAlign: 'center', marginBottom: 8 }}>ยืนยันการล้างข้อมูล?</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>
              ข้อมูลตั๋วซ่อม, timeline และคะแนนทั้งหมดจะถูกลบถาวร<br/>
              <strong style={{ color: 'var(--crit)' }}>ไม่สามารถกู้คืนได้</strong>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>พิมพ์ <strong>ลบทั้งหมด</strong> เพื่อยืนยัน</div>
              <input className="input" value={clearInput} onChange={e => setClearInput(e.target.value)}
                placeholder="ลบทั้งหมด" style={{ width: '100%', borderColor: clearInput === 'ลบทั้งหมด' ? 'var(--crit)' : undefined }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowClearConfirm(false)}
                style={{ flex: 1, padding: '10px', fontSize: 13, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink-2)' }}>
                ยกเลิก
              </button>
              <button onClick={clearAllData} disabled={clearInput !== 'ลบทั้งหมด' || clearing}
                style={{ flex: 2, padding: '10px', fontSize: 13, fontWeight: 600, background: clearInput === 'ลบทั้งหมด' ? 'var(--crit)' : 'var(--surface-2)', color: clearInput === 'ลบทั้งหมด' ? '#fff' : 'var(--ink-4)', border: 'none', borderRadius: 'var(--r-lg)', cursor: clearInput === 'ลบทั้งหมด' ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                {clearing ? 'กำลังล้าง...' : '🗑️ ล้างข้อมูลทั้งหมด'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        {toastEl}
        <MobileAdminTopBar title="ตั้งค่า" subtitle="จัดการการตั้งค่าระบบ" />
        <div style={{ padding: '12px 16px 24px', display: 'flex', flexDirection: 'column' }}>
          {sectionA}
          {sectionB}
          {sectionC}
          {sectionD}
          {sectionE}
          {sectionF}
        </div>
      </div>
    );
  }

  /* ── DESKTOP ── */
  return (
    <div className="admin-page" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {toastEl}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-1)' }}>ตั้งค่า</div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>จัดการการตั้งค่าระบบ</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900 }}>
        <div>{sectionA}{sectionB}</div>
        <div>{sectionC}{sectionD}</div>
      </div>
      <div style={{ maxWidth: 900, marginTop: 0 }}>{sectionE}</div>
      <div style={{ maxWidth: 900, marginTop: 0 }}>{sectionF}</div>
    </div>
  );
};

export default AdminSettingsPage;
