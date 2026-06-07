export const dynamic = "force-dynamic";
export const maxDuration = 25;

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/google-client";
import { ADONIS_CONTEXT } from "@/lib/data/adonis-context";

export async function POST(req: NextRequest) {
  try {
    const { niche, platforms, frequency } = await req.json();

    const platformList = (platforms || ["TikTok", "Instagram", "Telegram"]).join(", ");
    const postsPerWeek = frequency || 5;

    const prompt = `Создай 30-дневный контент-план для АДОНИС. Каждый пост — шаг к заявке на франшизу.

${ADONIS_CONTEXT}

Акцент/ниша: ${niche || "продажа франшиз, уход из найма, бизнес с нуля через мерч"}
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
      "goal": "expert",
      "topic": "Тема поста — конкретная, не абстрактная",
      "hook": "Первые слова хука — цепляющие, остановят скролл",
      "bestTime": "12:00",
      "viralScore": 91
    }
  ]
}

Требования:
- Строго ${postsPerWeek} постов в неделю (итого ~${postsPerWeek * 4} постов за 30 дней)
- Чередуй платформы: ${platformList}
- Чередуй форматы: Сценарий, Хук, Пост, Карусель, Кейс партнёра, Лайфхак
- Распредели цели контента (поле goal): 35% — expert (экспертный), 25% — story (история), 20% — case (кейс партнёра), 10% — entertain (развлечение), 10% — sell (продающий)
- Добавь поле "goal" в каждый объект: "sell" | "expert" | "story" | "case" | "entertain"
- Темы разные по углу захода:
  • Кейсы партнёров с реальными цифрами (Кирьяк 16 млн, Сергей 10 млн, Христофор 6 млн)
  • Боли тех кто работает в найме
  • Развенчание мифов о бизнесе («нужен большой капитал», «нет опыта»)
  • День из жизни партнёра АДОНИС
  • Как работает производство в Казани
  • Сравнение: найм vs свой бизнес через АДОНИС
  • Ответы на частые возражения
  • За кулисами: как выглядит запуск за 14 дней
- viralScore: реалистичный 78-97
- hook: конкретная фраза, не описание темы — то что скажешь в первые 3 секунды

Верни ТОЛЬКО JSON.`;

    const raw = (await generateText(prompt, { maxTokens: 2500, model: "claude-haiku-4-5-20251001" })).trim() || "{}";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Некорректный ответ");
    let repaired = jsonMatch[0];
    repaired = repaired.replace(/\}(\s*)\{/g, "},$1{");
    repaired = repaired.replace(/\](\s*)\[/g, "],$1[");
    repaired = repaired.replace(/,(\s*[}\]])/g, "$1");

    const result = JSON.parse(repaired);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Content plan error:", err);
    return NextResponse.json({ error: err.message || "Ошибка" }, { status: 500 });
  }
}
