export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEFAULT_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TG_BASE = "https://api.telegram.org/bot";

type CarouselData = {
  cover: string;
  subtitle: string;
  slides: { n: number; heading: string; text: string }[];
  hashtags: string;
  caption: string;
};

function formatCarousel(d: CarouselData): string {
  const lines: string[] = [
    `📊 ${d.cover}`,
    d.subtitle || "",
    "",
    "━━━━━━━━━━━━━━━━━",
    "",
    ...d.slides.flatMap((s) => [`📌 Слайд ${s.n}: ${s.heading}`, s.text, ""]),
    "━━━━━━━━━━━━━━━━━",
    "",
    ...(d.caption ? [d.caption, ""] : []),
    ...(d.hashtags ? [d.hashtags] : []),
  ];
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function stripPublishingMeta(text: string): string {
  const lines = text.split("\n");
  const filtered = lines.filter(
    (l) => !/^⏰/.test(l) && !/📊\s*(Прогноз|Viral Score)/.test(l)
  );
  // remove trailing separator lines left after stripping
  while (filtered.length && /^━+$/.test(filtered[filtered.length - 1].trim())) {
    filtered.pop();
  }
  return filtered.join("\n").trimEnd();
}

async function tgSend(chatId: string, text: string): Promise<void> {
  const MAX = 4096;
  const chunks: string[] = [];
  let rest = text;
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
  if (!BOT_TOKEN) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN не задан в .env.local" },
      { status: 500 }
    );
  }

  const body = await req.json() as {
    type: "post" | "carousel";
    content?: string;
    data?: CarouselData;
    chatId?: string;
  };

  const chatId = body.chatId || DEFAULT_CHAT_ID;
  if (!chatId) {
    return NextResponse.json(
      { error: "TELEGRAM_CHAT_ID не задан в .env.local" },
      { status: 500 }
    );
  }

  let text: string;
  if (body.type === "post") {
    text = body.content ?? "";
  } else if (body.type === "carousel" && body.data) {
    text = formatCarousel(body.data);
  } else {
    return NextResponse.json({ error: "Неверный payload" }, { status: 400 });
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "Пустой контент" }, { status: 400 });
  }

  try {
    await tgSend(chatId, stripPublishingMeta(text));
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
