export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { SPARTAN_CHARACTER_URL } from "@/lib/data/assets";

const CREDENTIALS = process.env.HIGGSFIELD_API_KEY ?? "";
const BASE_URL = "https://platform.higgsfield.ai";

function getAuthHeaders() {
  return {
    "Authorization": `Key ${CREDENTIALS}`,
    "Content-Type": "application/json",
  };
}

// Workspace ID — tied to the Higgsfield account
const FALLBACK_WORKSPACE_ID = "40e3dc18-a260-4432-87d5-ebc004e59b54";
let _workspaceId: string | null = process.env.HIGGSFIELD_WORKSPACE_ID || null;

async function resolveWorkspaceId(): Promise<string> {
  if (_workspaceId) return _workspaceId;
  try {
    const res = await fetch(`${BASE_URL}/v1/workspaces`, { headers: getAuthHeaders() });
    if (res.ok) {
      const json = await res.json();
      const list: any[] = Array.isArray(json) ? json : (json.data ?? json.workspaces ?? []);
      const id: string | undefined = list[0]?.id;
      if (id) { _workspaceId = id; return id; }
    }
  } catch {}
  _workspaceId = FALLBACK_WORKSPACE_ID;
  return FALLBACK_WORKSPACE_ID;
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

  // input_images is REQUIRED by Higgsfield /v1/job-sets — must have at least 1 item.
  // Use provided image_url, or fall back to SPARTAN_CHARACTER_URL as reference.
  const refImage = image_url || SPARTAN_CHARACTER_URL;
  const inputImages: unknown[] = [{ type: "image_url", image_url: refImage }];

  const params: Record<string, unknown> = {
    prompt,
    duration,
    aspect_ratio,
    input_images: inputImages,
  };

  // Add audio for wan2_7 lip-sync
  if (audio_media_id) {
    params.medias = [{ value: audio_media_id, role: "audio" }];
  }

  const workspaceId = await resolveWorkspaceId();
  const body: Record<string, unknown> = {
    model: selectedModel,
    workspace_id: workspaceId,
    params,
  };

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
        ? data.detail.map((e: any) => `[${(e.loc ?? []).join(".")}] ${e.msg}`).join("; ")
        : data?.detail || data?.message || data?.error;
      console.error("Higgsfield error", res.status, JSON.stringify(data));
      return NextResponse.json({ error: detail || `HTTP ${res.status}`, _raw: data }, { status: res.status });
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
