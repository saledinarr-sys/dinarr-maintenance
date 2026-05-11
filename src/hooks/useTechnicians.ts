import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Technician, TechStatus } from '../types';

const MOCK_TECHNICIANS: Technician[] = [
  { id: 'T001', name: 'นายสมชาย ใจดี',      team: 'electric', role: 'ช่างไฟฟ้าอาวุโส',       phone: '081-234-5678', extension: '101', status: 'free', active_jobs: 2, completed_jobs: 48, rating: 4.8, avg_time_hours: 2.3 },
  { id: 'T002', name: 'นายวิชัย แสงทอง',    team: 'plumb',    role: 'ช่างประปา',             phone: '082-345-6789', extension: '102', status: 'busy', active_jobs: 1, completed_jobs: 31, rating: 4.5, avg_time_hours: 3.1 },
  { id: 'T003', name: 'นายอนุชา รักงาน',    team: 'aircon',   role: 'ช่างแอร์',              phone: '083-456-7890', extension: '103', status: 'free', active_jobs: 0, completed_jobs: 25, rating: 4.7, avg_time_hours: 4.2 },
  { id: 'T004', name: 'นางสาวมาลี สดใส',    team: 'medical',  role: 'ช่างเทคนิคการแพทย์',   phone: '084-567-8901', extension: '104', status: 'busy', active_jobs: 3, completed_jobs: 19, rating: 4.9, avg_time_hours: 1.8 },
  { id: 'T005', name: 'นายประสิทธิ์ ทำดี',  team: 'it',       role: 'ช่าง IT',               phone: '085-678-9012', extension: '105', status: 'free', active_jobs: 1, completed_jobs: 42, rating: 4.6, avg_time_hours: 1.5 },
  { id: 'T006', name: 'นายกิตติ สร้างสรรค์', team: 'furn',    role: 'ช่างอาคาร',             phone: '086-789-0123', extension: '106', status: 'off',  active_jobs: 0, completed_jobs: 15, rating: 4.3, avg_time_hours: 5.0 },
];

export function useTechnicians(teamFilter?: string) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        let query = supabase.from('technicians').select('*').order('rating', { ascending: false });
        if (teamFilter) query = query.eq('team', teamFilter);
        const { data, error } = await query;
        if (error || !data || data.length === 0) {
          const mock = teamFilter ? MOCK_TECHNICIANS.filter(t => t.team === teamFilter) : MOCK_TECHNICIANS;
          setTechnicians(mock);
        } else {
          setTechnicians(data);
        }
      } catch {
        const mock = teamFilter ? MOCK_TECHNICIANS.filter(t => t.team === teamFilter) : MOCK_TECHNICIANS;
        setTechnicians(mock);
      }
      setLoading(false);
    };
    fetch();
  }, [teamFilter]);

  const updateStatus = async (techId: string, status: TechStatus) => {
    await supabase.from('technicians').update({ status }).eq('id', techId);
  };

  const addTechnician = async (input: Omit<Technician, 'id' | 'status' | 'active_jobs' | 'completed_jobs' | 'rating' | 'avg_time_hours'>) => {
    const newId = 'T' + String(Date.now()).slice(-4);
    const newTech: Technician = { ...input, id: newId, status: 'free', active_jobs: 0, completed_jobs: 0, rating: 0, avg_time_hours: 0 };
    try {
      await supabase.from('technicians').insert(newTech);
    } catch { /* save to Supabase when connected */ }
    setTechnicians(prev => [...prev, newTech]);
    return newTech;
  };

  const updateTechnician = async (techId: string, data: Partial<Technician>) => {
    try {
      await supabase.from('technicians').update(data).eq('id', techId);
    } catch { /* update local state anyway */ }
    setTechnicians(prev => prev.map(t => t.id === techId ? { ...t, ...data } : t));
  };

  const deleteTechnician = async (techId: string) => {
    try {
      await supabase.from('technicians').delete().eq('id', techId);
    } catch { /* update local state anyway */ }
    setTechnicians(prev => prev.filter(t => t.id !== techId));
  };

  return { technicians, loading, updateStatus, addTechnician, updateTechnician, deleteTechnician };
}

export function useTechnician(techId: string) {
  const [technician, setTechnician] = useState<Technician | null>(null);

  useEffect(() => {
    if (!techId) return;
    supabase.from('technicians').select('*').eq('id', techId).single()
      .then(({ data }) => setTechnician(data));
  }, [techId]);

  return { technician };
}
