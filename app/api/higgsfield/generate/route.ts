export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.HIGGSFIELD_API_KEY;
const BASE_URL = "https://api.higgsfield.ai";

const MODEL_MAP: Record<string, string> = {
  kling3_0: "kling-3",
  cinematic_studio_3_0: "cinematic-studio",
  seedance_2_0: "seedance-2",
  grok_video: "grok-video",
};

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "HIGGSFIELD_API_KEY not configured" }, { status: 500 });
  }

  const { prompt, model = "kling3_0", duration = 5, aspect_ratio = "9:16" } = await req.json() as {
    prompt: string;
    model?: string;
    duration?: number;
    aspect_ratio?: string;
  };

  if (!prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  const higgsfieldModel = MODEL_MAP[model] ?? model;

  try {
    const res = await fetch(`${BASE_URL}/v1/generations`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: higgsfieldModel,
        prompt,
        duration,
        aspect_ratio,
        enhance_prompt: true,
        check_nsfw: false,
      }),
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch {
      return NextResponse.json({ error: `Higgsfield non-JSON: ${text.slice(0, 300)}` }, { status: 500 });
    }

    if (!res.ok) {
      return NextResponse.json({ error: data?.message || data?.error || `HTTP ${res.status}` }, { status: res.status });
    }

    return NextResponse.json({
      id: data.generation_id || data.request_id || data.id,
      status: data.status || "queued",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Network error" }, { status: 500 });
  }
}
