import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/ui/Icon';
import type { AppUser } from '../types';

interface Role {
  role: AppUser['role'];
  label: string;
  subtitle: string;
  emoji: string;
  color: string;
  to: string;
}

const ROLES: Role[] = [
  { role: 'staff', label: 'พนักงาน / เจ้าหน้าที่', subtitle: 'แจ้งซ่อมและติดตามสถานะ', emoji: '🏥', color: 'var(--brand-soft)', to: '/staff/home' },
  { role: 'tech', label: 'ช่างซ่อม', subtitle: 'รับงานและอัปเดตสถานะ', emoji: '🔧', color: 'var(--warn-soft)', to: '/tech/queue' },
  { role: 'admin', label: 'หัวหน้าฝ่าย', subtitle: 'ดู Dashboard และจัดการทีม', emoji: '📊', color: 'var(--ok-soft)', to: '/admin/dashboard' },
];

const LoginPage: React.FC = () => {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [dept, setDept] = useState('');
  const [techId, setTechId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = (role: Role) => {
    setSelected(role);
    setName('');
    setDept('');
    setTechId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !name.trim()) return;
    setSubmitting(true);
    const user: AppUser = {
      role: selected.role,
      name: name.trim(),
      department: dept.trim() || undefined,
      tech_id: selected.role === 'tech' ? techId.trim() || undefined : undefined,
    };
    setUser(user);
    navigate(selected.to);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Logo size={48} />
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink-1)', marginTop: 12 }}>Dinarr</div>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 4 }}>ระบบแจ้งซ่อม โรงพยาบาลสัตว์</div>
        </div>

        {!selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', textAlign: 'center', marginBottom: 4 }}>เลือกบทบาทของคุณ</div>
            {ROLES.map(role => (
              <button key={role.role} onClick={() => handleSelect(role)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all .15s', width: '100%',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--r-md)', background: role.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
                }}>{role.emoji}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-1)' }}>{role.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{role.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="dn-card" style={{ padding: 24 }}>
            <button onClick={() => setSelected(null)}
              style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontSize: 14, padding: 0, marginBottom: 16, fontFamily: 'inherit' }}>
              ← เปลี่ยนบทบาท
            </button>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-1)', marginBottom: 16 }}>
              {selected.emoji} {selected.label}
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>ชื่อ-นามสกุล *</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="เช่น พ.สัตวแพทย์ สมชาย" required />
              </div>
              {selected.role !== 'admin' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>แผนก / ตำแหน่ง</label>
                  <input className="input" value={dept} onChange={e => setDept(e.target.value)} placeholder="เช่น แผนกสัตว์เล็ก" />
                </div>
              )}
              {selected.role === 'tech' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>รหัสช่าง (เช่น T01)</label>
                  <input className="input" value={techId} onChange={e => setTechId(e.target.value)} placeholder="T01" />
                </div>
              )}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={submitting || !name.trim()}>
                {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
