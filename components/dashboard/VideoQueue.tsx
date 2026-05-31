"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, CheckCircle2, Clock, Loader2, Video, Zap } from "lucide-react";
import { videoQueue } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const platformColors: Record<string, string> = {
  TikTok: "#fe2c55",
  Instagram: "#e91e8c",
  YouTube: "#ff4444",
  VK: "#0077ff",
  Telegram: "#26a5e4",
  Rutube: "#003087",
  Yappy: "#ff6600",
};

export default function VideoQueue() {
  const [progresses, setProgresses] = useState<Record<number, number>>(
    videoQueue.reduce((acc, v) => ({ ...acc, [v.id]: v.progress }), {})
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setProgresses((prev) => {
        const next = { ...prev };
        videoQueue.forEach((v) => {
          if (v.status === "rendering" && next[v.id] < 100) {
            next[v.id] = Math.min(next[v.id] + Math.random() * 2, 99);
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    rendering: { label: "Рендер", icon: Loader2, color: "text-violet-400", spin: true },
    queued: { label: "В очереди", icon: Clock, color: "text-slate-400", spin: false },
    completed: { label: "Готово", icon: CheckCircle2, color: "text-emerald-400", spin: false },
  };

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
          <h3 className="text-sm font-semibold text-white">Очередь рендера</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
            <Zap className="w-3 h-3 text-violet-400" />
            <span className="text-xs text-violet-400 font-medium">AI рендер</span>
          </div>
        </div>
      </div>

      {/* Video list */}
      <div className="space-y-3">
        {videoQueue.map((video, index) => {
          const config = statusConfig[video.status as keyof typeof statusConfig];
          const Icon = config.icon;
          const progress = progresses[video.id] || 0;

          return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.08 }}
              className={cn(
                "group p-3 rounded-xl border transition-all duration-200 cursor-pointer",
                video.status === "rendering"
                  ? "border-violet-500/20 bg-violet-500/5"
                  : video.status === "completed"
                  ? "border-emerald-500/15 bg-emerald-500/5 hover:bg-white/[0.03]"
                  : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Video thumbnail placeholder */}
                <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                  {video.status === "completed" ? (
                    <Play className="w-4 h-4 text-emerald-400" fill="currentColor" />
                  ) : (
                    <Video className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-white truncate leading-5">{video.title}</p>
                    <div className={cn("flex items-center gap-1 flex-shrink-0", config.color)}>
                      <Icon
                        className={cn("w-3.5 h-3.5", config.spin && "animate-spin")}
                      />
                      <span className="text-[10px] font-medium">{config.label}</span>
                    </div>
                  </div>

                  {/* Platforms & Meta */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center gap-1">
                      {video.platform.map((p) => (
                        <span
                          key={p}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                          style={{
                            color: platformColors[p],
                            backgroundColor: `${platformColors[p]}15`,
                          }}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                    <span className="text-slate-600 text-[10px]">·</span>
                    <span className="text-[10px] text-slate-500">{video.duration}</span>
                    <span className="text-slate-600 text-[10px]">·</span>
                    <span className="text-[10px] text-violet-400">Score: {video.viralScore}</span>
                  </div>

                  {/* Progress bar */}
                  {video.status === "rendering" && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500">{Math.round(progress)}%</span>
                        <span className="text-[10px] text-slate-500">{video.eta}</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 progress-glow"
                          style={{ width: `${progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
