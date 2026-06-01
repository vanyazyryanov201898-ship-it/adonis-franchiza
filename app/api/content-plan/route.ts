export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ADONIS_CONTEXT } from "@/lib/adonis-context";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
- Чередуй форматы: Сценарий, Хук, Пост, Карусель, Кейс партнёра, Возражение, Лайфхак
- Темы должны вести к заявке через разные углы:
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
