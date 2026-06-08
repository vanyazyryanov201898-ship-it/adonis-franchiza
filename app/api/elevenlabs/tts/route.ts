export const dynamic = "force-dynamic";
export const maxDuration = 30;

import { NextRequest, NextResponse } from "next/server";

const EL_KEY   = (process.env.ELEVENLABS_API_KEY ?? "").trim();
const VOICE_ID = (process.env.ELEVENLABS_VOICE_ID ?? "IKne3meq5aSn9XLyUdCD").trim();

export async function POST(req: NextRequest) {
  const { text } = await req.json() as { text: string };
  if (!text?.trim()) return NextResponse.json({ error: "text required" }, { status: 400 });
  if (!EL_KEY)      return NextResponse.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 500 });

  const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key":   EL_KEY,
      "Content-Type": "application/json",
      "Accept":       "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true },
    }),
  });

  if (!ttsRes.ok) {
    const err = await ttsRes.text();
    return NextResponse.json({ error: `ElevenLabs TTS failed (${ttsRes.status}): ${err.slice(0, 300)}` }, { status: 500 });
  }

  const audioBytes = await ttsRes.arrayBuffer();
  return new NextResponse(audioBytes, {
    headers: {
      "Content-Type":   "audio/mpeg",
      "Content-Length": audioBytes.byteLength.toString(),
    },
  });
}
