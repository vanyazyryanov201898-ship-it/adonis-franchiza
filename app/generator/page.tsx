"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Zap, Copy, RefreshCw, ChevronDown,
  Check, Flame, BookOpen, Video, MessageSquare, Hash, FileText,
  History, Trash2, AlertCircle, Download, ChevronLeft, ChevronRight,
  LayoutGrid, Send, BarChart2,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { pickImages } from "@/lib/carousel-images";

const contentTypes = [
  { id: "scenario",    label: "Сценарий",    icon: Video,         description: "Полный сценарий ролика" },
  { id: "hook",        label: "Хук",         icon: Zap,           description: "Цепляющее начало" },
  { id: "cta",         label: "CTA",         icon: MessageSquare, description: "Призыв к действию" },
  { id: "title",       label: "Заголовок",   icon: Hash,          description: "Виральный заголовок" },
  { id: "description", label: "Описание",    icon: FileText,      description: "Описание под видео" },
  { id: "ideas",       label: "Идеи",        icon: BookOpen,      description: "5 идей для роликов" },
];

const topics = [
  "Как я запустил студию за 14 дней",
  "Почему выбрал франшизу, а не с нуля",
  "Реальные цифры: мой первый месяц в АДОНИС",
  "Как окупить вложения за 4.5 месяца",
  "Два пути в АДОНИС: студия или свой бренд",
  "Как работает печать DTF и UV DTF",
  "Какой мерч сейчас берут корпораты",
  "Почему бизнес на мерче не умрёт никогда",
  "5 ниш где мерч нужен всегда",
  "Как выйти на Wildberries с одеждой",
  "Год назад я сидел в найме. Сегодня...",
  "Как спортивная команда стала моим первым клиентом",
  "Что изменилось в моей жизни за 6 месяцев",
  "История: мама в декрете открыла студию",
  "Кейс: заказ для фитнес-клуба на 80 худи",
  "Кейс Кирьяк и Мария — 16 млн за год",
  "Кейс: корпоративные подарки для банка",
  "Кейс Сергей Ставрополь — 10 млн с нуля",
];

const tones = ["Доверительный", "Экспертный", "Эмоциональный", "Провокационный", "Лёгкий"];
const platforms = ["TikTok", "Instagram", "YouTube", "VK", "Telegram", "Rutube", "Yappy"];

const contentGoals = [
  { id: "expert",    label: "Экспертный",  emoji: "🎓", hint: "Польза без продажи" },
  { id: "story",     label: "История",     emoji: "❤️", hint: "Эмоция и доверие" },
  { id: "case",      label: "Кейс",        emoji: "📊", hint: "Результаты партнёра" },
  { id: "entertain", label: "Развлечение", emoji: "😄", hint: "Охваты и виральность" },
  { id: "sell",      label: "Продающий",   emoji: "💰", hint: "Прямая заявка" },
];

function StreamText({ text, done }: { text: string; done: boolean }) {
  return (
    <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed">
      {text}
      {!done && (
        <span className="inline-block w-0.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle" />
      )}
    </pre>
  );
}

type HistoryItem = {
  id: string;
  type: string;
  topic: string;
  platform: string;
  content: string;
  viralScore: number;
  createdAt: string;
};

function StepHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 flex-shrink-0">
        {num}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

