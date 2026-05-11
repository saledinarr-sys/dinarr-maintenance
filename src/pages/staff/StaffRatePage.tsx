import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PhoneShell from '../../components/staff/PhoneShell';
import { StarFill, Star } from '../../components/ui/Icon';
import { useTicket, useTickets } from '../../hooks/useTickets';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

const TAGS = ['รวดเร็ว', 'สุภาพ', 'ทำความสะอาด', 'ซ่อมดี', 'สื่อสารดี'];

const StaffRatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { ticket } = useTicket(id ?? '');
  const { updateRating } = useTickets();
  const { user } = useApp();

  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async () => {
    if (!score || !id) return;
    setSubmitting(true);
    await supabase.from('ratings').insert({ ticket_id: id, score, tags: selectedTags, comment: comment.trim() });
    await updateRating(id, score);
    await supabase.from('ticket_events').insert({
      ticket_id: id,
      actor_name: user?.name ?? 'ผู้แจ้ง',
      action_type: 'rate',
      detail: `ให้คะแนน ${score}/5`,
    });
    navigate(`/staff/ticket/${id}`);
  };

  const displayScore = hovered || score;

  return (
    <PhoneShell title="ประเมินการซ่อม" showBack>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Success banner */}
      <div style={{ textAlign: 'center', padding: '24px 0', marginBottom: 24 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: 'var(--ok-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
        }}>
          <span style={{ fontSize: 32 }}>✅</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-1)', marginBottom: 6 }}>ซ่อมเสร็จแล้ว!</div>
        <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>ช่วยประเมินความพึงพอใจด้วยนะครับ</div>
      </div>

      {/* Ticket summary */}
      {ticket && (
        <div className="dn-card" style={{ padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'monospace' }}>{ticket.id}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-1)', marginTop: 4 }}>{ticket.title}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{ticket.where_loc}</div>
        </div>
      )}

      {/* Star rating */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 12 }}>ให้คะแนน</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <button key={i} type="button"
              onClick={() => setScore(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: i <= displayScore ? '#F6A11E' : 'var(--border-strong)' }}>
              {i <= displayScore ? <StarFill size={36} /> : <Star size={36} />}
            </button>
          ))}
        </div>
        {displayScore > 0 && (
          <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8 }}>
            {['', 'ปรับปรุง', 'พอใช้', 'ดี', 'ดีมาก', 'ยอดเยี่ยม!'][displayScore]}
          </div>
        )}
      </div>

      {/* Tags */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 12 }}>จุดเด่น (เลือกได้หลายข้อ)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TAGS.map(tag => {
            const active = selectedTags.includes(tag);
            return (
              <button key={tag} type="button" onClick={() => toggleTag(tag)}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--r-pill)',
                  border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border-strong)'}`,
                  background: active ? 'var(--brand-soft)' : 'var(--surface)',
                  color: active ? 'var(--brand-2)' : 'var(--ink-2)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all .15s',
                }}>
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comment */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 8 }}>ความคิดเห็นเพิ่มเติม</div>
        <textarea className="input" value={comment} onChange={e => setComment(e.target.value)}
          placeholder="ฝากข้อเสนอแนะ..." rows={3} />
      </div>

      <button className="btn btn-primary" style={{ width: '100%', height: 52, fontSize: 16, fontWeight: 600 }}
        onClick={handleSubmit} disabled={!score || submitting}>
        {submitting ? 'กำลังส่ง...' : 'ส่งการประเมิน'}
      </button>
      </div>
    </PhoneShell>
  );
};

export default StaffRatePage;
