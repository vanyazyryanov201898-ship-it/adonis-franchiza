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
  const pollRef                   = useRef<ReturnType<typeof setInterval> | null>(null);
  const dbIdRef                   = useRef<string | null>(null);

  const stopPoll = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  useEffect(() => {
    return () => { stopPoll(); };
  }, []);

  // Auto-resume polling if there's an active job stored (user navigated away and came back)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const job: StoredJob = JSON.parse(stored);
      if (job.direction !== direction) return;
      const age = Date.now() - job.startedAt;
      if (age > 40 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      dbIdRef.current = job.dbId;
      setState("polling");
      setProgress(Math.min(5 + Math.floor(age / 4000) * 2, 88));
      startPolling(job.higgsId, job.dbId, job.startedAt);
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

  const startPolling = (higgsId: string, dbId: string | null, startedAt: number) => {
    stopPoll();

    const TIMEOUT_MS = 40 * 60 * 1000;
    let consecutiveErrors = 0;

    pollRef.current = setInterval(async () => {
      if (Date.now() - startedAt > TIMEOUT_MS) {
        stopPoll();
        localStorage.removeItem(STORAGE_KEY);
        setError("Время ожидания истекло (40 мин). Попробуйте ещё раз.");
        setState("error");
        if (dbIdRef.current) updateInSupabase(dbIdRef.current, { status: "failed" });
        return;
      }

      try {
        const sr = await fetch(`/api/higgsfield/status/${higgsId}`);
        const sd = await sr.json();

        // HTTP errors (4xx/5xx) from the status endpoint — count as consecutive errors
        if (!sr.ok) {
          consecutiveErrors++;
          setDebugInfo(`Статус-API ошибка HTTP ${sr.status}: ${sd.error || "unknown"}`);
          if (consecutiveErrors >= 5) {
            stopPoll();
            localStorage.removeItem(STORAGE_KEY);
            setError(`Ошибка опроса статуса (HTTP ${sr.status}): ${sd.error || "Проверьте ключ Higgsfield"}`);
            setState("error");
            if (dbIdRef.current) updateInSupabase(dbIdRef.current, { status: "failed" });
          }
          return;
        }

        consecutiveErrors = 0;

        if (sd.status === "completed") {
          stopPoll();
          localStorage.removeItem(STORAGE_KEY);
          const url = sd.url ?? null;
          setVideoUrl(url);
          setState("done");
          if (!url) {
            setDebugInfo(`Видео завершено, но URL не получен. Debug: ${JSON.stringify(sd._debug)}`);
          }
          if (dbId) updateInSupabase(dbId, {
            status: "completed",
            video_url: url,
            completed_at: new Date().toISOString(),
          });
        } else if (sd.status === "failed" || sd.status === "error" || sd.error) {
          stopPoll();
          localStorage.removeItem(STORAGE_KEY);
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
          localStorage.removeItem(STORAGE_KEY);
          setError("Потеряно соединение с сервером. Обновите страницу.");
          setState("error");
          if (dbIdRef.current) updateInSupabase(dbIdRef.current, { status: "failed" });
        }
      }
    }, 4000);
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

    stopPoll();
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
        setError(`API не вернул ID задачи: ${JSON.stringify(data).slice(0, 200)}`);
        setState("error");
        if (dbId) updateInSupabase(dbId, { status: "failed" });
        return;
      }

      if (dbId) updateInSupabase(dbId, { higgs_id: higgsId, status: "processing" });

      const startedAt = Date.now();
      const storedJob: StoredJob = { higgsId, dbId, direction, startedAt };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(storedJob)); } catch {}

      setState("polling");
      setProgress(5);

      startPolling(higgsId, dbId, startedAt);
    } catch (e: any) {
      setError(e.message || "Ошибка сети");
      setState("error");
      if (dbIdRef.current) updateInSupabase(dbIdRef.current, { status: "failed" });
    }
  };

  const reset = () => {
    stopPoll();
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
