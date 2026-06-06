export const dynamic = "force-dynamic";
export const maxDuration = 25;

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/google-client";

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
Этот профиль будет использоваться AI для генерации контента под продажу франшиз — важно точно уловить живой человеческий голос автора.

${samplesText}

Верни ТОЛЬКО валидный JSON:
{
  "tone": "Краткое описание тона (1 предложение) — как звучит этот человек",
  "vocabulary": "Уровень и стиль словаря — формальный/разговорный/профессиональный",
  "keyPhrases": ["характерная фраза 1", "фраза 2", "фраза 3", "фраза 4"],
  "emotionalTriggers": ["эмоциональный якорь 1", "якорь 2", "якорь 3"],
  "doUse": ["использовать обороты 1", "использовать 2", "использовать 3"],
  "avoid": ["избегать 1", "избегать 2"],
  "summary": "Инструкция для AI в 2-3 предложениях: как именно писать в этом голосе, какие слова использовать, какой ритм фраз, что категорически нельзя"
}

Отвечай ТОЛЬКО JSON, без пояснений.`;

    const raw = (await generateText(prompt, { maxTokens: 600 })).trim() || "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Некорректный ответ");

    const profile = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ profile });
  } catch (err: any) {
    console.error("Brand voice error:", err);
    return NextResponse.json({ error: err.message || "Ошибка" }, { status: 500 });
  }
}
