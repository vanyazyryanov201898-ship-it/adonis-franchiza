"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Sparkles, Copy, Check, RefreshCw, ChevronLeft, Scissors } from "lucide-react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";

const montageTypes = [
  { id: "Рилс/Shorts (до 60 сек)", emoji: "📱", hint: "Вертикальный, быстрый монтаж" },
  { id: "Длинная нарезка (2-5 мин)", emoji: "🎬", hint: "Горизонтальный, нарратив" },
  { id: "Highlights / Best Of",   emoji: "⭐", hint: "Лучшие моменты" },
];

const narratives = [
  { id: "Рост / трансформация", emoji: "📈", hint: "Путь от А до Б" },
  { id: "День из жизни",        emoji: "☀️", hint: "Один день, несколько эпизодов" },
  { id: "За кулисами",          emoji: "🎭", hint: "Что обычно не показывают" },
  { id: "Кейс клиента",         emoji: "🏆", hint: "Проблема → решение → результат" },
];

const musicTempos = ["Медленный", "Средний", "Быстрый", "Динамичный"];
const platforms = ["TikTok", "Instagram", "YouTube", "VK"];

const footageSuggestions = [
  "Съёмки производства: DTF-печать, нанесение, упаковка заказов",
  "Интервью с партнёром о первых результатах",
  "День открытия новой студии АДОНИС",
  "Корпоративный заказ: от макета до готового мерча",
  "Закулисье: обучение нового партнёра",
];

function StepHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
        {num}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

export default function MontagePage() {
  const [montageType, setMontageType] = useState("Рилс/Shorts (до 60 сек)");
  const [narrative, setNarrative] = useState("Рост / трансформация");
  const [musicTempo, setMusicTempo] = useState("Средний");
  const [platform, setPlatform] = useState("Instagram");
  const [footageDescription, setFootageDescription] = useState("");
  const [topic, setTopic] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [clipsCount, setClipsCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    const finalTopic = topic.trim() || "Нарезка из рабочего материала";
    setIsGenerating(true);
    setResult("");
    setClipsCount(null);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: finalTopic,
          platform,
          tone: "Доверительный",
          direction: "montage",
          directionParams: { footageDescription: footageDescription.trim() || "исходный материал не указан", montageType, narrative, musicTempo },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка генерации");
      setResult(data.content);
      const matches = (data.content as string).match(/КЛИП/g);
      setClipsCount(matches ? matches.length : null);
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
    <AppLayout title="Нарезка / Монтаж" subtitle="Монтажный бриф из готового материала">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/video-factory" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-4">
            <ChevronLeft className="w-3.5 h-3.5" />
            Контент-завод
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Нарезка / Монтаж</h1>
              <p className="text-sm text-slate-400">Монтажный бриф из готового материала — оверлеи вместо закадра</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Step 1 — Footage description */}
          <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "var(--bg-secondary)" }}>
            <StepHeader num={1} title="Опиши имеющийся материал" />
            <textarea
              value={footageDescription}
              onChange={(e) => setFootageDescription(e.target.value)}
              placeholder="У меня есть: съёмки производства, интервью с партнёром, открытие студии..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-blue-500/40 transition-colors"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {footageSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setFootageDescription(s)}
                  className="px-2.5 py-1 rounded-lg text-xs border border-white/[0.06] text-slate-400 hover:text-blue-300 hover:border-blue-500/30 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — Montage type */}
          <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "var(--bg-secondary)" }}>
            <StepHeader num={2} title="Тип монтажа" />
            <div className="space-y-2">
              {montageTypes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMontageType(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    montageType === m.id
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]"
                  }`}
                >
                  <span className="text-xl leading-none">{m.emoji}</span>
                  <div>
                    <div className={`text-sm font-medium ${montageType === m.id ? "text-blue-300" : "text-slate-300"}`}>{m.id}</div>
                    <div className="text-xs text-slate-500">{m.hint}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3 — Narrative */}
          <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "var(--bg-secondary)" }}>
            <StepHeader num={3} title="Нарратив" />
            <div className="grid grid-cols-2 gap-2">
              {narratives.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setNarrative(n.id)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    narrative === n.id
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]"
                  }`}
                >
                  <span className="text-lg leading-none mt-0.5">{n.emoji}</span>
                  <div>
                    <div className={`text-sm font-medium ${narrative === n.id ? "text-blue-300" : "text-slate-300"}`}>{n.id}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{n.hint}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4 — Topic + Platform + Music */}
          <div className="rounded-2xl border border-white/[0.08] p-5" style={{ background: "var(--bg-secondary)" }}>
            <StepHeader num={4} title="Идея / тема (необязательно)" />
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Что хочешь рассказать этим роликом? Оставь пустым — AI придумает сам."
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-blue-500/40 transition-colors mb-4"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Платформа</label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${
                        platform === p
                          ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
                          : "border-white/[0.08] text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Темп музыки</label>
                <div className="flex flex-wrap gap-2">
                  {musicTempos.map((t) => (
                    <button
                      key={t}
                      onClick={() => setMusicTempo(t)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${
                        musicTempo === t
                          ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
                          : "border-white/[0.08] text-slate-400 hover:text-slate-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Генерирую монтажный бриф...
              </>
            ) : (
              <>
                <Scissors className="w-4 h-4" />
                Создать монтажный бриф
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
                className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-blue-300">Монтажный бриф готов</span>
                    {clipsCount && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                        Клипов в брифе: {clipsCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={copy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.10] text-sm text-slate-300 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Скопировано" : "Копировать"}
                  </button>
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
