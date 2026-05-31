export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const CREATOMATE_API = "https://api.creatomate.com/v1/renders";
// Шаблон из Creatomate — можно поменять на свой кастомный
const TEMPLATE_ID = process.env.CREATOMATE_TEMPLATE_ID || "67c64215-cedd-4ddb-a97e-f272ffe02b11";

export async function POST(req: NextRequest) {
  const apiKey = process.env.CREATOMATE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Добавь CREATOMATE_API_KEY в .env.local" },
      { status: 503 }
    );
  }

  try {
    const { title, hook, script } = await req.json();

    const mainText = hook || title || "Открой студию брендирования ADONIS";
    const subText = script
      ? script.slice(0, 120) + (script.length > 120 ? "..." : "")
      : "Выручка от 450К руб/мес · Окупаемость 3-5 мес";

    const body = {
      template_id: TEMPLATE_ID,
      modifications: {
        "Text-1.text": mainText,
        "Text-2.text": subText,
      },
    };

    const res = await fetch(CREATOMATE_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Creatomate: ${res.status} — ${err}`);
    }

    const data = await res.json();
    const render = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({
      id: render.id,
      status: render.status,
      url: render.url || null,
    });
  } catch (err: any) {
    console.error("Creatomate render error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Проверка статуса рендера по id
export async function GET(req: NextRequest) {
  const apiKey = process.env.CREATOMATE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Не настроен" }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const renderId = searchParams.get("id");
  if (!renderId) return NextResponse.json({ error: "Нет id" }, { status: 400 });

  try {
    const res = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    return NextResponse.json({
      status: data.status,
      url: data.url || null,
      progress: data.progress || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
