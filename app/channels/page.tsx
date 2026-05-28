"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2, CheckCircle2, XCircle, Zap, TrendingUp,
  Eye, Users, BarChart2, RefreshCw, Plus, Unlink,
  Activity, ArrowUpRight, AlertCircle,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const platforms = [
  {
    id: "tiktok",
    name: "TikTok",
    abbr: "TT",
    color: "#fe2c55",
    connected: true,
    username: "@adonis.franchise",
    followers: 12400,
    avgViews: 248000,
    posts: 487,
    er: 8.4,
    growth: +23,
    lastPost: "2 ч назад",
    status: "active",
    description: "Основная площадка · Короткие видео",
  },
  {
    id: "instagram",
    name: "Instagram",
    abbr: "IG",
    color: "#e91e8c",
    connected: true,
    username: "@adonis_merch",
    followers: 8900,
    avgViews: 89000,
    posts: 312,
    er: 6.2,
    growth: +18,
    lastPost: "5 ч назад",
    status: "active",
    description: "Reels и сторис · Портфолио",
  },
  {
    id: "youtube",
    name: "YouTube",
    abbr: "YT",
    color: "#ff4444",
    connected: true,
    username: "ADONIS Official",
    followers: 4200,
    avgViews: 45000,
    posts: 198,
    er: 4.8,
    growth: +34,
    lastPost: "Вчера",
    status: "active",
    description: "Shorts и лонгриды · Разборы",
  },
  {
    id: "vk",
    name: "VK Клипы",
    abbr: "VK",
    color: "#0077ff",
    connected: false,
    username: null,
    followers: 0,
    avgViews: 0,
    posts: 0,
    er: 0,
    growth: 0,
    lastPost: "—",
    status: "disconnected",
    description: "Клипы и посты · Русскоязычная аудитория",
  },
  {
    id: "telegram",
    name: "Telegram",
    abbr: "Tg",
    color: "#26a5e4",
    connected: true,
    username: "t.me/adonis_business",
    followers: 2800,
    avgViews: 12000,
    posts: 116,
    er: 12.4,
    growth: +8,
    lastPost: "1 ч назад",
    status: "active",
    description: "Канал · Прямая коммуникация",
  },
  {
    id: "dzen",
    name: "Дзен",
    abbr: "Дз",
    color: "#ff6633",
    connected: false,
    username: null,
    followers: 0,
    avgViews: 0,
    posts: 0,
    er: 0,
    growth: 0,
    lastPost: "—",
    status: "disconnected",
    description: "Статьи и видео · SEO трафик",
  },
];

const totalReach = platforms
  .filter((p) => p.connected)
  .reduce((acc, p) => acc + p.followers, 0);

const totalPosts = platforms
  .filter((p) => p.connected)
  .reduce((acc, p) => acc + p.posts, 0);

