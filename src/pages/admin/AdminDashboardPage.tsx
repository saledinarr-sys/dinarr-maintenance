import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTickets } from '../../hooks/useTickets';
import { useTechnicians } from '../../hooks/useTechnicians';
import { Bell, Plus, Trend, Activity } from '../../components/ui/Icon';
import StatusPill from '../../components/ui/StatusPill';
import PriorityChip from '../../components/ui/PriorityChip';
import MobileAdminTopBar from '../../components/admin/MobileAdminTopBar';
import { useIsMobileAdmin } from '../../components/admin/AdminLayout';
import { CATEGORY_COLOR, CATEGORY_LABEL } from '../../types';

const CHART_COLORS = ['#2B7CE9', '#18A4A8', '#E08A1E', '#DA3B4B', '#5B5BD6'];

function last14Days(): { day: string; new: number; closed: number }[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return { day: d.getDate().toString(), new: 0, closed: 0 };
  });
}

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobileAdmin();
  const { tickets, loading } = useTickets();
  const { technicians } = useTechnicians();

  const today = new Date();
  const todayCount = tickets.filter(t => new Date(t.created_at).toDateString() === today.toDateString()).length;
  const inProgressCount = tickets.filter(t => t.status === 'progress').length;
  const critPending = tickets.filter(t => t.priority === 'crit' && t.status !== 'done').length;
  const ratedTickets = tickets.filter(t => t.rating);
  const avgRating = ratedTickets.length > 0 ? (ratedTickets.reduce((s, t) => s + (t.rating ?? 0), 0) / ratedTickets.length).toFixed(1) : '-';

  const barData = last14Days();
  tickets.forEach(t => {
    const d = new Date(t.created_at);
    const dayStr = d.getDate().toString();
    const entry = barData.find(b => b.day === dayStr);
    if (entry) { entry.new++; if (t.status === 'done') entry.closed++; }
  });

  const catCount: Record<string, number> = {};
  tickets.forEach(t => { catCount[t.category_id] = (catCount[t.category_id] ?? 0) + 1; });
  const donutData = Object.entries(catCount).map(([id, count]) => ({ name: CATEGORY_LABEL[id as keyof typeof CATEGORY_LABEL] ?? id, value: count }));

  const activeQueue = tickets.filter(t => t.status !== 'done').slice(0, 6);
  const topTechs = [...technicians].sort((a, b) => b.rating - a.rating).slice(0, 4);

  const kpis = [
    { label: 'งานวันนี้',       value: todayCount,     sub: 'คำขอใหม่', icon: <Plus size={15} />,     color: 'var(--brand)' },
    { label: 'กำลังดำเนินการ', value: inProgressCount, sub: 'งาน',      icon: <Activity size={15} />, color: 'var(--warn)'  },
    { label: 'ฉุกเฉินค้างอยู่', value: critPending,    sub: 'งาน',      icon: <Bell size={15} />,     color: 'var(--crit)'  },
    { label: 'คะแนนเฉลี่ย',    value: avgRating,       sub: '/ 5.0',    icon: <Trend size={15} />,    color: 'var(--ok)'    },
  ];

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <MobileAdminTopBar
          title="Dashboard"
          subtitle={today.toLocaleDateString('th-TH', { weekday: 'long', month: 'long', day: 'numeric' })}
          action={
            <button className="btn btn-primary" onClick={() => navigate('/admin/new')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', fontSize: 13, borderRadius: 'var(--r-md)' }}>
              <Plus size={14} stroke="#fff" />แจ้งซ่อม
            </button>
          }
        />

        <div style={{ padding: '14px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* 2×2 stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {kpis.map((kpi, i) => (
              <div key={i} className="dn-card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 500 }}>{kpi.label}</div>
                  <div style={{
                    width: 26, height: 26, borderRadius: 8,
                    background: kpi.color + '18', color: kpi.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{kpi.icon}</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color, lineHeight: 1 }}>{loading ? '-' : kpi.value}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="dn-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-1)' }}>ปริมาณงาน 14 วันล่าสุด</div>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--ink-4)', marginBottom: 6 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--brand)', display: 'inline-block' }} />แจ้งใหม่</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--ok)', display: 'inline-block' }} />ปิดงาน</span>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={barData} barGap={2}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--ink-4)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="new" fill="#2B7CE9" radius={[3, 3, 0, 0]} name="แจ้งใหม่" />
                <Bar dataKey="closed" fill="#2BA672" radius={[3, 3, 0, 0]} name="ปิดงาน" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut chart + legend side by side */}
          <div className="dn-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-1)', marginBottom: 12 }}>ประเภทงาน</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
                <ResponsiveContainer width={110} height={110}>
                  <PieChart>
                    <Pie data={donutData} innerRadius={34} outerRadius={50} dataKey="value" paddingAngle={2}>
                      {donutData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-1)' }}>{tickets.length}</div>
                  <div style={{ fontSize: 9, color: 'var(--ink-4)' }}>งาน</div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                {donutData.slice(0, 4).map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                    <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active queue — compact list */}
          <div className="dn-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-1)' }}>คิวงานที่ดำเนินการ</div>
              <button onClick={() => navigate('/admin/board')}
                style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                ดูทั้งหมด →
              </button>
            </div>
            {activeQueue.map(t => (
              <div key={t.id} onClick={() => navigate(`/staff/ticket/${t.id}`)}
                style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 10.5, color: 'var(--ink-4)', fontWeight: 600, letterSpacing: 0.4, fontFamily: 'monospace' }}>{t.id}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-1)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
                    <StatusPill status={t.status} size="sm" />
                    <PriorityChip priority={t.priority} showLabel={false} />
                  </div>
                </div>
              </div>
            ))}
            {activeQueue.length === 0 && (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>ไม่มีงานค้าง</div>
            )}
          </div>

          {/* Top performers */}
          <div className="dn-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-1)', marginBottom: 4 }}>ช่างยอดนิยม</div>
            {topTechs.map((tech, i) => (
              <div key={tech.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: CATEGORY_COLOR[tech.team] + '20',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: CATEGORY_COLOR[tech.team],
                }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tech.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 1 }}>{CATEGORY_LABEL[tech.team]} · {tech.completed_jobs} งาน</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F6A11E', flexShrink: 0 }}>⭐ {tech.rating.toFixed(1)}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  /* ── DESKTOP ── */
  return (
    <div className="admin-page" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink-1)' }}>Dashboard</div>
          <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>
            {today.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/new')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} stroke="#fff" />แจ้งซ่อมใหม่
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {kpis.map((kpi, i) => (
          <div key={i} className="dn-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 8 }}>{kpi.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color }}>{loading ? '-' : kpi.value}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{kpi.sub}</div>
              </div>
              <div style={{ color: kpi.color, opacity: 0.6 }}>{kpi.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="dn-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)', marginBottom: 16 }}>ปริมาณงาน 14 วันล่าสุด</div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-3)' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--brand)' }} /> แจ้งใหม่</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-3)' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--ok)' }} /> ปิดงาน</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barGap={2}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--ink-4)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="new" fill="#2B7CE9" radius={[3, 3, 0, 0]} name="แจ้งใหม่" />
              <Bar dataKey="closed" fill="#2BA672" radius={[3, 3, 0, 0]} name="ปิดงาน" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="dn-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)', marginBottom: 16 }}>ประเภทงาน</div>
          <div style={{ position: 'relative', height: 140 }}>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={donutData} innerRadius={44} outerRadius={64} dataKey="value" paddingAngle={2}>
                  {donutData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-1)' }}>{tickets.length}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>งานทั้งหมด</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {donutData.slice(0, 4).map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="dn-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)' }}>คิวงานที่ดำเนินการ</div>
            <button onClick={() => navigate('/admin/board')} style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>ดูทั้งหมด →</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['รหัส', 'หัวข้อ', 'ผู้รับผิดชอบ', 'สถานะ', 'ความเร่งด่วน'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0 8px 10px 0', fontSize: 12, fontWeight: 600, color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeQueue.map(t => {
                const tech = technicians.find(tc => tc.id === t.assigned_tech_id);
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    onClick={() => navigate(`/staff/ticket/${t.id}`)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td style={{ padding: '10px 8px 10px 0', fontSize: 12, fontFamily: 'monospace', color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>{t.id}</td>
                    <td style={{ padding: '10px 8px 10px 0', fontSize: 13, color: 'var(--ink-1)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</td>
                    <td style={{ padding: '10px 8px 10px 0', fontSize: 12, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{tech?.name ?? '—'}</td>
                    <td style={{ padding: '10px 8px 10px 0' }}><StatusPill status={t.status} size="sm" /></td>
                    <td style={{ padding: '10px 0 10px 0' }}><PriorityChip priority={t.priority} showLabel={false} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="dn-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)', marginBottom: 16 }}>ช่างยอดนิยม</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topTechs.map((tech, i) => (
              <div key={tech.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: CATEGORY_COLOR[tech.team] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: CATEGORY_COLOR[tech.team] }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tech.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{CATEGORY_LABEL[tech.team]} · {tech.completed_jobs} งาน</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F6A11E', flexShrink: 0 }}>⭐ {tech.rating.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
