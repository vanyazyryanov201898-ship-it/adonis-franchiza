export const dynamic = "force-dynamic";
export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const VISUAL_TYPE_DESC: Record<string, string> = {
  charts:   "графики и диаграммы (столбчатые, круговые, линейные), статистика с процентами",
  timeline: "хронологическая лента событий — каждый кадр это период/год/событие",
  table:    "сравнительная таблица — чёткие колонки, плюсы/минусы, характеристики",
  toplist:  "топ-список с ранжированием — каждый элемент с цифрой, фактом и иконкой",
};

const CATEGORY_CONTEXT: Record<string, string> = {
  market:     "Тема из области рыночной аналитики. Используй реальные или реалистичные рыночные данные, тренды, объёмы рынка, прогнозы. Цифры делай правдоподобными для российского рынка.",
  history:    "Тема историческая или хронологическая. Строй повествование по временной линии — ключевые события, даты, переломные моменты. Делай увлекательно как документальный фильм.",
  comparison: "Тема сравнительная. Давай чёткие, честные сравнения с конкретными критериями. Без воды — только факты и цифры для каждой стороны.",
  process:    "Тема про процесс или механизм. Показывай шаги последовательно, каждый с конкретным действием и результатом. Максимально практично.",
};

export async function POST(req: NextRequest) {
  const { topic, category, visualType } = await req.json();

  if (!topic) return NextResponse.json({ error: "topic required" }, { status: 400 });

  const visualDesc = VISUAL_TYPE_DESC[visualType] || VISUAL_TYPE_DESC.charts;
  const categoryCtx = CATEGORY_CONTEXT[category] || CATEGORY_CONTEXT.market;

  const prompt = `Ты — дата-журналист и визуальный сторителлер. Создаёшь сценарий инфографики для короткого видео (30-60 сек).

Тема: «${topic}»
Визуальный формат: ${visualDesc}
${categoryCtx}

Верни ТОЛЬКО валидный JSON без пояснений:

{
  "title": "Цепляющий заголовок инфографики — максимум 7 слов",
  "subtitle": "Одна строка — уточнение или интригующий факт",
  "visual_type": "${visualType}",
  "frames": [
    {
      "n": 1,
      "type": "cover",
      "heading": "Заголовок обложки — провокация или факт",
      "stat": "Ключевая цифра или дата для обложки",
      "text": "1-2 предложения — зачем смотреть дальше",
      "visual_note": "Описание для дизайнера: что рисовать, какие цвета, стиль"
    },
    {
      "n": 2,
      "type": "data",
      "heading": "Заголовок кадра",
      "stat": "Главная цифра/факт этого кадра",
      "text": "2-3 предложения с контекстом",
      "visual_note": "Тип графика/визуала и что показывает"
    },
    {
      "n": 3,
      "type": "data",
      "heading": "Заголовок кадра",
      "stat": "Цифра/факт",
      "text": "2-3 предложения",
      "visual_note": "Описание визуала"
    },
    {
      "n": 4,
      "type": "data",
      "heading": "Заголовок кадра",
      "stat": "Цифра/факт",
      "text": "2-3 предложения",
      "visual_note": "Описание визуала"
    },
    {
      "n": 5,
      "type": "data",
      "heading": "Заголовок кадра",
      "stat": "Цифра/факт",
      "text": "2-3 предложения",
      "visual_note": "Описание визуала"
    },
    {
      "n": 6,
      "type": "insight",
      "heading": "Главный вывод",
      "stat": "Итоговая цифра или вывод одним числом",
      "text": "2-3 предложения — почему это важно для предпринимателя",
      "visual_note": "Финальный мощный визуал"
    },
    {
      "n": 7,
      "type": "cta",
      "heading": "Что делать с этим знанием",
      "stat": null,
      "text": "Мягкий призыв — сохрани, поделись, или лёгкое упоминание АДОНИС если тема релевантна",
      "visual_note": "Логотип АДОНИС или просто брендовый фон"
    }
  ],
  "hashtags": "#инфографика #бизнес #мерч #предпринимательство [ещё 5-7 по теме]",
  "caption": "2 живых предложения для подписи под видео — зацепить и объяснить зачем смотреть",
  "music_suggestion": "Темп и настроение фоновой музыки для этой инфографики"
}

Правила:
- Цифры должны быть правдоподобными для 2024-2026 года
- Каждый кадр читается за 5-7 секунд
- visual_note — конкретное описание для дизайнера/видеоредактора
- АДОНИС упоминается только в кадре 7 и только если тема про мерч/франшизу/производство
- Только JSON, без markdown и пояснений`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (message.content[0] as any).text as string;

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Не удалось распарсить JSON" }, { status: 500 });
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Infographic API error:", err);
    return NextResponse.json({ error: err.message || "Ошибка генерации" }, { status: 500 });
  }
}
