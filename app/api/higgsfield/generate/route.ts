export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const CREDENTIALS = process.env.HIGGSFIELD_API_KEY ?? "";
const BASE_URL = "https://platform.higgsfield.ai";

const MODEL_MAP: Record<string, string> = {
  kling3_0: "kling3_0",
  cinematic_studio_3_0: "cinematic_studio_3_0",
  seedance_2_0: "seedance_2_0",
  grok_video: "grok_video",
};

function getAuthHeaders() {
  const [apiKey, apiSecret] = CREDENTIALS.split(":");
  return {
    "hf-api-key": apiKey ?? "",
    "hf-secret": apiSecret ?? "",
    "Content-Type": "application/json",
  };
}

export async function POST(req: NextRequest) {
  if (!CREDENTIALS) {
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

  const modelEndpoint = MODEL_MAP[model] ?? model;

  try {
    const res = await fetch(`${BASE_URL}/v1/${modelEndpoint}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        params: { prompt, duration, aspect_ratio, enhance_prompt: false },
      }),
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch {
      return NextResponse.json({ error: `Higgsfield non-JSON (${res.status}): ${text.slice(0, 300)}` }, { status: 500 });
    }

    if (!res.ok) {
      return NextResponse.json({ error: data?.message || data?.error || data?.detail || `HTTP ${res.status}: ${JSON.stringify(data).slice(0,200)}` }, { status: res.status });
    }

    const id = data.id || data.request_id;
    if (!id) {
      return NextResponse.json({ error: `No id in response: ${JSON.stringify(data).slice(0, 200)}` }, { status: 502 });
    }

    return NextResponse.json({ id, status: data.status || "queued" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Network error" }, { status: 500 });
  }
}
