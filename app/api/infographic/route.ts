export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { topic, category, visualType } = await req.json();

  if (!topic) return NextResponse.json({ error: "topic required" }, { status: 400 });

  const prompt = `Создай сценарий инфографики-видео (30 сек) на тему: «${topic}».
Формат: ${visualType || "charts"}. Тип: ${category || "market"}.

Верни ТОЛЬКО JSON (без markdown):
{
  "title": "заголовок до 7 слов",
  "subtitle": "одна строка уточнения",
  "visual_type": "${visualType || "charts"}",
  "frames": [
    {"n":1,"type":"cover","heading":"...","stat":"цифра или дата","text":"1-2 предложения"},
    {"n":2,"type":"data","heading":"...","stat":"цифра","text":"2 предложения"},
    {"n":3,"type":"data","heading":"...","stat":"цифра","text":"2 предложения"},
    {"n":4,"type":"data","heading":"...","stat":"цифра","text":"2 предложения"},
    {"n":5,"type":"insight","heading":"Главный вывод","stat":"итоговая цифра","text":"2 предложения"},
    {"n":6,"type":"cta","heading":"Что делать","stat":null,"text":"призыв сохранить или поделиться"}
  ],
  "hashtags": "#инфографика #бизнес 6-8 хэштегов по теме",
  "caption": "2 предложения для подписи под видео",
  "music_suggestion": "темп и настроение фоновой музыки"
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text;
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
