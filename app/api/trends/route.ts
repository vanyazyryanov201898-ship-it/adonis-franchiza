export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ADONIS_CONTEXT } from "@/lib/adonis-context";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { niche, categories } = await req.json();

    const nicheDesc = niche || "франшиза студии брендирования АДОНИС — печать на одежде, мерч, корпоративные заказы. Цель контента: лиды на франшизу";
    const cats = (categories as string[]) || ["Уход из найма", "Доходы бизнеса", "Кейсы партнёров", "Франчайзинг", "Мерч и брендинг"];

    const prompt = `Ты — эксперт по вирусному контенту для российских соцсетей (TikTok, Instagram, YouTube, Telegram).

${ADONIS_CONTEXT}

Ниша: ${nicheDesc}
Категории контента: ${cats.join(", ")}
Год: 2026

Сгенерируй 6 актуальных трендовых тем для короткого видео-контента. Каждая тема должна:
— Вирусно зайти на платформах (деньги, личный опыт, цифры, честность)
— Вести к заявке на франшизу АДОНИС через разный угол

Верни ТОЛЬКО валидный JSON (без markdown, без обёрток \`\`\`):
{
  "topics": [
    {
      "id": 1,
      "title": "Конкретный заголовок темы — с цифрой или вопросом",
      "viralScore": 94,
      "views": 3800000,
      "engagement": 7.9,
      "trend": "🔥 Горячий",
      "category": "Уход из найма",
      "growth": 187,
      "hooks": [
        "Первый хук — цепляющая незаконченная фраза...",
        "Второй хук — другой угол...",
        "Третий хук — ещё вариант..."
      ]
    }
  ]
}

Правила:
- viralScore: 82–97
- views: 800 000 – 5 000 000
- engagement: 4.5 – 9.5
- growth: 80 – 280
- trend: одно из "🔥 Горячий", "📈 Растёт", "⚡ Стабильный", "🚀 Взлёт"
- category: одна из предложенных категорий
- hooks: ровно 3 штуки, незаконченные (обрываются на "..."), с разными углами
- Темы разные по категориям, не повторяются по смыслу
- Все тексты на русском
- Хуки должны реально цеплять — личный опыт, цифры, провокация`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Claude не вернул JSON");

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.topics || !Array.isArray(parsed.topics)) throw new Error("Неверная структура ответа");

    return NextResponse.json({ topics: parsed.topics });
  } catch (err: any) {
    console.error("Trends API error:", err);
    return NextResponse.json({ error: err.message || "Ошибка генерации трендов" }, { status: 500 });
  }
}
