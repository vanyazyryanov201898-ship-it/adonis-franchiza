"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Flame, Eye, Heart, Zap, Search,
  ChevronRight, Sparkles, Hash, ArrowUpRight,
  BarChart2, Copy, Check, RefreshCw,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { trendingTopics as mockTopics } from "@/lib/data/mock-data";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const categories = ["Все", "Уход из найма", "Доходы бизнеса", "Франчайзинг", "Открытие бизнеса", "Мерч и печать", "Wildberries"];

const viralHooks = [
  { text: "Открыл студию брендирования и окупился за 4.5 месяца — вот реальные цифры:", score: 96 },
  { text: "Показываю выручку своей студии за месяц — от 450 тысяч до...", score: 95 },
  { text: "Ушёл из найма, открыл печать на одежде, и вот что из этого вышло:", score: 93 },
  { text: "Сергей из Ставрополя заработал 10 млн на брендировании — вот как он это сделал:", score: 91 },
  { text: "Свой бренд на Wildberries без вложений в товар — это реально, потому что...", score: 89 },
  { text: "Бизнес из дома на печати на одежде — мой доход 300К в месяц:", score: 87 },
  { text: "Корпоративный заказ на 1000 футболок — сколько я на этом заработал:", score: 86 },
  { text: "Франшиза №1 в России по брендированию — что это значит на практике:", score: 84 },
];

const weeklyTrends = [
  { day: "Пн", views: 124, viral: 67 },
  { day: "Вт", views: 189, viral: 89 },
  { day: "Ср", views: 156, viral: 71 },
  { day: "Чт", views: 234, viral: 94 },
  { day: "Пт", views: 298, viral: 87 },
  { day: "Сб", views: 412, viral: 96 },
  { day: "Вс", views: 367, viral: 91 },
];

const ScoreBar = ({ score }: { score: number }) => {
  const color = score >= 90 ? "#10b981" : score >= 80 ? "#8b5cf6" : "#3b82f6";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  );
};

type Topic = {
  id: number;
  title: string;
  viralScore: number;
  views: number;
  engagement: number;
  trend: string;
  category: string;
  growth: number;
  hooks: string[];
};

