"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Plus, Loader2, CheckCircle2, Clock,
  Zap, Music, Type, Mic, Film, Settings2, Download,
  Eye, Sparkles, Waves, ChevronDown, ChevronUp,
  User, Bot, BarChart2, Palette, Layers,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const videoTypes = [
  { id: "avatar-real", label: "Живой аватар",  icon: User,      color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/40",  description: "Реальный человек говорит в камеру", api: "HeyGen" },
  { id: "avatar-ai",   label: "ИИ аватар",     icon: Bot,       color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/40", description: "AI-персонаж озвучивает сценарий",   api: "HeyGen" },
  { id: "infographic", label: "Инфографика",   icon: BarChart2, color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/40",   description: "Факты и цифры в движении",          api: "Creatomate" },
  { id: "cartoon",     label: "Мультяшный",    icon: Palette,   color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/40",   description: "Анимация и иллюстрация",            api: "Kling 2.0" },
  { id: "montage",     label: "Монтаж",        icon: Layers,    color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/40",   description: "Сборка из стоковых кадров",         api: "Pexels" },
];

const voiceOptions = [
  { id: "alex",  name: "Алекс",  description: "Уверенный мужской" },
  { id: "maria", name: "Мария",  description: "Профессиональный женский" },
  { id: "ivan",  name: "Иван",   description: "Энергичный мужской" },
  { id: "anna",  name: "Анна",   description: "Дружелюбный женский" },
];

const musicOptions = [
  { id: "motivational", name: "Мотивационная", bpm: "128 BPM" },
  { id: "calm",         name: "Спокойная",      bpm: "90 BPM" },
  { id: "viral",        name: "Вирусная",        bpm: "140 BPM" },
  { id: "corporate",    name: "Корпоративная",   bpm: "100 BPM" },
];

const subtitleStyles = [
  { id: "minimal", name: "Минимализм", preview: "Белый · Снизу" },
  { id: "bold",    name: "Жирный",     preview: "Жёлтый · Центр" },
  { id: "viral",   name: "Вирусный",   preview: "Цветной · Анимация" },
  { id: "premium", name: "Премиум",    preview: "Градиент · Снизу" },
];

const wavePlatforms = [
  { id: "tiktok",    name: "TikTok",    color: "#fe2c55" },
  { id: "instagram", name: "Instagram", color: "#e91e8c" },
  { id: "youtube",   name: "YouTube",   color: "#ff4444" },
  { id: "vk",        name: "VK",        color: "#0077ff" },
  { id: "telegram",  name: "Telegram",  color: "#26a5e4" },
  { id: "rutube",    name: "Rutube",    color: "#003087" },
  { id: "yappy",     name: "Yappy",     color: "#ff6600" },
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
  rendering:  { label: "Рендер",     color: "text-violet-400", bg: "bg-violet-400/10" },
  queued:     { label: "В очереди",  color: "text-slate-400",  bg: "bg-slate-400/10" },
  completed:  { label: "Готово",     color: "text-emerald-400",bg: "bg-emerald-400/10" },
  processing: { label: "Обработка",  color: "text-blue-400",   bg: "bg-blue-400/10" },
};

const initialVideos: VideoItem[] = [
  { id: 1, title: "Как открыть франшизу ADONIS за 30 дней",   status: "rendering", progress: 73, duration: "0:47", platform: ["TikTok","Instagram"], viralScore: 91, eta: "2 мин",   type: "avatar-ai" },
  { id: 2, title: "Доход партнёра ADONIS — реальные цифры",   status: "rendering", progress: 45, duration: "1:12", platform: ["YouTube","TikTok"],   viralScore: 89, eta: "5 мин",   type: "infographic" },
  { id: 3, title: "Производство мерча с нуля",                status: "queued",    progress: 0,  duration: "0:58", platform: ["Instagram"],           viralScore: 87, eta: "12 мин",  type: "montage" },
  { id: 4, title: "Почему уходят из найма в производство",    status: "completed", progress: 100,duration: "0:52", platform: ["TikTok","VK"],         viralScore: 94, eta: "Готово",  type: "avatar-real", views: 128000 },
  { id: 5, title: "Франшиза vs свой бренд — честный разбор",  status: "completed", progress: 100,duration: "1:04", platform: ["Instagram","YouTube"], viralScore: 88, eta: "Готово",  type: "cartoon",     views: 89000 },
  { id: 6, title: "Бизнес с нуля за 3 месяца — мой путь",    status: "completed", progress: 100,duration: "0:55", platform: ["TikTok"],               viralScore: 92, eta: "Готово",  type: "infographic", views: 234000 },
];

function StepHeader({ num, title, subtitle }: { num: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 flex-shrink-0">
        {num}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function VideoFactoryPage() {
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [selectedType, setSelectedType] = useState("infographic");
  const [videoTopic, setVideoTopic] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("alex");
  const [selectedMusic, setSelectedMusic] = useState("viral");
  const [selectedStyle, setSelectedStyle] = useState("viral");
  const [paramsOpen, setParamsOpen] = useState(false);

  // Launch mode: "single" | "wave"
  const [launchMode, setLaunchMode] = useState<"single" | "wave">("single");
  const [waveCount, setWaveCount] = useState(5);
  const [wavePlatformList, setWavePlatformList] = useState(["tiktok", "instagram"]);
  const [isLaunching, setIsLaunching] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleWavePlatform = (id: string) => {
    setWavePlatformList((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleLaunch = () => {
    const typeInfo = videoTypes.find((t) => t.id === selectedType);
    setIsLaunching(true);

    setTimeout(() => {
      setIsLaunching(false);
      const count = launchMode === "wave" ? waveCount : 1;
      const titles = launchMode === "wave"
        ? [
            "Как партнёры ADONIS выходят на 300K за 90 дней",
            "День из жизни владельца производства мерча",
            "5 причин выбрать франшизу ADONIS в 2026",
            "За кулисами: печатаем 500+ изделий в день",
            "Честный разбор: вложения vs доход",
            "Почему я ушёл из найма в производство",
            "Кейс партнёра: окупился за 4 месяца",
          ]
        : [videoTopic.trim() || "Новый ролик ADONIS"];

      const platforms = launchMode === "wave"
        ? wavePlatformList.map((p) => wavePlatforms.find((wp) => wp.id === p)?.name || p)
        : ["TikTok", "Instagram"];

      const newVideos: VideoItem[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        title: titles[i % titles.length],
        status: "queued",
        progress: 0,
        duration: "0:45",
        platform: platforms,
        viralScore: 80 + Math.floor(Math.random() * 15),
        eta: `${(i + 1) * 3} мин`,
        type: selectedType,
      }));

      setVideos((prev) => [...newVideos, ...prev]);
      showToast(launchMode === "wave"
        ? `AUTO-WAVE запущен: ${count} роликов в очереди!`
        : `«${newVideos[0].title.slice(0, 40)}...» добавлен в очередь`
      );
    }, 2000);
  };

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
      <div className="p-6 space-y-3">

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

        {/* ─── ШАГ 1: Тип видео ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
        >
          <StepHeader num={1} title="Тип видео" subtitle="Выбери формат — от него зависит какой инструмент будет использован" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {videoTypes.map((vt) => {
              const Icon = vt.icon;
              const isSelected = selectedType === vt.id;
              return (
                <motion.button
                  key={vt.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedType(vt.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center ${
                    isSelected ? `${vt.bg} ${vt.border}` : "border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? vt.bg : "bg-white/[0.04]"}`}>
                    <Icon className={`w-5 h-5 ${isSelected ? vt.color : "text-slate-500"}`} />
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${isSelected ? "text-white" : "text-slate-400"}`}>{vt.label}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5 leading-tight">{vt.description}</div>
                  </div>
                  <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/[0.04] ${isSelected ? vt.color : "text-slate-600"}`}>
                    {vt.api}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── ШАГ 2: Тема ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
        >
          <StepHeader num={2} title="Тема ролика" subtitle="Введи тему или вставь сценарий из AI Генератора" />
          <textarea
            value={videoTopic}
            onChange={(e) => setVideoTopic(e.target.value)}
            placeholder="Например: «Как я запустил студию АДОНИС за 14 дней» — или вставь готовый сценарий из AI Генератора..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/40 transition-colors resize-none"
          />
          <div className="mt-2 flex items-center gap-2">
            <a
              href="/generator"
              className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Перейти в AI Генератор и создать сценарий
            </a>
          </div>
        </motion.div>

        {/* ─── ШАГ 3: Параметры (свёрнуто) ────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          <button
            onClick={() => setParamsOpen(!paramsOpen)}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 flex-shrink-0">
              3
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold text-white">Параметры</div>
              <div className="text-[11px] text-slate-500">
                Голос: {voiceOptions.find(v => v.id === selectedVoice)?.name} · Музыка: {musicOptions.find(m => m.id === selectedMusic)?.name} · Субтитры: {subtitleStyles.find(s => s.id === selectedStyle)?.name}
              </div>
            </div>
            {paramsOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          <AnimatePresence>
            {paramsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">

                  {/* Voice */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Mic className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs font-semibold text-white">AI Голос</span>
                    </div>
                    <div className="space-y-1.5">
                      {voiceOptions.map((voice) => (
                        <button key={voice.id} onClick={() => setSelectedVoice(voice.id)}
                          className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left border transition-all ${
                            selectedVoice === voice.id ? "border-violet-500/40 bg-violet-500/10" : "border-white/[0.05] hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            selectedVoice === voice.id ? "bg-violet-600/50 text-violet-200" : "bg-white/[0.06] text-slate-500"
                          }`}>{voice.name[0]}</div>
                          <div>
                            <div className="text-xs font-medium text-white">{voice.name}</div>
                            <div className="text-[10px] text-slate-500">{voice.description}</div>
                          </div>
                          {selectedVoice === voice.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Music */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Music className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-semibold text-white">Музыка</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {musicOptions.map((music) => (
                        <button key={music.id} onClick={() => setSelectedMusic(music.id)}
                          className={`p-2.5 rounded-xl text-left border transition-all ${
                            selectedMusic === music.id ? "border-blue-500/40 bg-blue-500/10" : "border-white/[0.05] hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="text-xs font-medium text-white">{music.name}</div>
                          <div className="text-[10px] text-slate-500">{music.bpm}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtitles */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Type className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-semibold text-white">Субтитры</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {subtitleStyles.map((style) => (
                        <button key={style.id} onClick={() => setSelectedStyle(style.id)}
                          className={`p-2.5 rounded-xl text-left border transition-all ${
                            selectedStyle === style.id ? "border-emerald-500/40 bg-emerald-500/10" : "border-white/[0.05] hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="text-xs font-medium text-white">{style.name}</div>
                          <div className="text-[10px] text-slate-500">{style.preview}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── ШАГ 4: Запуск ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
        >
          <StepHeader num={4} title="Запуск" subtitle="Один ролик или сразу пачка?" />

          {/* Mode selector */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              onClick={() => setLaunchMode("single")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                launchMode === "single"
                  ? "border-violet-500/40 bg-violet-500/10"
                  : "border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              <Film className={`w-5 h-5 ${launchMode === "single" ? "text-violet-400" : "text-slate-500"}`} />
              <div className={`text-sm font-semibold ${launchMode === "single" ? "text-white" : "text-slate-400"}`}>1 видео</div>
              <div className="text-[11px] text-slate-600">По теме выше</div>
            </button>
            <button
              onClick={() => setLaunchMode("wave")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                launchMode === "wave"
                  ? "border-violet-500/40 bg-violet-500/10"
                  : "border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              <Waves className={`w-5 h-5 ${launchMode === "wave" ? "text-violet-400" : "text-slate-500"}`} />
              <div className={`text-sm font-semibold ${launchMode === "wave" ? "text-white" : "text-slate-400"}`}>AUTO-WAVE</div>
              <div className="text-[11px] text-slate-600">Пачка роликов сразу</div>
            </button>
          </div>

          {/* Wave settings */}
          <AnimatePresence>
            {launchMode === "wave" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mb-5"
              >
                <div className="space-y-4 pt-2 pb-4 border-t border-white/[0.06]">
                  <div className="pt-3">
                    <label className="text-xs text-slate-500 mb-2 block">Количество роликов</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setWaveCount((c) => Math.max(1, c - 1))}
                        className="w-8 h-8 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white transition-all flex items-center justify-center text-lg font-bold">
                        −
                      </button>
                      <div className="text-2xl font-bold text-white w-10 text-center">{waveCount}</div>
                      <button onClick={() => setWaveCount((c) => Math.min(30, c + 1))}
                        className="w-8 h-8 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white transition-all flex items-center justify-center text-lg font-bold">
                        +
                      </button>
                    </div>
                  </div>
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
                  <div className="text-xs text-slate-500">
                    Будет создано <span className="text-white font-semibold">{waveCount}</span> роликов · примерно <span className="text-emerald-400">{Math.ceil(waveCount * 1.5)} мин</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Launch button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleLaunch}
            disabled={isLaunching || (launchMode === "wave" && wavePlatformList.length === 0)}
            className="w-full py-4 rounded-xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLaunching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {launchMode === "wave" ? "Запускаю волну..." : "Создаю видео..."}
              </>
            ) : launchMode === "wave" ? (
              <>
                <Waves className="w-4 h-4" />
                Запустить AUTO-WAVE — {waveCount} роликов
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Создать видео — {videoTypes.find(t => t.id === selectedType)?.label}
              </>
            )}
          </motion.button>
        </motion.div>

        {/* ─── Статистика ──────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Очередь — демо-данные.</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-[10px] font-semibold text-amber-400">📊 ДЕМО</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "В рендере",     value: totalRendering,   icon: Loader2,       color: "text-violet-400", spin: true },
            { label: "Готово",        value: totalCompleted,   icon: CheckCircle2,  color: "text-emerald-400" },
            { label: "В очереди",     value: videos.filter(v => v.status === "queued").length, icon: Clock, color: "text-slate-400" },
            { label: "Всего",         value: videos.length,    icon: Film,          color: "text-blue-400" },
          ].map((stat, i) => (
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

        {/* ─── Очередь роликов ─────────────────────────────── */}
        <div>
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

          <div className="space-y-2">
            {videos.map((video, index) => {
              const config = statusConfig[video.status];
              const isRendering = video.status === "rendering";
              const typeInfo = videoTypes.find((t) => t.id === video.type);
              const TypeIcon = typeInfo?.icon;

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
                        {typeInfo && TypeIcon && (
                          <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${typeInfo.bg} ${typeInfo.color}`}>
                            <TypeIcon className="w-2.5 h-2.5" />
                            {typeInfo.label}
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
                          <button onClick={(e) => { e.stopPropagation(); showToast(`Просмотр: «${video.title.slice(0, 30)}...»`); }}
                            className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300">
                            <Play className="w-2.5 h-2.5" /> Смотреть
                          </button>
                          <span className="text-slate-700">·</span>
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
    </AppLayout>
  );
}
