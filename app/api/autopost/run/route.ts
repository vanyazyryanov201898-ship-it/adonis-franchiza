export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/db/supabase";

const BOT_TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID     = process.env.TELEGRAM_CHAT_ID;
const CRON_SECRET = process.env.CRON_SECRET;
const TG_BASE     = "https://api.telegram.org/bot";

function stripMeta(text: string): string {
  return text
    .split("\n")
    .filter((l) => !/^⏰/.test(l) && !/📊\s*Прогноз/.test(l))
    .join("\n")
    .replace(/━+\s*$/, "")
    .trimEnd();
}

async function sendTelegram(chatId: string, text: string): Promise<void> {
  const MAX = 4096;
  let rest = stripMeta(text);
  const chunks: string[] = [];
  while (rest.length > MAX) {
    const cut = rest.lastIndexOf("\n", MAX);
    const at = cut > MAX / 2 ? cut : MAX;
    chunks.push(rest.slice(0, at));
    rest = rest.slice(at).trimStart();
  }
  if (rest) chunks.push(rest);

  for (const chunk of chunks) {
    const res = await fetch(`${TG_BASE}${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: chunk }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.description || `Telegram HTTP ${res.status}`);
    }
  }
}

export async function POST(req: NextRequest) {
  // Защита от посторонних вызовов
  if (CRON_SECRET) {
    const secret = req.headers.get("x-cron-secret");
    if (secret !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!BOT_TOKEN || !CHAT_ID) {
    return NextResponse.json({ error: "Telegram не настроен" }, { status: 500 });
  }

  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase не настроен" }, { status: 500 });
  }

  // Берём все посты, время которых уже наступило
  const { data: posts, error } = await supabase
    .from("scheduled_posts")
    .select("id, content, title")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!posts || posts.length === 0) {
    return NextResponse.json({ published: 0, message: "Нет постов для публикации" });
  }

  let published = 0;
  const failed: { id: string; error: string }[] = [];

  for (const post of posts) {
    const text = post.content || post.title;
    if (!text) {
      await supabase.from("scheduled_posts").update({ status: "failed" }).eq("id", post.id);
      continue;
    }

    try {
      await sendTelegram(CHAT_ID, text);
      await supabase
        .from("scheduled_posts")
        .update({ status: "published" })
        .eq("id", post.id);
      published++;
    } catch (err: any) {
      failed.push({ id: post.id, error: err.message });
      await supabase
        .from("scheduled_posts")
        .update({ status: "failed" })
        .eq("id", post.id);
    }
  }

  return NextResponse.json({ published, failed });
}

// Также разрешаем GET — для простой проверки через браузер/cron-job.org
export async function GET(req: NextRequest) {
  return POST(req);
}
