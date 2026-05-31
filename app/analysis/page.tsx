"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, TrendingUp, Users, Eye, BarChart2,
  Zap, Target, Calendar, ChevronRight,
  CheckCircle2, AlertTriangle, Sparkles,
  ArrowUpRight, Loader2, FileText, Video, Image,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const platforms = [
  { id: "tiktok", name: "TikTok", abbr: "TT", color: "#fe2c55", available: true },
  { id: "instagram", name: "Instagram", abbr: "IG", color: "#e91e8c", available: true },
  { id: "telegram", name: "Telegram", abbr: "Tg", color: "#26a5e4", available: true },
  { id: "youtube", name: "YouTube", abbr: "YT", color: "#ff4444", available: false },
  { id: "vk", name: "VK", abbr: "VK", color: "#0077ff", available: false },
  { id: "rutube", name: "Rutube", abbr: "Rt", color: "#003087", available: false },
  { id: "yappy", name: "Yappy", abbr: "Yp", color: "#ff6600", available: false },
];


const formatIcons = { video: Video, post: FileText, image: Image };
const platformColors: Record<string, string> = {
  TikTok: "#fe2c55",
  Instagram: "#e91e8c",
  YouTube: "#ff4444",
  Telegram: "#26a5e4",
  Rutube: "#003087",
  Yappy: "#ff6600",
};

