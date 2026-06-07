"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart, BarChart2, AlignLeft, List, Clock,
  Sparkles, RefreshCw, Copy, Check, Download,
  Trash2, AlertCircle, Music, Eye, Video,
  Play, CheckCircle2, ExternalLink, Loader2,
} from "lucide-react";
import DirectionLayout, { type Tab } from "@/components/factory/DirectionLayout";
import { useVideoGen } from "@/lib/hooks/use-video-gen";
import ContentPlanTab from "@/components/factory/ContentPlanTab";
import TrendsSelector, { type TrendItem } from "@/components/factory/TrendsSelector";
import AutopostTab from "@/components/factory/AutopostTab";
import VideoPromptPanel from "@/components/factory/VideoPromptPanel";
import { useBgTask } from "@/lib/hooks/use-bg-task";
import type { InfographicData, InfographicFrame } from "@/lib/types/infographic-types";
import { PLATFORMS, DIRECTION_DEFAULT_PLATFORMS } from "@/lib/data/platforms";
import { cn } from "@/lib/utils";

// ─── Options ──────────────────────────────────────────────────────────────────

const categories = [
  { id: "market",     icon: BarChart2,  label: "Рынок",      desc: "Аналитика, тренды, цифры рынка" },
  { id: "history",    icon: Clock,      label: "История",    desc: "Хронология, события, даты" },
  { id: "comparison", icon: AlignLeft,  label: "Сравнение",  desc: "Плюсы/минусы, критерии выбора" },
  { id: "process",    icon: List,       label: "Процесс",    desc: "Шаги, механизмы, инструкции" },
];

const visualTypes = [
  { id: "charts",   icon: BarChart2, label: "Графики",    desc: "Столбчатые, круговые, линейные" },
  { id: "timeline", icon: Clock,     label: "Таймлайн",   desc: "Хронологическая лента событий" },
  { id: "table",    icon: AlignLeft, label: "Таблица",    desc: "Сравнительные колонки" },
  { id: "toplist",  icon: List,      label: "Топ-список", desc: "Рейтинг с цифрами и иконками" },
];

const suggestedTopics = [
  "Рынок мерча в России 2024: цифры и тренды",
  "Как выглядел бизнес на печати 10 лет назад",
  "Франшиза vs бизнес с нуля: честное сравнение",
  "Как открыть студию мерча за 14 дней",
  "Топ-5 ниш где мерч всегда востребован",
  "Рост рынка корпоративных подарков в РФ",
  "DTF vs шелкотрафарет: что выбрать",
  "Как окупается студия мерча: реальные цифры",
  "История брендированной одежды в России",
  "Топ-7 ошибок новичков в бизнесе на мерче",
];

const frameStyle: Record<string, { border: string; bg: string; badge: string; badgeText: string }> = {
  cover:   { border: "border-violet-500/30",  bg: "bg-violet-900/15",  badge: "bg-violet-500/20",  badgeText: "text-violet-300" },
  data:    { border: "border-blue-500/25",     bg: "bg-blue-900/10",    badge: "bg-blue-500/20",    badgeText: "text-blue-300" },
  insight: { border: "border-emerald-500/25",  bg: "bg-emerald-900/10", badge: "bg-emerald-500/20", badgeText: "text-emerald-300" },
  cta:     { border: "border-orange-500/25",   bg: "bg-orange-900/10",  badge: "bg-orange-500/20",  badgeText: "text-orange-300" },
};

const frameLabel: Record<string, string> = {
  cover: "Обложка", data: "Данные", insight: "Вывод", cta: "CTA",
};

function StepHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xs font-bold text-cyan-400 flex-shrink-0">
        {num}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

// ─── Script Tab ───────────────────────────────────────────────────────────────

