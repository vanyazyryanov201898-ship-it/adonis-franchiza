"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Play, Loader2, CheckCircle2, Clock,
  Zap, Download, Eye, Film, Settings2,
  User, Bot, BarChart2, Palette, Layers,
  ArrowRight, X, FileText,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const directions = [
  {
    id: "heygen-live",
    href: "/video-factory/heygen-live",
    label: "HeyGen Живой",
    icon: User,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    gradFrom: "from-amber-600",
    gradTo: "to-orange-600",
    api: "HeyGen",
    description: "Реальный человек говорит в камеру — личные истории, кейсы, экспертные советы",
    hint: "Доверие · Личная подача · Живой язык",
    ready: true,
  },
  {
    id: "heygen-ai",
    href: "/video-factory/heygen-ai",
    label: "HeyGen AI Аватар",
    icon: Bot,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    gradFrom: "from-violet-600",
    gradTo: "to-purple-600",
    api: "HeyGen",
    description: "AI-персонаж с профессиональной подачей — экспертный контент, телесуфлёр",
    hint: "Авторитет · TTS-оптимизация · Полированный",
    ready: true,
  },
  {
    id: "infographic",
    href: "/infographics",
    label: "Инфографика",
    icon: BarChart2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    gradFrom: "from-cyan-600",
    gradTo: "to-teal-600",
    api: "Creatomate",
    description: "Данные, цифры и истории в движении — история DTF, рынок мерча, статистика",
    hint: "Факты · Данные · Образование",
    ready: true,
    badge: "Уже готов",
  },
  {
    id: "cartoon",
    href: "/video-factory/cartoon",
    label: "Мультяшки",
    icon: Palette,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/30",
    gradFrom: "from-pink-600",
    gradTo: "to-rose-600",
    api: "Kling 2.0",
    description: "Кот Адонис — стендап, скетчи, обучалки с юмором про мерч-бизнес",
    hint: "Охваты · Виральность · Развлечение",
    ready: true,
  },
  {
    id: "montage",
    href: "/video-factory/montage",
    label: "Нарезка / Монтаж",
    icon: Layers,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    gradFrom: "from-blue-600",
    gradTo: "to-cyan-600",
    api: "Pexels",
    description: "Монтажный бриф из готового материала — текстовые оверлеи вместо закадра",
    hint: "Нарезка · Рилс · Шортс",
    ready: true,
  },
];

const platformColors: Record<string, string> = {
  TikTok: "#fe2c55", Instagram: "#e91e8c", YouTube: "#ff4444",
  VK: "#0077ff", Telegram: "#26a5e4", Rutube: "#003087", Yappy: "#ff6600",
};

type VideoStatus = "rendering" | "queued" | "completed" | "processing";

interface VideoItem {
  id: number;
  title: string;
  status: VideoStatus;
  progress: number;
  duration: string;
  platform: string[];
  viralScore: number;
  eta: string;
  views?: number;
  type?: string;
}

const statusConfig: Record<VideoStatus, { label: string; color: string; bg: string }> = {
  rendering:  { label: "Рендер",    color: "text-violet-400", bg: "bg-violet-400/10" },
  queued:     { label: "В очереди", color: "text-slate-400",  bg: "bg-slate-400/10"  },
  completed:  { label: "Готово",    color: "text-emerald-400",bg: "bg-emerald-400/10"},
  processing: { label: "Обработка", color: "text-blue-400",   bg: "bg-blue-400/10"  },
};

const initialVideos: VideoItem[] = [
  { id: 1, title: "Как открыть франшизу ADONIS за 30 дней",   status: "rendering", progress: 73, duration: "0:47", platform: ["TikTok","Instagram"], viralScore: 91, eta: "2 мин",   type: "heygen-ai" },
  { id: 2, title: "Доход партнёра ADONIS — реальные цифры",   status: "rendering", progress: 45, duration: "1:12", platform: ["YouTube","TikTok"],   viralScore: 89, eta: "5 мин",   type: "infographic" },
  { id: 3, title: "Производство мерча с нуля",                status: "queued",    progress: 0,  duration: "0:58", platform: ["Instagram"],           viralScore: 87, eta: "12 мин",  type: "montage" },
  { id: 4, title: "Почему уходят из найма в производство",    status: "completed", progress: 100,duration: "0:52", platform: ["TikTok","VK"],         viralScore: 94, eta: "Готово",  type: "heygen-live", views: 128000 },
  { id: 5, title: "Франшиза vs свой бренд — честный разбор",  status: "completed", progress: 100,duration: "1:04", platform: ["Instagram","YouTube"], viralScore: 88, eta: "Готово",  type: "cartoon",     views: 89000 },
  { id: 6, title: "Бизнес с нуля за 3 месяца — мой путь",    status: "completed", progress: 100,duration: "0:55", platform: ["TikTok"],               viralScore: 92, eta: "Готово",  type: "infographic", views: 234000 },
];