export default function GeneratorPage() {
  const [selectedType, setSelectedType] = useState("scenario");
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [tone, setTone] = useState("Доверительный");
  const [platform, setPlatform] = useState("TikTok");
  const [goal, setGoal] = useState("expert");

  const [isGenerating, setIsGenerating] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [streamDone, setStreamDone] = useState(false);
  const [viralScore, setViralScore] = useState<number | null>(null);
  const [viralAnalysis, setViralAnalysis] = useState<{positives: string[]; improvements: string[]} | null>(null);
  const [carouselData, setCarouselData] = useState<{
    cover: string; subtitle: string;
    slides: {n: number; heading: string; text: string}[];
    hashtags: string; caption: string;
  } | null>(null);
  const [carouselSlide, setCarouselSlide] = useState(0);
  const [carouselBgUrl, setCarouselBgUrl] = useState("");
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("adonis_last_result");
      if (saved) {
        const r = JSON.parse(saved);
        if (r.streamText)    setStreamText(r.streamText);
        if (r.streamDone)    setStreamDone(r.streamDone);
        if (r.viralScore)    setViralScore(r.viralScore);
        if (r.viralAnalysis) setViralAnalysis(r.viralAnalysis);
        if (r.selectedType)  setSelectedType(r.selectedType);
        if (r.platform)      setPlatform(r.platform);
        if (r.tone)          setTone(r.tone);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const pending = sessionStorage.getItem("generator_topic");
      if (pending) {
        setCustomTopic(pending);
        sessionStorage.removeItem("generator_topic");
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("adonis_gen_history");
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  const saveToHistory = (item: HistoryItem) => {
    setHistory(prev => {
      const next = [item, ...prev].slice(0, 20);
      try { localStorage.setItem("adonis_gen_history", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("adonis_gen_history");
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStreamText("");
    setStreamDone(false);
    setViralScore(null);
    setViralAnalysis(null);
    setCarouselData(null);
    setCarouselSlide(0);
    setError(null);

    const topic = customTopic.trim() || selectedTopic;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, topic, platform, tone, goal }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка сервера");
        return;
      }

      const full: string = data.content;
      setViralScore(data.viralScore);
      if (data.viralAnalysis) setViralAnalysis(data.viralAnalysis);
      if (data.carouselData) {
        const imgs = pickImages(data.carouselData.slides.length + 1);
        setCarouselData(data.carouselData);
        setSlideImages(imgs);
        setStreamDone(true);
        setIsGenerating(false);
        try {
          localStorage.setItem("adonis_last_result", JSON.stringify({
            carouselData: data.carouselData, slideImages: imgs,
            viralScore: data.viralScore, selectedType, platform, tone, streamDone: true,
          }));
        } catch {}
        return;
      }

      let i = 0;
      const speed = 6;
      const tick = () => {
        if (i < full.length) {
          setStreamText(full.slice(0, i + 1));
          i++;
          setTimeout(tick, speed);
        } else {
          setStreamDone(true);
          setIsGenerating(false);
          setGenerationCount((c) => c + 1);
          try {
            localStorage.setItem("adonis_last_result", JSON.stringify({
              streamText: full, streamDone: true,
              viralScore: data.viralScore, viralAnalysis: data.viralAnalysis,
              selectedType, platform, tone,
            }));
          } catch {}
          saveToHistory({
            id: Date.now().toString(),
            type: selectedType,
            topic,
            platform,
            content: full,
            viralScore: data.viralScore,
            createdAt: new Date().toISOString(),
          });
        }
      };
      tick();
    } catch {
      setError("Сеть недоступна или сервер не отвечает");
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (text: string) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `adonis_${selectedType}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const topic = customTopic.trim() || selectedTopic;
  const hasResult = !!(streamText || carouselData);

  return (
    <AppLayout title="AI Генератор" subtitle="Создание вирусного контента через Claude AI">
      <div className="p-6 space-y-3">

        {/* ─── ШАГ 1: Тип контента ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
        >
          <StepHeader num={1} title="Что создаём?" />
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {contentTypes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedType(id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center ${
                  selectedType === id
                    ? "border-violet-500/40 bg-violet-500/10 text-white"
                    : "border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                }`}
              >
                <Icon className={`w-4 h-4 ${selectedType === id ? "text-violet-400" : ""}`} />
                <span className="text-[11px] font-medium leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── ШАГ 2: Цель ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
        >
          <StepHeader num={2} title="Цель контента" />
          <div className="flex flex-wrap gap-2">
            {contentGoals.map((g) => (
              <button
                key={g.id}
                onClick={() => setGoal(g.id)}
                title={g.hint}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  goal === g.id
                    ? "border-orange-500/40 bg-orange-500/10 text-white"
                    : "border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                }`}
              >
                <span>{g.emoji}</span>
                <div className="text-left">
                  <div className="text-xs font-semibold">{g.label}</div>
                  <div className="text-[10px] opacity-60">{g.hint}</div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── ШАГ 3: Тема ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
        >
          <StepHeader num={3} title="Тема" />
          <input
            type="text"
            placeholder="Своя тема — или выбери из списка ниже"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/40 transition-colors"
          />
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => { setSelectedTopic(t); setCustomTopic(""); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedTopic === t && !customTopic
                    ? "bg-violet-600/80 text-white"
                    : "bg-white/[0.04] text-slate-500 hover:text-slate-300 border border-white/[0.06]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ─── ШАГ 4: Платформа и тон ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
        >
          <StepHeader num={4} title="Платформа и тон" />
          <div className="space-y-4">
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 block">Платформа</label>
              <div className="flex flex-wrap gap-1.5">
                {platforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      platform === p
                        ? "bg-emerald-600/70 text-white"
                        : "bg-white/[0.04] text-slate-500 hover:text-slate-300 border border-white/[0.06]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 block">Тон подачи</label>
              <div className="flex flex-wrap gap-1.5">
                {tones.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      tone === t
                        ? "bg-blue-600/70 text-white"
                        : "bg-white/[0.04] text-slate-500 hover:text-slate-300 border border-white/[0.06]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Баннер: посты/карусели переехали ───────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-emerald-500/20 bg-emerald-900/10"
        >
          <div className="text-xs text-slate-400 flex-1">
            <span className="text-emerald-400 font-medium">Посты и Карусели</span> переехали в Контент-завод — теперь у них свой контент-план и автопостинг
          </div>
          <a href="/factory/posts" className="text-xs text-emerald-400 hover:text-emerald-300 whitespace-nowrap transition-colors">Посты →</a>
          <a href="/factory/carousels" className="text-xs text-orange-400 hover:text-orange-300 whitespace-nowrap transition-colors">Карусели →</a>
        </motion.div>

        {/* ─── Кнопка генерации ────────────────────────────── */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 rounded-2xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <RefreshCw className="w-5 h-5" />
              </motion.div>
              Claude генерирует...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Сгенерировать — {contentTypes.find(t => t.id === selectedType)?.label} · {platform} · {goal === "sell" ? "Продающий" : contentGoals.find(g => g.id === goal)?.label}
            </>
          )}
        </motion.button>

        {generationCount > 0 && (
          <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Сгенерировано {generationCount} раз в этой сессии
          </div>
        )}

        {/* ─── Результат ───────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {error && !isGenerating && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 flex flex-col items-center justify-center gap-4 text-center"
            >
              <AlertCircle className="w-10 h-10 text-red-400" />
              <div>
                <p className="text-white font-semibold mb-1">Ошибка генерации</p>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
              <button onClick={handleGenerate} className="px-4 py-2 rounded-xl bg-white/[0.06] text-sm text-white hover:bg-white/[0.1] transition-colors">
                Попробовать снова
              </button>
            </motion.div>
          )}

          {isGenerating && streamText === "" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-900/15 to-blue-900/10 flex flex-col items-center justify-center gap-6 min-h-[200px]"
            >
              <div className="relative">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/30 to-blue-600/30 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Sparkles className="w-8 h-8 text-violet-400" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 rounded-2xl border border-violet-400/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold mb-2">Claude создаёт контент</p>
                <p className="text-slate-500 text-sm">Анализирую тренды · Генерирую текст · Оптимизирую</p>
              </div>
              <div className="space-y-2 w-64">
                {["Анализ темы и тренда...", "Генерация хука...", "Оптимизация CTA...", "Расчёт Viral Score..."].map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.4 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-violet-400"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.6, delay: i * 0.4, repeat: Infinity }}
                    />
                    <span className="text-xs text-slate-500">{step}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {streamText && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-semibold text-white">Результат</span>
                  {streamDone && viralScore && (
                    <span className="text-xs font-bold text-emerald-400 ml-2">Viral Score: {viralScore}/100</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {streamDone && (
                    <span className="text-[10px] text-slate-600 tabular-nums">{streamText.length} симв.</span>
                  )}
                  <button
                    onClick={() => handleCopy(streamText, "main")}
                    disabled={!streamDone}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-40"
                  >
                    {copiedId === "main" ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Скопировано</> : <><Copy className="w-3.5 h-3.5" /> Копировать</>}
                  </button>
                  <button
                    onClick={() => handleDownload(streamText)}
                    disabled={!streamDone}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" /> .txt
                  </button>
                  <button
                    onClick={() => { setStreamText(""); setStreamDone(false); setViralScore(null); setViralAnalysis(null); try { localStorage.removeItem("adonis_last_result"); } catch {} }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Очистить
                  </button>
                </div>
              </div>

              <StreamText text={streamText} done={streamDone} />

              {streamDone && viralScore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-5 pt-4 border-t border-white/[0.05] space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-600">Viral Score:</span>
                      <span className="text-sm font-bold text-emerald-400">{viralScore}/100</span>
                      <div className="w-24 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${viralScore}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleGenerate}
                      className="text-xs text-slate-500 hover:text-violet-400 transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Регенерировать
                    </button>
                  </div>

                  {viralAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3"
                    >
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Почему такой score?</p>
                      <div className="space-y-1.5">
                        {viralAnalysis.positives?.map((p, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-emerald-400">
                            <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                      {viralAnalysis.improvements?.length > 0 && (
                        <div className="space-y-1.5 pt-2 border-t border-white/[0.05]">
                          {viralAnalysis.improvements.map((imp, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-amber-400/80">
                              <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span>{imp}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {carouselData && streamDone && (
            <motion.div key="carousel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-semibold text-white">Карусель</span>
                  {viralScore && <span className="text-xs font-bold text-emerald-400 ml-2">Viral Score: {viralScore}/100</span>}
                </div>
                <button
                  onClick={() => { setCarouselData(null); setSlideImages([]); setStreamDone(false); try { localStorage.removeItem("adonis_last_result"); } catch {} }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Очистить
                </button>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[11px] text-slate-500 flex-shrink-0">Фон слайдов:</span>
                <input
                  type="text"
                  value={carouselBgUrl}
                  onChange={(e) => setCarouselBgUrl(e.target.value)}
                  placeholder="Вставь URL фото или оставь пустым (авто из библиотеки)"
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 outline-none"
                />
                {carouselBgUrl && (
                  <button onClick={() => setCarouselBgUrl("")} className="text-slate-600 hover:text-red-400 transition-colors text-xs">✕</button>
                )}
              </div>

              {(() => {
                const totalSlides = carouselData.slides.length + 1;
                const bgPhoto = carouselBgUrl || slideImages[carouselSlide] || slideImages[0] || "";
                const isCover = carouselSlide === 0;
                const slide = isCover ? null : carouselData.slides[carouselSlide - 1];

                return (
                  <div className="max-w-sm mx-auto">
                    <div className="relative rounded-2xl overflow-hidden aspect-square">
                      {bgPhoto && (
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgPhoto})` }} />
                      )}
                      <div className="absolute inset-0" style={{
                        background: bgPhoto
                          ? "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.75) 100%)"
                          : "linear-gradient(135deg, #4c1d95 0%, #1e3a8a 100%)"
                      }} />
                      <div className="relative z-10 h-full flex flex-col justify-between p-7">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">ADONIS</span>
                          <span className="text-[10px] text-white/50">{carouselSlide + 1} / {totalSlides}</span>
                        </div>
                        <div className={isCover ? "text-center" : ""}>
                          {isCover ? (
                            <>
                              <h2 className="text-2xl font-black text-white leading-tight mb-3 drop-shadow-lg">{carouselData.cover}</h2>
                              <p className="text-sm text-white/80">{carouselData.subtitle}</p>
                            </>
                          ) : (
                            <>
                              <h3 className="text-xl font-black text-white leading-tight mb-3 drop-shadow-md">{slide?.heading}</h3>
                              <p className="text-sm text-white/85 leading-relaxed">{slide?.text}</p>
                            </>
                          )}
                        </div>
                        <div className={`flex gap-1 ${isCover ? "justify-center" : ""}`}>
                          {Array.from({ length: totalSlides }).map((_, i) => (
                            <button key={i} onClick={() => setCarouselSlide(i)}
                              className={`h-1 rounded-full transition-all ${i === carouselSlide ? "w-6 bg-white" : "w-1.5 bg-white/30"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <button onClick={() => setCarouselSlide(s => Math.max(0, s - 1))}
                        disabled={carouselSlide === 0}
                        className="p-2 rounded-xl bg-white/[0.06] text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-slate-500">Слайд {carouselSlide + 1} из {totalSlides}</span>
                      <button onClick={() => setCarouselSlide(s => Math.min(totalSlides - 1, s + 1))}
                        disabled={carouselSlide === totalSlides - 1}
                        className="p-2 rounded-xl bg-white/[0.06] text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] space-y-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Caption</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{carouselData.caption}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Хэштеги</p>
                  <p className="text-xs text-violet-400">{carouselData.hashtags}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => handleCopy(`${carouselData.caption}\n\n${carouselData.hashtags}`, "carousel-caption")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] text-xs text-slate-400 hover:text-white transition-colors">
                    {copiedId === "carousel-caption" ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Скопировано</> : <><Copy className="w-3.5 h-3.5" /> Caption</>}
                  </button>
                  <button onClick={() => handleCopy(
                    [`Обложка: ${carouselData.cover}`, ...carouselData.slides.map(s => `Слайд ${s.n}: ${s.heading}\n${s.text}`)].join("\n\n"), "carousel-all"
                  )} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] text-xs text-slate-400 hover:text-white transition-colors">
                    {copiedId === "carousel-all" ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Скопировано</> : <><Copy className="w-3.5 h-3.5" /> Все слайды</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {!error && !isGenerating && !streamText && !carouselData && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[200px] text-center p-6 rounded-2xl border border-dashed border-white/[0.08]"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-slate-600" />
              </div>
              <p className="text-slate-500 font-medium mb-1">Настрой параметры выше и нажми «Сгенерировать»</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-violet-400/60">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Claude Sonnet 4.6 · Подключён
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── История ─────────────────────────────────────── */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
          >
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-sm font-medium text-white"
              >
                <History className="w-4 h-4 text-slate-500" />
                История ({history.length})
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showHistory ? "rotate-180" : ""}`} />
              </button>
              <button onClick={clearHistory} className="text-[11px] text-slate-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {history.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => { setStreamText(item.content); setStreamDone(true); setViralScore(item.viralScore); }}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] cursor-pointer hover:border-violet-500/25 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-white truncate">{item.topic}</span>
                        <span className="text-[10px] text-violet-400 flex-shrink-0">{item.type}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5">{item.platform} · Score: {item.viralScore}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </AppLayout>
  );
}
