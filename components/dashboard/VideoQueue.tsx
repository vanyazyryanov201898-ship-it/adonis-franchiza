"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, CheckCircle2, Clock, Loader2, Video, Zap, XCircle, ExternalLink } from "lucide-react";
import { getSupabase } from "@/lib/db/supabase";
import { cn } from "@/lib/utils";

interface VideoRecord {
  id: string;
  direction: string;
  topic: string | null;
  prompt: string;
  model: string;
  duration_sec: number;
  status: "queued" | "processing" | "completed" | "failed";
  video_url: string | null;
  created_at: string;
  completed_at: string | null;
}

const directionLabel: Record<string, string> = {
  infographics: "Инфографика",
  cartoon: "Мультяшки",
  clips: "Клипы",
  posts: "Посты",
  carousels: "Карусели",
  "heygen-ai": "HeyGen AI",
  "heygen-live": "HeyGen Live",
};

const modelLabel: Record<string, string> = {
  kling3_0: "Kling 3.0",
  cinematic_studio_3_0: "Cinema Studio 3.0",
  grok_video: "Grok Imagine",
  wan2_7: "WAN 2.7",
  seedance_2_0: "Seedance 2.0",
};

export default function VideoQueue() {
  const [videos, setVideos]   = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    try {
      const sb = getSupabase();
      if (!sb) { setLoading(false); return; }
      const { data } = await sb
        .from("video_generations")
        .select("id,direction,topic,prompt,model,duration_sec,status,video_url,created_at,completed_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setVideos(data as VideoRecord[]);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVideos();
    // Auto-refresh every 15 sec to pick up status changes
    const interval = setInterval(fetchVideos, 15_000);
    return () => clearInterval(interval);
  }, [fetchVideos]);

  const hasProcessing = videos.some((v) => v.status === "processing" || v.status === "queued");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">История видео</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasProcessing && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />
              <span className="text-xs text-violet-400 font-medium">Рендер</span>
            </div>
          )}
          {!hasProcessing && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Zap className="w-3 h-3 text-violet-400" />
              <span className="text-xs text-violet-400 font-medium">Higgsfield AI</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Video className="w-8 h-8 text-slate-700 mb-2" />
          <p className="text-xs text-slate-500">Пока нет сгенерированных видео</p>
          <p className="text-[10px] text-slate-600 mt-1">Создай первое в разделе Factory</p>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video, index) => (
            <VideoRow key={video.id} video={video} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function VideoRow({ video, index }: { video: VideoRecord; index: number }) {
  const statusConfig = {
    queued:     { label: "В очереди", icon: Clock,         color: "text-slate-400",   spin: false },
    processing: { label: "Рендер",    icon: Loader2,       color: "text-violet-400",  spin: true  },
    completed:  { label: "Готово",    icon: CheckCircle2,  color: "text-emerald-400", spin: false },
    failed:     { label: "Ошибка",    icon: XCircle,       color: "text-red-400",     spin: false },
  };

  const config = statusConfig[video.status];
  const Icon   = config.icon;

  const title = video.topic || video.prompt.slice(0, 60) + (video.prompt.length > 60 ? "…" : "");
  const dir   = directionLabel[video.direction] || video.direction;
  const model = modelLabel[video.model] || video.model;

  // Time since creation
  const elapsed = (() => {
    const diff = (Date.now() - new Date(video.created_at).getTime()) / 1000;
    if (diff < 60)   return `${Math.round(diff)} сек назад`;
    if (diff < 3600) return `${Math.round(diff / 60)} мин назад`;
    return `${Math.round(diff / 3600)} ч назад`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + index * 0.06 }}
      className={cn(
        "group p-3 rounded-xl border transition-all duration-200",
        video.status === "processing"
          ? "border-violet-500/20 bg-violet-500/5"
          : video.status === "completed"
          ? "border-emerald-500/15 bg-emerald-500/5"
          : video.status === "failed"
          ? "border-red-500/10 bg-red-500/5"
          : "border-white/[0.05] bg-white/[0.02]"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail / play area */}
        <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 overflow-hidden">
          {video.status === "completed" && video.video_url ? (
            <a href={video.video_url} target="_blank" rel="noopener noreferrer"
              className="w-full h-full flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
              <Play className="w-4 h-4 text-emerald-400" fill="currentColor" />
            </a>
          ) : (
            <Video className="w-4 h-4 text-slate-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium text-white truncate leading-5">{title}</p>
            <div className={cn("flex items-center gap-1 flex-shrink-0", config.color)}>
              <Icon className={cn("w-3.5 h-3.5", config.spin && "animate-spin")} />
              <span className="text-[10px] font-medium">{config.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/15 text-violet-400">{dir}</span>
            <span className="text-[10px] text-slate-500">{model}</span>
            <span className="text-slate-600 text-[10px]">·</span>
            <span className="text-[10px] text-slate-500">{video.duration_sec} сек</span>
            <span className="text-slate-600 text-[10px]">·</span>
            <span className="text-[10px] text-slate-600">{elapsed}</span>
          </div>

          {/* Processing progress animation */}
          {video.status === "processing" && (
            <div className="mt-2">
              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                  animate={{ width: ["20%", "85%"] }}
                  transition={{ duration: 60, ease: "linear", repeat: Infinity }}
                />
              </div>
            </div>
          )}

          {/* Download link for completed */}
          {video.status === "completed" && video.video_url && (
            <a href={video.video_url} target="_blank" rel="noopener noreferrer"
              className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors">
              <ExternalLink className="w-3 h-3" />
              Скачать / открыть
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