interface QueueItem {
  id: number;
  title: string;
  direction: string;
  platforms: string[];
  script?: string;
  status: VideoStatus;
  progress: number;
  viralScore: number;
  duration: string;
  addedAt: number;
}

export default function VideoFactoryPage() {
  const [userQueue, setUserQueue] = useState<VideoItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [scriptModal, setScriptModal] = useState<{ title: string; script: string } | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Load user queue from localStorage
  useEffect(() => {
    try {
      const stored: QueueItem[] = JSON.parse(localStorage.getItem("adonis_queue") || "[]");
      setUserQueue(stored.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        progress: item.progress,
        duration: item.duration,
        platform: item.platforms || ["TikTok"],
        viralScore: item.viralScore,
        eta: item.status === "queued" ? "Скоро" : item.status === "rendering" ? "~2 мин" : "Готово",
        type: item.direction,
        script: item.script,
      })));
    } catch {}
  }, []);

  // Simulate progress for user queue items
  useEffect(() => {
    const interval = setInterval(() => {
      setUserQueue((prev) => {
        let changed = false;
        const updated = prev.map((v) => {
          if (v.status === "queued") {
            changed = true;
            return { ...v, status: "rendering" as VideoStatus, progress: 2, eta: "~2 мин" };
          }
          if (v.status === "rendering" && v.progress < 100) {
            changed = true;
            const np = Math.min(v.progress + Math.random() * 4 + 1, 100);
            if (np >= 100) return { ...v, status: "completed" as VideoStatus, progress: 100, eta: "Готово" };
            return { ...v, progress: np };
          }
          return v;
        });
        if (changed) {
          try {
            const stored: QueueItem[] = JSON.parse(localStorage.getItem("adonis_queue") || "[]");
            const persisted = stored.map((s) => {
              const match = updated.find((u) => u.id === s.id);
              return match ? { ...s, status: match.status, progress: match.progress } : s;
            });
            localStorage.setItem("adonis_queue", JSON.stringify(persisted));
          } catch {}
        }
        return updated;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Demo videos still animate
  const [demoAnimated, setDemoAnimated] = useState<VideoItem[]>(initialVideos);
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoAnimated((prev) =>
        prev.map((v) => {
          if (v.status === "rendering" && v.progress < 99) {
            return { ...v, progress: Math.min(v.progress + Math.random() * 2, 99) };
          }
          return v;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const allVideos = [...userQueue, ...demoAnimated];
  const totalRendering = allVideos.filter((v) => v.status === "rendering").length;
  const totalCompleted = allVideos.filter((v) => v.status === "completed").length;

  return (
    <AppLayout title="Контент-завод" subtitle="Выбери направление и создай сценарий">
      <div className="p-6 space-y-6">

        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-sm text-emerald-300 shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── 5 направлений ───────────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Выбери направление</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {directions.map((dir, i) => {
              const Icon = dir.icon;
              return (
                <motion.div
                  key={dir.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={dir.href}>
                    <motion.div
                      whileHover={{ scale: 1.015, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex flex-col gap-3 p-5 rounded-2xl border cursor-pointer transition-all group ${dir.bg} ${dir.border} hover:border-opacity-60`}
                    >
                      {dir.badge && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                          {dir.badge}
                        </span>
                      )}

                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dir.bg} border ${dir.border}`}>
                          <Icon className={`w-5 h-5 ${dir.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{dir.label}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/[0.05] ${dir.color}`}>{dir.api}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{dir.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-medium ${dir.color} opacity-70`}>{dir.hint}</span>
                        <span className={`flex items-center gap-1 text-xs font-semibold ${dir.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                          Открыть <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── Статистика очереди ───────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Очередь рендера</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-[10px] font-semibold text-amber-400">ДЕМО</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: "В рендере",  value: totalRendering,                                               icon: Loader2,      color: "text-violet-400", spin: true },
              { label: "Готово",     value: totalCompleted,                                               icon: CheckCircle2, color: "text-emerald-400" },
              { label: "В очереди",  value: allVideos.filter(v => v.status === "queued").length,          icon: Clock,        color: "text-slate-400" },
              { label: "Всего",      value: allVideos.length,                                             icon: Film,         color: "text-blue-400" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center">
                  <stat.icon className={`w-4 h-4 ${stat.color} ${(stat as any).spin ? "animate-spin" : ""}`} />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="text-[11px] text-slate-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Queue list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-violet-400" />
                Очередь роликов
              </h3>
              <button
                onClick={() => showToast("Настройки рендера будут доступны в следующем обновлении")}
                className="text-xs text-slate-500 hover:text-violet-400 transition-colors flex items-center gap-1"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Настройки рендера
              </button>
            </div>

            {allVideos.map((video: VideoItem, index: number) => {
              const config = statusConfig[video.status];
              const isRendering = video.status === "rendering";
              const dirInfo = directions.find((d) => d.id === video.type);
              const TypeIcon = dirInfo?.icon;

              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                    isRendering
                      ? "border-violet-500/25 bg-violet-500/5"
                      : video.status === "completed"
                      ? "border-emerald-500/15 bg-emerald-500/[0.03] hover:border-emerald-500/25"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-9 rounded-xl bg-gradient-to-br from-violet-900/40 to-blue-900/40 border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                      {video.status === "completed" ? (
                        <Play className="w-3.5 h-3.5 text-white/70" fill="currentColor" />
                      ) : isRendering ? (
                        <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-sm font-medium text-white truncate">{video.title}</p>
                        <div className={`flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.color}`}>
                          {isRendering && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                          {video.status === "completed" && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {video.status === "queued" && <Clock className="w-2.5 h-2.5" />}
                          {config.label}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        {dirInfo && TypeIcon && (
                          <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${dirInfo.bg} ${dirInfo.color}`}>
                            <TypeIcon className="w-2.5 h-2.5" />
                            {dirInfo.label}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">{video.duration}</span>
                        <div className="flex gap-1">
                          {video.platform.map((p) => (
                            <span key={p} className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                              style={{ color: platformColors[p], backgroundColor: `${platformColors[p]}15` }}>
                              {p}
                            </span>
                          ))}
                        </div>
                        <span className="text-[11px] text-violet-400">Score: {video.viralScore}</span>
                        {video.views && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Eye className="w-2.5 h-2.5" />
                            {(video.views / 1000).toFixed(0)}K
                          </span>
                        )}
                      </div>

                      {isRendering && (
                        <div>
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-slate-500">Рендер: {Math.round(video.progress)}%</span>
                            <span className="text-slate-500">ETA: {video.eta}</span>
                          </div>
                          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                              style={{ width: `${video.progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      )}

                      {video.status === "completed" && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(video as any).script && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); setScriptModal({ title: video.title, script: (video as any).script }); }}
                                className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300">
                                <FileText className="w-2.5 h-2.5" /> Сценарий
                              </button>
                              <span className="text-slate-700">·</span>
                            </>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); showToast("Видео скачивается..."); }}
                            className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300">
                            <Download className="w-2.5 h-2.5" /> Скачать
                          </button>
                          <span className="text-slate-700">·</span>
                          <button onClick={(e) => { e.stopPropagation(); showToast("Ролик отправлен в автопостинг!"); }}
                            className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300">
                            <Zap className="w-2.5 h-2.5" /> Опубликовать
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Script modal */}
      <AnimatePresence>
        {scriptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setScriptModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[80vh] rounded-2xl border border-white/[0.10] overflow-hidden"
              style={{ background: "var(--bg-secondary)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold text-white truncate max-w-xs">{scriptModal.title}</span>
                </div>
                <button onClick={() => setScriptModal(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 overflow-y-auto max-h-[60vh]">
                <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed">
                  {scriptModal.script}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
