export const dynamic = "force-dynamic";
export const maxDuration = 25;

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/google-client";

// ─── Extract username/handle from URL ─────────────────────────
function extractUsername(url: string): string {
  return url
    .replace(/https?:\/\/(www\.)?/, "")
    .replace(/\?.*$/, "")
    .replace(/\/$/, "")
    .split("/")
    .pop()!
    .replace("@", "");
}

// ─── Try to get real data from the public page ─────────────────
async function fetchRealPageData(url: string, platform: string): Promise<{ info: string; isReal: boolean }> {
  const username = extractUsername(url);

  const headers = {
    "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
  };

  // ── Helper: parse meta tags ──
  const parseMeta = (html: string) => {
    const get = (patterns: RegExp[]) => {
      for (const re of patterns) {
        const m = html.match(re);
        if (m?.[1]) return m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim();
      }
      return "";
    };
    return {
      title: get([/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i, /<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i, /<title[^>]*>([^<]+)<\/title>/i]),
      desc: get([/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i, /<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i, /<meta[^>]+name="description"[^>]+content="([^"]+)"/i, /<meta[^>]+content="([^"]+)"[^>]+name="description"/i]),
    };
  };

  // ── Instagram ──
  if (platform === "Instagram" || url.includes("instagram.com")) {
    try {
      // Strategy 1: Instagram oEmbed (public, no auth)
      const oembed = await fetch(
        `https://api.instagram.com/oembed/?url=https://www.instagram.com/${username}/&maxwidth=400`,
        { headers: { "User-Agent": "curl/8.0" }, signal: AbortSignal.timeout(6000) }
      );
      if (oembed.ok) {
        const data = await oembed.json();
        if (data.author_name) {
          return { info: `Название: ${data.author_name} | Аккаунт: @${username} | Платформа: Instagram`, isReal: true };
        }
      }
    } catch {}

    try {
      // Strategy 2: Fetch profile page as Googlebot
      const res = await fetch(`https://www.instagram.com/${username}/`, {
        headers, signal: AbortSignal.timeout(8000),
      });
      const html = await res.text();
      const { title, desc } = parseMeta(html);
      // Instagram og:description often: "134K Followers, 891 Following, 312 Posts - See Instagram photos..."
      if (desc && (desc.includes("Followers") || desc.includes("Posts") || desc.includes("подписчик"))) {
        return { info: `${title} | ${desc}`, isReal: true };
      }
      if (title && !title.includes("Instagram")) {
        return { info: `Название: ${title} | ${desc}`, isReal: true };
      }
    } catch {}

    return { info: `Аккаунт Instagram: @${username}`, isReal: false };
  }

  // ── TikTok ──
  if (platform === "TikTok" || url.includes("tiktok.com")) {
    try {
      const res = await fetch(`https://www.tiktok.com/@${username}`, {
        headers: { ...headers, "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" },
        signal: AbortSignal.timeout(8000),
      });
      const html = await res.text();
      const { title, desc } = parseMeta(html);
      // TikTok og:description: "12.8M Likes. 583.9K Followers. Watch the latest..."
      if (desc && (desc.includes("Followers") || desc.includes("Likes"))) {
        return { info: `${title} | ${desc}`, isReal: true };
      }
    } catch {}
    return { info: `Аккаунт TikTok: @${username}`, isReal: false };
  }

  // ── Telegram ──
  if (platform === "Telegram" || url.includes("t.me")) {
    try {
      const res = await fetch(`https://t.me/${username}`, {
        headers, signal: AbortSignal.timeout(8000),
      });
      const html = await res.text();
      const { title, desc } = parseMeta(html);
      // Telegram page shows member count in class "tgme_page_extra"
      const membersMatch = html.match(/(\d[\d\s]+)\s*(?:members?|подписчик|subscriber)/i);
      const members = membersMatch ? `Подписчиков: ${membersMatch[1].trim()}` : "";
      if (title || desc || members) {
        return { info: [title, desc, members].filter(Boolean).join(" | "), isReal: true };
      }
    } catch {}
    return { info: `Telegram-канал: @${username}`, isReal: false };
  }

  return { info: `Профиль: @${username}`, isReal: false };
}

// ─── Main handler ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { url, platform } = await req.json();
    if (!url) return NextResponse.json({ error: "URL не указан" }, { status: 400 });

    const username = extractUsername(url);
    const { info: realInfo, isReal } = await fetchRealPageData(url, platform || "Instagram");

    // Build next-14-days dates
    const dayNames = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];
    const months = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
    const today = new Date();
    const dates14 = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i + 1);
      return `{"day":"${dayNames[d.getDay()]}","date":"${d.getDate()} ${months[d.getMonth()]}"}`;
    }).join(",");

    const dataBlock = isReal
      ? `РЕАЛЬНЫЕ ДАННЫЕ СО СТРАНИЦЫ (используй эти цифры точно — они настоящие):\n${realInfo}`
      : `ДАННЫЕ: Страница недоступна для парсинга. Оцени метрики реалистично для аккаунта @${username} в нише мерч/франшиза/бизнес.\nURL: ${url}`;

    const prompt = `Ты — AI-аналитик соцсетей для компании ADONIS (мерч-производство, франшиза).

${dataBlock}

Верни ТОЛЬКО валидный JSON (без markdown) этой структуры:

{
  "channel": {
    "name": "реальное название из данных выше",
    "username": "@${username}",
    "platform": "${platform || "Instagram"}",
    "followers": ЧИСЛО (точно из данных выше; если нет — реалистичная оценка без круглых чисел),
    "avgViews": ЧИСЛО (обычно 3-12% от followers для Reels/TikTok; для Telegram — 15-30%),
    "totalPosts": ЧИСЛО (из данных или реалистичная оценка),
    "er": ЧИСЛО (вовлечённость % с одним знаком после запятой, 2.0-12.0),
    "category": "точная ниша",
    "postingFreq": "X пост(а)/день",
    "avgDuration": "XX сек"
  },
  "score": ЧИСЛО 50-85,
  "strengths": ["конкретная сильная сторона 1","сильная сторона 2","сильная сторона 3"],
  "weaknesses": ["слабость 1 — шанс для ADONIS","слабость 2","слабость 3","слабость 4"],
  "contentTypes": [
    {"type":"тип 1","share":40,"trend":"↑ Растёт","color":"#8b5cf6"},
    {"type":"тип 2","share":28,"trend":"→ Стабильно","color":"#10b981"},
    {"type":"тип 3","share":20,"trend":"↑ Растёт","color":"#3b82f6"},
    {"type":"тип 4","share":12,"trend":"↓ Снижается","color":"#f59e0b"}
  ],
  "contentPlan": [${dates14.replace(/"}/g, '","title":"тема ролика ADONIS против этого конкурента","format":"video","viralScore":88,"platform":"${platform || "Instagram"}"}')}]
}

ПРАВИЛА:
- contentTypes.share в сумме = 100
- contentPlan: ровно 14 объектов с датами выше, темы конкретные и заточены под обыгрывание этого конкурента
- viralScore 75-97
- format: "video" или "post"
- Всё на русском`;

    const raw = await generateText(prompt, { maxTokens: 3000 });
    const jsonStr = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(jsonStr);
    data._sourceHint = isReal ? realInfo.slice(0, 300) : "";
    data._isRealData = isReal;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: err.message || "Ошибка анализа" }, { status: 500 });
  }
}
