"use client";

import { useRef, useState, useEffect } from "react";
import { getSupabase } from "@/lib/db/supabase";

export type VideoGenState = "idle" | "submitting" | "polling" | "done" | "error";

interface UseVideoGenOptions {
  direction: string;
  topic?: string;
}

export function useVideoGen({ direction, topic }: UseVideoGenOptions) {
  const [state, setState]       = useState<VideoGenState>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError]       = useState<string | null>(null);
  const pollRef                 = useRef<ReturnType<typeof setInterval> | null>(null);
  const dbIdRef                 = useRef<string | null>(null);

  // Clear interval on unmount to prevent leak and stale setState
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

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

  const stopPoll = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
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

    // If a previous poll is running, cancel it before starting a new generation
    stopPoll();

    setState("submitting");
    setError(null);
    setVideoUrl(null);
    setProgress(0);

    const dbId = await saveToSupabase({
      direction, topic: topic ?? null, prompt, model,
      duration_sec: duration, status: "queued",
    });
    dbIdRef.current = dbId;

    try {
      // If audio_text provided — prepare audio first, then generate with it
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
          // If audio fails — continue without it (no blocking)
        } catch { /* continue without audio */ }
      }

      const res = await fetch("/api/higgsfield/generate", {
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
        setError("API не вернул ID задачи. Попробуйте ещё раз.");
        setState("error");
        if (dbId) updateInSupabase(dbId, { status: "failed" });
        return;
      }

      if (dbId) updateInSupabase(dbId, { higgs_id: higgsId, status: "processing" });

      setState("polling");
      setProgress(5);

      let consecutiveErrors = 0;
      const startedAt = Date.now();
      const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes max

      pollRef.current = setInterval(async () => {
        // Global timeout — stop polling after 15 minutes
        if (Date.now() - startedAt > TIMEOUT_MS) {
          stopPoll();
          setError("Время ожидания истекло (15 мин). Попробуйте ещё раз.");
          setState("error");
          if (dbIdRef.current) updateInSupabase(dbIdRef.current, { status: "failed" });
          return;
        }

        try {
          const sr = await fetch(`/api/higgsfield/status/${higgsId}`);
          const sd = await sr.json();

          consecutiveErrors = 0;

          if (sd.status === "completed") {
            stopPoll();
            setVideoUrl(sd.url ?? null);
            setState("done");
            if (dbId) updateInSupabase(dbId, {
              status: "completed",
              video_url: sd.url ?? null,
              completed_at: new Date().toISOString(),
            });
          } else if (sd.status === "failed" || sd.error) {
            stopPoll();
            setError(sd.error || "Ошибка рендера на Higgsfield");
            setState("error");
            if (dbId) updateInSupabase(dbId, { status: "failed" });
          } else {
            setProgress((p) => Math.min(p + 2, 88));
          }
        } catch {
          consecutiveErrors++;
          if (consecutiveErrors >= 5) {
            stopPoll();
            setError("Потеряно соединение. Попробуйте обновить страницу.");
            setState("error");
            if (dbIdRef.current) updateInSupabase(dbIdRef.current, { status: "failed" });
          }
        }
      }, 4000);
    } catch (e: any) {
      setError(e.message || "Ошибка сети");
      setState("error");
      if (dbIdRef.current) updateInSupabase(dbIdRef.current, { status: "failed" });
    }
  };

  const reset = () => {
    stopPoll();
    setState("idle");
    setVideoUrl(null);
    setProgress(0);
    setError(null);
    dbIdRef.current = null;
  };

  return { state, videoUrl, progress, error, generate, reset };
}
