export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { samples } = await req.json();

    if (!samples || !samples.length) {
      return NextResponse.json({ error: "Нет примеров контента" }, { status: 400 });
    }

    const samplesText = samples
      .filter(Boolean)
      .map((s: string, i: number) => `Пример ${i + 1}:\n${s}`)
      .join("\n\n---\n\n");

    const prompt = `Ты — эксперт по бренд-коммуникациям. Проанализируй стиль этих постов и создай профиль голоса бренда.

${samplesText}

Верни ТОЛЬКО валидный JSON:
{
  "tone": "Краткое описание тона (1 предложение)",
  "vocabulary": "Уровень и стиль словаря",
  "keyPhrases": ["фраза 1", "фраза 2", "фраза 3", "фраза 4"],
  "emotionalTriggers": ["триггер 1", "триггер 2", "триггер 3"],
  "doUse": ["что использовать 1", "что использовать 2", "что использовать 3"],
  "avoid": ["чего избегать 1", "чего избегать 2"],
  "summary": "Инструкция для AI в 2-3 предложениях как писать в этом стиле"
}

Отвечай ТОЛЬКО JSON, без пояснений.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Некорректный ответ");

    const profile = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ profile });
  } catch (err: any) {
    console.error("Brand voice error:", err);
    return NextResponse.json({ error: err.message || "Ошибка" }, { status: 500 });
  }
}
