import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { TicketEvent } from '../types';

export function useTicketEvents(ticketId: string) {
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('ticket_events')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      setEvents(data ?? []);
      setLoading(false);
    };
    fetch();
    const channel = supabase.channel(`events-${ticketId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_events', filter: `ticket_id=eq.${ticketId}` }, (payload) => {
        setEvents(prev => [...prev, payload.new as TicketEvent]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [ticketId]);

  return { events, loading };
}
