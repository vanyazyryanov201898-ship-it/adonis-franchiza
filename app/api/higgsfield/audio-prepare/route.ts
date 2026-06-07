export const dynamic = "force-dynamic";
export const maxDuration = 25;

import { NextRequest, NextResponse } from "next/server";

const HF_CREDENTIALS = process.env.HIGGSFIELD_API_KEY ?? "";
const HF_BASE = "https://platform.higgsfield.ai";
const EL_KEY = process.env.ELEVENLABS_API_KEY ?? "";

// Charlie — young energetic multilingual male, works well in Russian
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "IKne3meq5aSn9XLyUdCD";

function hfHeaders(extra?: Record<string, string>) {
  return { "Authorization": `Key ${HF_CREDENTIALS}`, "Content-Type": "application/json", ...extra };
}

export async function POST(req: NextRequest) {
  const { text } = await req.json() as { text: string };
  if (!text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });
  if (!EL_KEY) return NextResponse.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 500 });
  if (!HF_CREDENTIALS) return NextResponse.json({ error: "HIGGSFIELD_API_KEY not configured" }, { status: 500 });

  const workspaceId = HF_CREDENTIALS.split(":")[0];

  // Step 1: Generate Russian audio via ElevenLabs
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
    return NextResponse.json({ error: `ElevenLabs error: ${err.slice(0, 200)}` }, { status: 500 });
  }

  const audioBytes = await ttsRes.arrayBuffer();

  // Step 2: Get presigned upload URL from Higgsfield
  const presignRes = await fetch(`${HF_BASE}/v1/media`, {
    method: "POST",
    headers: hfHeaders(),
    body: JSON.stringify({ filename: "spartan-voice.mp3", content_type: "audio/mp3", workspace_id: workspaceId }),
  });

  let presignData: any;
  if (presignRes.ok) {
    presignData = await presignRes.json();
  } else {
    // Fallback: try alternate endpoint
    const alt = await fetch(`${HF_BASE}/v1/uploads`, {
      method: "POST",
      headers: hfHeaders(),
      body: JSON.stringify({ filename: "spartan-voice.mp3", content_type: "audio/mp3", workspace_id: workspaceId }),
    });
    if (!alt.ok) {
      const altText = await alt.text();
      return NextResponse.json({ error: `Higgsfield upload init failed: ${altText.slice(0, 200)}` }, { status: 500 });
    }
    presignData = await alt.json();
  }

  const mediaId: string = presignData.media_id || presignData.id;
  const uploadUrl: string = presignData.upload_url || presignData.url;

  if (!uploadUrl || !mediaId) {
    return NextResponse.json({ error: `No upload URL from Higgsfield: ${JSON.stringify(presignData).slice(0, 200)}` }, { status: 500 });
  }

  // Step 3: Upload audio bytes to presigned URL
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "audio/mp3" },
    body: audioBytes,
  });

  if (!uploadRes.ok) {
    return NextResponse.json({ error: `Upload to presigned URL failed: HTTP ${uploadRes.status}` }, { status: 500 });
  }

  // Step 4: Confirm the upload
  const confirmRes = await fetch(`${HF_BASE}/v1/media/${mediaId}/confirm`, {
    method: "POST",
    headers: hfHeaders(),
  });

  if (!confirmRes.ok) {
    // Try alternate confirm format
    const altConfirm = await fetch(`${HF_BASE}/v1/media/confirm`, {
      method: "POST",
      headers: hfHeaders(),
      body: JSON.stringify({ media_id: mediaId, workspace_id: workspaceId }),
    });
    if (!altConfirm.ok) {
      const ct = await altConfirm.text();
      return NextResponse.json({ error: `Confirm failed: ${ct.slice(0, 200)}` }, { status: 500 });
    }
  }

  return NextResponse.json({ media_id: mediaId });
}
