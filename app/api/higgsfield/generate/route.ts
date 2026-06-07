export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const CREDENTIALS = process.env.HIGGSFIELD_API_KEY ?? "";
const WORKSPACE_ID = process.env.HIGGSFIELD_WORKSPACE_ID ?? "";
const BASE_URL = "https://platform.higgsfield.ai";

function getAuthHeaders() {
  return {
    "Authorization": `Key ${CREDENTIALS}`,
    "Content-Type": "application/json",
  };
}

export async function POST(req: NextRequest) {
  if (!CREDENTIALS) {
    return NextResponse.json({ error: "HIGGSFIELD_API_KEY not configured" }, { status: 500 });
  }

  const { prompt, model = "kling3_0", duration = 5, aspect_ratio = "9:16", image_url, audio_media_id } = await req.json() as {
    prompt: string;
    model?: string;
    duration?: number;
    aspect_ratio?: string;
    image_url?: string;
    audio_media_id?: string;
  };

  if (!prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  // Use wan2_7 (audio-synchronized) when audio is provided
  const selectedModel = audio_media_id ? "wan2_7" : model;

  // Build params — Higgsfield uses `medias` array (not `input_images`)
  const params: Record<string, unknown> = {
    prompt,
    duration,
    aspect_ratio,
  };

  // Add audio for wan2_7 lip-sync
  if (audio_media_id) {
    params.medias = [{ value: audio_media_id, role: "audio" }];
  }
  // Add reference image as start_image for models that support it (Kling 3.0)
  else if (image_url) {
    params.medias = [{ value: image_url, role: "start_image" }];
  }

  const body: Record<string, unknown> = {
    model: selectedModel,
    params,
  };
  // workspace_id is optional — Higgsfield derives it from the API key;
  // pass it only when explicitly configured
  if (WORKSPACE_ID) body.workspace_id = WORKSPACE_ID;

  try {
    const res = await fetch(`${BASE_URL}/v1/job-sets`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch {
      return NextResponse.json({ error: `Higgsfield non-JSON (${res.status}): ${text.slice(0, 300)}` }, { status: 500 });
    }

    if (!res.ok) {
      const detail = Array.isArray(data?.detail)
        ? data.detail.map((e: any) => e.msg).join("; ")
        : data?.detail || data?.message || data?.error;
      return NextResponse.json({ error: detail || `HTTP ${res.status}` }, { status: res.status });
    }

    const id = data.id || data.job_set_id || data.request_id;
    if (!id) {
      return NextResponse.json({ error: `No id in response: ${JSON.stringify(data).slice(0, 200)}` }, { status: 502 });
    }

    return NextResponse.json({ id, status: data.status || "queued" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Network error" }, { status: 500 });
  }
}
