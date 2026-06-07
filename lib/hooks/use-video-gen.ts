"use client";

import { useRef, useState, useEffect } from "react";
import { getSupabase } from "@/lib/db/supabase";

export type VideoGenState = "idle" | "submitting" | "polling" | "done" | "error";

interface UseVideoGenOptions {
  direction: string;
  topic?: string;
}

const STORAGE_KEY = "hf_active_job";

interface StoredJob {
  higgsId: string;
  dbId: string | null;
  direction: string;
  startedAt: number;
}

export function useVideoGen({ direction, topic }: UseVideoGenOptions) {
  const [state, setState]         = useState<VideoGenState>("idle");
  const [videoUrl, setVideoUrl]   = useState<string | null>(null);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const esRef                     = useRef<EventSource | null>(null);
  const dbIdRef                   = useRef<string | null>(null);

  const stopStream = () => {
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
  };

  useEffect(() => {
    return () => { stopStream(); };
  }, []);

  // Auto-resume if there's an active job stored for this direction
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const job: StoredJob = JSON.parse(stored);
      if (job.direction !== direction) return;
      const age = Date.now() - job.startedAt;
      if (age > 15 * 60 * 1000) { // 15 min matches server cap
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      dbIdRef.current = job.dbId;
      setState("polling");
      setProgress(Math.min(10 + Math.floor(age / 2000), 95));
      startStream(job.higgsId, job.dbId);
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction]);

  const saveToSupabase = async (row: Record<string, unknown>) => {
    try {
      const sb = getSupabase();
      if (!sb) return null;
      const { data } = await sb.from("video_generations").insert(row).select("id").single();
      return data?.id ?? null;
    } catch { return null; }
  };

  const updateInSupabase = async (id: string, updates: Record<string, unknown>) => {
    try {
      const sb = getSupabase();
      if (!sb || !id) return;
      await sb.from("video_generations").update(updates).eq("id", id);
    } catch {}
  };

  const startStream = (higgsId: string, dbId: string | null) => {
    stopStream();

    // Animate progress smoothly up to 95% while waiting
    let prog = 10;
    const ticker = setInterval(() => {
      prog = Math.min(prog + 1, 95);
      setProgress(prog);
    }, 2_000);

    const es = new EventSource(`/api/higgsfield/stream/${higgsId}`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as { status: string; url?: string; error?: string };

        if (msg.status === "completed") {
          clearInterval(ticker);
          stopStream();
          localStorage.removeItem(STORAGE_KEY);
          setProgress(100);
          const url = msg.url ?? null;
          setVideoUrl(url);
          setState("done");
          if (!url) {
            setDebugInfo("Видео готово, но URL не получен. Проверьте историю на дашборде.");
          }
          if (dbId) updateInSupabase(dbId, {
            status: "completed",
            video_url: url,
            completed_at: new Date().toISOString(),
          });
        } else if (msg.status === "failed") {
          clearInterval(ticker);
          stopStream();
          localStorage.removeItem(STORAGE_KEY);
          setError(msg.error || "Ошибка рендера на Higgsfield");
          setState("error");
          if (dbId) updateInSupabase(dbId, { status: "failed" });
        }
        // "processing" — just a heartbeat, progress ticker handles the bar
      } catch {}
    };

    es.onerror = () => {
      // SSE connection dropped — this is normal after completion (server closes)
      // Only treat as error if we're still in polling state
      clearInterval(ticker);
      stopStream();
      // Don't mark as error here — the server might have sent "completed" before closing
    };
  };

  const generate = async ({
    prompt, model, duration, aspect_ratio = "9:16", image_url, audio_text,
  }: {
    prompt: string;
    model: string;
    duration: number;
    aspect_ratio?: string;
    image_url?: string;
    audio_text?: string;
  }) => {
    if (!prompt.trim()) return;

    stopStream();
    localStorage.removeItem(STORAGE_KEY);

    setState("submitting");
    setError(null);
    setDebugInfo(null);
    setVideoUrl(null);
    setProgress(0);

    const dbId = await saveToSupabase({
      direction, topic: topic ?? null, prompt, model,
      duration_sec: duration, status: "queued",
    });
    dbIdRef.current = dbId;

    try {
      let audio_media_id: string | undefined;
      if (audio_text?.trim()) {
        try {
          const audioRes = await fetch("/api/higgsfield/audio-prepare", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: audio_text }),
          });
          const audioData = await audioRes.json();
          if (audioRes.ok && audioData.media_id) {
            audio_media_id = audioData.media_id;
          }
        } catch { /* continue without audio */ }
      }

      const res  = await fetch("/api/higgsfield/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model, duration, aspect_ratio, image_url, audio_media_id }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `HTTP ${res.status}`);
        setState("error");
        if (dbId) updateInSupabase(dbId, { status: "failed" });
        return;
      }

      const higgsId = data.id;
      if (!higgsId) {
        setError(`API не вернул ID задачи: ${JSON.stringify(data).slice(0, 200)}`);
        setState("error");
        if (dbId) updateInSupabase(dbId, { status: "failed" });
        return;
      }

      if (dbId) updateInSupabase(dbId, { higgs_id: higgsId, status: "processing" });

      const storedJob: StoredJob = { higgsId, dbId, direction, startedAt: Date.now() };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(storedJob)); } catch {}

      setState("polling");
      setProgress(5);

      startStream(higgsId, dbId);
    } catch (e: any) {
      setError(e.message || "Ошибка сети");
      setState("error");
      if (dbIdRef.current) updateInSupabase(dbIdRef.current, { status: "failed" });
    }
  };

  const reset = () => {
    stopStream();
    localStorage.removeItem(STORAGE_KEY);
    setState("idle");
    setVideoUrl(null);
    setProgress(0);
    setError(null);
    setDebugInfo(null);
    dbIdRef.current = null;
  };

  return { state, videoUrl, progress, error, debugInfo, generate, reset };
}
