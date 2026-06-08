"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, CheckCircle2, Clock, Loader2, Video, Zap, XCircle,
  Download, Maximize2, ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react";
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
  infographics:  "Инфографика",
  cartoon:       "Мультяшки",
  clips:         "Клипы",
  posts:         "Посты",
  carousels:     "Карусели",
  "heygen-ai":   "HeyGen AI",
  "heygen-live": "HeyGen Live",
};

const modelLabel: Record<string, string> = {
  kling3_0:            "Kling 3.0",
  cinematic_studio_3_0:"Cinema Studio 3.0",
  grok_video:          "Grok Imagine",
  wan2_7:              "WAN 2.7",
  wan2_1:              "WAN 2.1",
  seedance_2_0:        "Seedance 2.0",
  "dop-turbo":         "DOP Turbo",
};

export default function VideoQueue() {
  const [videos, setVideos]   = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    try {
      const res  = await fetch("/api/videos");
      const json = await res.json();
      if (json.videos) setVideos(json.videos as VideoRecord[]);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch("/api/higgsfield/recover").catch(() => {});
    fetchVideos();
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
          {videos.length > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/[0.06] text-slate-400">
              {videos.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasProcessing ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />
              <span className="text-xs text-violet-400 font-medium">Рендер</span>
            </div>
          ) : (
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
        <div className="space-y-2">
          {videos.map((video, index) => (
            <VideoRow key={video.id} video={video} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function VideoRow({ video, index }: { video: VideoRecord; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    queued:     { label: "В очереди", icon: Clock,        color: "text-slate-400",   spin: false },
    processing: { label: "Рендер",    icon: Loader2,      color: "text-violet-400",  spin: true  },
    completed:  { label: "Готово",    icon: CheckCircle2, color: "text-emerald-400", spin: false },
    failed:     { label: "Ошибка",    icon: XCircle,      color: "text-red-400",     spin: false },
  };

  const config = statusConfig[video.status];
  const Icon   = config.icon;

  const title    = video.topic || video.prompt.slice(0, 55) + (video.prompt.length > 55 ? "…" : "");
  const dir      = directionLabel[video.direction]  || video.direction;
  const model    = modelLabel[video.model]           || video.model;
  const canPlay  = video.status === "completed" && !!video.video_url;

  const elapsed = (() => {
    const diff = (Date.now() - new Date(video.created_at).getTime()) / 1000;
    if (diff < 60)   return `${Math.round(diff)} сек назад`;
    if (diff < 3600) return `${Math.round(diff / 60)} мин назад`;
    return `${Math.round(diff / 3600)} ч назад`;
  })();

  const downloadUrl = video.video_url
    ? `/api/download?url=${encodeURIComponent(video.video_url)}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + index * 0.05 }}
      className={cn(
        "rounded-xl border transition-all duration-200 overflow-hidden",
        video.status === "processing" ? "border-violet-500/20 bg-violet-500/5"
        : video.status === "completed" ? "border-emerald-500/15 bg-emerald-500/5"
        : video.status === "failed"    ? "border-red-500/10 bg-red-500/5"
        : "border-white/[0.05] bg-white/[0.02]"
      )}
    >
      {/* Row header */}
      <div
        className={cn("flex items-start gap-3 p-3", canPlay && "cursor-pointer")}
        onClick={() => canPlay && setExpanded((e) => !e)}
      >
        {/* Thumbnail / play icon */}
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          canPlay ? "bg-emerald-500/15 hover:bg-emerald-500/25 transition-colors" : "bg-white/[0.06]"
        )}>
          {canPlay ? (
            expanded
              ? <ChevronUp  className="w-4 h-4 text-emerald-400" />
              : <Play className="w-4 h-4 text-emerald-400" fill="currentColor" />
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

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/15 text-violet-400">{dir}</span>
            <span className="text-[10px] text-slate-500">{model}</span>
            <span className="text-slate-600 text-[10px]">·</span>
            <span className="text-[10px] text-slate-500">{video.duration_sec} сек</span>
            <span className="text-slate-600 text-[10px]">·</span>
            <span className="text-[10px] text-slate-600">{elapsed}</span>
          </div>

          {/* Processing bar */}
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

          {/* Quick action buttons for completed */}
          {canPlay && !expanded && (
            <div className="flex items-center gap-3 mt-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
                className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Play className="w-3 h-3" fill="currentColor" />
                Смотреть
              </button>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Скачать
                </a>
              )}
              <a
                href={video.video_url!}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-400 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Открыть
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Inline video player */}
      <AnimatePresence>
        {expanded && canPlay && video.video_url && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-white/[0.05] overflow-hidden"
          >
            <div className="p-3 pt-0 mt-3">
              <div className="relative rounded-xl overflow-hidden bg-black/40 flex items-center justify-center"
                   style={{ maxHeight: 360 }}>
                <video
                  src={video.video_url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full rounded-xl"
                  style={{ maxHeight: 360, objectFit: "contain" }}
                />
              </div>

              {/* Download bar */}
              <div className="flex items-center gap-2 mt-2.5">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/20 text-xs text-blue-400 hover:bg-blue-500/25 transition-colors font-medium"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Скачать MP4
                  </a>
                )}
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  На весь экран
                </a>
                <button
                  onClick={() => setExpanded(false)}
                  className="ml-auto text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
                >
                  Свернуть
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