export default function TrendsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>(mockTopics as Topic[]);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [selectedTopic, setSelectedTopic] = useState<Topic>(mockTopics[0] as Topic);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedHook, setCopiedHook] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshed, setRefreshed] = useState(false);

  const copyHook = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHook(text);
    setTimeout(() => setCopiedHook(null), 2000);
  };

  const goToGenerator = (topic: string) => {
    sessionStorage.setItem("generator_topic", topic);
    router.push("/generator");
  };

  const refreshTrends = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: "франшиза и производство мерча (DTF-печать, одежда с принтами)", categories }),
      });
      const data = await res.json();
      if (data.topics && data.topics.length > 0) {
        setTopics(data.topics);
        setSelectedTopic(data.topics[0]);
        setRefreshed(true);
        setTimeout(() => setRefreshed(false), 3000);
      }
    } catch (e) {
      console.error("Ошибка обновления трендов:", e);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTopics = topics.filter((t: Topic) => {
    const matchCategory = activeCategory === "Все" || t.category === activeCategory;
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <AppLayout title="Аналитика трендов" subtitle="Вирусные темы в реальном времени">
      <div className="p-6 space-y-6">

        {/* Refresh bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {refreshed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs text-emerald-400 font-medium"
              >
                <Check className="w-3.5 h-3.5" />
                Тренды обновлены Claude AI
              </motion.div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={refreshTrends}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-sm text-violet-300 font-medium hover:bg-violet-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Claude анализирует..." : "Обновить тренды через Claude"}
          </motion.button>
        </div>

        {/* Header Stats */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-slate-500">Статистика ниже — демо-данные.</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-[10px] font-semibold text-amber-400 tracking-wide">📊 ДЕМО</span>
          <span className="text-xs text-slate-500">Темы и хуки — реальный Claude AI.</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Активных трендов", value: "247", icon: TrendingUp, color: "text-violet-400" },
            { label: "Viral топик дня", value: "#найм2026", icon: Hash, color: "text-cyan-400" },
            { label: "Среднее views/ролик", value: "2.4M", icon: Eye, color: "text-blue-400" },
            { label: "AI Оценка", value: "94/100", icon: Zap, color: "text-emerald-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-[11px] text-slate-500">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left: Topics List */}
          <div className="xl:col-span-2 space-y-4">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Поиск темы..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/40 transition-colors"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeCategory === cat
                        ? "bg-violet-600/80 text-white"
                        : "bg-white/[0.04] text-slate-500 hover:text-slate-400 border border-white/[0.06]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="space-y-3">
              <AnimatePresence>
                {filteredTopics.map((topic: Topic, index: number) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedTopic(topic)}
                    className={`group p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      selectedTopic.id === topic.id
                        ? "border-violet-500/30 bg-violet-500/8"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Rank */}
                      <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 font-medium">
                                {topic.category}
                              </span>
                              <span className="text-[10px] text-violet-300 font-medium">{topic.trend}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-white group-hover:text-violet-200 transition-colors">
                              {topic.title}
                            </h3>
                          </div>
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 transition-all ${
                            selectedTopic.id === topic.id
                              ? "text-violet-400 translate-x-0.5"
                              : "text-slate-600 group-hover:text-slate-500"
                          }`} />
                        </div>

                        {/* Metrics */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs text-slate-500">
                              {(topic.views / 1000000).toFixed(1)}M
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs text-slate-500">{topic.engagement}%</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-medium">+{topic.growth}%</span>
                          </div>
                          <div className="flex-1">
                            <ScoreBar score={topic.viralScore} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Detail Panel */}
          <div className="space-y-4">
            {/* Topic Detail */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTopic.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="p-5 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/8 to-blue-500/5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-semibold text-white">Детали темы</span>
                </div>

                <h3 className="text-sm font-bold text-white mb-4">{selectedTopic.title}</h3>

                {/* Viral score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Viral Score</span>
                    <span className="text-xs font-bold text-emerald-400">{selectedTopic.viralScore}/100</span>
                  </div>
                  <ScoreBar score={selectedTopic.viralScore} />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/[0.04]">
                    <div className="text-lg font-bold text-white">
                      {(selectedTopic.views / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-[10px] text-slate-500">просмотров</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04]">
                    <div className="text-lg font-bold text-emerald-400">+{selectedTopic.growth}%</div>
                    <div className="text-[10px] text-slate-500">рост за неделю</div>
                  </div>
                </div>

                {/* Hooks */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs font-semibold text-white">Лучшие хуки</span>
                  </div>
                  <div className="space-y-2">
                    {selectedTopic.hooks.map((hook: string, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => copyHook(hook)}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.05] cursor-pointer hover:border-violet-500/25 transition-colors group"
                        title="Кликни чтобы скопировать"
                      >
                        <span className="text-violet-400 text-xs font-bold mt-0.5">{i + 1}.</span>
                        <span className="text-xs text-slate-400 group-hover:text-white transition-colors flex-1">{hook}</span>
                        {copiedHook === hook
                          ? <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                          : <Copy className="w-3 h-3 text-slate-700 group-hover:text-violet-400 flex-shrink-0 mt-0.5 transition-colors" />}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => goToGenerator(selectedTopic.title)}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl btn-ai text-sm text-white font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  Создать сценарий по теме
                </motion.button>
              </motion.div>
            </AnimatePresence>

            {/* Viral Hooks */}
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-semibold text-white">Топ хуки недели</h3>
              </div>
              <div className="space-y-3">
                {viralHooks.map((hook: { text: string; score: number }, i: number) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <p className="text-xs text-slate-400 truncate flex-1">{hook.text}</p>
                      <button
                        onClick={() => copyHook(hook.text)}
                        className="flex-shrink-0 text-slate-600 hover:text-violet-400 transition-colors"
                        title="Скопировать хук"
                      >
                        {copiedHook === hook.text
                          ? <Check className="w-3 h-3 text-emerald-400" />
                          : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <ScoreBar score={hook.score} />
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly chart */}
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Недельный тренд</h3>
              </div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyTrends} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(13,13,26,0.95)",
                        border: "1px solid rgba(139,92,246,0.2)",
                        borderRadius: "12px",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="viral" name="Viral Score" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
