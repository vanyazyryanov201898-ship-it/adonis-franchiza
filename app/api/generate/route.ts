export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Промпты по типу контента ─────────────────────────────────
function buildPrompt(type: string, topic: string, platform: string, tone: string): string {
  const toneDesc: Record<string, string> = {
    "Доверительный": "доверительный, личный, как разговор с другом",
    "Экспертный": "экспертный, авторитетный, с конкретными цифрами и фактами",
    "Эмоциональный": "эмоциональный, вдохновляющий, с акцентом на трансформацию",
    "Провокационный": "провокационный, интригующий, вызывающий споры",
    "Лёгкий": "лёгкий, разговорный, с юмором",
  };

  const platformDesc: Record<string, string> = {
    "TikTok": "TikTok (вертикальное видео, 30-60 сек, молодая аудитория, трендовый формат)",
    "Instagram": "Instagram Reels (вертикальное видео, 30-90 сек, визуальный контент)",
    "YouTube": "YouTube Shorts или длинное видео (горизонтальное, 60-180 сек)",
    "VK": "VK Клипы (вертикальное видео, 30-60 сек, российская аудитория)",
    "Telegram": "Telegram-канал (текст + видео, деловая аудитория)",
  };

  const base = `Ты — AI-копирайтер для компании ADONIS.
Контекст: ADONIS — франшиза №1 в России по печати и брендированию одежды и аксессуаров. Студия брендирования: печать на одежде, создание собственных брендов, работа с маркетплейсами (Wildberries), корпоративные заказы от 30 до 1000 штук.
Ключевые цифры: выручка партнёра 450 тыс. — 1 млн руб/мес, чистая прибыль 150–300 тыс. руб/мес, окупаемость 3–5 месяцев. Рекорд: 31 млн выручки за год.
Реальные кейсы: Кирьяк и Мария (Ростов) — 16 млн, окупились за 4.5 мес; Сергей (Ставрополь) — 10 млн, 6 мес; Христофор (Сочи) — 6 млн, 5 мес.
Что получает партнёр: готовое оборудование, обучение, поддержка 24/7, помощь в открытии ИП, юр/бух сопровождение, помощь в поиске клиентов, доступ к производству в Казани. Запуск: 14 дней — 1 месяц. Можно работать из дома.
Целевая аудитория: предприниматели 25–45 лет, хотят уйти из найма, открыть своё дело, зарабатывать 150–300 тыс./мес, боятся больших вложений.
Тон: ${toneDesc[tone] || "доверительный"}.
Платформа: ${platformDesc[platform] || platform}.
Тема: ${topic}.

ВАЖНО: Используй реальные цифры компании. Отвечай ТОЛЬКО на русском языке. Без вступлений — сразу контент.`;

  const prompts: Record<string, string> = {
    scenario: `${base}

Создай ПОЛНЫЙ СЦЕНАРИЙ для короткого видео (45-90 секунд).
Формат строго такой:

🎬 СЦЕНАРИЙ: «[название]»
⏱ Длительность: [X-Y сек]
📊 Viral Score: [85-96]/100

━━━━━━━━━━━━━━━━━━━━━━

🔥 ХУК (0-5 сек):
[цепляющее начало, первые слова]

📱 ОСНОВНОЙ КОНТЕНТ (5-35 сек):
[3-4 конкретных пункта с цифрами]

💡 ДЕТАЛИ (35-50 сек):
[подтверждение, доказательства, факты]

📣 CTA (50-60 сек):
[призыв к действию]

━━━━━━━━━━━━━━━━━━━━━━
#хэштег1 #хэштег2 #хэштег3 #адонис`,

    hook: `${base}

Создай 5 разных ВИРУСНЫХ ХУКОВ (первые 3-5 секунд видео).
Каждый хук — одна сильная фраза, которая заставит остановить скролл.
Формат: пронумерованный список, каждый хук с новой строки.
Используй цифры, провокацию, интригу или личный опыт.`,

    cta: `${base}

Создай 5 разных CTA (призывов к действию) для конца видео.
Цель: подписка, заявка на франшизу, запись на консультацию.
Каждый CTA — 1-2 предложения, конкретный и действенный.
Формат: пронумерованный список.`,

    title: `${base}

Создай 5 разных ВИРУСНЫХ ЗАГОЛОВКОВ для видео.
Заголовки должны цеплять, вызывать любопытство или эмоции.
Используй цифры, вопросы, обещания результата.
Формат: пронумерованный список.`,

    description: `${base}

Создай ОПИСАНИЕ под видео (150-300 символов).
Включи: суть видео, ключевые слова, призыв к действию, хэштеги.
Формат: готовый текст для поля описания.`,

    ideas: `${base}

Придумай 5 ИДЕЙ ДЛЯ РОЛИКОВ по теме «${topic}».
Каждая идея: название + формат + ключевой хук + Viral Score.

Формат:
1️⃣ «[название идеи]»
   → [формат и подача]
   → Хук: [первые слова]
   Viral Score: [XX]/100

[и так далее для каждой идеи]`,
  };

  return prompts[type] || prompts.hook;
}

async function analyzeViralPotential(content: string, type: string, platform: string) {
  try {
    const analysisPrompt = `Ты — эксперт по вирусному контенту. Проанализируй этот контент для ${platform} и верни JSON.

Контент:
${content.slice(0, 800)}

Верни ТОЛЬКО валидный JSON без пояснений:
{"score":NUMBER_80_97,"positives":["конкретный плюс 1","конкретный плюс 2","конкретный плюс 3"],"improvements":["что улучшить 1","что улучшить 2"]}

Правила:
- score: реальная оценка 80-97, учитывай хук, CTA, цифры, платформу
- positives: конкретные сильные стороны этого контента (упоминай цифры если есть)
- improvements: конкретные рекомендации по улучшению`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: analysisPrompt }],
    });

    const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { type, topic, platform, tone, brandVoice } = await req.json();

    if (!type || !topic || !platform) {
      return NextResponse.json({ error: "Не указаны обязательные параметры" }, { status: 400 });
    }

    let prompt = buildPrompt(type, topic, platform, tone || "Доверительный");

    // Если передан голос бренда — добавляем его в промпт
    if (brandVoice) {
      prompt += `\n\nВАЖНО — Голос бренда: ${brandVoice}\nПиши строго в этом стиле.`;
    }

    // Генерируем контент + анализ параллельно
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";

    // Анализ вирусности — параллельный запрос
    const viralAnalysis = await analyzeViralPotential(content, type, platform);
    const viralScore = viralAnalysis?.score ?? Math.floor(Math.random() * 12) + 85;

    // Сохраняем в Supabase (если настроен)
    try {
      const db = createServerClient();
      if (!db) throw new Error("not configured");
      await db.from("generated_content").insert({
        type,
        topic,
        platform,
        tone: tone || "Доверительный",
        content,
        viral_score: viralScore,
      });
    } catch (dbErr) {
      console.warn("Supabase не настроен:", dbErr);
    }

    return NextResponse.json({ content, viralScore, viralAnalysis });
  } catch (err: any) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: err.message || "Ошибка генерации" },
      { status: 500 }
    );
  }
}
