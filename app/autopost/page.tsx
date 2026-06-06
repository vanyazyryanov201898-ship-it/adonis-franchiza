"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, Send,
  Check, Trash2, CalendarDays, LayoutGrid, Star, TrendingUp,
  Zap, BarChart2, RefreshCw, PlayCircle,
} from "lucide-react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isToday, isSameMonth,
  addMonths, subMonths, addDays, isSameDay,
} from "date-fns";
import { ru } from "date-fns/locale";
import AppLayout from "@/components/layout/AppLayout";
import { PLATFORMS } from "@/lib/data/platforms";
import { getBestTimes, getHourPerformance, getTimeLabel, PLATFORM_BEST_TIMES } from "@/lib/data/best-times";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CalendarPost = {
  id: string;
  directionId: string;
  platformId: string;
  topic: string;
  scheduledDate: string;  // YYYY-MM-DD
  scheduledTime: string;  // HH:MM
  viralScore?: number;
  status: "draft" | "scheduled" | "published";
  views?: number;
};

const STORAGE_KEY = "adonis_calendar_v1";

const DIRECTIONS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "heygen-live":  { label: "HeyGen Живой",  color: "#f59e0b", bg: "bg-amber-500/20",  border: "border-amber-500/40" },
  "heygen-ai":    { label: "HeyGen AI",      color: "#8b5cf6", bg: "bg-violet-500/20", border: "border-violet-500/40" },
  "infographics": { label: "Инфографика",    color: "#06b6d4", bg: "bg-cyan-500/20",   border: "border-cyan-500/40" },
  "cartoon":      { label: "Мультяшки",      color: "#ec4899", bg: "bg-pink-500/20",   border: "border-pink-500/40" },
  "clips":        { label: "Нарезка",        color: "#3b82f6", bg: "bg-blue-500/20",   border: "border-blue-500/40" },
};

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6..23

function genId() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function pad(n: number) { return String(n).padStart(2, "0"); }

// ─── Storage ──────────────────────────────────────────────────────────────────

