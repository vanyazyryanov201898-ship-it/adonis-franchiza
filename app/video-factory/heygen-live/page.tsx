"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Sparkles, Copy, Check, RefreshCw, ChevronLeft, Flame, Video, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";

const deliveryTypes = [
  { id: "Личная история",   emoji: "❤️", hint: "От первого лица, твой путь" },
  { id: "Кейс партнёра",    emoji: "📊", hint: "Имя, город, цифры" },
  { id: "Экспертный совет", emoji: "🎓", hint: "Польза без продажи" },
  { id: "День из жизни",    emoji: "📷", hint: "Живо, детально" },
];

const speakers = [
  "Я (от первого лица)",
  "Партнёр (своё имя)",
  "Илья Анастасов",
];

const durations = ["30", "45", "60", "90"];

const platforms = ["TikTok", "Instagram", "YouTube", "VK", "Telegram"];

const contentPlanTopics = [
  "Мой первый месяц в АДОНИС — честно",
  "Как я нашёл первого клиента на 80 000 руб",
  "Страхи перед покупкой франшизы",
  "День производства: 200 изделий за смену",
  "Почему ушёл из найма в мерч-бизнес",
];

function StepHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-400 flex-shrink-0">
        {num}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

export default function HeyGenLivePage() {
  const [deliveryType, setDeliveryType] = useState("Личная история");
  const [speaker, setSpeaker] = useState("Я (от первого лица)");
  const [duration, setDuration] = useState("60");
  const [platform, setPlatform] = useState("TikTok");
  const [topic, setTopic] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [viralScore, setViralScore] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [addedToQueue, setAddedToQueue] = useState(false);

  function extractTitle(text: string) {
    const m = text.match(/«([^»]+)»/);
    return m ? m[1] : topic.trim() || "HeyGen Живой ролик";
  }

  function addToQueue() {
    const item = {
      id: Date.now(),
      title: extractTitle(result),
      direction: "heygen-live",
      platforms: [platform],
      script: result,
      status: "queued",
      progress: 0,
      viralScore: viralScore || 88,
      duration: `~${duration}с`,
      addedAt: Date.now(),
    };
    const existing = JSON.parse(localStorage.getItem("adonis_queue") || "[]");
    localStorage.setItem("adonis_queue", JSON.stringify([item, ...existing.slice(0, 19)]));
    setAddedToQueue(true);
  }

  async function generate() {
    const finalTopic = topic.trim() || "Почему я выбрал мерч-бизнес";
    setIsGenerating(true);
    setResult("");
    setViralScore(null);
    setError("");
    setAddedToQueue(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: finalTopic,
          platform,
          tone: "Доверительный",
          direction: "heygen-live",
          directionParams: { deliveryType, speaker, duration },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка генерации");
      setResult(data.content);
      setViralScore(data.viralScore ?? null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsGenerating(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AppLayout title="HeyGen Живой" subtitle="Сценарий для живого видео">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/video-factory" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-4">
            <ChevronLeft className="w-3.5 h-3.5" />
            Контент-завод
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">HeyGen Живой</h1>
              <p className="text-sm text-slate-400">Сценарий для живого видео — говорит реальный человек</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Step 1 — Delivery type */}
          <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "var(--bg-secondary)" }}>
            <StepHeader num={1} title="Тип подачи" />
            <div className="grid grid-cols-2 gap-2">
              {deliveryTypes.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDeliveryType(d.id)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    deliveryType === d.id
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]"
                  }`}
                >
                  <span className="text-lg leading-none mt-0.5">{d.emoji}</span>
                  <div>
                    <div className={`text-sm font-medium ${deliveryType === d.id ? "text-amber-300" : "text-slate-300"}`}>{d.id}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{d.hint}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — Speaker + Duration */}
          <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "var(--bg-secondary)" }}>
            <StepHeader num={2} title="Спикер и длительность" />
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Спикер</label>
                <div className="flex flex-wrap gap-2">
                  {speakers.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeaker(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${
                        speaker === s
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                          : "border-white/[0.08] text-slate-400 hover:text-slate-300 hover:border-white/[0.15]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Длительность (сек)</label>
                <div className="flex gap-2">
                  {durations.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all border ${
                        duration === d
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                          : "border-white/[0.08] text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {d}с
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 — Topic */}
          <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "var(--bg-secondary)" }}>
            <StepHeader num={3} title="Тема" />
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Опиши тему или выбери из готовых ниже..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-amber-500/40 transition-colors"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {contentPlanTopics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="px-2.5 py-1 rounded-lg text-xs border border-white/[0.06] text-slate-400 hover:text-amber-300 hover:border-amber-500/30 transition-all"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4 — Platform */}
          <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "var(--bg-secondary)" }}>
            <StepHeader num={4} title="Платформа" />
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${
                    platform === p
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                      : "border-white/[0.08] text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Генерирую сценарий...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Создать сценарий для HeyGen Живой
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-300">Сценарий готов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {viralScore && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300">{viralScore}/100</span>
                      </div>
                    )}
                    <button
                      onClick={copy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-sm text-slate-300 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Скопировано" : "Копировать"}
                    </button>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed">
                  {result}
                </pre>
                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">Сценарий готов — отправь в очередь создания видео</p>
                  {!addedToQueue ? (
                    <button
                      onClick={addToQueue}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-semibold transition-all flex-shrink-0"
                    >
                      <Video className="w-4 h-4" />
                      Создать видео
                    </button>
                  ) : (
                    <Link href="/video-factory" className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      Добавлено — смотреть очередь
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}
