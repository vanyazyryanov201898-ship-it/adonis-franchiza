export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { niche, platforms, frequency } = await req.json();

    const platformList = (platforms || ["TikTok", "Instagram", "Telegram"]).join(", ");
    const postsPerWeek = frequency || 5;

    const prompt = `Создай 30-дневный контент-план для ADONIS (франшиза брендирования одежды).
Ниша/тема акцента: ${niche || "продажа франшиз, уход из найма, бизнес с нуля"}
Платформы: ${platformList}
Постов в неделю: ${postsPerWeek}

Верни ТОЛЬКО валидный JSON без комментариев:
{
  "plan": [
    {
      "day": 1,
      "weekday": "Пн",
      "platform": "TikTok",
      "format": "Сценарий",
      "topic": "Тема поста",
      "hook": "Первые слова хука",
      "bestTime": "12:00",
      "viralScore": 91
    }
  ]
}

Требования:
- Строго ${postsPerWeek} постов в неделю (итого ~${postsPerWeek * 4} постов за 30 дней)
- Чередуй платформы: ${platformList}
- Чередуй форматы: Сценарий, Хук, Идеи, CTA, Кейс партнёра, Лайфхак
- Темы: уход из найма, реальные цифры, кейсы партнёров, как работает бизнес, возражения
- viralScore: реалистичный 78-97
- Дни без постов: day=-1 (не включай их, только дни с постами)

Верни ТОЛЬКО JSON.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Некорректный ответ");

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Content plan error:", err);
    return NextResponse.json({ error: err.message || "Ошибка" }, { status: 500 });
  }
}
