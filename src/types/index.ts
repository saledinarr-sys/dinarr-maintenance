export type TicketStatus = 'new' | 'progress' | 'done';
export type TicketPriority = 'low' | 'mid' | 'high' | 'crit';
export type TechStatus = 'free' | 'busy' | 'off';
export type CategoryId = 'electric' | 'plumb' | 'aircon' | 'medical' | 'it' | 'furn';
export type EventAction = 'open' | 'progress' | 'done' | 'rate';

export interface Category {
  id: CategoryId;
  name: string;
  icon_name: string;
  color_hex: string;
}

export interface Ticket {
  id: string;
  category_id: CategoryId;
  status: TicketStatus;
  priority: TicketPriority;
  title: string;
  where_loc: string;
  reporter_name: string;
  reporter_role: string;
  assigned_tech_id: string | null;
  created_at: string;
  sla_hours: number;
  description: string;
  photo_urls: string[];
  rating: number | null;
}

export interface TicketEvent {
  id: string;
  ticket_id: string;
  created_at: string;
  actor_name: string;
  action_type: EventAction;
  detail: string;
}

export interface Technician {
  id: string;
  name: string;
  team: CategoryId;
  role: string;
  phone: string;
  extension: string;
  status: TechStatus;
  active_jobs: number;
  completed_jobs: number;
  rating: number;
  avg_time_hours: number;
}

export interface Rating {
  id: string;
  ticket_id: string;
  score: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  comment: string;
  created_at: string;
}

export interface AppUser {
  role: 'staff' | 'tech' | 'admin';
  name: string;
  department?: string;
  tech_id?: string;
}

export const STATUS_LABEL: Record<TicketStatus, string> = {
  new: 'รอรับเรื่อง',
  progress: 'กำลังดำเนินการ',
  done: 'เสร็จสิ้น',
};

export const PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: 'ปกติ',
  mid: 'ด่วน',
  high: 'ด่วนมาก',
  crit: 'ฉุกเฉิน',
};

export const TECH_STATUS_LABEL: Record<TechStatus, string> = {
  free: 'พร้อมรับงาน',
  busy: 'กำลังทำงาน',
  off: 'ไม่พร้อม',
};

export const CATEGORY_LABEL: Record<CategoryId, string> = {
  electric: 'ไฟฟ้า',
  plumb: 'ประปา/สุขภัณฑ์',
  aircon: 'เครื่องปรับอากาศ',
  medical: 'เครื่องมือแพทย์',
  it: 'คอมพิวเตอร์/IT',
  furn: 'เฟอร์นิเจอร์/อาคาร',
};

export const CATEGORY_COLOR: Record<CategoryId, string> = {
  electric: '#E08A1E',
  plumb: '#2B7CE9',
  aircon: '#18A4A8',
  medical: '#DA3B4B',
  it: '#5B5BD6',
  furn: '#8A6E4B',
};
