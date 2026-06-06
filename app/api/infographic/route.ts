export const dynamic = "force-dynamic";
export const maxDuration = 25;

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/google-client";

type TrendContext = {
  title: string;
  viralScore: number;
  growth: number;
  hooks: string[];
  category: string;
};

export async function POST(req: NextRequest) {
  const { topic, category, visualType, trendContext } = await req.json() as {
    topic: string;
    category?: string;
    visualType?: string;
    trendContext?: TrendContext;
  };

  if (!topic) return NextResponse.json({ error: "topic required" }, { status: 400 });

  const trendNote = trendContext
    ? `\n\nАКТУАЛЬНЫЙ ТРЕНД ДЛЯ ПРИВЯЗКИ:\nТема: «${trendContext.title}» · Балл: ${trendContext.viralScore}/100 · Рост: +${trendContext.growth}%\nХуки: ${trendContext.hooks.slice(0, 2).join(" / ")}\nИспользуй цифры тренда и его подачу в данных.`
    : "";

  const prompt = `Создай детальный сценарий для видео-инфографики (30-45 сек) на тему: «${topic}».
Формат визуала: ${visualType || "charts"}. Тип контента: ${category || "market"}.${trendNote}

Верни ТОЛЬКО валидный JSON без markdown:
{
  "title": "заголовок до 7 слов — цепляющий",
  "subtitle": "одна строка уточнения или интриги",
  "visual_type": "${visualType || "charts"}",
  "frames": [
    {
      "n": 1,
      "type": "cover",
      "heading": "...",
      "stat": "главная цифра или дата",
      "text": "2-3 предложения — интрига, заставляет смотреть дальше",
      "visual_note": "детальное описание: цвет фона (#hex), главный элемент, расположение текста",
      "animation_note": "zoom in from center, text appears letter by letter",
      "voice_over": "текст для озвучки этого кадра — разговорный стиль"
    },
    {
      "n": 2,
      "type": "data",
      "heading": "...",
      "stat": "цифра с единицей измерения",
      "text": "2 предложения — контекст цифры, почему это важно",
      "visual_note": "тип графика/диаграммы, цветовая схема, акцент на главном числе",
      "animation_note": "bar chart grows from left to right, number counts up",
      "voice_over": "..."
    },
    {
      "n": 3,
      "type": "data",
      "heading": "...",
      "stat": "...",
      "text": "...",
      "visual_note": "...",
      "animation_note": "slide in from right, icon bounces",
      "voice_over": "..."
    },
    {
      "n": 4,
      "type": "data",
      "heading": "...",
      "stat": "...",
      "text": "...",
      "visual_note": "...",
      "animation_note": "...",
      "voice_over": "..."
    },
    {
      "n": 5,
      "type": "process",
      "heading": "Как это работает",
      "stat": null,
      "text": "2-3 шага или этапа процесса — кратко",
      "visual_note": "три иконки с стрелками, горизонтальный флоу",
      "animation_note": "each step appears with a delay of 0.5s",
      "voice_over": "..."
    },
    {
      "n": 6,
      "type": "insight",
      "heading": "Главный вывод",
      "stat": "итоговая или сравнительная цифра",
      "text": "2 предложения — ключевой инсайт, который удивит зрителя",
      "visual_note": "яркий акцентный цвет, крупный текст, минимум элементов",
      "animation_note": "scale up from 0, glow effect on stat",
      "voice_over": "..."
    },
    {
      "n": 7,
      "type": "insight",
      "heading": "Что это значит для тебя",
      "stat": null,
      "text": "персональная релевантность — как этот тренд влияет на конкретного зрителя",
      "visual_note": "человек / иконка персонажа, тёплые цвета",
      "animation_note": "fade in with slight upward motion",
      "voice_over": "..."
    },
    {
      "n": 8,
      "type": "cta",
      "heading": "Что делать прямо сейчас",
      "stat": null,
      "text": "конкретный призыв — сохрани, поделись, напиши нам",
      "visual_note": "логотип АДОНИС, контактный элемент, тёмный фон",
      "animation_note": "logo pulse, arrow points to DM button",
      "voice_over": "Сохраняй, чтобы не потерять. Если хочешь узнать больше — пиши нам."
    }
  ],
  "hashtags": "#инфографика #бизнес #мерч #франшиза и ещё 8-10 по теме",
  "caption": "2-3 живых предложения для подписи — от первого лица, с вопросом к аудитории",
  "music_suggestion": "темп BPM примерно, настроение, жанр",
  "total_duration": "35 сек",
  "voice_style": "уверенный мужской голос, разговорный темп, паузы между кадрами 0.3 сек"
}

Требования:
- Все цифры реальные и конкретные (не 'X миллионов', а '16 млн руб')
- voice_over каждого кадра — разговорный, не рекламный, как будто объясняет другу
- animation_note — конкретные технические инструкции для After Effects / motion designer
- visual_note — точное описание с hex-цветами и расположением элементов`;

  try {
    const raw = await generateText(prompt, { maxTokens: 8000 });
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json({ error: "Не удалось распарсить JSON от модели" }, { status: 500 });
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Infographic API error:", err);
    return NextResponse.json({ error: err.message || "Ошибка генерации" }, { status: 500 });
  }
}
