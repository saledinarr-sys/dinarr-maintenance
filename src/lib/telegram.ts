import { getSettings } from '../hooks/useSettings';
import type { Ticket } from '../types';
import { CATEGORY_LABEL, PRIORITY_LABEL } from '../types';

const PRIORITY_EMOJI: Record<string, string> = {
  low: '🟢', mid: '🔵', high: '🟠', crit: '🔴',
};
const STATUS_EMOJI: Record<string, string> = {
  new: '🆕', progress: '🔧', done: '✅',
};
const STATUS_LABEL: Record<string, string> = {
  new: 'รับเรื่องแล้ว', progress: 'กำลังดำเนินการ', done: 'เสร็จสิ้น',
};

function getAppUrl(): string {
  const url = import.meta.env.VITE_APP_URL as string | undefined;
  if (url) return url;
  return typeof window !== 'undefined' ? window.location.origin : '';
}

export async function sendTelegramMessage(text: string): Promise<void> {
  const { telegramEnabled, telegramBotToken, telegramChatId } = getSettings();
  if (!telegramEnabled || !telegramBotToken || !telegramChatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });
  } catch {
    // silent fail — notifications are non-critical
  }
}

export function buildTicketOpenMsg(ticket: Ticket): string {
  const appUrl = getAppUrl();
  const catLabel = CATEGORY_LABEL[ticket.category_id] ?? ticket.category_id;
  const prioLabel = PRIORITY_LABEL[ticket.priority] ?? ticket.priority;
  const prioEmoji = PRIORITY_EMOJI[ticket.priority] ?? '';
  const link = appUrl ? `\n──────────────────\n<a href="${appUrl}/staff/ticket/${ticket.id}">ดูรายละเอียด →</a>` : '';
  return `🆕 <b>งานแจ้งซ่อมใหม่</b>
──────────────────
📋 <b>${ticket.id}</b> · ${ticket.title}
📍 ${ticket.where_loc}
🏷️ ${catLabel} · ${prioEmoji} ${prioLabel}
👤 ${ticket.reporter_name}
⏱️ SLA: ${ticket.sla_hours} ชั่วโมง${link}`;
}

export function buildStatusUpdateMsg(ticket: Ticket, actorName: string, detail?: string): string {
  const appUrl = getAppUrl();
  const emoji = STATUS_EMOJI[ticket.status] ?? '🔄';
  const statusTh = STATUS_LABEL[ticket.status] ?? ticket.status;
  const detailLine = detail ? `\n💬 ${detail}` : '';
  const link = appUrl ? `\n──────────────────\n<a href="${appUrl}/staff/ticket/${ticket.id}">ดูรายละเอียด →</a>` : '';
  return `${emoji} <b>อัปเดตสถานะ: ${statusTh}</b>
──────────────────
📋 <b>${ticket.id}</b> · ${ticket.title}
👤 โดย: ${actorName}${detailLine}${link}`;
}

export function buildRatingMsg(ticket: Ticket, score: number, comment: string): string {
  const stars = '⭐'.repeat(score) + '☆'.repeat(5 - score);
  const commentLine = comment.trim() ? `\n💬 "${comment.trim()}"` : '';
  return `⭐ <b>ประเมินผลการซ่อม</b>
──────────────────
📋 <b>${ticket.id}</b> · ${ticket.title}
${stars} (${score}/5)${commentLine}`;
}

export function buildPendingSummaryMsg(tickets: Ticket[]): string {
  const newTickets = tickets.filter(t => t.status === 'new');
  const progressTickets = tickets.filter(t => t.status === 'progress');
  const dateStr = new Date().toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  let msg = `📊 <b>สรุปงานค้าง</b>
${dateStr}
──────────────────
🆕 รอดำเนินการ: <b>${newTickets.length}</b> งาน
🔧 กำลังดำเนินการ: <b>${progressTickets.length}</b> งาน`;

  if (progressTickets.length > 0) {
    msg += `\n\n<b>กำลังดำเนินการ:</b>`;
    progressTickets.slice(0, 6).forEach(t => {
      const prioEmoji = PRIORITY_EMOJI[t.priority] ?? '';
      msg += `\n• ${prioEmoji} ${t.id} · ${t.title}`;
    });
    if (progressTickets.length > 6) msg += `\n...และอีก ${progressTickets.length - 6} งาน`;
  }

  if (newTickets.length > 0) {
    msg += `\n\n<b>รอดำเนินการ:</b>`;
    newTickets.slice(0, 6).forEach(t => {
      const prioEmoji = PRIORITY_EMOJI[t.priority] ?? '';
      msg += `\n• ${prioEmoji} ${t.id} · ${t.title}`;
    });
    if (newTickets.length > 6) msg += `\n...และอีก ${newTickets.length - 6} งาน`;
  }

  if (newTickets.length === 0 && progressTickets.length === 0) {
    msg += `\n\n✅ ไม่มีงานค้างอยู่`;
  }

  return msg;
}
