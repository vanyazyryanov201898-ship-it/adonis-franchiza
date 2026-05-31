export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { niche, categories } = await req.json();

    const nicheDesc = niche || "франшиза студии брендирования ADONIS — печать на одежде, создание брендов, Wildberries, корпоративные заказы. Выручка 450К–1М руб/мес, окупаемость 3–5 мес, работа из дома или студии";
    const cats = (categories as string[]) || ["Уход из найма", "Доходы бизнеса", "Франчайзинг", "Открытие бизнеса", "Мерч"];

    const prompt = `Ты — эксперт по вирусному контенту для российских соцсетей (TikTok, Instagram, YouTube).

Ниша клиента: ${nicheDesc}
Категории контента: ${cats.join(", ")}
Текущий год: 2026

Сгенерируй 6 актуальных трендовых тем для короткого видео-контента в этой нише.
Темы должны быть реально виральными — про деньги, личный опыт, цифры, уход из найма, открытие бизнеса.

Верни ТОЛЬКО валидный JSON (без markdown, без обёрток \`\`\`), строго по этой схеме:
{
  "topics": [
    {
      "id": 1,
      "title": "Заголовок темы",
      "viralScore": 94,
      "views": 3800000,
      "engagement": 7.9,
      "trend": "🔥 Горячий",
      "category": "Уход из найма",
      "growth": 187,
      "hooks": [
        "Первый хук для этой темы...",
        "Второй хук...",
        "Третий хук..."
      ]
    }
  ]
}

Правила:
- viralScore от 82 до 97
- views от 800000 до 5000000
- engagement от 4.5 до 9.5
- growth от 80 до 280
- trend: одно из "🔥 Горячий", "📈 Растёт", "⚡ Стабильный", "🚀 Взлёт"
- category: одна из предложенных категорий
- hooks: ровно 3 штуки, цепляющие первые фразы для видео, незаконченные (обрывающиеся на "...")
- Все тексты на русском языке
- Темы должны быть разными по категориям`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";

    // Извлекаем JSON если Claude обернул в markdown
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
