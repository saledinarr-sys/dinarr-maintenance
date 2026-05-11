import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Ticket, TicketStatus, EventAction } from '../types';

interface CreateTicketInput {
  category_id: string;
  status?: TicketStatus;
  priority: string;
  title: string;
  where_loc: string;
  reporter_name: string;
  reporter_role: string;
  sla_hours?: number;
  description?: string;
  photo_urls?: string[];
}

interface UpdateStatusInput {
  ticketId: string;
  status: TicketStatus;
  actorName: string;
  detail?: string;
}

// Module-level cache: tickets created locally (no Supabase) are stored here
// so both useTickets and useTicket can find them
const localTicketCache = new Map<string, Ticket>();

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'DN-2446', category_id: 'electric', status: 'new', priority: 'high',
    title: 'ไฟดับทั้งชั้น 3', where_loc: 'อาคาร A · ชั้น 3 · ทั้งชั้น',
    reporter_name: 'พนักงาน', reporter_role: 'เจ้าหน้าที่',
    assigned_tech_id: null, created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    sla_hours: 4, description: 'ไฟฟ้าดับทั้งชั้น ไม่สามารถใช้งานเครื่องมือได้',
    photo_urls: [], rating: null,
  },
  {
    id: 'DN-2447', category_id: 'aircon', status: 'new', priority: 'mid',
    title: 'แอร์ห้องตรวจไม่เย็น', where_loc: 'อาคาร B · ชั้น 1 · ห้องตรวจ 1',
    reporter_name: 'พนักงาน', reporter_role: 'เจ้าหน้าที่',
    assigned_tech_id: null, created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    sla_hours: 8, description: 'อุณหภูมิไม่ลดลงแม้เปิดมา 2 ชั่วโมง',
    photo_urls: [], rating: null,
  },
  {
    id: 'DN-2448', category_id: 'plumb', status: 'progress', priority: 'low',
    title: 'ก๊อกน้ำรั่ว', where_loc: 'อาคาร A · ชั้น 2 · ห้องน้ำ',
    reporter_name: 'พนักงาน', reporter_role: 'เจ้าหน้าที่',
    assigned_tech_id: 'T002', created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    sla_hours: 24, description: 'น้ำหยดตลอดเวลา',
    photo_urls: [], rating: null,
  },
  {
    id: 'DN-2449', category_id: 'it', status: 'progress', priority: 'mid',
    title: 'เครื่องพิมพ์ไม่ทำงาน', where_loc: 'อาคาร C · ชั้น 1 · เคาน์เตอร์',
    reporter_name: 'พนักงาน', reporter_role: 'เจ้าหน้าที่',
    assigned_tech_id: 'T005', created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    sla_hours: 8, description: 'พิมพ์ไม่ออก ติดกระดาษ',
    photo_urls: [], rating: null,
  },
  {
    id: 'DN-2450', category_id: 'medical', status: 'done', priority: 'crit',
    title: 'เครื่อง X-Ray ค้าง', where_loc: 'อาคาร B · ชั้น 2 · ห้อง X-Ray',
    reporter_name: 'พนักงาน', reporter_role: 'เจ้าหน้าที่',
    assigned_tech_id: 'T004', created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    sla_hours: 2, description: 'ซ่อมเสร็จแล้ว บอร์ดควบคุมเสื่อมสภาพ เปลี่ยนใหม่แล้ว',
    photo_urls: [], rating: 4,
  },
];

