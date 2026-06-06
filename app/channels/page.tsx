"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2, XCircle, Zap, TrendingUp,
  Eye, Users, BarChart2, RefreshCw, Plus, Unlink,
  Activity, ArrowUpRight, AlertCircle,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/lib/contexts/toast-context";
import { DIRECTION_DEFAULT_PLATFORMS } from "@/lib/data/platforms";
import {
  type Account,
  getAccountsByPlatform,
  addAccount,
  removeAccount,
} from "@/lib/stores/accounts-store";

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
  {
    id: "rutube",
    name: "Rutube",
    abbr: "Rt",
    color: "#003087",
    connected: false,
    username: null,
    followers: 0,
    avgViews: 0,
    posts: 0,
    er: 0,
    growth: 0,
    lastPost: "—",
    status: "disconnected",
    description: "Видео · Российская платформа",
  },
  {
    id: "yappy",
    name: "Yappy",
    abbr: "Yp",
    color: "#ff6600",
    connected: false,
    username: null,
    followers: 0,
    avgViews: 0,
    posts: 0,
    er: 0,
    growth: 0,
    lastPost: "—",
    status: "disconnected",
    description: "Короткие видео · Газпром-Медиа",
  },
];

const totalReach = platforms
  .filter((p) => p.connected)
  .reduce((acc, p) => acc + p.followers, 0);

const totalPosts = platforms
  .filter((p) => p.connected)
  .reduce((acc, p) => acc + p.posts, 0);

function SkeletonPlatformCard() {
  return (
    <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/[0.06]" />
          <div className="space-y-2">
            <div className="h-3.5 w-20 rounded-full bg-white/[0.08]" />
            <div className="h-2.5 w-28 rounded-full bg-white/[0.04]" />
          </div>
        </div>
        <div className="h-6 w-24 rounded-full bg-white/[0.05]" />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
            <div className="h-5 w-12 rounded bg-white/[0.07] mb-1" />
            <div className="h-2.5 w-16 rounded-full bg-white/[0.04]" />
          </div>
        ))}
      </div>
      <div className="h-9 rounded-xl bg-white/[0.04]" />
    </div>
  );
}

const DIRECTION_LABELS: Record<string, string> = {
  "heygen-live":  "HeyGen Живой",
  "heygen-ai":    "HeyGen AI",
  "infographics": "Инфографика",
  "cartoon":      "Мультяшки",
  "clips":        "Нарезка",
};

export default function ChannelsPage() {
  const router = useRouter();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [platformList, setPlatformList] = useState(platforms);
  const [syncing, setSyncing] = useState(false);
  const [livePostCount, setLivePostCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Extra accounts (multi-account)
  const [extraAccounts, setExtraAccounts] = useState<Record<string, Account[]>>({});
  const [addFormPlatform, setAddFormPlatform] = useState<string | null>(null);
  const [newAccName, setNewAccName] = useState("");
  const [newAccHandle, setNewAccHandle] = useState("");
  const [newAccDirection, setNewAccDirection] = useState<string>("null");

  useEffect(() => {
    const all: Record<string, Account[]> = {};
    platforms.forEach((p) => { all[p.id] = getAccountsByPlatform(p.id); });
    setExtraAccounts(all);
  }, []);

  const refreshAccounts = (platformId: string) => {
    setExtraAccounts((prev) => ({ ...prev, [platformId]: getAccountsByPlatform(platformId) }));
  };

  const handleAddExtra = (platformId: string) => {
    if (!newAccName.trim()) return;
    addAccount({
      platformId,
      name: newAccName.trim(),
      handle: newAccHandle.trim(),
      directionId: newAccDirection === "null" ? null : newAccDirection,
    });
    setNewAccName("");
    setNewAccHandle("");
    setNewAccDirection("null");
    setAddFormPlatform(null);
    refreshAccounts(platformId);
  };

  const handleRemoveExtra = (id: string, platformId: string) => {
    removeAccount(id);
    refreshAccounts(platformId);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) setLivePostCount((c) => c + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const { toast } = useToast();
  const showToast = (msg: string) => toast(msg);

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
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-slate-500">Подписчики и охваты — демо-данные.</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-[10px] font-semibold text-amber-400 tracking-wide">📊 ДЕМО</span>
        </div>
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
              value: livePostCount > 0 ? `+${livePostCount} сегодня` : "Активен",
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
            onClick={() => { handleSync(); setTimeout(() => showToast("Данные синхронизированы"), 2500); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-xs text-slate-300 hover:text-white hover:border-violet-500/30 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-violet-400" : ""}`} />
            {syncing ? "Синхронизация..." : "Синхронизировать"}
          </motion.button>
        </div>

        {/* Platform Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonPlatformCard key={i} />)
            : platformList.map((platform, index) => {
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
                    <button
                      onClick={() => router.push("/analytics")}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-80"
                      style={{ backgroundColor: `${platform.color}20`, border: `1px solid ${platform.color}35` }}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        Аналитика
                      </span>
                    </button>
                    <button
                      onClick={() => { handleDisconnect(platform.id); showToast(`${platform.name} отключён`); }}
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

                {/* Extra accounts (multi-account) */}
                {(() => {
                  const accs = extraAccounts[platform.id] || [];
                  const isAddingHere = addFormPlatform === platform.id;
                  return (
                    <div className="mt-3 space-y-2">
                      {accs.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">Ещё аккаунты</p>
                          {accs.map((acc) => (
                            <div key={acc.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                              <div className="flex-1 min-w-0">
                                <span className="text-xs text-white font-medium">{acc.name}</span>
                                {acc.handle && <span className="text-[11px] text-slate-500 ml-1.5">{acc.handle}</span>}
                                {acc.directionId && (
                                  <span className="text-[9px] text-violet-400 ml-1.5 font-semibold">
                                    {DIRECTION_LABELS[acc.directionId] ?? acc.directionId}
                                  </span>
                                )}
                                {acc.directionId === null && (
                                  <span className="text-[9px] text-slate-500 ml-1.5">все направления</span>
                                )}
                              </div>
                              <button
                                onClick={() => handleRemoveExtra(acc.id, platform.id)}
                                className="p-0.5 text-slate-600 hover:text-red-400 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {isAddingHere ? (
                        <div className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2">
                          <input
                            value={newAccName} onChange={(e) => setNewAccName(e.target.value)}
                            placeholder="Название (напр. ADONIS Инфографика)"
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-600 outline-none focus:border-violet-500/40 transition-colors"
                          />
                          <input
                            value={newAccHandle} onChange={(e) => setNewAccHandle(e.target.value)}
                            placeholder="Хэндл (@name или URL)"
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-600 outline-none focus:border-violet-500/40 transition-colors"
                          />
                          <select
                            value={newAccDirection}
                            onChange={(e) => setNewAccDirection(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white outline-none focus:border-violet-500/40 transition-colors"
                          >
                            <option value="null">Все направления</option>
                            {Object.entries(DIRECTION_LABELS).map(([id, label]) => (
                              <option key={id} value={id}>{label}</option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAddExtra(platform.id)}
                              disabled={!newAccName.trim()}
                              className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-600/80 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Добавить
                            </button>
                            <button
                              onClick={() => setAddFormPlatform(null)}
                              className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-white bg-white/[0.05] transition-colors"
                            >
                              Отмена
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddFormPlatform(platform.id)}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-white/[0.08] text-[11px] text-slate-600 hover:text-slate-400 hover:border-white/[0.15] transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          Добавить ещё аккаунт
                        </button>
                      )}
                    </div>
                  );
                })()}
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