function loadPosts(): CalendarPost[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function savePosts(posts: CalendarPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function seedPosts(base: Date): CalendarPost[] {
  const dirIds = Object.keys(DIRECTIONS);
  const topics = [
    "Окупился за 4.5 месяца — показываю цифры",
    "Wildberries без товара — как это работает",
    "31 млн выручки на студии брендирования",
    "Бизнес из дома на печати: мой доход 300К",
    "Кейс Сергея из Ставрополя: 10 млн за год",
    "Рынок мерча 2024: цифры и тренды",
    "Спартанец объясняет DTF печать за 60 сек",
    "Почему мерч не умрёт никогда",
    "3 причины уйти из найма прямо сейчас",
    "Как открыть студию за 14 дней",
    "Кейс: партнёр из Ростова заработал 16 млн",
    "Франшиза vs бизнес с нуля — честно",
  ];
  const bestTimes: Record<string, string[]> = {
    tiktok: ["17:00", "20:00"], instagram: ["18:00", "21:00"],
    youtube: ["19:00", "17:00"], telegram: ["19:00", "12:00"], vk: ["20:00"],
  };
  const platformIds = ["tiktok", "instagram", "youtube", "telegram", "vk"];
  const posts: CalendarPost[] = [];
  for (let i = 0; i < 12; i++) {
    const date = addDays(base, i - 3);
    const pid = platformIds[i % platformIds.length];
    const times = bestTimes[pid] ?? ["19:00"];
    posts.push({
      id: genId(),
      directionId: dirIds[i % dirIds.length],
      platformId: pid,
      topic: topics[i % topics.length],
      scheduledDate: format(date, "yyyy-MM-dd"),
      scheduledTime: times[i % times.length],
      viralScore: Math.floor(Math.random() * 15) + 82,
      status: date < base ? "published" : i % 4 === 0 ? "draft" : "scheduled",
      views: date < base ? Math.floor(Math.random() * 80000) + 5000 : undefined,
    });
  }
  return posts;
}

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({
  post, onDragStart, onClick, compact,
}: {
  post: CalendarPost;
  onDragStart: (id: string) => void;
  onClick: (post: CalendarPost) => void;
  compact?: boolean;
}) {
  const dir = DIRECTIONS[post.directionId];
  const platform = PLATFORMS.find((p) => p.id === post.platformId);
  const perf = getHourPerformance(post.scheduledTime);
  const isGood = perf >= 1.5;

  return (
    <div
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(post.id); }}
      onClick={(e) => { e.stopPropagation(); onClick(post); }}
      className={cn(
        "rounded-lg border cursor-grab active:cursor-grabbing select-none transition-all hover:scale-[1.02] hover:shadow-lg",
        compact ? "px-1.5 py-1" : "px-2 py-1.5",
        dir?.border ?? "border-white/20",
        dir?.bg ?? "bg-white/10",
        post.status === "published" && "opacity-60"
      )}
    >
      <div className="flex items-center gap-1 min-w-0">
        {platform && (
          <span className="text-[8px] font-black w-4 h-4 rounded flex-shrink-0 flex items-center justify-center"
            style={{ backgroundColor: platform.bgColor, color: platform.color }}>
            {platform.shortLabel}
          </span>
        )}
        <span className={cn("font-medium truncate flex-1", compact ? "text-[9px]" : "text-[10px]")}
          style={{ color: dir?.color ?? "#94a3b8" }}>
          {post.topic}
        </span>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {isGood && !compact && <Star className="w-2.5 h-2.5 text-amber-400" />}
          <span className="text-[9px] text-slate-500">{post.scheduledTime}</span>
        </div>
      </div>
      {post.status === "published" && post.views && !compact && (
        <div className="text-[9px] text-emerald-400 mt-0.5">{(post.views / 1000).toFixed(0)}K просмотров</div>
      )}
    </div>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditModal({
  post, onSave, onDelete, onClose,
}: {
  post: CalendarPost;
  onSave: (p: CalendarPost) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [topic, setTopic]           = useState(post.topic);
  const [date, setDate]             = useState(post.scheduledDate);
  const [time, setTime]             = useState(post.scheduledTime);
  const [platformId, setPlatformId] = useState(post.platformId);
  const [directionId, setDirectionId] = useState(post.directionId);
  const [status, setStatus]         = useState(post.status);

  const dir = DIRECTIONS[directionId];
  const perf = getHourPerformance(time);
  const timeInfo = getTimeLabel(perf);
  const bestTimes = getBestTimes(platformId).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border bg-[#0d0d1a] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        style={{ borderColor: (dir?.color ?? "#8b5cf6") + "40" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dir?.color ?? "#8b5cf6" }} />
            <span className="text-sm font-semibold text-white">{dir?.label ?? "Пост"}</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>

        {/* Topic */}
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Тема</label>
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={2}
            className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:border-violet-500/40 transition-colors resize-none" />
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Дата</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:border-violet-500/40 transition-colors" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 flex items-center gap-1 block">
              <Clock className="w-3 h-3" /> Время
            </label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:border-violet-500/40 transition-colors" />
          </div>
        </div>

        {/* Time quality indicator */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs",
          perf >= 1.7 ? "bg-emerald-900/20 border-emerald-500/25" :
          perf >= 1.2 ? "bg-cyan-900/15 border-cyan-500/20" :
          "bg-white/[0.03] border-white/[0.07]"
        )}>
          <Zap className={cn("w-3.5 h-3.5 flex-shrink-0", timeInfo.color)} />
          <span className={timeInfo.color}>{timeInfo.label}</span>
          <span className="text-slate-500 ml-auto">x{perf.toFixed(1)} охват</span>
        </div>

        {/* Best time recommendations */}
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Лучшее время для {PLATFORMS.find(p=>p.id===platformId)?.label ?? platformId}:</p>
          <div className="flex flex-wrap gap-1.5">
            {bestTimes.map((slot) => (
              <button key={slot.time} onClick={() => setTime(slot.time)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-all",
                  time === slot.time
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.18]"
                )}>
                {Array(slot.score).fill("★").join("")}
                <span>{slot.time}</span>
                <span className="text-slate-600">— {slot.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">Платформа</label>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORMS.map((p) => (
              <button key={p.id} onClick={() => setPlatformId(p.id)}
                className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",
                  platformId === p.id ? "text-white border-transparent" : "bg-white/[0.03] text-slate-500 border-white/[0.06] hover:text-slate-300")}
                style={platformId === p.id ? { backgroundColor: p.bgColor, borderColor: p.color + "60" } : {}}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Direction */}
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">Направление</label>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(DIRECTIONS).map(([id, d]) => (
              <button key={id} onClick={() => setDirectionId(id)}
                className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",
                  directionId === id ? "text-white" : "bg-white/[0.03] text-slate-500 border-white/[0.06] hover:text-slate-300")}
                style={directionId === id ? { backgroundColor: d.color + "25", borderColor: d.color + "60", color: d.color } : {}}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Published analytics */}
        {post.status === "published" && post.views && (
          <div className="p-3 rounded-xl bg-emerald-900/15 border border-emerald-500/20 space-y-1">
            <p className="text-xs font-semibold text-emerald-400">Результат публикации</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><div className="text-sm font-bold text-white">{(post.views / 1000).toFixed(0)}K</div><div className="text-[10px] text-slate-500">просмотров</div></div>
              <div><div className="text-sm font-bold text-white">{post.viralScore ?? "—"}%</div><div className="text-[10px] text-slate-500">вирусность</div></div>
              <div><div className={cn("text-sm font-bold", getTimeLabel(getHourPerformance(post.scheduledTime)).color)}>x{getHourPerformance(post.scheduledTime).toFixed(1)}</div><div className="text-[10px] text-slate-500">время</div></div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex gap-2">
          {(["draft", "scheduled", "published"] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={cn("flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all",
                status === s
                  ? s === "published" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : s === "scheduled" ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                    : "bg-white/[0.08] border-white/[0.15] text-white"
                  : "bg-white/[0.03] border-white/[0.06] text-slate-500 hover:text-slate-300")}>
              {s === "draft" ? "Черновик" : s === "scheduled" ? "Запланирован" : "Опубликован"}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button onClick={() => onSave({ ...post, topic, scheduledDate: date, scheduledTime: time, platformId, directionId, status })}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600/80 hover:bg-violet-600 text-white text-sm font-semibold transition-colors">
            <Check className="w-4 h-4" /> Сохранить
          </button>
          <button onClick={() => onDelete(post.id)}
            className="px-4 py-2.5 rounded-xl border border-red-500/25 text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Analytics panel ──────────────────────────────────────────────────────────

function AnalyticsPanel({ posts }: { posts: CalendarPost[] }) {
  const published = posts.filter((p) => p.status === "published" && p.views);
  if (published.length === 0) return null;

  // Best hour by avg views
  const byHour: Record<number, number[]> = {};
  published.forEach((p) => {
    const h = parseInt(p.scheduledTime.split(":")[0]);
    if (!byHour[h]) byHour[h] = [];
    byHour[h].push(p.views!);
  });
  const hourStats = Object.entries(byHour).map(([h, views]) => ({
    hour: parseInt(h),
    avg: Math.round(views.reduce((a, b) => a + b, 0) / views.length),
  })).sort((a, b) => b.avg - a.avg);

  const bestHour = hourStats[0];
  const totalViews = published.reduce((a, p) => a + (p.views ?? 0), 0);

  // Best direction
  const byDir: Record<string, number[]> = {};
  published.forEach((p) => {
    if (!byDir[p.directionId]) byDir[p.directionId] = [];
    byDir[p.directionId].push(p.views!);
  });
  const bestDir = Object.entries(byDir)
    .map(([id, views]) => ({ id, avg: views.reduce((a,b)=>a+b,0)/views.length }))
    .sort((a,b) => b.avg - a.avg)[0];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-900/15 to-blue-900/10 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-white">Аналитика публикаций</h3>
        <span className="text-[10px] text-slate-500 ml-auto">{published.length} видео проанализировано</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.07] text-center">
          <div className="text-base font-bold text-white">{(totalViews / 1000).toFixed(0)}K</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Всего просмотров</div>
        </div>
        {bestHour && (
          <div className="p-3 rounded-xl bg-emerald-900/20 border border-emerald-500/25 text-center">
            <div className="text-base font-bold text-emerald-400">{pad(bestHour.hour)}:00</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Лучший час</div>
            <div className="text-[10px] text-emerald-500">{(bestHour.avg/1000).toFixed(0)}K avg</div>
          </div>
        )}
        {bestDir && (
          <div className="p-3 rounded-xl text-center"
            style={{ backgroundColor: (DIRECTIONS[bestDir.id]?.color ?? "#8b5cf6") + "15",
                     borderWidth: 1, borderStyle: "solid",
                     borderColor: (DIRECTIONS[bestDir.id]?.color ?? "#8b5cf6") + "30" }}>
            <div className="text-base font-bold" style={{ color: DIRECTIONS[bestDir.id]?.color ?? "#fff" }}>
              {DIRECTIONS[bestDir.id]?.label.split(" ")[0] ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Лучшее направление</div>
          </div>
        )}
      </div>

      {/* Hour chart */}
      {hourStats.length > 0 && (
        <div>
          <p className="text-[10px] text-slate-500 mb-2">Просмотры по времени публикации:</p>
          <div className="flex items-end gap-1 h-12">
            {HOURS.filter(h => byHour[h]).map((h) => {
              const avg = byHour[h] ? byHour[h].reduce((a,b)=>a+b,0)/byHour[h].length : 0;
              const max = Math.max(...hourStats.map(s=>s.avg));
              const heightPct = max > 0 ? (avg / max) * 100 : 0;
              const isBest = bestHour?.hour === h;
              return (
                <div key={h} className="flex flex-col items-center gap-0.5 flex-1">
                  <div className={cn("w-full rounded-sm transition-all", isBest ? "bg-emerald-400" : "bg-violet-500/40")}
                    style={{ height: `${heightPct}%` }} />
                  <span className="text-[8px] text-slate-600">{h}</span>
                </div>
              );
            })}
          </div>
          {bestHour && (
            <p className="text-xs text-emerald-400 mt-2">
              💡 Рекомендуем публиковать в <strong>{pad(bestHour.hour)}:00</strong> — в среднем {(bestHour.avg/1000).toFixed(0)}K просмотров
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ViewMode = "month" | "week";

export default function AutopostPage() {
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [posts, setPosts]               = useState<CalendarPost[]>([]);
  const [viewMode, setViewMode]         = useState<ViewMode>("week");
  const [dragId, setDragId]             = useState<string | null>(null);
  const [dropTarget, setDropTarget]     = useState<string | null>(null); // "YYYY-MM-DD|HH:MM"
  const [editPost, setEditPost]         = useState<CalendarPost | null>(null);
  const [runState, setRunState]         = useState<"idle" | "running" | "done" | "error">("idle");
  const [runResult, setRunResult]       = useState<{ published: number; failed: number } | null>(null);
  const weekScrollRef                   = useRef<HTMLDivElement>(null);

  const handleRunAutopost = async () => {
    setRunState("running");
    setRunResult(null);
    try {
      const res = await fetch("/api/autopost/run", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setRunResult({ published: data.published ?? 0, failed: data.failed?.length ?? 0 });
      setRunState("done");
      // Обновляем статус опубликованных постов в localStorage
      if ((data.published ?? 0) > 0) {
        const stored = loadPosts();
        savePosts(stored); // триггерим перечитку (в реальности статус придёт из Supabase)
      }
      setTimeout(() => setRunState("idle"), 5000);
    } catch (err: any) {
      setRunResult({ published: 0, failed: 1 });
      setRunState("error");
      setTimeout(() => setRunState("idle"), 5000);
    }
  };

  useEffect(() => {
    const stored = loadPosts();
    if (stored.length === 0) {
      const seeded = seedPosts(new Date());
      savePosts(seeded);
      setPosts(seeded);
    } else {
      setPosts(stored);
    }
  }, []);

  // Scroll week view to 8:00 on mount
  useEffect(() => {
    if (viewMode === "week" && weekScrollRef.current) {
      weekScrollRef.current.scrollTop = 2 * 56; // 2 hours offset (start at 8:00)
    }
  }, [viewMode]);

  const save = useCallback((updated: CalendarPost[]) => {
    setPosts(updated);
    savePosts(updated);
  }, []);

  const handleSaveEdit = (updated: CalendarPost) => {
    save(posts.map((p) => (p.id === updated.id ? updated : p)));
    setEditPost(null);
  };

  const handleDelete = (id: string) => {
    save(posts.filter((p) => p.id !== id));
    setEditPost(null);
  };

  const handleAddPost = (dateStr: string, timeStr = "12:00") => {
    const np: CalendarPost = {
      id: genId(), directionId: "infographics", platformId: "tiktok",
      topic: "Новый пост", scheduledDate: dateStr, scheduledTime: timeStr, status: "draft",
    };
    save([...posts, np]);
    setEditPost(np);
  };

  const handleDrop = (key: string) => {
    if (!dragId) return;
    const [dateStr, timeStr] = key.split("|");
    save(posts.map((p) => p.id === dragId ? { ...p, scheduledDate: dateStr, scheduledTime: timeStr ?? p.scheduledTime } : p));
    setDragId(null);
    setDropTarget(null);
  };

  // Calendar helpers
  const monthStart = startOfMonth(currentDate);
  const monthEnd   = endOfMonth(currentDate);
  const calDays    = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end:   endOfWeek(monthEnd, { weekStartsOn: 1 }),
  });
  const weekStart  = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays   = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });

  const getPostsForDay = (day: Date) =>
    posts.filter((p) => p.scheduledDate === format(day, "yyyy-MM-dd"))
         .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const getPostsAtSlot = (day: Date, hour: number) =>
    posts.filter((p) => {
      if (p.scheduledDate !== format(day, "yyyy-MM-dd")) return false;
      const h = parseInt(p.scheduledTime.split(":")[0]);
      return h === hour;
    });

  const totalScheduled  = posts.filter((p) => p.status === "scheduled").length;
  const totalPublished  = posts.filter((p) => p.status === "published").length;
  const totalPlatforms  = new Set(posts.map((p) => p.platformId)).size;

  const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <AppLayout title="Автопостинг" subtitle="Единый календарь — все направления, все платформы">
      <div className="p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Запланировано", value: totalScheduled, color: "text-violet-400" },
            { label: "Опубликовано",  value: totalPublished, color: "text-emerald-400" },
            { label: "Платформ",      value: totalPlatforms, color: "text-cyan-400" },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Run autopost button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAutopost}
            disabled={runState === "running"}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-sm font-semibold transition-all",
              runState === "done"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : runState === "error"
                ? "border-red-500/30 bg-red-500/5 text-red-400"
                : "border-violet-500/30 bg-violet-500/10 text-white hover:bg-violet-500/20"
            )}
          >
            {runState === "running" ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw className="w-4 h-4" /></motion.div>Проверяю расписание...</>
            ) : runState === "done" ? (
              <><Check className="w-4 h-4" />{runResult?.published ? `Опубликовано: ${runResult.published}` : "Нет постов на сейчас"}</>
            ) : runState === "error" ? (
              <><Send className="w-4 h-4" />Ошибка — попробовать снова</>
            ) : (
              <><PlayCircle className="w-4 h-4" />Запустить автопостинг</>
            )}
          </button>
          <p className="text-xs text-slate-600">
            {runState === "idle" ? "Публикует все запланированные посты у которых наступило время" : ""}
          </p>
        </div>

        {/* Direction legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(DIRECTIONS).map(([id, d]) => (
            <div key={id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-[10px] text-slate-400 font-medium">{d.label}</span>
              <span className="text-[10px] text-slate-600">{posts.filter((p) => p.directionId === id).length}</span>
            </div>
          ))}
        </div>

        {/* Calendar header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentDate(viewMode === "month" ? subMonths(currentDate, 1) : addDays(currentDate, -7))}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-semibold text-white capitalize min-w-[200px] text-center">
              {viewMode === "month"
                ? format(currentDate, "LLLL yyyy", { locale: ru })
                : `${format(weekStart, "d MMM", { locale: ru })} — ${format(addDays(weekStart, 6), "d MMM yyyy", { locale: ru })}`}
            </h3>
            <button onClick={() => setCurrentDate(viewMode === "month" ? addMonths(currentDate, 1) : addDays(currentDate, 7))}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 hover:text-white transition-all">
              Сегодня
            </button>
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <button onClick={() => setViewMode("month")}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                viewMode === "month" ? "bg-white/[0.08] text-white" : "text-slate-500 hover:text-slate-300")}>
              <LayoutGrid className="w-3.5 h-3.5" /> Месяц
            </button>
            <button onClick={() => setViewMode("week")}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                viewMode === "week" ? "bg-white/[0.08] text-white" : "text-slate-500 hover:text-slate-300")}>
              <CalendarDays className="w-3.5 h-3.5" /> Неделя
            </button>
          </div>
        </div>

        {/* ─── MONTH VIEW ─────────────────────────────── */}
        {viewMode === "month" && (
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
            <div className="grid grid-cols-7 border-b border-white/[0.07]">
              {DAY_NAMES.map((d) => (
                <div key={d} className="py-2 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const dayPosts = getPostsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDay = isToday(day);
                const isDropHere = dropTarget?.startsWith(dateStr) ?? false;

                return (
                  <div key={dateStr}
                    onDragOver={(e) => { e.preventDefault(); setDropTarget(dateStr + "|12:00"); }}
                    onDragLeave={() => setDropTarget(null)}
                    onDrop={() => handleDrop(dateStr + "|12:00")}
                    className={cn(
                      "min-h-[90px] p-1.5 border-b border-r border-white/[0.05] transition-colors group",
                      !isCurrentMonth && "opacity-40",
                      isDropHere && "bg-violet-500/10",
                      isTodayDay && "bg-white/[0.03]"
                    )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn("text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full",
                        isTodayDay ? "bg-violet-500 text-white" : isCurrentMonth ? "text-slate-400" : "text-slate-700")}>
                        {format(day, "d")}
                      </span>
                      <button onClick={() => handleAddPost(dateStr)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-600 hover:text-violet-400 hover:bg-violet-500/15 transition-all">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-0.5">
                      {dayPosts.slice(0, 3).map((p) => (
                        <PostCard key={p.id} post={p} onDragStart={setDragId} onClick={setEditPost} compact />
                      ))}
                      {dayPosts.length > 3 && (
                        <div className="text-[9px] text-slate-600 pl-1">+{dayPosts.length - 3} ещё</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── WEEK VIEW (time-grid) ───────────────────── */}
        {viewMode === "week" && (
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col">
            {/* Day header */}
            <div className="grid border-b border-white/[0.07]" style={{ gridTemplateColumns: "48px repeat(7, 1fr)" }}>
              <div className="border-r border-white/[0.05]" />
              {weekDays.map((day) => {
                const isTodayDay = isToday(day);
                return (
                  <div key={day.toISOString()}
                    className={cn("py-3 text-center border-r border-white/[0.05] last:border-r-0", isTodayDay && "bg-violet-500/10")}>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider capitalize">
                      {format(day, "EEE", { locale: ru })}
                    </div>
                    <div className={cn("text-sm font-bold mt-0.5", isTodayDay ? "text-violet-400" : "text-white")}>
                      {format(day, "d")}
                    </div>
                    <div className="text-[9px] text-slate-600 mt-0.5">{getPostsForDay(day).length} постов</div>
                  </div>
                );
              })}
            </div>

            {/* Time grid — scrollable */}
            <div ref={weekScrollRef} className="overflow-y-auto" style={{ maxHeight: 520 }}>
              <div style={{ gridTemplateColumns: "48px repeat(7, 1fr)", display: "grid" }}>
                {HOURS.map((hour) => {
                  const isWorkHour = hour >= 9 && hour <= 22;
                  const isPrime    = hour === 17 || hour === 19 || hour === 20;
                  return (
                    <>
                      {/* Hour label */}
                      <div key={`label-${hour}`}
                        className={cn(
                          "flex items-start justify-center pt-1.5 border-r border-b border-white/[0.05] text-[10px] font-mono flex-shrink-0",
                          isPrime ? "text-amber-500/70" : "text-slate-600"
                        )}
                        style={{ height: 56 }}>
                        {pad(hour)}
                      </div>

                      {/* Day cells for this hour */}
                      {weekDays.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const timeStr = `${pad(hour)}:00`;
                        const cellKey = `${dateStr}|${timeStr}`;
                        const slotPosts = getPostsAtSlot(day, hour);
                        const isDropHere = dropTarget === cellKey;
                        const isTodayDay = isToday(day);
                        const perf = getHourPerformance(timeStr);
                        const isGoodSlot = perf >= 1.5;

                        return (
                          <div key={cellKey}
                            onDragOver={(e) => { e.preventDefault(); setDropTarget(cellKey); }}
                            onDragLeave={() => setDropTarget(null)}
                            onDrop={() => handleDrop(cellKey)}
                            onClick={() => slotPosts.length === 0 && handleAddPost(dateStr, timeStr)}
                            className={cn(
                              "relative border-r border-b border-white/[0.04] last:border-r-0 transition-colors cursor-pointer group",
                              isTodayDay && "bg-white/[0.01]",
                              isDropHere && "bg-violet-500/15 border-violet-500/30",
                              !isDropHere && isGoodSlot && isWorkHour && slotPosts.length === 0 && "hover:bg-emerald-500/5",
                              !isDropHere && !isGoodSlot && slotPosts.length === 0 && "hover:bg-white/[0.02]"
                            )}
                            style={{ height: 56 }}>

                            {/* Best time glow indicator */}
                            {isGoodSlot && slotPosts.length === 0 && (
                              <div className="absolute left-0 top-0 bottom-0 w-0.5"
                                style={{ backgroundColor: "#10b98120" }} />
                            )}

                            {/* Posts in this slot */}
                            <div className="p-1 space-y-0.5 h-full overflow-hidden">
                              {slotPosts.map((p) => (
                                <PostCard key={p.id} post={p} onDragStart={setDragId} onClick={setEditPost} compact />
                              ))}
                              {slotPosts.length === 0 && (
                                <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Plus className="w-3 h-3 text-slate-600" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })}
              </div>
            </div>

            {/* Best time legend */}
            <div className="px-4 py-2.5 border-t border-white/[0.05] flex items-center gap-4 text-[10px] text-slate-600">
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500/60" /> янтарный час = топ-время
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-3 h-3 text-amber-400" /> звезда = отличное время
              </span>
              <span>Перетащи карточку на нужный час · Клик по ячейке = новый пост</span>
            </div>
          </div>
        )}

        {/* Analytics */}
        <AnalyticsPanel posts={posts} />

        <p className="text-xs text-slate-600 text-center">
          Перетаскивай карточки между ячейками · Клик = редактировать дату, время, платформу
        </p>
      </div>

      <AnimatePresence>
        {editPost && (
          <EditModal post={editPost} onSave={handleSaveEdit} onDelete={handleDelete} onClose={() => setEditPost(null)} />
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
