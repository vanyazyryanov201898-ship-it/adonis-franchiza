"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, Copy, Check, RefreshCw, ChevronLeft, Flame, Video, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";

const angles = [
  { id: "Экспертный разбор", emoji: "🎓", hint: "Глубокий разбор с цифрами" },
  { id: "Продающий",         emoji: "💰", hint: "Ведёт к заявке через ценность" },
  { id: "Обучающий",         emoji: "📚", hint: "Зритель узнаёт что-то новое" },
  { id: "Кейс",              emoji: "📊", hint: "Факты, цифры, результат" },
];

const avatars = [
  { id: "Алекс",  hint: "Уверенный мужской" },
  { id: "Мария",  hint: "Профессиональный женский" },
  { id: "Иван",   hint: "Энергичный мужской" },
  { id: "Анна",   hint: "Дружелюбный женский" },
];

const platforms = ["TikTok", "Instagram", "YouTube", "VK", "Telegram"];

const contentPlanTopics = [
  "ТОП-5 ошибок при открытии мерч-студии",
  "Сколько реально зарабатывают партнёры АДОНИС",
  "DTF vs шелкография — что выбрать в 2025",
  "Как быстро окупить франшизу — разбор цифр",
  "Почему мерч-бизнес не умрёт никогда",
];

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

export default function HeyGenAIPage() {
  const [angle, setAngle] = useState("Экспертный разбор");
  const [avatarId, setAvatarId] = useState("Алекс");
  const [teleprompter, setTeleprompter] = useState(false);
  const [platform, setPlatform] = useState("YouTube");
  const [topic, setTopic] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [viralScore, setViralScore] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [addedToQueue, setAddedToQueue] = useState(false);

  function extractTitle(text: string) {
    const m = text.match(/«([^»]+)»/);
    return m ? m[1] : topic.trim() || "HeyGen AI Аватар ролик";
  }

  function addToQueue() {
    const item = {
      id: Date.now(),
      title: extractTitle(result),
      direction: "heygen-ai",
      platforms: [platform],
      script: result,
      status: "queued",
      progress: 0,
      viralScore: viralScore || 88,
      duration: "~60с",
      addedAt: Date.now(),
    };
    const existing = JSON.parse(localStorage.getItem("adonis_queue") || "[]");
    localStorage.setItem("adonis_queue", JSON.stringify([item, ...existing.slice(0, 19)]));
    setAddedToQueue(true);
  }

  async function generate() {
    const finalTopic = topic.trim() || "Как работает франшиза АДОНИС";
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
          tone: "Экспертный",
          direction: "heygen-ai",
          directionParams: { angle, avatarId, teleprompter },
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
    <AppLayout title="HeyGen AI Аватар" subtitle="Сценарий для AI-персонажа">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/video-factory" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-4">
            <ChevronLeft className="w-3.5 h-3.5" />
            Контент-завод
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">HeyGen AI Аватар</h1>
              <p className="text-sm text-slate-400">Сценарий для AI-персонажа — полированный, под TTS</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Step 1 — Angle */}
          <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "var(--bg-secondary)" }}>
            <StepHeader num={1} title="Угол подачи" />
            <div className="grid grid-cols-2 gap-2">
              {angles.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAngle(a.id)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    angle === a.id
                      ? "border-violet-500/50 bg-violet-500/10"
                      : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]"
                  }`}
                >
                  <span className="text-lg leading-none mt-0.5">{a.emoji}</span>
                  <div>
                    <div className={`text-sm font-medium ${angle === a.id ? "text-violet-300" : "text-slate-300"}`}>{a.id}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{a.hint}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — Avatar + Teleprompter */}
          <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "var(--bg-secondary)" }}>
            <StepHeader num={2} title="Аватар и настройки" />
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Аватар</label>
                <div className="grid grid-cols-2 gap-2">
                  {avatars.map((av) => (
                    <button
                      key={av.id}
                      onClick={() => setAvatarId(av.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${
                        avatarId === av.id
                          ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                          : "border-white/[0.06] text-slate-400 hover:text-slate-300 hover:border-white/[0.12]"
                      }`}
                    >
                      <span className="font-medium">{av.id}</span>
                      <span className="text-xs text-slate-500">{av.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setTeleprompter(!teleprompter)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${teleprompter ? "bg-violet-500" : "bg-white/10"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${teleprompter ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm text-slate-300">Режим телесуфлёра</span>
                  <span className="text-xs text-slate-500">Каждое предложение с новой строки</span>
                </label>
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
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-violet-500/40 transition-colors"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {contentPlanTopics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="px-2.5 py-1 rounded-lg text-xs border border-white/[0.06] text-slate-400 hover:text-violet-300 hover:border-violet-500/30 transition-all"
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
                      ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
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
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Генерирую сценарий...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Создать сценарий для AI Аватара
              </>
            )}
          </button>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-semibold text-violet-300">Сценарий готов · {avatarId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {viralScore && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <Flame className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-xs font-bold text-violet-300">{viralScore}/100</span>
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
                    <button onClick={addToQueue} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-semibold transition-all flex-shrink-0">
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
