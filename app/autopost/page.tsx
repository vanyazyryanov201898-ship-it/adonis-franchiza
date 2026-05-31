"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, CheckCircle2, Clock, Zap, Plus, Link2,
  BarChart2, Eye, Settings, Calendar, Loader2,
  TrendingUp, Play, X, Sparkles, ChevronDown, ChevronUp, RefreshCw,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { autopostSchedule } from "@/lib/mock-data";

const platforms = [
  {
    id: "tiktok",
    name: "TikTok",
    icon: "T",
    color: "#fe2c55",
    followers: "12.4K",
    connected: true,
    posts: 487,
    avgViews: "248K",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "In",
    color: "#e91e8c",
    followers: "8.9K",
    connected: true,
    posts: 312,
    avgViews: "89K",
  },
  {
    id: "youtube",
    name: "YouTube Shorts",
    icon: "Yt",
    color: "#ff4444",
    followers: "4.2K",
    connected: true,
    posts: 198,
    avgViews: "45K",
  },
  {
    id: "vk",
    name: "VK Клипы",
    icon: "VK",
    color: "#0077ff",
    followers: "3.1K",
    connected: false,
    posts: 134,
    avgViews: "23K",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "Tg",
    color: "#26a5e4",
    followers: "2.8K",
    connected: true,
    posts: 116,
    avgViews: "12K",
  },
  {
    id: "rutube",
    name: "Rutube",
    icon: "Rt",
    color: "#003087",
    followers: "1.4K",
    connected: false,
    posts: 0,
    avgViews: "0",
  },
  {
    id: "yappy",
    name: "Yappy",
    icon: "Yp",
    color: "#ff6600",
    followers: "0",
    connected: false,
    posts: 0,
    avgViews: "0",
  },
];

