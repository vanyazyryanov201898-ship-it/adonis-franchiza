export const dynamic = "force-dynamic";
export const maxDuration = 120;

import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { createServerClient } from "@/lib/db/supabase";

const execFileAsync = promisify(execFile);

const EL_KEY   = (process.env.ELEVENLABS_API_KEY ?? "").trim();
const VOICE_ID = (process.env.ELEVENLABS_VOICE_ID ?? "IKne3meq5aSn9XLyUdCD").trim();

async function ensureStorageBucket(sb: ReturnType<typeof createServerClient>) {
  if (!sb) return;
  try {
    await sb.storage.createBucket("videos", { public: true, allowedMimeTypes: ["video/mp4"] });
  } catch { /* bucket may already exist */ }
}

export async function POST(req: NextRequest) {
  const { videoUrl, audioText, direction = "video", dbId } = await req.json() as {
    videoUrl: string;
    audioText: string;
    direction?: string;
    dbId?: string;
  };

  if (!videoUrl) return NextResponse.json({ error: "videoUrl required" }, { status: 400 });
  if (!audioText?.trim()) return NextResponse.json({ error: "audioText required" }, { status: 400 });
  if (!EL_KEY) return NextResponse.json({ error: "ELEVENLABS_API_KEY not set" }, { status: 500 });

  const id = randomUUID();
  const tmpVideo  = join("/tmp", `${id}-video.mp4`);
  const tmpAudio  = join("/tmp", `${id}-audio.mp3`);
  const tmpOutput = join("/tmp", `${id}-merged.mp4`);

  try {
    // Step 1 — download Higgsfield video
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error(`Video fetch failed: ${videoRes.status}`);
    const videoBytes = await videoRes.arrayBuffer();
    await writeFile(tmpVideo, Buffer.from(videoBytes));

    // Step 2 — generate ElevenLabs audio
    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: { "xi-api-key": EL_KEY, "Content-Type": "application/json", "Accept": "audio/mpeg" },
      body: JSON.stringify({
        text: audioText.trim(),
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.35, use_speaker_boost: true },
      }),
    });
    if (!ttsRes.ok) {
      const err = await ttsRes.text();
      throw new Error(`ElevenLabs TTS failed (${ttsRes.status}): ${err.slice(0, 200)}`);
    }
    const audioBytes = await ttsRes.arrayBuffer();
    await writeFile(tmpAudio, Buffer.from(audioBytes));

    // Step 3 — FFmpeg merge: copy video, add audio, trim to video length
    await execFileAsync("ffmpeg", [
      "-i", tmpVideo,
      "-i", tmpAudio,
      "-map", "0:v:0",
      "-map", "1:a:0",
      "-c:v", "copy",
      "-c:a", "aac",
      "-shortest",
      "-y",
      tmpOutput,
    ]);

    // Step 4 — upload merged video to Supabase Storage
    const mergedBytes = await readFile(tmpOutput);
    const sb = createServerClient();
    let mergedUrl: string = videoUrl; // fallback to original if storage fails

    if (sb) {
      await ensureStorageBucket(sb);
      const storagePath = `${direction}/${Date.now()}-${id}.mp4`;
      const { error: uploadErr } = await sb.storage
        .from("videos")
        .upload(storagePath, mergedBytes, { contentType: "video/mp4", upsert: false });

      if (!uploadErr) {
        const { data: { publicUrl } } = sb.storage.from("videos").getPublicUrl(storagePath);
        mergedUrl = publicUrl;

        // Update DB record with permanent storage URL
        if (dbId) {
          await sb.from("video_generations")
            .update({ video_url: mergedUrl, status: "completed", completed_at: new Date().toISOString() })
            .eq("id", dbId);
        }
      }
    }

    return NextResponse.json({ mergedUrl });

  } catch (e: any) {
    console.error("merge-video error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    // Clean up temp files
    await Promise.allSettled([
      unlink(tmpVideo).catch(() => {}),
      unlink(tmpAudio).catch(() => {}),
      unlink(tmpOutput).catch(() => {}),
    ]);
  }
}
