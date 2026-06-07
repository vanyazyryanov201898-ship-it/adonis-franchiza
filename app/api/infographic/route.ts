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
  const { topic, category, visualType, trendContext, platform } = await req.json() as {
    topic: string;
    category?: string;
    visualType?: string;
    trendContext?: TrendContext;
    platform?: string;
  };

  if (!topic) return NextResponse.json({ error: "topic required" }, { status: 400 });

  const trendNote = trendContext
    ? `\n\nАКТУАЛЬНЫЙ ТРЕНД ДЛЯ ПРИВЯЗКИ:\nТема: «${trendContext.title}» · Балл: ${trendContext.viralScore}/100 · Рост: +${trendContext.growth}%\nХуки: ${trendContext.hooks.slice(0, 2).join(" / ")}\nИспользуй цифры тренда и его подачу в данных.`
    : "";

  const platformNote = platform ? ` Целевая платформа: ${platform} — адаптируй caption и хэштеги под неё.` : "";
  const prompt = `Создай сценарий видео-инфографики на тему: «${topic}».
Визуал: ${visualType || "charts"}. Тип: ${category || "market"}.${platformNote}${trendNote}

Верни ТОЛЬКО валидный JSON (без markdown, без пояснений):
{"title":"заголовок до 7 слов","subtitle":"одна строка-интрига","visual_type":"${visualType || "charts"}","frames":[{"n":1,"type":"cover","heading":"...","stat":"ключевая цифра","text":"2 предложения — зачем смотреть дальше","visual_note":"цвет фона, главный элемент"},{"n":2,"type":"data","heading":"...","stat":"цифра с единицей","text":"2 предложения — контекст цифры","visual_note":"тип графика, цветовая схема"},{"n":3,"type":"data","heading":"...","stat":"...","text":"...","visual_note":"..."},{"n":4,"type":"data","heading":"...","stat":"...","text":"...","visual_note":"..."},{"n":5,"type":"insight","heading":"Главный вывод","stat":"итоговая цифра","text":"2 предложения — ключевой инсайт","visual_note":"яркий акцент, крупный текст"},{"n":6,"type":"cta","heading":"Что делать","stat":null,"text":"конкретный призыв — сохрани, напиши нам","visual_note":"логотип АДОНИС, тёмный фон"}],"hashtags":"#инфографика #бизнес #мерч #франшиза + 6-8 по теме","caption":"2-3 предложения от первого лица с вопросом к аудитории","music_suggestion":"темп и настроение"}

Правила: цифры конкретные (не 'X млн', а '16 млн руб'). Только валидный JSON.`;

  function repairJson(raw: string): string {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return raw;
    let s = m[0];
    // Add missing comma between } { (Haiku sometimes forgets between array items)
    s = s.replace(/\}(\s*)\{/g, "},$1{");
    // Add missing comma between ] [
    s = s.replace(/\](\s*)\[/g, "],$1[");
    // Remove trailing commas before } or ]
    s = s.replace(/,(\s*[}\]])/g, "$1");
    return s;
  }

  try {
    const raw = await generateText(prompt, { maxTokens: 1200, model: "claude-haiku-4-5-20251001" });
    const repaired = repairJson(raw);

    let data: any;
    try {
      data = JSON.parse(repaired);
    } catch {
      return NextResponse.json({ error: "Не удалось распарсить JSON от модели. Попробуй ещё раз." }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Infographic API error:", err);
    return NextResponse.json({ error: err.message || "Ошибка генерации" }, { status: 500 });
  }
}
