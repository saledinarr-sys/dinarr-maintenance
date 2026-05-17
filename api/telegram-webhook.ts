// Vercel Serverless Function — Telegram Bot Webhook
// Receives messages/commands from Telegram and replies with ticket data
//
// Setup (run once after deploy):
// https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://YOUR_APP.vercel.app/api/telegram-webhook

export const config = { runtime: 'edge' };

interface TelegramMessage {
  message_id: number;
  chat: { id: number };
  text?: string;
}
interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}
interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  where_loc: string;
  sla_hours: number;
  created_at: string;
}

const PRIORITY_EMOJI: Record<string, string> = {
  low: '🟢', mid: '🔵', high: '🟠', crit: '🔴',
};

async function replyToTelegram(botToken: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

async function fetchTickets(supabaseUrl: string, serviceKey: string, statusFilter?: string): Promise<Ticket[]> {
  let url = `${supabaseUrl}/rest/v1/tickets?select=id,title,status,priority,where_loc,sla_hours,created_at&order=created_at.desc`;
  if (statusFilter) {
    url += `&status=eq.${statusFilter}`;
  } else {
    url += `&status=neq.done`;
  }
  const res = await fetch(url, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!res.ok) return [];
  return res.json() as Promise<Ticket[]>;
}

function formatSummary(tickets: Ticket[]): string {
  const newT = tickets.filter(t => t.status === 'new');
  const progressT = tickets.filter(t => t.status === 'progress');

  if (tickets.length === 0) return '✅ ไม่มีงานค้างอยู่ในขณะนี้';

  let msg = `📊 <b>สรุปงานค้าง</b> (${tickets.length} รายการ)\n──────────────────\n`;
  msg += `🆕 รอดำเนินการ: <b>${newT.length}</b> งาน\n`;
  msg += `🔧 กำลังดำเนินการ: <b>${progressT.length}</b> งาน`;

  if (progressT.length > 0) {
    msg += `\n\n<b>🔧 กำลังดำเนินการ:</b>`;
    progressT.slice(0, 8).forEach(t => {
      msg += `\n• ${PRIORITY_EMOJI[t.priority] ?? ''} <b>${t.id}</b> · ${t.title}`;
    });
    if (progressT.length > 8) msg += `\n  ...อีก ${progressT.length - 8} งาน`;
  }

  if (newT.length > 0) {
    msg += `\n\n<b>🆕 รอดำเนินการ:</b>`;
    newT.slice(0, 8).forEach(t => {
      // SLA countdown
      const deadlineMs = new Date(t.created_at).getTime() + t.sla_hours * 3600000;
      const remaining = deadlineMs - Date.now();
      const slaText = remaining <= 0
        ? '⚠️ เกิน SLA'
        : remaining < 3600000
          ? `${Math.floor(remaining / 60000)} นาที`
          : `${Math.floor(remaining / 3600000)} ชม.`;
      msg += `\n• ${PRIORITY_EMOJI[t.priority] ?? ''} <b>${t.id}</b> · ${t.title} (${slaText})`;
    });
    if (newT.length > 8) msg += `\n  ...อีก ${newT.length - 8} งาน`;
  }

  return msg;
}

function helpMessage(): string {
  return `🤖 <b>Dinarr Bot — คำสั่งที่ใช้ได้</b>
──────────────────
/status — ดูงานค้างทั้งหมด (new + progress)
/new — ดูเฉพาะงานที่รอดำเนินการ
/progress — ดูเฉพาะงานที่กำลังซ่อม
/done — ดูงานที่เสร็จแล้ว (10 รายการล่าสุด)
/help — แสดงคำสั่งทั้งหมด`;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!botToken || !supabaseUrl || !serviceKey) {
    return new Response('Not configured', { status: 200 });
  }

  let update: TelegramUpdate;
  try {
    update = await req.json() as TelegramUpdate;
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const message = update.message;
  if (!message?.text) return new Response('OK', { status: 200 });

  const chatId = message.chat.id;
  const text = message.text.trim().toLowerCase().split('@')[0]; // strip @botname suffix

  if (text === '/start' || text === '/help') {
    await replyToTelegram(botToken, chatId, helpMessage());

  } else if (text === '/status' || text === '/งาน') {
    const tickets = await fetchTickets(supabaseUrl, serviceKey);
    await replyToTelegram(botToken, chatId, formatSummary(tickets));

  } else if (text === '/new' || text === '/ใหม่') {
    const tickets = await fetchTickets(supabaseUrl, serviceKey, 'new');
    const msg = tickets.length === 0
      ? '✅ ไม่มีงานรอดำเนินการ'
      : `🆕 <b>งานรอดำเนินการ</b> (${tickets.length} รายการ)\n──────────────────\n` +
        tickets.map(t => {
          const deadlineMs = new Date(t.created_at).getTime() + t.sla_hours * 3600000;
          const remaining = deadlineMs - Date.now();
          const slaText = remaining <= 0 ? '⚠️ เกิน SLA' : `${Math.floor(remaining / 3600000)} ชม.`;
          return `• ${PRIORITY_EMOJI[t.priority] ?? ''} <b>${t.id}</b> · ${t.title}\n  📍 ${t.where_loc} · ⏱️ ${slaText}`;
        }).join('\n');
    await replyToTelegram(botToken, chatId, msg);

  } else if (text === '/progress' || text === '/ซ่อม') {
    const tickets = await fetchTickets(supabaseUrl, serviceKey, 'progress');
    const msg = tickets.length === 0
      ? '✅ ไม่มีงานกำลังดำเนินการ'
      : `🔧 <b>งานกำลังดำเนินการ</b> (${tickets.length} รายการ)\n──────────────────\n` +
        tickets.map(t => `• ${PRIORITY_EMOJI[t.priority] ?? ''} <b>${t.id}</b> · ${t.title}\n  📍 ${t.where_loc}`).join('\n');
    await replyToTelegram(botToken, chatId, msg);

  } else if (text === '/done' || text === '/เสร็จ') {
    const tickets = await fetchTickets(supabaseUrl, serviceKey, 'done');
    const recent = tickets.slice(0, 10);
    const msg = recent.length === 0
      ? '📭 ยังไม่มีงานที่เสร็จแล้ว'
      : `✅ <b>งานที่เสร็จแล้ว</b> (10 รายการล่าสุด)\n──────────────────\n` +
        recent.map(t => {
          const date = new Date(t.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
          return `• ${PRIORITY_EMOJI[t.priority] ?? ''} <b>${t.id}</b> · ${t.title}\n  📍 ${t.where_loc} · 📅 ${date}`;
        }).join('\n');
    await replyToTelegram(botToken, chatId, msg);

  } else {
    await replyToTelegram(botToken, chatId,
      `ไม่เข้าใจคำสั่งนี้ครับ พิมพ์ /help เพื่อดูคำสั่งทั้งหมด`);
  }

  return new Response('OK', { status: 200 });
}