const statusConfig = {
  scheduled: { label: "Запланировано", icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10" },
  processing: { label: "Публикуется", icon: Loader2, color: "text-violet-400", bg: "bg-violet-400/10", spin: true },
  draft: { label: "Черновик", icon: Settings, color: "text-slate-400", bg: "bg-slate-400/10" },
  published: { label: "Опубликовано", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
};

const platformColors: Record<string, string> = {
  TikTok: "#fe2c55",
  Instagram: "#e91e8c",
  YouTube: "#ff4444",
  VK: "#0077ff",
  Telegram: "#26a5e4",
  Rutube: "#003087",
  Yappy: "#ff6600",
};

const bestTimes = [
  { time: "09:00", score: 87, label: "Утро" },
  { time: "12:00", score: 94, label: "Обед" },
  { time: "17:00", score: 91, label: "Вечер" },
  { time: "20:00", score: 96, label: "Прайм" },
  { time: "22:00", score: 78, label: "Ночь" },
];

export default function AutopostPage() {
  const [activePlatforms, setActivePlatforms] = useState(["tiktok", "instagram", "youtube", "telegram"]);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalPlatform, setModalPlatform] = useState("TikTok");
  const [modalTime, setModalTime] = useState("12:00");
  const [notification, setNotification] = useState<string | null>(null);
  const [aiPilot, setAiPilot] = useState(true);

  // 30-day content plan
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planNiche, setPlanNiche] = useState("");
  const [planFrequency, setPlanFrequency] = useState(5);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [contentPlan, setContentPlan] = useState<Array<{day:number;weekday:string;platform:string;format:string;topic:string;hook:string;bestTime:string;viralScore:number}>>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<number[]>([1]);

  const generatePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch("/api/content-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: planNiche, platforms: activePlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)), frequency: planFrequency }),
      });
      const data = await res.json();
      if (data.plan) { setContentPlan(data.plan); setShowPlanModal(false); setExpandedWeeks([1]); showToast(`Создан план на ${data.plan.length} публикаций!`); }
    } catch { showToast("Ошибка генерации плана"); }
    finally { setIsGeneratingPlan(false); }
  };

  const togglePlatform = (id: string) => {
    setActivePlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddPost = () => {
    if (!modalTitle.trim()) return;
    setShowModal(false);
    setModalTitle("");
    showToast(`Публикация запланирована на ${modalTime} в ${modalPlatform}!`);
  };

  return (
    <AppLayout title="Автопостинг" subtitle="Управление публикациями на всех платформах">
      <div className="p-6 space-y-6">
        {/* Toast */}
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

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md p-6 rounded-2xl border border-white/[0.1] bg-[#0e0e1f] shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-violet-400" />
                    Новая публикация
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block">Заголовок поста</label>
                    <input
                      type="text"
                      value={modalTitle}
                      onChange={(e) => setModalTitle(e.target.value)}
                      placeholder="Как открыть бизнес за 30 дней..."
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 transition-colors"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1.5 block">Платформа</label>
                      <select
                        value={modalPlatform}
                        onChange={(e) => setModalPlatform(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white outline-none focus:border-violet-500/50 transition-colors"
                      >
                        {["TikTok", "Instagram", "YouTube", "Telegram", "VK", "Rutube", "Yappy"].map((p) => (
                          <option key={p} value={p} className="bg-[#0e0e1f]">{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1.5 block">Время публикации</label>
                      <input
                        type="time"
                        value={modalTime}
                        onChange={(e) => setModalTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white outline-none focus:border-violet-500/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddPost}
                    disabled={!modalTitle.trim()}
                    className="flex-1 py-2.5 rounded-xl btn-ai text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Запланировать
                  </motion.button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-sm text-slate-400 hover:text-white border border-white/[0.08] transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Platform Cards */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-violet-400" />
            Подключённые платформы
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-[10px] font-semibold text-amber-400 tracking-wide">📊 ДЕМО</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                onClick={() => togglePlatform(platform.id)}
                className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-200 group ${
                  activePlatforms.includes(platform.id)
                    ? "border-opacity-40 bg-opacity-5"
                    : "border-white/[0.06] bg-white/[0.02] opacity-60"
                }`}
                style={
                  activePlatforms.includes(platform.id)
                    ? {
                        borderColor: `${platform.color}40`,
                        background: `${platform.color}08`,
                      }
                    : {}
                }
              >
                {/* Platform Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white mb-3"
                  style={{ backgroundColor: `${platform.color}25`, border: `1px solid ${platform.color}40` }}
                >
                  <span style={{ color: platform.color }}>{platform.icon}</span>
                </div>

                <div className="text-xs font-semibold text-white mb-0.5">{platform.name}</div>
                <div className="text-[10px] text-slate-500 mb-3">{platform.followers} подп.</div>

                {/* Stats */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-600">Постов</span>
                    <span className="text-slate-400">{platform.posts}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-600">Ср. охват</span>
                    <span style={{ color: platform.color }}>{platform.avgViews}</span>
                  </div>
                </div>

                {/* Connection status */}
                <div className="mt-3 flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: platform.connected ? "#10b981" : "#64748b" }}
                  />
                  <span className="text-[10px] text-slate-500">
                    {platform.connected ? "Подключено" : "Не подключено"}
                  </span>
                </div>

                {!platform.connected && (
                  <button
                    className="absolute top-3 right-3 text-[10px] text-slate-500 hover:text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    + Подключить
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Schedule */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Расписание публикаций
              </h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl btn-ai text-xs text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                Добавить публикацию
              </motion.button>
            </div>

            {/* Schedule List */}
            <div className="space-y-3">
              {/* Today header */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-violet-400">Сегодня</span>
                <div className="flex-1 h-px bg-white/[0.05]" />
              </div>

              {autopostSchedule
                .filter((p) => p.date === "Сегодня")
                .map((post, index) => {
                  const config = statusConfig[post.status as keyof typeof statusConfig];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.07 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        post.status === "processing"
                          ? "border-violet-500/25 bg-violet-500/5"
                          : post.status === "scheduled"
                          ? "border-blue-500/20 bg-blue-500/5"
                          : "border-white/[0.06] bg-white/[0.02]"
                      }`}
                    >
                      {/* Time */}
                      <div className="text-center w-12 flex-shrink-0">
                        <div className="text-sm font-bold text-white">{post.time}</div>
                      </div>

                      <div className="w-px h-8 bg-white/[0.08]" />

                      {/* Platform */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{
                          color: platformColors[post.platform],
                          backgroundColor: `${platformColors[post.platform]}15`,
                          border: `1px solid ${platformColors[post.platform]}30`,
                        }}
                      >
                        {post.platform.slice(0, 2)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{post.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {post.platform} · Автопостинг
                        </p>
                      </div>

                      {/* Status */}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium flex-shrink-0 ${config.bg} ${config.color}`}>
                        <Icon
                          className={`w-3 h-3 ${(config as any).spin ? "animate-spin" : ""}`}
                        />
                        {config.label}
                      </div>
                    </motion.div>
                  );
                })}

              {/* Tomorrow header */}
              <div className="flex items-center gap-3 mt-4">
                <span className="text-xs font-semibold text-slate-500">Завтра</span>
                <div className="flex-1 h-px bg-white/[0.05]" />
              </div>

              {autopostSchedule
                .filter((p) => p.date === "Завтра")
                .map((post, index) => {
                  const config = statusConfig[post.status as keyof typeof statusConfig];
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.07 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group"
                    >
                      <div className="text-center w-12 flex-shrink-0">
                        <div className="text-sm font-bold text-white">{post.time}</div>
                      </div>

                      <div className="w-px h-8 bg-white/[0.08]" />

                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{
                          color: platformColors[post.platform],
                          backgroundColor: `${platformColors[post.platform]}15`,
                          border: `1px solid ${platformColors[post.platform]}30`,
                        }}
                      >
                        {post.platform.slice(0, 2)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{post.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {post.platform} · Автопостинг
                        </p>
                      </div>

                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium flex-shrink-0 ${config.bg} ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-5">
            {/* Best Times */}
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Лучшее время</h3>
                <span className="text-[10px] text-slate-500 ml-auto">AI рекомендует</span>
              </div>
              <div className="space-y-3">
                {bestTimes.map((time, i) => (
                  <div key={time.time} className="flex items-center gap-3">
                    <div className="w-12 text-xs font-mono font-medium text-white">{time.time}</div>
                    <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${time.score}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                        style={{ opacity: time.score >= 90 ? 1 : 0.6 }}
                      />
                    </div>
                    <div className="text-xs font-medium text-slate-400 w-6">{time.score}</div>
                    <span className="text-[10px] text-slate-600 w-12">{time.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Сегодня</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Запланировано", value: "6", color: "text-blue-400" },
                  { label: "Опубликовано", value: "3", color: "text-emerald-400" },
                  { label: "Охваты", value: "124K", color: "text-violet-400" },
                  { label: "Лиды", value: "34", color: "text-orange-400" },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-xl bg-white/[0.03]">
                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Autopilot */}
            <div className={`p-5 rounded-2xl border transition-all ${aiPilot ? "border-violet-500/20 bg-gradient-to-br from-violet-900/15 to-blue-900/10" : "border-white/[0.06] bg-white/[0.02]"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${aiPilot ? "text-violet-400" : "text-slate-500"}`} />
                  <h3 className="text-sm font-semibold text-white">AI Автопилот</h3>
                </div>
                <button
                  onClick={() => { setAiPilot(!aiPilot); showToast(aiPilot ? "AI Автопилот выключен" : "AI Автопилот включён!"); }}
                  className={`relative w-10 h-5 rounded-full transition-all duration-300 ${aiPilot ? "bg-violet-600" : "bg-white/[0.1]"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${aiPilot ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                AI сам выбирает лучшее время публикации и оптимизирует расписание
              </p>
              {aiPilot ? (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Активен · Следующая публикация в 12:00
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  Выключен · Расписание вручную
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── 30-дневный AI Контент-план ─────────────────────── */}
        <div className="p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 to-blue-900/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AI Контент-план на 30 дней</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {contentPlan.length > 0 ? `${contentPlan.length} публикаций сгенерировано` : "Claude составит полное расписание за 10 секунд"}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPlanModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl btn-ai text-xs text-white font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {contentPlan.length > 0 ? "Перегенерировать" : "Создать план"}
            </motion.button>
          </div>

          {/* Plan items */}
          {contentPlan.length > 0 && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((week) => {
                const weekItems = contentPlan.filter((_, i) => Math.ceil((i + 1) / Math.ceil(contentPlan.length / 4)) === week);
                if (!weekItems.length) return null;
                const isOpen = expandedWeeks.includes(week);
                return (
                  <div key={week} className="rounded-xl border border-white/[0.06] overflow-hidden">
                    <button
                      onClick={() => setExpandedWeeks(prev => isOpen ? prev.filter(w => w !== week) : [...prev, week])}
                      className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-xs font-semibold text-white">Неделя {week}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">{weekItems.length} постов</span>
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="divide-y divide-white/[0.04]">
                        {weekItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.02] transition-colors">
                            <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-slate-400">{item.day}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white truncate font-medium">{item.topic}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5 truncate">{item.hook}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.05] text-slate-400">{item.platform}</span>
                              <span className="text-[10px] text-slate-600">{item.bestTime}</span>
                              <span className="text-[10px] font-bold text-emerald-400">{item.viralScore}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Plan Modal ─────────────────────────────────────────── */}
        <AnimatePresence>
          {showPlanModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowPlanModal(false)}
            >
              <motion.div
                initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md p-6 rounded-2xl border border-white/[0.1] bg-[#0e0e1f] shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    AI Контент-план
                  </h3>
                  <button onClick={() => setShowPlanModal(false)} className="text-slate-500 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block">Акцент / ниша</label>
                    <input
                      type="text"
                      value={planNiche}
                      onChange={(e) => setPlanNiche(e.target.value)}
                      placeholder="Например: уход из найма, заработок 300К, бизнес с нуля..."
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-2 block">Постов в неделю: <span className="text-white font-semibold">{planFrequency}</span></label>
                    <input
                      type="range" min={3} max={7} value={planFrequency}
                      onChange={(e) => setPlanFrequency(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                      <span>3 / нед</span><span>5 / нед</span><span>7 / нед</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={generatePlan}
                  disabled={isGeneratingPlan}
                  className="w-full py-3 rounded-xl btn-ai text-sm text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isGeneratingPlan ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Генерирую план...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Создать план на 30 дней</>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AppLayout>
  );
}
