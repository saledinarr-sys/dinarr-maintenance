import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/ui/Icon';
import { getSettings } from '../../hooks/useSettings';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [wrong, setWrong] = useState(false);

  const handleLogin = () => {
    if (password === getSettings().password) {
      navigate('/admin/dashboard');
    } else {
      setWrong(true);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'var(--surface)', borderRadius: 'var(--r-lg)',
        padding: '40px 32px', boxShadow: 'var(--shadow-2)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <Logo size={48} />
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-1)', marginTop: 12 }}>ผู้ดูแลระบบ</div>
          <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 4 }}>Dinarr Admin Dashboard</div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 8 }}>รหัสผ่าน</div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setWrong(false); }}
              onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
              placeholder="กรอกรหัสผ่าน"
              autoFocus
              style={{ fontSize: 15 }}
            />
            {wrong && (
              <div style={{ fontSize: 12, color: 'var(--crit)', marginTop: 6 }}>รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่</div>
            )}
          </div>

          <button className="btn btn-primary"
            style={{ width: '100%', height: 50, fontSize: 15, fontWeight: 600 }}
            onClick={handleLogin}>
            เข้าสู่ระบบ
          </button>
        </div>

        {/* Back */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button onClick={() => navigate('/staff/home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-4)', fontFamily: 'inherit' }}>
            ← กลับหน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
