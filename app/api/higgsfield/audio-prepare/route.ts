export const dynamic = "force-dynamic";
export const maxDuration = 25;

import { NextRequest, NextResponse } from "next/server";

const HF_KEY  = process.env.HIGGSFIELD_API_KEY ?? "";
const HF_BASE = "https://platform.higgsfield.ai";
const EL_KEY  = process.env.ELEVENLABS_API_KEY ?? "";

// Charlie — young energetic multilingual male voice
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "IKne3meq5aSn9XLyUdCD";

// Same fallback workspace used in generate/route.ts
const FALLBACK_WORKSPACE_ID = "40e3dc18-a260-4432-87d5-ebc004e59b54";

function hfHeaders() {
  return { "Authorization": `Key ${HF_KEY}`, "Content-Type": "application/json" };
}

async function resolveWorkspaceId(): Promise<string> {
  if (process.env.HIGGSFIELD_WORKSPACE_ID) return process.env.HIGGSFIELD_WORKSPACE_ID;
  try {
    const res = await fetch(`${HF_BASE}/v1/workspaces`, { headers: hfHeaders() });
    if (res.ok) {
      const json = await res.json();
      const list: any[] = Array.isArray(json) ? json : (json.data ?? json.workspaces ?? []);
      const id = list[0]?.id as string | undefined;
      if (id) return id;
    }
  } catch { /* fallthrough */ }
  return FALLBACK_WORKSPACE_ID;
}

export async function POST(req: NextRequest) {
  const { text } = await req.json() as { text: string };
  if (!text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });
  if (!EL_KEY)  return NextResponse.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 500 });
  if (!HF_KEY)  return NextResponse.json({ error: "HIGGSFIELD_API_KEY not configured" }, { status: 500 });

  // Step 1 — Generate Russian audio via ElevenLabs
  const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: { "xi-api-key": EL_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true },
    }),
  });

  if (!ttsRes.ok) {
    const err = await ttsRes.text();
    return NextResponse.json({ error: `ElevenLabs TTS failed: ${err.slice(0, 300)}` }, { status: 500 });
  }

  const audioBytes = await ttsRes.arrayBuffer();

  // Step 2 — Get workspace ID then request presigned upload URL from Higgsfield
  const workspaceId = await resolveWorkspaceId();

  const presignRes = await fetch(`${HF_BASE}/v1/media`, {
    method: "POST",
    headers: hfHeaders(),
    body: JSON.stringify({
      filename: "spartan-voice.mp3",
      content_type: "audio/mp3",
      workspace_id: workspaceId,
    }),
  });

  if (!presignRes.ok) {
    const errText = await presignRes.text();
    return NextResponse.json({
      error: `Higgsfield /v1/media failed (${presignRes.status}): ${errText.slice(0, 300)}`,
    }, { status: 500 });
  }

  const presignData = await presignRes.json();
  const mediaId: string  = presignData.media_id || presignData.id;
  const uploadUrl: string = presignData.upload_url || presignData.url;

  if (!uploadUrl || !mediaId) {
    return NextResponse.json({
      error: `Higgsfield /v1/media missing fields: ${JSON.stringify(presignData).slice(0, 300)}`,
    }, { status: 500 });
  }

  // Step 3 — Upload audio to presigned S3 URL
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "audio/mp3" },
    body: audioBytes,
  });

  if (!uploadRes.ok) {
    return NextResponse.json({ error: `S3 upload failed: HTTP ${uploadRes.status}` }, { status: 500 });
  }

  // Step 4 — Confirm upload so Higgsfield marks the media as ready
  const confirmRes = await fetch(`${HF_BASE}/v1/media/${mediaId}/confirm`, {
    method: "POST",
    headers: hfHeaders(),
  });

  if (!confirmRes.ok) {
    const ct = await confirmRes.text();
    return NextResponse.json({ error: `Confirm failed (${confirmRes.status}): ${ct.slice(0, 200)}` }, { status: 500 });
  }

  return NextResponse.json({ media_id: mediaId });
}
