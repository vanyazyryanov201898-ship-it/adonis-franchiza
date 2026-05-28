"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, CheckCircle2, Clock, Zap, Plus, Link2,
  BarChart2, Eye, Settings, Calendar, Loader2,
  TrendingUp, Play,
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

  const togglePlatform = (id: string) => {
    setActivePlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <AppLayout title="Автопостинг" subtitle="Управление публикациями на всех платформах">
      <div className="p-6 space-y-6">

        {/* Platform Cards */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-violet-400" />
            Подключённые платформы
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
            <div className="p-5 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-900/15 to-blue-900/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-semibold text-white">AI Автопилот</h3>
                </div>
                <div className="relative">
                  <div className="w-10 h-5 bg-violet-600/80 rounded-full flex items-center px-0.5">
                    <div className="w-4 h-4 bg-white rounded-full shadow-lg ml-auto" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                AI сам выбирает лучшее время публикации и оптимизирует расписание
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Активен · Следующая публикация в 12:00
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
