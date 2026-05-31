export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PLATFORM_SPECS: Record<string, { name: string; format: string; maxChars: number }> = {
  tiktok:    { name: "TikTok",            format: "Сценарий ролика",     maxChars: 600 },
  instagram: { name: "Instagram Reels",   format: "Описание + хуки",     maxChars: 400 },
  youtube:   { name: "YouTube Shorts",    format: "Сценарий + описание", maxChars: 600 },
  telegram:  { name: "Telegram",          format: "Пост с хэштегами",    maxChars: 800 },
  vk:        { name: "VK Клипы",          format: "Пост для VK",         maxChars: 500 },
  rutube:    { name: "Rutube",            format: "Описание видео",      maxChars: 500 },
  email:     { name: "Email-рассылка",    format: "Письмо подписчикам",  maxChars: 600 },
  whatsapp:  { name: "WhatsApp/Telegram", format: "Сообщение для рассылки", maxChars: 300 },
};

export async function POST(req: NextRequest) {
  try {
    const { originalContent, platforms } = await req.json();

    if (!originalContent || !platforms?.length) {
      return NextResponse.json({ error: "Нет контента или платформ" }, { status: 400 });
    }

    const selectedPlatforms = platforms
      .filter((p: string) => PLATFORM_SPECS[p])
      .map((p: string) => PLATFORM_SPECS[p]);

    const prompt = `Ты — AI-копирайтер для ADONIS (франшиза брендирования одежды, партнёры зарабатывают 150-300К/мес).

Исходный контент:
"""
${originalContent}
"""

Адаптируй этот контент для ${selectedPlatforms.length} платформ. Верни ТОЛЬКО валидный JSON:

{
  "variations": [
    ${selectedPlatforms.map((p: {name: string; format: string; maxChars: number}, i: number) => `{
      "platform": "${p.name}",
      "format": "${p.format}",
      "content": "АДАПТИРОВАННЫЙ КОНТЕНТ ДЛЯ ${p.name.toUpperCase()} (макс ${p.maxChars} симв, в формате ${p.format})"
    }`).join(",\n    ")}
  ]
}

Требования для каждой платформы:
- TikTok: короткий хук 3-5 сек + сценарий + хэштеги
- Instagram Reels: эмоциональный текст + 5-7 хэштегов + CTA
- YouTube Shorts: заголовок + тайм-коды + описание
- Telegram: развёрнутый пост с форматированием и эмодзи
- VK: дружелюбный тон + призыв к действию
- Email: тема письма + текст + подпись
- WhatsApp: короткое личное сообщение

Сохраняй суть и цифры из исходника. Отвечай ТОЛЬКО JSON.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Некорректный ответ от Claude");

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Repurpose error:", err);
    return NextResponse.json({ error: err.message || "Ошибка" }, { status: 500 });
  }
}
