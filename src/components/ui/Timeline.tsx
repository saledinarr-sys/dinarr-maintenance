import React from 'react';
import type { TicketEvent } from '../../types';

const DOT_COLOR: Record<string, string> = {
  open: '#2B7CE9',
  assign: '#18A4A8',
  progress: '#E08A1E',
  wait: '#8A9BAE',
  done: '#2BA672',
  rate: '#5B5BD6',
};

interface Props {
  events: TicketEvent[];
}

const Timeline: React.FC<Props> = ({ events }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
    {events.map((ev, i) => (
      <div key={ev.id} style={{ display: 'flex', gap: 12, paddingBottom: i < events.length - 1 ? 16 : 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%', marginTop: 4, flexShrink: 0,
            background: DOT_COLOR[ev.action_type] ?? '#CBD7E5',
            border: '2px solid white', boxShadow: '0 0 0 1.5px ' + (DOT_COLOR[ev.action_type] ?? '#CBD7E5'),
          }} />
          {i < events.length - 1 && (
            <div style={{ width: 1, flex: 1, background: 'var(--border)', marginTop: 4 }} />
          )}
        </div>
        <div style={{ flex: 1, paddingBottom: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}>{ev.actor_name}</span>
              <span style={{ fontSize: 13, color: 'var(--ink-3)', marginLeft: 6 }}>{ev.detail}</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--ink-4)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {new Date(ev.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default Timeline;