export default function ChannelsPage() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [platformList, setPlatformList] = useState(platforms);
  const [syncing, setSyncing] = useState(false);

  const handleConnect = (id: string) => {
    setConnecting(id);
    setTimeout(() => {
      setPlatformList((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                connected: true,
                status: "active",
                username: `@adonis_${id}`,
                followers: Math.floor(Math.random() * 5000) + 500,
                avgViews: Math.floor(Math.random() * 30000) + 5000,
                posts: Math.floor(Math.random() * 100) + 10,
                er: parseFloat((Math.random() * 8 + 2).toFixed(1)),
                growth: Math.floor(Math.random() * 30) + 5,
                lastPost: "только что",
              }
            : p
        )
      );
      setConnecting(null);
    }, 2000);
  };

  const handleDisconnect = (id: string) => {
    setDisconnecting(id);
    setTimeout(() => {
      setPlatformList((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                connected: false,
                status: "disconnected",
                username: null,
                followers: 0,
                avgViews: 0,
                posts: 0,
                er: 0,
                growth: 0,
                lastPost: "—",
              }
            : p
        )
      );
      setDisconnecting(null);
    }, 1500);
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2500);
  };

  const connectedCount = platformList.filter((p) => p.connected).length;

  return (
    <AppLayout title="Каналы" subtitle="Подключённые платформы и статусы интеграций">
      <div className="p-6 space-y-6">

        {/* Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Подключено",
              value: `${connectedCount} / ${platformList.length}`,
              icon: Link2,
              color: "text-violet-400",
              bg: "bg-violet-400/10",
            },
            {
              label: "Суммарная аудитория",
              value: `${(totalReach / 1000).toFixed(1)}K`,
              icon: Users,
              color: "text-emerald-400",
              bg: "bg-emerald-400/10",
            },
            {
              label: "Всего публикаций",
              value: totalPosts,
              icon: BarChart2,
              color: "text-blue-400",
              bg: "bg-blue-400/10",
            },
            {
              label: "AI Автопостинг",
              value: "Активен",
              icon: Activity,
              color: "text-cyan-400",
              bg: "bg-cyan-400/10",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Все платформы</h3>
            <p className="text-xs text-slate-500 mt-0.5">Управление подключениями и мониторинг метрик</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSync}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-xs text-slate-300 hover:text-white hover:border-violet-500/30 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-violet-400" : ""}`} />
            {syncing ? "Синхронизация..." : "Синхронизировать"}
          </motion.button>
        </div>

        {/* Platform Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {platformList.map((platform, index) => {
            const isConnecting = connecting === platform.id;
            const isDisconnecting = disconnecting === platform.id;
            const isBusy = isConnecting || isDisconnecting;

            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`relative p-5 rounded-2xl border transition-all duration-300 ${
                  platform.connected
                    ? "bg-white/[0.02] hover:bg-white/[0.04]"
                    : "bg-white/[0.01] opacity-75 hover:opacity-90"
                }`}
                style={{
                  borderColor: platform.connected
                    ? `${platform.color}35`
                    : "rgba(255,255,255,0.06)",
                }}
              >
                {/* Glow for connected */}
                {platform.connected && (
                  <div
                    className="absolute inset-0 rounded-2xl opacity-5 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top left, ${platform.color}, transparent 60%)` }}
                  />
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{
                        color: platform.color,
                        backgroundColor: `${platform.color}20`,
                        border: `1px solid ${platform.color}40`,
                      }}
                    >
                      {platform.abbr}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{platform.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{platform.description}</div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                    platform.connected
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-slate-500/15 text-slate-400"
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      platform.connected ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                    }`} />
                    {platform.connected ? "Подключено" : "Не подключено"}
                  </div>
                </div>

                {/* Username */}
                {platform.connected && platform.username && (
                  <div className="flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <span className="text-[11px] text-slate-400 font-mono">{platform.username}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-600 ml-auto" />
                  </div>
                )}

                {/* Stats Grid */}
                {platform.connected ? (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: "Подписчики", value: platform.followers >= 1000 ? `${(platform.followers / 1000).toFixed(1)}K` : platform.followers, color: "text-white" },
                      { label: "Ср. охват", value: platform.avgViews >= 1000 ? `${(platform.avgViews / 1000).toFixed(0)}K` : platform.avgViews, color: `text-[${platform.color}]` },
                      { label: "Публикаций", value: platform.posts, color: "text-slate-300" },
                      { label: "ER", value: `${platform.er}%`, color: platform.er >= 8 ? "text-emerald-400" : platform.er >= 5 ? "text-blue-400" : "text-slate-400" },
                    ].map((stat) => (
                      <div key={stat.label} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                        <div className={`text-base font-bold ${stat.color}`} style={stat.label === "Ср. охват" ? { color: platform.color } : {}}>
                          {stat.value}
                        </div>
                        <div className="text-[10px] text-slate-600 mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01]">
                    <AlertCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    <p className="text-[11px] text-slate-600">
                      Подключите аккаунт чтобы начать публикации и видеть аналитику
                    </p>
                  </div>
                )}

                {/* Growth + Last post */}
                {platform.connected && (
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">+{platform.growth}%</span>
                      <span className="text-slate-600">за 30 дней</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Пост: {platform.lastPost}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {platform.connected ? (
                  <div className="flex gap-2">
                    <button className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
                      style={{ backgroundColor: `${platform.color}20`, border: `1px solid ${platform.color}35` }}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        Аналитика
                      </span>
                    </button>
                    <button
                      onClick={() => handleDisconnect(platform.id)}
                      disabled={isBusy}
                      className="px-3 py-2.5 rounded-xl text-xs text-slate-500 hover:text-red-400 border border-white/[0.06] hover:border-red-500/30 transition-all disabled:opacity-50"
                    >
                      {isDisconnecting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Unlink className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleConnect(platform.id)}
                    disabled={isBusy}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${platform.color}40, ${platform.color}20)`,
                      border: `1px solid ${platform.color}50`,
                    }}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Подключение...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Подключить аккаунт
                      </>
                    )}
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-5 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-900/15 to-blue-900/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                <Zap className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  AI публикует на все каналы одновременно
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Один контент — адаптируется автоматически под формат каждой платформы
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Работает</span>
            </div>
          </div>
        </motion.div>

      </div>
    </AppLayout>
  );
}
