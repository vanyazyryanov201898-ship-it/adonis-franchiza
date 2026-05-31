"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Zap, Copy, RefreshCw, ChevronDown,
  Check, Flame, BookOpen, Video, MessageSquare, Hash, FileText,
  History, Trash2, AlertCircle, Download, ChevronLeft, ChevronRight,
  LayoutGrid, Send,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { pickImages } from "@/lib/carousel-images";

const contentTypes = [
  { id: "scenario",    label: "Сценарий",  icon: Video,        description: "Полный сценарий ролика" },
  { id: "hook",        label: "Хук",       icon: Zap,          description: "Цепляющее начало" },
  { id: "post",        label: "Пост",      icon: Send,         description: "Готовый пост для соцсетей" },
  { id: "carousel",   label: "Карусель",  icon: LayoutGrid,   description: "Слайды для Instagram" },
  { id: "cta",         label: "CTA",       icon: MessageSquare,description: "Призыв к действию" },
  { id: "title",       label: "Заголовок", icon: Hash,         description: "Виральный заголовок" },
  { id: "description", label: "Описание",  icon: FileText,     description: "Описание под видео" },
  { id: "ideas",       label: "Идеи",      icon: BookOpen,     description: "5 идей для роликов" },
];

const topics = [
  "Уход из найма",
  "Как окупиться за 3-5 месяцев",
  "Франшиза ADONIS — честный разбор",
  "Студия брендирования с нуля",
  "Печать на одежде как бизнес",
  "Продажи на Wildberries",
  "Доход 150–300К в месяц",
  "Бизнес без офиса и сотрудников",
  "Открытие ИП за 1 день",
  "Корпоративные заказы на мерч",
  "Свой бренд одежды с нуля",
  "Масштабирование студии",
  "Реальные цифры партнёра",
  "Производство от 30 до 1000 штук",
  "Финансовая свобода через франшизу",
];

const tones = ["Доверительный", "Экспертный", "Эмоциональный", "Провокационный", "Лёгкий"];
const platforms = ["TikTok", "Instagram", "YouTube", "VK", "Telegram", "Rutube", "Yappy"];

// ─── Анимированный курсор при стриминге ────────────────────
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

// ─── Тип истории ────────────────────────────────────────────
type HistoryItem = {
  id: string;
  type: string;
  topic: string;
  platform: string;
  content: string;
  viralScore: number;
  createdAt: string;
};