function ScriptTab({
  onDataGenerated,
  onGoToCreate,
}: {
  onDataGenerated: (data: InfographicData) => void;
  onGoToCreate: () => void;
}) {
  const [topic, setTopic]         = useState("");
  const [category, setCategory]   = useState("market");
  const [visualType, setVisual]   = useState("charts");
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [copiedId, setCopiedId]   = useState<string | null>(null);
  const [platform, setPlatform]   = useState(DIRECTION_DEFAULT_PLATFORMS["infographics"][0]);

  const { run, isRunning, result: data, error, clear } = useBgTask<InfographicData>("infographics-script");
  const isLoading = isRunning;

  useEffect(() => {
    if (data) onDataGenerated(data);
  }, [data]);

  const activeTopic = topic.trim() || suggestedTopics[0];

  const generate = () => {
    const snap = { topic: activeTopic, category, visualType, trend: selectedTrend };
    run(`Инфографика · ${snap.topic.slice(0,30)}`, async () => {
      const res = await fetch("/api/infographic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: snap.topic, category: snap.category, visualType: snap.visualType, trendContext: snap.trend ?? undefined, platform: PLATFORMS.find(p => p.id === platform)?.label }),
      });
      const text = await res.text();
      let json: any;
      try { json = JSON.parse(text); } catch { throw new Error(`Ответ не JSON (${res.status}): ${text.slice(0, 200)}`); }
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      return json as InfographicData;
    });
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const download = () => {
    if (!data) return;
    const lines = [
      `# ${data.title}`,
      `${data.subtitle}`,
      "",
      ...data.frames.map((f: InfographicFrame) => [
        `## Кадр ${f.n} — ${frameLabel[f.type] || f.type}`,
        f.stat ? `**${f.stat}**` : "",
        f.heading,
        f.text,
        `_Визуал: ${f.visual_note}_`,
      ].filter(Boolean).join("\n")),
      "",
      `**Caption:** ${data.caption}`,
      `**Хэштеги:** ${data.hashtags}`,
      `**Музыка:** ${data.music_suggestion}`,
    ];
    const blob = new Blob([lines.join("\n\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `infographic_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-3">
      {/* Шаг 1: Тема */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <StepHeader num={1} title="Тема инфографики" />
        <input
          type="text"
          placeholder="Своя тема — или выбери из предложенных ниже"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/40 transition-colors"
        />
        <div className="flex flex-wrap gap-2">
          {suggestedTopics.map((t) => (
            <button key={t} onClick={() => setTopic(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                topic === t ? "bg-cyan-600/80 text-white" : "bg-white/[0.04] text-slate-500 hover:text-slate-300 border border-white/[0.06]"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Шаг 2: Категория */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <StepHeader num={2} title="Тип контента" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categories.map(({ id, icon: Icon, label, desc }) => (
            <button key={id} onClick={() => setCategory(id)}
              className={`flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left ${
                category === id ? "border-cyan-500/40 bg-cyan-500/10 text-white" : "border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
              }`}>
              <Icon className={`w-4 h-4 ${category === id ? "text-cyan-400" : ""}`} />
              <div>
                <div className="text-xs font-semibold">{label}</div>
                <div className="text-[10px] opacity-60 mt-0.5 leading-tight">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Шаг 3: Визуал */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <StepHeader num={3} title="Визуальный формат" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {visualTypes.map(({ id, icon: Icon, label, desc }) => (
            <button key={id} onClick={() => setVisual(id)}
              className={`flex flex-col items-start gap-2 p-4 rounded-xl border transition-all text-left ${
                visualType === id ? "border-cyan-500/40 bg-cyan-500/10 text-white" : "border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
              }`}>
              <Icon className={`w-4 h-4 ${visualType === id ? "text-cyan-400" : ""}`} />
              <div>
                <div className="text-xs font-semibold">{label}</div>
                <div className="text-[10px] opacity-60 mt-0.5 leading-tight">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Тренды */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <TrendsSelector
          selectedTrend={selectedTrend}
          onSelect={setSelectedTrend}
          accentColor="text-cyan-400"
        />
      </motion.div>

      {/* Платформа */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
        className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Платформа</p>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map((p) => (
            <button key={p.id} onClick={() => setPlatform(p.id)}
              className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                platform === p.id ? "text-white border-transparent" : "bg-white/[0.03] text-slate-500 border-white/[0.06] hover:text-slate-300")}
              style={platform === p.id ? { backgroundColor: p.bgColor, borderColor: p.color + "60" } : {}}>
              <span className="text-[9px] font-black" style={platform === p.id ? { color: p.color } : { color: "#64748b" }}>{p.shortLabel}</span>
              {p.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Кнопка генерации */}
      <motion.button
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={generate} disabled={isLoading}
        className="w-full py-4 rounded-2xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw className="w-5 h-5" /></motion.div>Claude создаёт сценарий...</>
        ) : (
          <><PieChart className="w-5 h-5" />Сгенерировать инфографику</>
        )}
      </motion.button>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-8 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-900/15 to-blue-900/10 flex flex-col items-center justify-center gap-6 min-h-[200px]">
            <div className="relative">
              <motion.div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600/30 to-blue-600/30 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <PieChart className="w-8 h-8 text-cyan-400" />
              </motion.div>
              <motion.div className="absolute inset-0 rounded-2xl border border-cyan-400/30"
                animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }} transition={{ duration: 1.5, repeat: Infinity }} />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold mb-2">Создаю сценарий инфографики</p>
              <p className="text-slate-500 text-sm">Анализирую данные · Формирую кадры · Пишу подписи</p>
            </div>
          </motion.div>
        )}

        {error && !isLoading && (
          <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <div>
              <p className="text-white font-semibold mb-1">Ошибка генерации</p>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button onClick={generate} className="px-4 py-2 rounded-xl bg-white/[0.06] text-sm text-white hover:bg-white/[0.1] transition-colors">
              Попробовать снова
            </button>
          </motion.div>
        )}

        {!isLoading && !error && !data && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[200px] text-center p-6 rounded-2xl border border-dashed border-white/[0.08]">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
              <PieChart className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-slate-500 font-medium mb-1">Выбери тему и параметры, нажми «Сгенерировать»</p>
            <p className="text-slate-600 text-xs mt-1">Claude создаст 7 кадров с данными, визуальными заметками и caption</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-cyan-400/60">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Claude Haiku · Подключён
            </div>
          </motion.div>
        )}

        {data && !isLoading && (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Header */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">{data.title}</h2>
                  <p className="text-sm text-slate-400 mt-1">{data.subtitle}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={download} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] text-xs text-slate-400 hover:text-white transition-colors">
                    <Download className="w-3.5 h-3.5" /> .txt
                  </button>
                  <button onClick={clear}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Очистить
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-md bg-cyan-500/15 text-cyan-400 text-[11px] font-medium">
                  {visualTypes.find(v => v.id === data.visual_type)?.label || data.visual_type}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/[0.05] text-slate-400 text-[11px]">
                  {data.frames.length} кадров
                </span>
              </div>
            </div>

            {/* Storyboard */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Сторибоард</span>
              </div>
              <div className="space-y-2">
                {data.frames.map((frame: InfographicFrame, i: number) => {
                  const s = frameStyle[frame.type] || frameStyle.data;
                  return (
                    <motion.div key={frame.n} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className={`p-4 rounded-2xl border ${s.border} ${s.bg}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-slate-400">
                          {frame.n}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${s.badge} ${s.badgeText}`}>
                              {frameLabel[frame.type] || frame.type}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-white mb-1 leading-tight">{frame.heading}</h4>
                          {frame.stat && (
                            <div className="text-2xl font-black text-white/90 mb-2 leading-none tabular-nums">{frame.stat}</div>
                          )}
                          <p className="text-sm text-slate-400 leading-relaxed mb-3">{frame.text}</p>
                          <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.05]">
                            <Sparkles className="w-3 h-3 text-slate-600 flex-shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-500 leading-relaxed italic">{frame.visual_note}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Caption + hashtags */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Caption</p>
                <p className="text-sm text-slate-300 leading-relaxed">{data.caption}</p>
                <button onClick={() => copy(data.caption, "caption")}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-slate-400 hover:text-white transition-colors">
                  {copiedId === "caption" ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Скопировано</> : <><Copy className="w-3.5 h-3.5" /> Копировать</>}
                </button>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Хэштеги</p>
                <p className="text-xs text-cyan-400">{data.hashtags}</p>
                <button onClick={() => copy(data.hashtags, "hashtags")}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-slate-400 hover:text-white transition-colors">
                  {copiedId === "hashtags" ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Скопировано</> : <><Copy className="w-3.5 h-3.5" /> Копировать</>}
                </button>
              </div>
              <div className="flex items-start gap-2">
                <Music className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-0.5">Музыка</p>
                  <p className="text-sm text-slate-400">{data.music_suggestion}</p>
                </div>
              </div>
              <button onClick={() => copy(`${data.caption}\n\n${data.hashtags}`, "all")}
                className="w-full py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-sm text-cyan-300 hover:bg-cyan-500/15 transition-colors font-medium">
                {copiedId === "all" ? "Скопировано!" : "Скопировать caption + хэштеги"}
              </button>
            </div>

            {/* Go to create video */}
            <button onClick={onGoToCreate}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all">
              <Video className="w-4 h-4" />
              Создать видео по этому сценарию →
            </button>

            <button onClick={generate}
              className="w-full py-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-sm text-slate-400 hover:text-white hover:border-cyan-500/25 transition-all flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Сгенерировать ещё раз
            </button>
            {data && (
              <VideoPromptPanel
                script={[
                  `${data.title}. ${data.subtitle}`,
                  ...data.frames.map((f: InfographicFrame) =>
                    `Кадр ${f.n} (${f.type}): ${f.heading}. ${f.stat ? f.stat + ". " : ""}${f.text} Визуал: ${f.visual_note}`
                  ),
                  `Caption: ${data.caption}`,
                ].join("\n\n")}
                direction="infographics"
                topic={activeTopic}
                bgKey="infographics-videoprompt"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Create Video Tab ─────────────────────────────────────────────────────────

const MODELS = [
  { id: "kling3_0",              label: "Kling 3.0",         desc: "Multi-shot · аудио · быстро" },
  { id: "cinematic_studio_3_0",  label: "Cinema Studio 3.0", desc: "Higgsfield · топ качество" },
  { id: "grok_video",            label: "Grok Imagine",      desc: "xAI · text-to-video · аудио" },
];

const DURATIONS = [
  { value: 5,  label: "5 сек",  credits: "~10 кр" },
  { value: 10, label: "10 сек", credits: "~20 кр" },
  { value: 15, label: "15 сек", credits: "~30 кр" },
];

function CreateVideoTab({ infographicData }: { infographicData: InfographicData | null }) {
  const [prompt, setPrompt]       = useState("");
  const [model, setModel]         = useState("kling3_0");
  const [duration, setDuration]   = useState(5);
  const { state: renderState, videoUrl, progress, error: errorMsg, debugInfo, generate: runGen, reset } = useVideoGen({ direction: "infographics", topic: infographicData?.title });

  useEffect(() => {
    if (infographicData) {
      const frames = infographicData.frames || [];
      const frameText = frames.slice(0, 4).map((f: InfographicFrame) =>
        `Frame ${f.n}: ${f.heading}. ${f.stat ? f.stat + ". " : ""}${f.text}`
      ).join(" ");
      setPrompt(
        `Animated infographic video: "${infographicData.title}". ${infographicData.subtitle}. ` +
        `${frameText} Style: modern motion graphics, dark background, cyan accents, ` +
        `smooth data animations, professional business infographic.`
      );
    }
  }, [infographicData]);

  const createVideo = () => {
    if (!prompt.trim()) return;
    runGen({ prompt: prompt.trim(), model, duration, aspect_ratio: "9:16" });
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <Video className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Создать видео · Higgsfield AI</h3>
          <p className="text-xs text-slate-500">Text-to-video генерация — промпт → MP4</p>
        </div>
      </div>

      {infographicData && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-900/20 border border-cyan-500/20">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <p className="text-xs text-cyan-300">Промпт сформирован из сценария — можешь отредактировать</p>
        </div>
      )}

      {/* Model selector */}
      <div>
        <p className="text-xs font-medium text-slate-400 mb-2">Модель</p>
        <div className="grid grid-cols-3 gap-2">
          {MODELS.map((m) => (
            <button key={m.id} onClick={() => setModel(m.id)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                model === m.id
                  ? "border-cyan-500/40 bg-cyan-500/10"
                  : "border-white/[0.06] hover:border-white/[0.12]"
              }`}>
              <span className={`text-xs font-semibold ${model === m.id ? "text-white" : "text-slate-400"}`}>{m.label}</span>
              <span className="text-[10px] text-slate-600 mt-0.5">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <p className="text-xs font-medium text-slate-400 mb-2">Длительность</p>
        <div className="grid grid-cols-3 gap-2">
          {DURATIONS.map((d) => (
            <button key={d.value} onClick={() => setDuration(d.value)}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                duration === d.value ? "border-cyan-500/40 bg-cyan-500/10" : "border-white/[0.06] hover:border-white/[0.12]"
              }`}>
              <span className={`text-xs font-semibold ${duration === d.value ? "text-white" : "text-slate-400"}`}>{d.label}</span>
              <span className="text-[10px] text-slate-600 mt-0.5">{d.credits}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt */}
      <div>
        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Промпт для видео</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder="Опиши видео для Higgsfield — стиль, содержание, визуал..."
          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/40 transition-colors resize-none leading-relaxed"
        />
      </div>

      {renderState === "idle" && (
        <button onClick={createVideo} disabled={!prompt.trim()}
          className="w-full py-4 rounded-2xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
          <Play className="w-5 h-5" />
          Генерировать видео
        </button>
      )}

      {renderState === "submitting" && (
        <div className="w-full py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center gap-3 text-sm text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Отправляю в Higgsfield...
        </div>
      )}

      {renderState === "polling" && (
        <div className="p-5 rounded-2xl border border-cyan-500/20 bg-cyan-900/10 space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="text-sm text-white font-medium">Генерирую видео... {progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/[0.06]">
            <motion.div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
              animate={{ width: `${Math.max(progress, 5)}%` }} transition={{ duration: 0.8 }} />
          </div>
          <p className="text-xs text-slate-500">Higgsfield AI рендерит — обычно 3–10 минут</p>
          <button onClick={reset} className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors underline">
            Отменить и начать заново
          </button>
        </div>
      )}

      {renderState === "done" && videoUrl && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-900/10 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-white font-semibold">Видео готово!</span>
          </div>
          <video src={videoUrl} controls className="w-full rounded-xl" />
          <a href={videoUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-sm text-emerald-300 font-medium transition-all">
            <ExternalLink className="w-4 h-4" /> Скачать / открыть
          </a>
          <button onClick={reset} className="w-full py-2 rounded-xl bg-white/[0.04] text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Создать ещё
          </button>
        </motion.div>
      )}

      {renderState === "done" && !videoUrl && (
        <div className="p-5 rounded-2xl border border-yellow-500/20 bg-yellow-900/10 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-white font-semibold">Видео готово, но URL не получен</span>
          </div>
          {debugInfo && <p className="text-xs text-slate-400 font-mono break-all">{debugInfo}</p>}
          <button onClick={reset} className="px-4 py-2 rounded-xl bg-white/[0.06] text-sm text-white hover:bg-white/[0.1] transition-colors">
            Попробовать снова
          </button>
        </div>
      )}

      {renderState === "error" && (
        <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-white font-semibold">Ошибка генерации</span>
          </div>
          <p className="text-sm text-red-400">{errorMsg}</p>
          <button onClick={reset} className="px-4 py-2 rounded-xl bg-white/[0.06] text-sm text-white hover:bg-white/[0.1] transition-colors">
            Попробовать снова
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InfographicsDirectionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("script");
  const [infographicData, setInfographicData] = useState<InfographicData | null>(null);

  return (
    <DirectionLayout
      title="Инфографика"
      subtitle="Сценарий · Контент-план · Рендер через Higgsfield AI"
      accentColor="text-cyan-400"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "script" && (
        <ScriptTab
          onDataGenerated={setInfographicData}
          onGoToCreate={() => setActiveTab("create")}
        />
      )}
      {activeTab === "plan" && (
        <ContentPlanTab
          directionLabel="Инфографика"
          directionId="infographics"
        />
      )}
      {activeTab === "create" && (
        <CreateVideoTab infographicData={infographicData} />
      )}
      {activeTab === "autopost" && (
        <AutopostTab directionId="infographics" directionLabel="Инфографика" />
      )}
    </DirectionLayout>
  );
}
