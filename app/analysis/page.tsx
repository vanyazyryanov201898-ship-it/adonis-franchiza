"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, TrendingUp, Users, Eye, BarChart2,
  Zap, Target, Clock, Calendar, ChevronRight,
  CheckCircle2, AlertTriangle, Sparkles, Play,
  ArrowUpRight, Loader2, FileText, Video, Image,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const platforms = [
  { id: "tiktok", name: "TikTok", abbr: "TT", color: "#fe2c55", available: true },
  { id: "instagram", name: "Instagram", abbr: "IG", color: "#e91e8c", available: true },
  { id: "telegram", name: "Telegram", abbr: "Tg", color: "#26a5e4", available: true },
  { id: "youtube", name: "YouTube", abbr: "YT", color: "#ff4444", available: false },
  { id: "vk", name: "VK", abbr: "VK", color: "#0077ff", available: false },
];

const mockAnalysis = {
  channel: {
    name: "Бизнес с нуля",
    username: "@biznes_s_nulya",
    platform: "TikTok",
    followers: 284000,
    avgViews: 124000,
    totalPosts: 312,
    er: 6.8,
    category: "Бизнес / Франчайзинг",
    postingFreq: "1.4 поста/день",
    avgDuration: "47 сек",
  },
  score: 72,
  strengths: [
    "Регулярные публикации — высокая частота постинга",
    "Хорошие хуки в первые 3 секунды",
    "Тема франчайзинга даёт стабильный спрос",
  ],
  weaknesses: [
    "Слабые CTA — нет призыва к действию в 70% видео",
    "Не используют трендовые звуки и музыку",
    "Отсутствует контент про «день из жизни» — сейчас в тренде",
    "Нет серийного контента (сериал/рубрика)",
  ],
  contentTypes: [
    { type: "Мотивационные видео", share: 42, trend: "↓ Снижается", color: "#fe2c55" },
    { type: "Разборы бизнеса", share: 28, trend: "↑ Растёт", color: "#10b981" },
    { type: "Личный опыт", share: 18, trend: "↑ Растёт", color: "#8b5cf6" },
    { type: "Обучение", share: 12, trend: "→ Стабильно", color: "#3b82f6" },
  ],
  contentPlan: [
    { day: "Пн", date: "26 мая", title: "Сколько реально зарабатывают партнёры ADONIS", format: "video", viralScore: 94, platform: "TikTok" },
    { day: "Вт", date: "27 мая", title: "День из жизни владельца франшизы — будни производства", format: "video", viralScore: 91, platform: "Instagram" },
    { day: "Ср", date: "28 мая", title: "3 ошибки при выборе франшизы (я их все совершил)", format: "video", viralScore: 89, platform: "TikTok" },
    { day: "Чт", date: "29 мая", title: "За кулисами: как делается 500 изделий в день", format: "video", viralScore: 87, platform: "YouTube" },
    { day: "Пт", date: "30 мая", title: "Открытый ответ: почему я выбрал не найм, а производство", format: "video", viralScore: 93, platform: "TikTok" },
    { day: "Сб", date: "31 мая", title: "Кейс партнёра: вложил 1.2M → получает 340K/мес", format: "video", viralScore: 96, platform: "Instagram" },
    { day: "Вс", date: "1 июн", title: "Вопрос-ответ: всё что вы хотели знать о мерч-бизнесе", format: "post", viralScore: 82, platform: "Telegram" },
    { day: "Пн", date: "2 июн", title: "Как мы открываем нового партнёра за 30 дней", format: "video", viralScore: 90, platform: "TikTok" },
    { day: "Вт", date: "3 июн", title: "Правда о первых 3 месяцах в бизнесе", format: "video", viralScore: 88, platform: "Instagram" },
    { day: "Ср", date: "4 июн", title: "Сравнение: своё производство vs аутсорс", format: "video", viralScore: 85, platform: "YouTube" },
    { day: "Чт", date: "5 июн", title: "Живой поток: отвечаю на вопросы про франшизу", format: "video", viralScore: 79, platform: "TikTok" },
    { day: "Пт", date: "6 июн", title: "Итоги месяца: наши цифры и планы", format: "post", viralScore: 84, platform: "Telegram" },
    { day: "Сб", date: "7 июн", title: "Рассказываю что пошло не так и как мы это исправили", format: "video", viralScore: 92, platform: "Instagram" },
    { day: "Вс", date: "8 июн", title: "Лучшие моменты недели — нарезка", format: "video", viralScore: 78, platform: "TikTok" },
  ],
};

const formatIcons = { video: Video, post: FileText, image: Image };
const platformColors: Record<string, string> = {
  TikTok: "#fe2c55",
  Instagram: "#e91e8c",
  YouTube: "#ff4444",
  Telegram: "#26a5e4",
};

export default function AnalysisPage() {
  const [url, setUrl] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("tiktok");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<typeof mockAnalysis | null>(null);
  const [analysesLeft] = useState(3);

  const handleAnalyze = () => {
    if (!url.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult(mockAnalysis);
    }, 3000);
  };

  return (
    <AppLayout title="Анализ каналов" subtitle="AI-диагностика конкурентов и генерация контент-плана">
      <div className="p-6 space-y-6">

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
              <span className="text-xs text-violet-300">{analysesLeft} бесплатных</span>
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
                    { label: "Подписчиков", value: `${(result.channel.followers / 1000).toFixed(0)}K`, icon: Users, color: "text-violet-400", bg: "bg-violet-400/10" },
                    { label: "Ср. просмотры", value: `${(result.channel.avgViews / 1000).toFixed(0)}K`, icon: Eye, color: "text-blue-400", bg: "bg-blue-400/10" },
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
                        className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-violet-500/20 transition-all cursor-pointer group"
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