export function useTickets(filters?: { assigned_tech_id?: string; reporter_name?: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const mergeCache = (base: Ticket[]): Ticket[] => {
    // Override base tickets with cached versions (preserves status updates made offline)
    const updated = base.map(t => localTicketCache.get(t.id) ?? t);
    // Also add locally-created tickets that don't exist in the base list at all
    const ids = new Set(base.map(t => t.id));
    const extra = Array.from(localTicketCache.values()).filter(t => !ids.has(t.id));
    return [...extra, ...updated].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const applyFilters = (list: Ticket[]) => {
    let result = [...list];
    if (filters?.assigned_tech_id) result = result.filter(t => t.assigned_tech_id === filters.assigned_tech_id);
    if (filters?.reporter_name) result = result.filter(t => t.reporter_name === filters.reporter_name);
    return result;
  };

  const fetch = async () => {
    setLoading(true);
    try {
      let query = supabase.from('tickets').select('*').order('created_at', { ascending: false });
      if (filters?.assigned_tech_id) query = query.eq('assigned_tech_id', filters.assigned_tech_id);
      if (filters?.reporter_name) query = query.eq('reporter_name', filters.reporter_name);
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        setTickets(mergeCache(applyFilters(MOCK_TICKETS)));
      } else {
        setTickets(mergeCache(data));
      }
    } catch {
      setTickets(mergeCache(applyFilters(MOCK_TICKETS)));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch();
    const channel = supabase.channel('tickets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filters?.assigned_tech_id, filters?.reporter_name]);

  const createTicket = async (input: CreateTicketInput, actorName: string) => {
    // Generate ID — try Supabase RPC first, fall back to local counter
    let newId: string;
    try {
      const { data: idRow } = await supabase.rpc('next_ticket_id');
      newId = (idRow as string) || generateLocalId();
    } catch {
      newId = generateLocalId();
    }

    const newTicket: Ticket = {
      id: newId,
      ...input,
      category_id: input.category_id as Ticket['category_id'],
      priority: input.priority as Ticket['priority'],
      status: 'new',
      assigned_tech_id: null,
      created_at: new Date().toISOString(),
      sla_hours: input.sla_hours ?? 8,
      description: input.description ?? '',
      photo_urls: input.photo_urls ?? [],
      rating: null,
    };

    // Try to save to Supabase; if unavailable, keep local only
    try {
      const { data, error } = await supabase.from('tickets').insert(newTicket).select().single();
      if (!error && data) {
        await supabase.from('ticket_events').insert({
          ticket_id: newId,
          actor_name: actorName,
          action_type: 'open' as EventAction,
          detail: 'เปิดคำขอแจ้งซ่อม',
        });
        setTickets(prev => [data as Ticket, ...prev]);
        return data as Ticket;
      }
    } catch { /* Supabase unavailable — use local fallback */ }

    // Local fallback: add to state + cache
    localTicketCache.set(newTicket.id, newTicket);
    setTickets(prev => [newTicket, ...prev]);
    return newTicket;
  };

  const generateLocalId = () => {
    const existing = [...MOCK_TICKETS].map(t => parseInt(t.id.replace('DN-', '')) || 0);
    const max = existing.length > 0 ? Math.max(...existing) : 2450;
    return 'DN-' + String(max + Math.floor(Math.random() * 10) + 1).padStart(4, '0');
  };

  const updateStatus = async ({ ticketId, status, actorName, detail }: UpdateStatusInput) => {
    const updateData: Partial<Ticket> & { status: TicketStatus } = { status };

    const actionMap: Record<TicketStatus, EventAction> = {
      new: 'open', progress: 'progress', done: 'done',
    };

    // Update local state + cache immediately
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      const updated = { ...t, ...updateData };
      localTicketCache.set(ticketId, updated);
      return updated;
    }));

    // Try Supabase (best-effort)
    try {
      await supabase.from('tickets').update(updateData).eq('id', ticketId);
      await supabase.from('ticket_events').insert({
        ticket_id: ticketId,
        actor_name: actorName,
        action_type: actionMap[status],
        detail: detail ?? '',
      });
    } catch { /* Supabase unavailable — local state already updated */ }
  };

  const updateRating = async (ticketId: string, rating: number) => {
    await supabase.from('tickets').update({ rating }).eq('id', ticketId);
  };

  return { tickets, loading, error, createTicket, updateStatus, updateRating, refetch: fetch };
}

export function useTicket(ticketId: string) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('tickets').select('*').eq('id', ticketId).single();
        if (error || !data) {
          // Cache takes priority (has latest status), then mock
          const mock = MOCK_TICKETS.find(t => t.id === ticketId) ?? null;
          setTicket(localTicketCache.get(ticketId) ?? mock);
        } else {
          // Even when Supabase returns data, override with cache if it's newer
          setTicket(localTicketCache.get(ticketId) ?? data);
        }
      } catch {
        const mock = MOCK_TICKETS.find(t => t.id === ticketId) ?? null;
        setTicket(localTicketCache.get(ticketId) ?? mock);
      }
      setLoading(false);
    };
    fetch();
    const channel = supabase.channel(`ticket-${ticketId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tickets', filter: `id=eq.${ticketId}` }, (payload) => {
        setTicket(payload.new as Ticket);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [ticketId]);

  return { ticket, loading };
}