type AnalysisResult = {
  channel: {
    name: string;
    username: string;
    platform: string;
    followers: number;
    avgViews: number;
    totalPosts: number;
    er: number;
    category: string;
    postingFreq: string;
    avgDuration: string;
  };
  score: number;
  strengths: string[];
  weaknesses: string[];
  contentTypes: { type: string; share: number; trend: string; color: string }[];
  contentPlan: { day: string; date: string; title: string; format: string; viralScore: number; platform: string }[];
  _sourceHint?: string;
  _isRealData?: boolean;
};

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function AnalysisPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("tiktok");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const platformName = platforms.find((p) => p.id === selectedPlatform)?.name || "TikTok";
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), platform: platformName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка анализа");
        return;
      }

      setResult(data);
    } catch (err: any) {
      setError("Сеть недоступна или сервер не отвечает");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AppLayout title="Анализ каналов" subtitle="AI-диагностика конкурентов и генерация контент-плана">
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

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 mb-5">
            <Search className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Анализ канала конкурента</h3>
            <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span className="text-xs text-violet-300">Claude AI</span>
            </div>
          </div>

          {/* Platform Selector */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => p.available && setSelectedPlatform(p.id)}
                disabled={!p.available}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                  selectedPlatform === p.id
                    ? "border-opacity-50 text-white"
                    : p.available
                    ? "border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.15]"
                    : "border-white/[0.04] text-slate-600 cursor-not-allowed"
                }`}
                style={
                  selectedPlatform === p.id
                    ? { borderColor: `${p.color}50`, backgroundColor: `${p.color}15` }
                    : {}
                }
              >
                <span
                  className="text-[11px] font-bold"
                  style={{ color: selectedPlatform === p.id || p.available ? p.color : "#64748b" }}
                >
                  {p.abbr}
                </span>
                {p.name}
                {!p.available && (
                  <span className="text-[9px] text-slate-600 ml-1">скоро</span>
                )}
              </button>
            ))}
          </div>

          {/* URL Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="Вставьте ссылку на канал / аккаунт конкурента..."
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/40 focus:bg-white/[0.06] transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={!url.trim() || isAnalyzing}
              className="px-6 py-3 rounded-xl btn-ai text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Анализирую...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Проанализировать
                </>
              )}
            </motion.button>
          </div>

          <p className="text-[11px] text-slate-600 mt-3">
            AI проанализирует канал и выдаст диагностику + готовый контент-план на 14 дней
          </p>
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
          {error && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 flex flex-col items-center gap-4 text-center"
            >
              <AlertTriangle className="w-10 h-10 text-red-400" />
              <div>
                <p className="text-white font-semibold mb-1">Ошибка анализа</p>
                <p className="text-red-400 text-sm">{error}</p>
                <p className="text-slate-600 text-xs mt-2">Убедитесь что ANTHROPIC_API_KEY указан в .env.local</p>
              </div>
              <button
                onClick={handleAnalyze}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-sm text-white hover:bg-white/[0.1] transition-colors"
              >
                Попробовать снова
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-8 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-900/15 to-blue-900/10 flex flex-col items-center gap-4"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-violet-400 animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500/30 border border-blue-500/50 flex items-center justify-center">
                  <Loader2 className="w-2.5 h-2.5 text-blue-400 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-white mb-1">AI анализирует канал</div>
                <div className="text-xs text-slate-500">Изучаю контент, аудиторию, тренды и стратегию...</div>
              </div>
              <div className="flex gap-2">
                {["Сканирую посты", "Анализирую ER", "Нахожу паттерны", "Генерирую план"].map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.6 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] text-slate-400"
                  >
                    <div className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
                    {step}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Data source badge */}
              {result._isRealData ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="flex-1">Данные получены со страницы канала — Claude AI работал с реальной информацией</span>
                  {result._sourceHint && (
                    <span className="text-emerald-600 truncate max-w-xs hidden md:block">{result._sourceHint.slice(0, 80)}…</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] text-[11px] text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Страница канала недоступна для парсинга — метрики оценены AI. Для точных данных проверьте профиль вручную.</span>
                </div>
              )}

              {/* Channel Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Main Info */}
                <div className="lg:col-span-1 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600/40 to-blue-600/40 border border-violet-500/30 flex items-center justify-center text-lg font-bold text-white">
                      {result.channel.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{result.channel.name}</div>
                      <div className="text-xs text-slate-500">{result.channel.username}</div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-600 ml-auto" />
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: "Платформа", value: result.channel.platform },
                      { label: "Ниша", value: result.channel.category },
                      { label: "Частота", value: result.channel.postingFreq },
                      { label: "Ср. длина", value: result.channel.avgDuration },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between text-xs">
                        <span className="text-slate-600">{item.label}</span>
                        <span className="text-slate-300">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Score */}
                  <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500">AI-оценка канала</span>
                      <span className="text-lg font-bold text-white">{result.score}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.score}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                      />
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1.5">Средний уровень — есть точки роста</div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-3">
                  {[
                    { label: "Подписчиков", value: fmtNum(result.channel.followers), icon: Users, color: "text-violet-400", bg: "bg-violet-400/10" },
                    { label: "Ср. просмотры", value: fmtNum(result.channel.avgViews), icon: Eye, color: "text-blue-400", bg: "bg-blue-400/10" },
                    { label: "Публикаций", value: result.channel.totalPosts, icon: BarChart2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                    { label: "Вовлечённость", value: `${result.channel.er}%`, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-400/10" },
                  ].map((metric, i) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i }}
                      className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-3"
                    >
                      <div className={`w-10 h-10 rounded-xl ${metric.bg} flex items-center justify-center`}>
                        <metric.icon className={`w-5 h-5 ${metric.color}`} />
                      </div>
                      <div>
                        <div className={`text-xl font-bold ${metric.color}`}>{metric.value}</div>
                        <div className="text-[11px] text-slate-600">{metric.label}</div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Content Types */}
                  <div className="col-span-2 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="text-xs font-semibold text-white mb-3">Типы контента</div>
                    <div className="space-y-2">
                      {result.contentTypes.map((ct) => (
                        <div key={ct.type} className="flex items-center gap-3">
                          <div className="text-[11px] text-slate-400 w-36 flex-shrink-0">{ct.type}</div>
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${ct.share}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: ct.color }}
                            />
                          </div>
                          <div className="text-[11px] text-slate-500 w-8 text-right">{ct.share}%</div>
                          <div className="text-[10px] text-slate-600 w-24">{ct.trend}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03]">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-semibold text-white">Сильные стороны</h4>
                  </div>
                  <div className="space-y-2.5">
                    {result.strengths.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2.5"
                      >
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </div>
                        <span className="text-xs text-slate-300 leading-relaxed">{s}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-orange-500/15 bg-orange-500/[0.03]">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <h4 className="text-sm font-semibold text-white">Слабые места — ваш шанс</h4>
                  </div>
                  <div className="space-y-2.5">
                    {result.weaknesses.map((w, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2.5"
                      >
                        <div className="w-4 h-4 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        </div>
                        <span className="text-xs text-slate-300 leading-relaxed">{w}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Plan */}
              <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    <h4 className="text-sm font-semibold text-white">AI Контент-план на 14 дней</h4>
                    <span className="text-[10px] text-violet-400 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                      На основе анализа
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => showToast("Контент-план добавлен в расписание автопостинга!")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl btn-ai text-xs font-medium text-white"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Взять в работу
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.contentPlan.map((item, i) => {
                    const FormatIcon = formatIcons[item.format as keyof typeof formatIcons] || Video;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => { sessionStorage.setItem("generator_topic", item.title); router.push("/generator"); }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-violet-500/20 transition-all cursor-pointer group"
                        title="Кликни чтобы сгенерировать сценарий"
                      >
                        {/* Day */}
                        <div className="text-center w-10 flex-shrink-0">
                          <div className="text-[10px] text-slate-600">{item.day}</div>
                          <div className="text-[11px] font-bold text-slate-400">{item.date.split(" ")[0]}</div>
                        </div>

                        <div className="w-px h-8 bg-white/[0.06]" />

                        {/* Icon */}
                        <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                          <FormatIcon className="w-3.5 h-3.5 text-slate-500" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white truncate leading-snug">{item.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                              style={{
                                color: platformColors[item.platform] || "#8b5cf6",
                                backgroundColor: `${platformColors[item.platform] || "#8b5cf6"}15`,
                              }}
                            >
                              {item.platform}
                            </span>
                          </div>
                        </div>

                        {/* Viral Score */}
                        <div className="flex-shrink-0 text-right">
                          <div className={`text-sm font-bold ${item.viralScore >= 90 ? "text-emerald-400" : item.viralScore >= 80 ? "text-blue-400" : "text-slate-400"}`}>
                            {item.viralScore}
                          </div>
                          <div className="text-[9px] text-slate-600">Score</div>
                        </div>

                        <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-violet-400 transition-colors flex-shrink-0" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!result && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Target className="w-8 h-8 text-violet-400/60" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-400 mb-1">
                Введите ссылку на канал конкурента
              </div>
              <div className="text-xs text-slate-600">
                AI проанализирует стратегию и найдёт точки роста для вашего контента
              </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {["tiktok.com/@", "instagram.com/", "t.me/"].map((example) => (
                <button
                  key={example}
                  onClick={() => setUrl(example)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-slate-500 hover:text-slate-300 hover:border-white/[0.12] transition-all font-mono"
                >
                  {example}
                </button>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </AppLayout>
  );
}
