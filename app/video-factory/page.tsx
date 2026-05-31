"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Plus, Loader2, CheckCircle2, Clock,
  Zap, Music, Type, Mic, Film, Settings2, Download,
  Eye, Sparkles, Waves,
  Calendar, Package, ChevronDown, ChevronUp,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const voiceOptions = [
  { id: "alex", name: "Алекс", description: "Уверенный мужской", lang: "RU" },
  { id: "maria", name: "Мария", description: "Профессиональный женский", lang: "RU" },
  { id: "ivan", name: "Иван", description: "Энергичный мужской", lang: "RU" },
  { id: "anna", name: "Анна", description: "Дружелюбный женский", lang: "RU" },
];

const musicOptions = [
  { id: "motivational", name: "Мотивационная", bpm: "128 BPM", mood: "Энергичная" },
  { id: "calm", name: "Спокойная", bpm: "90 BPM", mood: "Фоновая" },
  { id: "viral", name: "Вирусная", bpm: "140 BPM", mood: "Хайп" },
  { id: "corporate", name: "Корпоративная", bpm: "100 BPM", mood: "Деловая" },
];

const subtitleStyles = [
  { id: "minimal", name: "Минимализм", preview: "Белый · Снизу" },
  { id: "bold", name: "Жирный", preview: "Жёлтый · Центр" },
  { id: "viral", name: "Вирусный", preview: "Цветной · Анимация" },
  { id: "premium", name: "Премиум", preview: "Градиент · Снизу" },
];

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
}

const initialVideos: VideoItem[] = [
  {
    id: 1,
    title: "Как открыть франшизу ADONIS за 30 дней",
    status: "rendering",
    progress: 73,
    duration: "0:47",
    platform: ["TikTok", "Instagram"],
    viralScore: 91,
    eta: "2 мин",
  },
  {
    id: 2,
    title: "Доход партнёра ADONIS — реальные цифры",
    status: "rendering",
    progress: 45,
    duration: "1:12",
    platform: ["YouTube", "TikTok"],
    viralScore: 89,
    eta: "5 мин",
  },
  {
    id: 3,
    title: "Производство мерча с нуля",
    status: "queued",
    progress: 0,
    duration: "0:58",
    platform: ["Instagram"],
    viralScore: 87,
    eta: "12 мин",
  },
  {
    id: 4,
    title: "Почему уходят из найма в производство",
    status: "completed",
    progress: 100,
    duration: "0:52",
    platform: ["TikTok", "VK"],
    viralScore: 94,
    eta: "Готово",
    views: 128000,
  },
  {
    id: 5,
    title: "Франшиза vs свой бренд — честный разбор",
    status: "completed",
    progress: 100,
    duration: "1:04",
    platform: ["Instagram", "YouTube"],
    viralScore: 88,
    eta: "Готово",
    views: 89000,
  },
  {
    id: 6,
    title: "Бизнес с нуля за 3 месяца — мой путь",
    status: "completed",
    progress: 100,
    duration: "0:55",
    platform: ["TikTok"],
    viralScore: 92,
    eta: "Готово",
    views: 234000,
  },
];

const platformColors: Record<string, string> = {
  TikTok: "#fe2c55",
  Instagram: "#e91e8c",
  YouTube: "#ff4444",
  VK: "#0077ff",
  Telegram: "#26a5e4",
  Rutube: "#003087",
  Yappy: "#ff6600",
};