export default function GeneratorPage() {
  const [selectedType, setSelectedType] = useState("scenario");
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [tone, setTone] = useState("Доверительный");
  const [platform, setPlatform] = useState("TikTok");

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

  // Восстанавливаем последний результат при возврате на страницу
  useEffect(() => {
    try {
      const saved = localStorage.getItem("adonis_last_result");
      if (saved) {
        const r = JSON.parse(saved);
        if (r.streamText)    setStreamText(r.streamText);
        if (r.streamDone)    setStreamDone(r.streamDone);
        if (r.viralScore)    setViralScore(r.viralScore);
        if (r.viralAnalysis) setViralAnalysis(r.viralAnalysis);
        if (r.carouselData)  { setCarouselData(r.carouselData); setSlideImages(r.slideImages || []); }
        if (r.selectedType)  setSelectedType(r.selectedType);
        if (r.platform)      setPlatform(r.platform);
        if (r.tone)          setTone(r.tone);
      }
    } catch {}
  }, []);

  // Подхватываем тему из Trends/Analysis если передана через sessionStorage
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem("generator_topic");
      if (pending) {
        setCustomTopic(pending);
        sessionStorage.removeItem("generator_topic");
      }
    } catch {}
  }, []);

  // Загружаем историю из localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("adonis_gen_history");
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  const saveToHistory = (item: HistoryItem) => {
    const next = [item, ...history].slice(0, 20); // храним последние 20
    setHistory(next);
    try { localStorage.setItem("adonis_gen_history", JSON.stringify(next)); } catch {}
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
        body: JSON.stringify({ type: selectedType, topic, platform, tone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка сервера");
        return;
      }

      // Имитируем стриминг для красивого эффекта
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
      const speed = 6; // мс на символ

      const tick = () => {
        if (i < full.length) {
          setStreamText(full.slice(0, i + 1));
          i++;
          setTimeout(tick, speed);
        } else {
          setStreamDone(true);
          setIsGenerating(false);
          setGenerationCount((c) => c + 1);

          // Сохраняем результат — восстановится при возврате на страницу
          try {
            localStorage.setItem("adonis_last_result", JSON.stringify({
              streamText: full, streamDone: true,
              viralScore: data.viralScore, viralAnalysis: data.viralAnalysis,
              selectedType, platform, tone,
            }));
          } catch {}

          // Сохраняем в историю
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
    } catch (err: any) {
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

  return (
    <AppLayout title="AI Генератор" subtitle="Создание вирусного контента через Claude AI">
      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* ─── Левая панель: настройки ─────────────────────── */}
          <div className="xl:col-span-2 space-y-5">

            {/* Тип контента */}
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Тип контента
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {contentTypes.map(({ id, label, icon: Icon, description }) => (
                  <button
                    key={id}
                    onClick={() => setSelectedType(id)}
                    className={`flex flex-col gap-1.5 p-3 rounded-xl text-left border transition-all ${
                      selectedType === id
                        ? "border-violet-500/40 bg-violet-500/10 text-white"
                        : "border-white/[0.06] bg-transparent text-slate-500 hover:text-slate-400 hover:bg-white/[0.03]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${selectedType === id ? "text-violet-400" : ""}`} />
                    <span className="text-xs font-medium">{label}</span>
                    <span className="text-[10px] opacity-70">{description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Тема */}
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-white mb-3">Тема</h3>

              {/* Свой вариант */}
              <input
                type="text"
                placeholder="Своя тема (или выбери ниже)"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full mb-3 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/40 transition-colors"
              />

              <div className="flex flex-wrap gap-2">
                {topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setSelectedTopic(t); setCustomTopic(""); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedTopic === t && !customTopic
                        ? "bg-violet-600/80 text-white"
                        : "bg-white/[0.04] text-slate-500 hover:text-slate-400 border border-white/[0.06]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Параметры */}
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] space-y-4">
              <h3 className="text-sm font-semibold text-white">Параметры</h3>

              <div>
                <label className="text-xs text-slate-500 mb-2 block">Тон подачи</label>
                <div className="flex flex-wrap gap-1.5">
                  {tones.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        tone === t
                          ? "bg-blue-600/70 text-white"
                          : "bg-white/[0.04] text-slate-600 hover:text-slate-400"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-2 block">Платформа</label>
                <div className="flex gap-1.5 flex-wrap">
                  {platforms.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        platform === p
                          ? "bg-emerald-600/70 text-white"
                          : "bg-white/[0.04] text-slate-600 hover:text-slate-400"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Кнопка генерации */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
                  Сгенерировать контент
                </>
              )}
            </motion.button>

            {generationCount > 0 && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Сгенерировано {generationCount} раз в этой сессии
              </div>
            )}

            {/* История */}
            {history.length > 0 && (
              <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
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
                          onClick={() => {
                            setStreamText(item.content);
                            setStreamDone(true);
                            setViralScore(item.viralScore);
                          }}
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
              </div>
            )}
          </div>

          {/* ─── Правая панель: результат ────────────────────── */}
          <div className="xl:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Результат генерации
              </h3>
              <div className="flex items-center gap-3">
                {streamDone && viralScore && (
                  <span className="text-xs font-bold text-emerald-400">Viral Score: {viralScore}/100</span>
                )}
                {(streamDone || carouselData) && (
                  <button
                    onClick={() => {
                      setStreamText(""); setStreamDone(false); setViralScore(null);
                      setViralAnalysis(null); setCarouselData(null); setSlideImages([]);
                      try { localStorage.removeItem("adonis_last_result"); } catch {}
                    }}
                    className="text-xs text-slate-600 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Очистить
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* Ошибка */}
              {error && !isGenerating && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 flex flex-col items-center justify-center min-h-[200px] gap-4 text-center"
                >
                  <AlertCircle className="w-10 h-10 text-red-400" />
                  <div>
                    <p className="text-white font-semibold mb-1">Ошибка генерации</p>
                    <p className="text-red-400 text-sm">{error}</p>
                    <p className="text-slate-600 text-xs mt-2">Проверь ANTHROPIC_API_KEY в файле .env.local</p>
                  </div>
                  <button
                    onClick={handleGenerate}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] text-sm text-white hover:bg-white/[0.1] transition-colors"
                  >
                    Попробовать снова
                  </button>
                </motion.div>
              )}

              {/* Загрузка / стриминг */}
              {isGenerating && streamText === "" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-900/15 to-blue-900/10 min-h-[400px] flex flex-col items-center justify-center gap-6"
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

              {/* Стриминг результата */}
              {streamText && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] group"
                >
                  {/* Кнопки действий */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {streamDone && (
                      <span className="text-[10px] text-slate-600 tabular-nums">
                        {streamText.length} симв.
                      </span>
                    )}
                    <button
                      onClick={() => handleCopy(streamText, "main")}
                      disabled={!streamDone}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-40"
                    >
                      {copiedId === "main" ? (
                        <><Check className="w-3.5 h-3.5 text-emerald-400" /> Скопировано</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Копировать</>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownload(streamText)}
                      disabled={!streamDone}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-40"
                    >
                      <Download className="w-3.5 h-3.5" />
                      .txt
                    </button>
                  </div>

                  <StreamText text={streamText} done={streamDone} />

                  {/* Footer */}
                  {streamDone && viralScore && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-5 pt-4 border-t border-white/[0.05] space-y-4"
                    >
                      {/* Score row */}
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

                      {/* Viral Analysis */}
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

              {/* Карусель превью */}
              {carouselData && streamDone && (
                <motion.div key="carousel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

                  {/* Фон — URL или авто из библиотеки */}
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

                  {/* Slide card */}
                  {(() => {
                    const totalSlides = carouselData.slides.length + 1;
                    const bgPhoto = carouselBgUrl || slideImages[carouselSlide] || slideImages[0] || "";
                    const isCover = carouselSlide === 0;
                    const slide = isCover ? null : carouselData.slides[carouselSlide - 1];

                    return (
                      <div className="max-w-sm mx-auto">
                        <div className="relative rounded-2xl overflow-hidden aspect-square">
                          {/* Фото фон */}
                          {bgPhoto && (
                            <div className="absolute inset-0 bg-cover bg-center"
                              style={{ backgroundImage: `url(${bgPhoto})` }} />
                          )}
                          {/* Тёмный оверлей */}
                          <div className="absolute inset-0" style={{
                            background: bgPhoto
                              ? "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.75) 100%)"
                              : "linear-gradient(135deg, #4c1d95 0%, #1e3a8a 100%)"
                          }} />

                          {/* Контент */}
                          <div className="relative z-10 h-full flex flex-col justify-between p-7">
                            {/* Top */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">ADONIS</span>
                              <span className="text-[10px] text-white/50">{carouselSlide + 1} / {totalSlides}</span>
                            </div>

                            {/* Middle */}
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

                            {/* Dots */}
                            <div className={`flex gap-1 ${isCover ? "justify-center" : ""}`}>
                              {Array.from({ length: totalSlides }).map((_, i) => (
                                <button key={i} onClick={() => setCarouselSlide(i)}
                                  className={`h-1 rounded-full transition-all ${i === carouselSlide ? "w-6 bg-white" : "w-1.5 bg-white/30"}`} />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Navigation */}
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

                  {/* Caption + hashtags */}
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

              {/* Пустой стейт */}
              {!error && !isGenerating && !streamText && !carouselData && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 rounded-2xl border border-dashed border-white/[0.08]"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-500 font-medium mb-2">Готов к генерации через Claude AI</p>
                  <p className="text-slate-600 text-sm">
                    Выбери тему, тип контента и нажми «Сгенерировать»
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-violet-400/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    Claude Sonnet 4.6 · Подключён
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
