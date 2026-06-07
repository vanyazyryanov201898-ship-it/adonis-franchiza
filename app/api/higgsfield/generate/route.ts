export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const CREDENTIALS = process.env.HIGGSFIELD_API_KEY ?? "";
const BASE_URL = "https://platform.higgsfield.ai";

// Dark cinematic placeholder used when no reference image is provided
const DEFAULT_IMAGE = "https://picsum.photos/seed/adonis/576/1024";

function getWorkspaceId() {
  return CREDENTIALS.split(":")[0] ?? "";
}

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

  const { prompt, model = "kling3_0", duration = 5, aspect_ratio = "9:16", image_url } = await req.json() as {
    prompt: string;
    model?: string;
    duration?: number;
    aspect_ratio?: string;
    image_url?: string;
  };

  if (!prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE_URL}/v1/job-sets`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        model,
        workspace_id: getWorkspaceId(),
        params: {
          prompt,
          input_images: [{ type: "image_url", image_url: image_url || DEFAULT_IMAGE }],
          duration,
          aspect_ratio,
        },
      }),
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
