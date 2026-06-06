export const dynamic = "force-dynamic";
export const maxDuration = 25;

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/google-client";
import { ADONIS_CONTEXT } from "@/lib/data/adonis-context";

const PLATFORM_SPECS: Record<string, { name: string; format: string; maxChars: number }> = {
  tiktok:    { name: "TikTok",            format: "Сценарий ролика",        maxChars: 600 },
  instagram: { name: "Instagram Reels",   format: "Описание + хуки",        maxChars: 400 },
  youtube:   { name: "YouTube Shorts",    format: "Сценарий + описание",    maxChars: 600 },
  telegram:  { name: "Telegram",          format: "Пост с хэштегами",       maxChars: 800 },
  vk:        { name: "VK Клипы",          format: "Пост для VK",            maxChars: 500 },
  rutube:    { name: "Rutube",            format: "Описание видео",         maxChars: 500 },
  email:     { name: "Email-рассылка",    format: "Письмо подписчикам",     maxChars: 600 },
  whatsapp:  { name: "WhatsApp/Telegram", format: "Личное сообщение",       maxChars: 300 },
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

    const prompt = `Ты — контент-стратег АДОНИС. Адаптируешь контент под разные платформы с одной целью: привести лиды на франшизу.

${ADONIS_CONTEXT}

Исходный контент:
"""
${originalContent}
"""

Адаптируй для ${selectedPlatforms.length} платформ. Сохраняй суть, цифры и голос бренда.
Каждая адаптация должна быть нативной для платформы — не просто укороченная копия.

Верни ТОЛЬКО валидный JSON:

{
  "variations": [
    ${selectedPlatforms.map((p: {name: string; format: string; maxChars: number}) => `{
      "platform": "${p.name}",
      "format": "${p.format}",
      "content": "АДАПТИРОВАННЫЙ КОНТЕНТ ДЛЯ ${p.name.toUpperCase()} (макс ${p.maxChars} симв)"
    }`).join(",\n    ")}
  ]
}

Требования по платформам:
- TikTok: короткий цепляющий хук 3-5 сек + сценарий + хэштеги. Динамично, без воды.
- Instagram Reels: эмоциональный текст + сильные хуки + 5-7 хэштегов + CTA в директ.
- YouTube Shorts: заголовок + структура + описание с ключевыми словами.
- Telegram: развёрнутый пост в стиле Ильи — личный, с цифрами, эмодзи по делу.
- VK: дружелюбный тон, призыв к действию, хэштеги.
- Email: тема письма (до 50 симв) + текст + подпись + CTA.
- WhatsApp: короткое личное сообщение как от человека, не рассылка.

Отвечай ТОЛЬКО JSON.`;

    const raw = (await generateText(prompt, { maxTokens: 1200, model: "claude-haiku-4-5-20251001" })).trim() || "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Некорректный ответ от Claude");

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Repurpose error:", err);
    return NextResponse.json({ error: err.message || "Ошибка" }, { status: 500 });
  }
}
