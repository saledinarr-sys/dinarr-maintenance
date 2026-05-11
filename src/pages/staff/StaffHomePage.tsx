import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneShell from '../../components/staff/PhoneShell';
import TicketRow from '../../components/shared/TicketRow';
import { CATEGORY_ICONS, Settings } from '../../components/ui/Icon';
import { useTickets } from '../../hooks/useTickets';
import type { CategoryId } from '../../types';
import { CATEGORY_LABEL, CATEGORY_COLOR } from '../../types';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isMobile;
}

const CATS: CategoryId[] = ['electric', 'plumb', 'aircon', 'medical', 'it', 'furn'];

const StaffHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { tickets, loading } = useTickets();
  const isMobile = useIsMobile();

  return (
    <PhoneShell showBell>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-1)' }}>
          สวัสดี วันนี้มีอะไรให้ซ่อม ไม่ซ่อมก็จะดีมาก !!
        </div>
      </div>

      {/* New request CTA */}
      <button onClick={() => navigate('/staff/new')}
        className="btn btn-primary"
        style={{ width: '100%', height: 52, fontSize: 16, fontWeight: 600, borderRadius: 'var(--r-lg)', marginBottom: 24 }}>
        + แจ้งซ่อมใหม่
      </button>

      {/* Category grid */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 12, letterSpacing: '.5px', textTransform: 'uppercase' }}>ประเภทงาน</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {CATS.map(cat => {
            const Icon = CATEGORY_ICONS[cat];
            return (
              <button key={cat} onClick={() => navigate(`/staff/new?cat=${cat}`)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '14px 8px', borderRadius: 'var(--r-lg)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = CATEGORY_COLOR[cat])}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 'var(--r-md)',
                  background: CATEGORY_COLOR[cat] + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} stroke={CATEGORY_COLOR[cat]} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.3 }}>
                  {CATEGORY_LABEL[cat]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent tickets */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '.5px', textTransform: 'uppercase' }}>คำขอล่าสุด</div>
          <button onClick={() => navigate('/staff/list')}
            style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            ดูทั้งหมด
          </button>
        </div>
        {loading ? (
          <div style={{ color: 'var(--ink-4)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>กำลังโหลด...</div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--ink-4)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔧</div>
            <div style={{ fontSize: 14 }}>ยังไม่มีคำขอแจ้งซ่อม</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tickets.slice(0, 3).map(t => (
              <TicketRow key={t.id} ticket={t} onClick={() => navigate(`/staff/ticket/${t.id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* Admin link — mobile only (desktop shows it in sidebar) */}
      {isMobile && (
        <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
          <button onClick={() => navigate('/admin-login')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'var(--ink-4)', fontFamily: 'inherit',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
            <Settings size={13} stroke="var(--ink-4)" />
            เข้าสู่ระบบผู้ดูแล
          </button>
        </div>
      )}
      </div>
    </PhoneShell>
  );
};

export default StaffHomePage;