const statusConfig: Record<VideoStatus, { label: string; color: string; bg: string }> = {
  rendering: { label: "Рендер", color: "text-violet-400", bg: "bg-violet-400/10" },
  queued: { label: "В очереди", color: "text-slate-400", bg: "bg-slate-400/10" },
  completed: { label: "Готово", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  processing: { label: "Обработка", color: "text-blue-400", bg: "bg-blue-400/10" },
};

const waveContentTypes = [
  { id: "video", label: "Видео", icon: Film, color: "text-violet-400" },
  { id: "posts", label: "Посты", icon: Sparkles, color: "text-cyan-400" },
  { id: "carousel", label: "Карусели", icon: Package, color: "text-blue-400" },
];

const wavePlatforms = [
  { id: "tiktok", name: "TikTok", color: "#fe2c55" },
  { id: "instagram", name: "Instagram", color: "#e91e8c" },
  { id: "youtube", name: "YouTube", color: "#ff4444" },
  { id: "vk", name: "VK", color: "#0077ff" },
  { id: "telegram", name: "Telegram", color: "#26a5e4" },
  { id: "rutube", name: "Rutube", color: "#003087" },
  { id: "yappy", name: "Yappy", color: "#ff6600" },
];

const wavePeriods = [
  { id: "day", label: "1 день", units: 1 },
  { id: "week", label: "Неделя", units: 7 },
  { id: "two_weeks", label: "2 недели", units: 14 },
  { id: "month", label: "Месяц", units: 30 },
];

export default function VideoFactoryPage() {
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [selectedVoice, setSelectedVoice] = useState("alex");
  const [selectedMusic, setSelectedMusic] = useState("viral");
  const [selectedStyle, setSelectedStyle] = useState("viral");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateVideo = () => {
    if (!newVideoTitle.trim()) return;
    const newVideo: VideoItem = {
      id: Date.now(),
      title: newVideoTitle.trim(),
      status: "queued",
      progress: 0,
      duration: "0:45",
      platform: ["TikTok", "Instagram"],
      viralScore: 80 + Math.floor(Math.random() * 15),
      eta: "5 мин",
    };
    setVideos((prev) => [newVideo, ...prev]);
    setNewVideoTitle("");
    setShowNewForm(false);
    showToast("Ролик добавлен в очередь рендера!");
  };

  // AUTO-WAVE state
  const [waveOpen, setWaveOpen] = useState(true);
  const [wavePeriod, setWavePeriod] = useState("week");
  const [waveType, setWaveType] = useState("video");
  const [waveCount, setWaveCount] = useState(5);
  const [wavePlatformList, setWavePlatformList] = useState(["tiktok", "instagram"]);
  const [waveLaunching, setWaveLaunching] = useState(false);
  const [waveLaunched, setWaveLaunched] = useState(false);

  const toggleWavePlatform = (id: string) => {
    setWavePlatformList((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleLaunchWave = () => {
    setWaveLaunching(true);
    setTimeout(() => {
      setWaveLaunching(false);
      setWaveLaunched(true);
      const newVideos: VideoItem[] = Array.from({ length: waveCount }, (_, i) => ({
        id: Date.now() + i,
        title: [
          "Как партнёры ADONIS выходят на 300K за 90 дней",
          "День из жизни владельца производства мерча",
          "5 причин выбрать франшизу ADONIS в 2026",
          "За кулисами: печатаем 500+ изделий в день",
          "Честный разбор: вложения vs доход",
          "Почему я ушёл из найма в производство",
          "Кейс партнёра: окупился за 4 месяца",
        ][i % 7],
        status: "queued",
        progress: 0,
        duration: `0:${40 + i * 5}`,
        platform: wavePlatformList.map((p) =>
          wavePlatforms.find((wp) => wp.id === p)?.name || p
        ),
        viralScore: 80 + Math.floor(Math.random() * 15),
        eta: `${(i + 1) * 3} мин`,
      }));
      setVideos((prev) => [...newVideos, ...prev]);
      setTimeout(() => setWaveLaunched(false), 4000);
    }, 2500);
  };

  const selectedPeriod = wavePeriods.find((p) => p.id === wavePeriod);
  const estimatedCost = (waveCount * 0.24).toFixed(2);
  const estimatedTime = `${Math.ceil(waveCount * 1.5)} мин`;


  useEffect(() => {
    const interval = setInterval(() => {
      setVideos((prev) =>
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

  const totalRendering = videos.filter((v) => v.status === "rendering").length;
  const totalCompleted = videos.filter((v) => v.status === "completed").length;

  return (
    <AppLayout title="Видео-фабрика" subtitle="AI рендер и управление роликами">
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

        {/* AUTO-WAVE Block */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-900/15 to-blue-900/10 overflow-hidden"
        >
          {/* Header */}
          <button
            onClick={() => setWaveOpen(!waveOpen)}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Waves className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-left flex-1">
              <div className="text-sm font-semibold text-white">AUTO-WAVE — Пакетная генерация</div>
              <div className="text-[11px] text-slate-500">Запусти сразу {waveCount} роликов за один клик</div>
            </div>
            <div className="flex items-center gap-2">
              {waveLaunched && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[11px] text-emerald-400 font-medium"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Запущено!
                  </motion.div>
                </AnimatePresence>
              )}
              {waveOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </button>

          {/* Body */}
          <AnimatePresence>
            {waveOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-4 border-t border-white/[0.06]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">

                    {/* Period */}
                    <div>
                      <label className="text-xs text-slate-500 mb-2 block flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Период
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {wavePeriods.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setWavePeriod(p.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                              wavePeriod === p.id
                                ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                                : "border-white/[0.06] text-slate-500 hover:text-white hover:border-white/[0.12]"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Content Type */}
                    <div>
                      <label className="text-xs text-slate-500 mb-2 block flex items-center gap-1.5">
                        <Package className="w-3 h-3" /> Тип контента
                      </label>
                      <div className="space-y-1.5">
                        {waveContentTypes.map((ct) => {
                          const Icon = ct.icon;
                          return (
                            <button
                              key={ct.id}
                              onClick={() => setWaveType(ct.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs border transition-all ${
                                waveType === ct.id
                                  ? "border-violet-500/40 bg-violet-500/10 text-white"
                                  : "border-white/[0.06] text-slate-500 hover:text-white hover:border-white/[0.12]"
                              }`}
                            >
                              <Icon className={`w-3.5 h-3.5 ${waveType === ct.id ? ct.color : "text-slate-600"}`} />
                              {ct.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Platforms + Count */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-500 mb-2 block">Платформы</label>
                        <div className="flex flex-wrap gap-1.5">
                          {wavePlatforms.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => toggleWavePlatform(p.id)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all"
                              style={
                                wavePlatformList.includes(p.id)
                                  ? { borderColor: `${p.color}50`, backgroundColor: `${p.color}18`, color: p.color }
                                  : { borderColor: "rgba(255,255,255,0.06)", color: "#475569" }
                              }
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-500 mb-2 block">Количество единиц</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setWaveCount((c) => Math.max(1, c - 1))}
                            className="w-8 h-8 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.2] transition-all flex items-center justify-center text-lg font-bold"
                          >
                            −
                          </button>
                          <div className="flex-1 text-center text-xl font-bold text-white">{waveCount}</div>
                          <button
                            onClick={() => setWaveCount((c) => Math.min(30, c + 1))}
                            className="w-8 h-8 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.2] transition-all flex items-center justify-center text-lg font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Estimate + Launch */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center gap-5 text-xs text-slate-500">
                      <span>
                        <span className="text-white font-semibold">{waveCount}</span> единиц за{" "}
                        <span className="text-violet-300">{selectedPeriod?.label.toLowerCase()}</span>
                      </span>
                      <span>≈ <span className="text-emerald-400 font-semibold">{estimatedTime}</span> рендера</span>
                      <span>≈ <span className="text-amber-400 font-semibold">${estimatedCost}</span></span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLaunchWave}
                      disabled={waveLaunching || wavePlatformList.length === 0}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-ai text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {waveLaunching ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Запускаю волну...
                        </>
                      ) : (
                        <>
                          <Waves className="w-4 h-4" />
                          Запустить AUTO-WAVE
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats Row */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-slate-500">Очередь и статистика — демо-данные.</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-[10px] font-semibold text-amber-400 tracking-wide">📊 ДЕМО</span>
          <span className="text-xs text-slate-500">Реальный рендер подключается под клиента.</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "В рендере", value: totalRendering, icon: Loader2, color: "text-violet-400", spin: true },
            { label: "Готово сегодня", value: totalCompleted, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "В очереди", value: 3, icon: Clock, color: "text-slate-400" },
            { label: "Всего роликов", value: videos.length, icon: Film, color: "text-blue-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                <stat.icon
                  className={`w-5 h-5 ${stat.color} ${(stat as any).spin ? "animate-spin" : ""}`}
                />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left: Settings */}
          <div className="xl:col-span-1 space-y-5">

            {/* Voice Selection */}
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-4">
                <Mic className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">AI Голос</h3>
              </div>
              <div className="space-y-2">
                {voiceOptions.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border transition-all ${
                      selectedVoice === voice.id
                        ? "border-violet-500/40 bg-violet-500/10"
                        : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      selectedVoice === voice.id ? "bg-violet-600/50 text-violet-200" : "bg-white/[0.06] text-slate-500"
                    }`}>
                      {voice.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">{voice.name}</div>
                      <div className="text-[10px] text-slate-500">{voice.description}</div>
                    </div>
                    <div className="ml-auto">
                      {selectedVoice === voice.id && (
                        <div className="w-2 h-2 rounded-full bg-violet-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Music */}
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Музыка</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {musicOptions.map((music) => (
                  <button
                    key={music.id}
                    onClick={() => setSelectedMusic(music.id)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      selectedMusic === music.id
                        ? "border-blue-500/40 bg-blue-500/10"
                        : "border-white/[0.05] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="text-xs font-medium text-white mb-0.5">{music.name}</div>
                    <div className="text-[10px] text-slate-500">{music.bpm}</div>
                    <div className={`text-[10px] mt-1 ${selectedMusic === music.id ? "text-blue-400" : "text-slate-600"}`}>
                      {music.mood}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitles */}
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Субтитры</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {subtitleStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      selectedStyle === style.id
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : "border-white/[0.05] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="text-xs font-medium text-white mb-0.5">{style.name}</div>
                    <div className="text-[10px] text-slate-500">{style.preview}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Create Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNewForm(!showNewForm)}
              className="w-full py-3.5 rounded-2xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Создать новый ролик
            </motion.button>

            {/* New Video Form */}
            <AnimatePresence>
              {showNewForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-2xl border border-violet-500/25 bg-violet-500/[0.06] space-y-3">
                    <p className="text-xs font-semibold text-white">Новый ролик</p>
                    <input
                      type="text"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateVideo()}
                      placeholder="Название ролика..."
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/50 transition-colors"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleCreateVideo}
                        disabled={!newVideoTitle.trim()}
                        className="flex-1 py-2 rounded-xl bg-violet-600/70 text-xs font-semibold text-white hover:bg-violet-600/90 transition-colors disabled:opacity-40"
                      >
                        Добавить в очередь
                      </motion.button>
                      <button
                        onClick={() => { setShowNewForm(false); setNewVideoTitle(""); }}
                        className="px-3 py-2 rounded-xl bg-white/[0.06] text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Video Queue */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-violet-400" />
                Очередь и готовые ролики
              </h3>
              <button
                onClick={() => showToast("Настройки рендера будут доступны в следующем обновлении")}
                className="text-xs text-slate-500 hover:text-violet-400 transition-colors flex items-center gap-1"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Настройки рендера
              </button>
            </div>

            <div className="space-y-3">
              {videos.map((video, index) => {
                const config = statusConfig[video.status];
                const isRendering = video.status === "rendering";

                return (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                      isRendering
                        ? "border-violet-500/25 bg-violet-500/5"
                        : video.status === "completed"
                        ? "border-emerald-500/15 bg-emerald-500/[0.03] hover:border-emerald-500/25"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                    onClick={() => {}}
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-10 rounded-xl bg-gradient-to-br from-violet-900/40 to-blue-900/40 border border-white/[0.08] flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {video.status === "completed" ? (
                          <div className="relative w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 text-white/70" fill="currentColor" />
                          </div>
                        ) : isRendering ? (
                          <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-white truncate">{video.title}</p>
                          <div className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.color}`}>
                            {isRendering && <Loader2 className="w-3 h-3 animate-spin" />}
                            {video.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                            {video.status === "queued" && <Clock className="w-3 h-3" />}
                            {config.label}
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[11px] text-slate-500">{video.duration}</span>
                          <div className="flex gap-1">
                            {video.platform.map((p) => (
                              <span
                                key={p}
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                                style={{ color: platformColors[p], backgroundColor: `${platformColors[p]}15` }}
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                          <span className="text-[11px] text-violet-400">Score: {video.viralScore}</span>
                          {video.views && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Eye className="w-3 h-3" />
                              {(video.views / 1000).toFixed(0)}K
                            </span>
                          )}
                        </div>

                        {/* Progress */}
                        {isRendering && (
                          <div>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-slate-500">Рендер: {Math.round(video.progress)}%</span>
                              <span className="text-slate-500">ETA: {video.eta}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                                style={{ width: `${video.progress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Actions for completed */}
                        {video.status === "completed" && (
                          <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); showToast(`Просмотр: «${video.title.slice(0, 30)}...»`); }}
                              className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300"
                            >
                              <Play className="w-3 h-3" />
                              Смотреть
                            </button>
                            <span className="text-slate-700">·</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); showToast("Видео скачивается..."); }}
                              className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300"
                            >
                              <Download className="w-3 h-3" />
                              Скачать
                            </button>
                            <span className="text-slate-700">·</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); showToast("Ролик отправлен в расписание автопостинга!"); }}
                              className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300"
                            >
                              <Zap className="w-3 h-3" />
                              Опубликовать
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
      </div>
    </AppLayout>
  );
}
