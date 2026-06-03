"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Sparkles, Copy, Check, RefreshCw, ChevronLeft, Flame } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";

const characters = [
  { id: "Кот Адонис (основной)", emoji: "🐱", hint: "Умный, ироничный маскот" },
  { id: "Кот Адонис + партнёр",  emoji: "🐱🤝", hint: "Диалог кота с человеком" },
  { id: "Кот объясняет",         emoji: "🐱📖", hint: "Кот-эксперт объясняет" },
];

const formats = [
  { id: "Стендап",              emoji: "🎤", hint: "Монолог — одна тема, панчлайн" },
  { id: "Скетч (диалог)",       emoji: "💬", hint: "Setup → развитие → финал" },
  { id: "Реакция на тренд",     emoji: "📱", hint: "Кот реагирует на ситуацию" },
  { id: "Обучалка с юмором",    emoji: "😄", hint: "Учит, но весело" },
];

const tones = ["Ироничный", "Абсурдный", "Образовательный с юмором", "Мемный"];

const platforms = ["TikTok", "Instagram", "YouTube", "VK"];

const contentPlanTopics = [
  "DTF-печать за 30 секунд — объясняет кот",
  "Когда клиент хочет «немного подправить логотип»",
  "Стендап: почему все хотят мерч но не знают зачем",
  "Кот Адонис vs принтер (понедельник)",
  "Реакция кота на вопрос «а это точно окупится?»",
];

function StepHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-xs font-bold text-pink-400 flex-shrink-0">
        {num}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

export default function CartoonPage() {
  const [character, setCharacter] = useState("Кот Адонис (основной)");
  const [format, setFormat] = useState("Стендап");
  const [cartoonTone, setCartoonTone] = useState("Ироничный");
  const [platform, setPlatform] = useState("TikTok");
  const [topic, setTopic] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [viralScore, setViralScore] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    const finalTopic = topic.trim() || "Мерч-бизнес и странные клиенты";
    setIsGenerating(true);
    setResult("");
    setViralScore(null);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: finalTopic,
          platform,
          tone: "Лёгкий",
          direction: "cartoon",
          directionParams: { character, format, cartoonTone },
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
    <AppLayout title="Мультяшки" subtitle="Сценарий для анимации — Кот Адонис">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/video-factory" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-4">
            <ChevronLeft className="w-3.5 h-3.5" />
            Контент-завод
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center">
              <Palette className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Мультяшки</h1>
              <p className="text-sm text-slate-400">Сценарий для анимации — Кот Адонис в деле</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Step 1 — Character */}
          <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "var(--bg-secondary)" }}>
            <StepHeader num={1} title="Персонаж" />
            <div className="space-y-2">
              {characters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCharacter(c.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    character === c.id
                      ? "border-pink-500/50 bg-pink-500/10"
                      : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]"
                  }`}
                >
                  <span className="text-xl leading-none">{c.emoji}</span>
                  <div>
                    <div className={`text-sm font-medium ${character === c.id ? "text-pink-300" : "text-slate-300"}`}>{c.id}</div>
                    <div className="text-xs text-slate-500">{c.hint}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — Format */}
          <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "var(--bg-secondary)" }}>
            <StepHeader num={2} title="Формат" />
            <div className="grid grid-cols-2 gap-2">
              {formats.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    format === f.id
                      ? "border-pink-500/50 bg-pink-500/10"
                      : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]"
                  }`}
                >
                  <span className="text-lg leading-none mt-0.5">{f.emoji}</span>
                  <div>
                    <div className={`text-sm font-medium ${format === f.id ? "text-pink-300" : "text-slate-300"}`}>{f.id}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{f.hint}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3 — Tone */}
          <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "var(--bg-secondary)" }}>
            <StepHeader num={3} title="Тон юмора" />
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button
                  key={t}
                  onClick={() => setCartoonTone(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${
                    cartoonTone === t
                      ? "bg-pink-500/15 border-pink-500/40 text-pink-300"
                      : "border-white/[0.08] text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4 — Topic */}
          <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "var(--bg-secondary)" }}>
            <StepHeader num={4} title="Тема / идея" />
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Опиши идею или выбери готовую тему..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-pink-500/40 transition-colors"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {contentPlanTopics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="px-2.5 py-1 rounded-lg text-xs border border-white/[0.06] text-slate-400 hover:text-pink-300 hover:border-pink-500/30 transition-all"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Step 5 — Platform */}
          <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "var(--bg-secondary)" }}>
            <StepHeader num={5} title="Платформа" />
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${
                    platform === p
                      ? "bg-pink-500/15 border-pink-500/40 text-pink-300"
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
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Генерирую сценарий...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Создать сценарий для Мультяшки
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
                className="rounded-2xl border border-pink-500/20 bg-pink-500/5 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🐱</span>
                    <span className="text-sm font-semibold text-pink-300">Сценарий готов · {format}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {viralScore && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20">
                        <Flame className="w-3.5 h-3.5 text-pink-400" />
                        <span className="text-xs font-bold text-pink-300">{viralScore}/100</span>
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}
