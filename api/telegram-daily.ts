// Vercel Edge Function — Daily Telegram Summary
// Schedule: 01:00 UTC = 08:00 น. (Thailand time) — configured in vercel.json
// Required env vars: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET

export const config = { runtime: 'edge' };

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  where_loc: string;
}

const PRIORITY_EMOJI: Record<string, string> = {
  low: '🟢', mid: '🔵', high: '🟠', crit: '🔴',
};

function buildDailySummary(tickets: Ticket[]): string {
  const newT = tickets.filter(t => t.status === 'new');
  const progressT = tickets.filter(t => t.status === 'progress');

  const dateStr = new Date().toLocaleDateString('th-TH', {
    timeZone: 'Asia/Bangkok',
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  let msg = `📊 <b>สรุปงานประจำวัน</b>\n${dateStr}\n──────────────────\n`;
  msg += `🆕 รอดำเนินการ: <b>${newT.length}</b> งาน\n`;
  msg += `🔧 กำลังดำเนินการ: <b>${progressT.length}</b> งาน`;

  if (progressT.length > 0) {
    msg += `\n\n<b>กำลังดำเนินการ:</b>`;
    progressT.slice(0, 8).forEach(t => {
      msg += `\n• ${PRIORITY_EMOJI[t.priority] ?? ''} ${t.id} · ${t.title}`;
    });
    if (progressT.length > 8) msg += `\n...และอีก ${progressT.length - 8} งาน`;
  }

  if (newT.length > 0) {
    msg += `\n\n<b>รอดำเนินการ:</b>`;
    newT.slice(0, 8).forEach(t => {
      msg += `\n• ${PRIORITY_EMOJI[t.priority] ?? ''} ${t.id} · ${t.title}`;
    });
    if (newT.length > 8) msg += `\n...และอีก ${newT.length - 8} งาน`;
  }

  if (newT.length === 0 && progressT.length === 0) {
    msg += `\n\n✅ ไม่มีงานค้างอยู่`;
  }

  return msg;
}

export default async function handler(req: Request): Promise<Response> {
  // Security: verify cron secret to prevent unauthorized calls
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    const secret = authHeader?.replace('Bearer ', '') ?? req.headers.get('x-cron-secret');
    if (secret !== cronSecret) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!botToken || !chatId) {
    return new Response('Telegram credentials not configured', { status: 200 });
  }
  if (!supabaseUrl || !serviceKey) {
    return new Response('Supabase credentials not configured', { status: 200 });
  }

  // Query Supabase for pending tickets
  const res = await fetch(
    `${supabaseUrl}/rest/v1/tickets?status=neq.done&select=id,title,status,priority,where_loc&order=created_at.desc`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!res.ok) {
    return new Response('Failed to fetch tickets', { status: 500 });
  }

  const tickets: Ticket[] = await res.json() as Ticket[];
  const message = buildDailySummary(tickets);

  // Send to Telegram
  const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    }),
  });

  const tgData = await tgRes.json() as { ok: boolean };
  return new Response(JSON.stringify({ ok: tgData.ok, pending: tickets.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
