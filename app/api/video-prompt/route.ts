export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/google-client";

type Direction = "heygen-live" | "heygen-ai" | "cartoon" | "clips" | "infographics";

type VideoPrompt = {
  tool: string;
  prompt: string;
  negativePrompt?: string;
  settings: Record<string, string | number>;
  tip: string;
  avatarNote?: string;
  backgroundPrompt?: string;
  scriptReady?: boolean;
};

const directionInstructions: Record<Direction, string> = {
  "heygen-live": `Создай промпты для видеогенерации ФОНА и B-ROLL к сценарию с живым человеком в кадре.
HeyGen — промпт для виртуального фона за аватаром.
Kling/Runway — промпты для b-roll сцен, которые чередуются с говорящим человеком.
Стиль: деловой, современный, российский визуальный контекст.`,

  "heygen-ai": `Создай промпты для виртуального фона AI-аватара и b-roll сцен.
HeyGen — фон за аватаром. Kling/Runway — b-roll для монтажа поверх речи аватара.
Стиль: профессиональный, чистый, минималистичный или корпоративный.`,

  "cartoon": `Создай промпты для генерации 2D/3D мультяшной анимации Спартанца АДОНИС.
Kling video mode / Runway Animate — анимировать статичного персонажа.
Описывай движения, экспрессию, фон в стиле flat 2D animation.`,

  "clips": `Создай промпты для B-ROLL видео, которые подойдут под нарезку.
Нужны конкретные сцены: производство, мерч, деловые встречи, городские локации России.
Стиль: документальный / lifestyle / cinematic.`,

  "infographics": `Создай промпты для motion graphics / data visualization видео.
Описывай анимированные графики, иконки, переходы между данными.
Стиль: clean motion design, flat icons, smooth transitions.`,
};

export async function POST(req: NextRequest) {
  try {
    const { script, direction, topic, style } = await req.json() as {
      script: string;
      direction: Direction;
      topic: string;
      style?: string;
    };

    const instrunction = directionInstructions[direction] ?? directionInstructions["heygen-live"];
    const styleNote = style ? `Визуальный стиль: ${style}.` : "";

    const systemPrompt = `Ты — эксперт по созданию промптов для AI-видеогенераторов.
ВАЖНО: Возвращай ТОЛЬКО валидный JSON. Никаких markdown блоков. Никаких двойных кавычек внутри строк — используй только одинарные кавычки внутри значений. Не используй символ переноса строки внутри строковых значений JSON.`;

    // HeyGen только для talking-head направлений; clips/infographics — только визуальные генераторы
    const includeHeyGen = direction === "heygen-live" || direction === "heygen-ai";
    const templateSuffix = includeHeyGen
      ? `,{"tool":"HeyGen","avatarNote":"описание аватара на русском","backgroundPrompt":"описание фона на английском","tip":"совет на русском"}]}`
      : `]}`;

    const userPrompt = `Направление: ${direction}. Тема: ${topic}. ${styleNote}
${instrunction}

Сценарий (краткое содержание): ${script.slice(0, 800)}

Создай промпты для AI-генераторов видео. Верни ТОЛЬКО валидный JSON в точно таком формате:

{"prompts":[{"tool":"Kling 2.0","prompt":"описание сцены на английском без внутренних кавычек","negativePrompt":"text watermark blurry distorted","duration":"10s","ratio":"9:16","tip":"совет на русском"},{"tool":"Runway Gen-3","prompt":"описание сцены на английском","camera":"slow zoom","tip":"совет на русском"},{"tool":"Sora","prompt":"детальное описание на английском","duration":"15s","tip":"совет на русском"}${templateSuffix}`;

    const raw = (await generateText(userPrompt, { maxTokens: 2500, systemPrompt })).trim() || "{}";

    // Strip markdown code blocks if present
    const cleaned = raw
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Не удалось найти JSON в ответе");

    let result: unknown;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch {
      // Try to fix common JSON issues: control characters, unescaped newlines in strings
      const fixed = jsonMatch[0]
        .replace(/[\x00-\x1F\x7F]/g, (c) => c === "\n" || c === "\r" || c === "\t" ? " " : "")
        .replace(/,\s*([}\]])/g, "$1"); // trailing commas
      result = JSON.parse(fixed);
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("video-prompt error:", err);
    return NextResponse.json({ error: err.message || "Ошибка" }, { status: 500 });
  }
}
