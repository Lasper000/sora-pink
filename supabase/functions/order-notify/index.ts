// Supabase Edge Function: Server-side Order Notification (Telegram / Webhook)
// Deploy with: supabase functions deploy order-notify
// Secrets required:
//   supabase secrets set TELEGRAM_BOT_TOKEN=xxx TELEGRAM_CHAT_ID=xxx ORDER_WEBHOOK_URL=xxx
// Connect in Supabase Dashboard -> Database -> Webhooks -> Table: public.orders -> Event: INSERT

// @ts-nocheck — Deno Edge Runtime template
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200 });
  }

  try {
    const payload = await req.json();
    const record = payload.record || payload;
    if (!record || !record.id) {
      return new Response(JSON.stringify({ error: 'Invalid order payload' }), { status: 400 });
    }

    const shipping = record.shipping_address || {};
    const msg =
      `🛍️ [ออเดอร์ใหม่ SORA PINK]\n` +
      `━━━━━━━━━━━━━━━\n` +
      `📦 เลขออเดอร์: ${record.id}\n` +
      `👤 ลูกค้า: ${shipping.fullName || '-'} (${shipping.phone || '-'})\n` +
      `💳 ช่องทางชำระ: ${String(record.payment_method || '').toUpperCase()}${record.slip_url ? ' (แนบสลิปแล้ว ✅)' : ''}\n` +
      `💰 ยอดสุทธิ: ฿${Number(record.total_amount || 0).toLocaleString()}\n` +
      `📍 ที่อยู่: ${shipping.address || ''} จ.${shipping.province || ''} ${shipping.postalCode || ''}\n` +
      `━━━━━━━━━━━━━━━\n` +
      `⏳ สถานะ: รอแอดมินตรวจสอบและยืนยัน`;

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
    const webhookUrl = Deno.env.get('ORDER_WEBHOOK_URL');

    const tasks: Promise<Response>[] = [];

    if (botToken && chatId) {
      tasks.push(
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: msg }),
        })
      );
    }

    if (webhookUrl) {
      tasks.push(
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: msg,
            text: msg,
            order_id: record.id,
            total_amount: record.total_amount,
          }),
        })
      );
    }

    await Promise.allSettled(tasks);
    return new Response(JSON.stringify({ ok: true, notified: tasks.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
