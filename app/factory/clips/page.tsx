"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Sparkles, RefreshCw, Copy, Check, AlertCircle, Zap, Link2, Upload, X, FileVideo, ChevronDown } from "lucide-react";
import DirectionLayout, { type Tab } from "@/components/factory/DirectionLayout";
import ContentPlanTab from "@/components/factory/ContentPlanTab";
import ApiKeyPlaceholder from "@/components/factory/ApiKeyPlaceholder";
import TrendsSelector, { type TrendItem } from "@/components/factory/TrendsSelector";
import AutopostTab from "@/components/factory/AutopostTab";
import VideoPromptPanel from "@/components/factory/VideoPromptPanel";
import { useBgTask } from "@/lib/use-bg-task";

const suggestedSources = [
  "Интервью с партнёром Кирьяком про 16 млн рублей",
  "Влог запуска новой точки АДОНИС за 14 дней",
  "Лонгрид: Илья Анастасов о стратегии развития",
  "Обзор производственного процесса DTF печати",
  "Вебинар для будущих партнёров АДОНИС",
  "День открытых дверей в студии Казани",
];

function ScriptTab() {
  const [source, setSource]       = useState("");
  const [videoUrl, setVideoUrl]   = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [copied, setCopied]       = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { run, isRunning, result, error } = useBgTask<{content:string;viralScore:number}>("clips-script");
  const content    = result?.content ?? null;
  const viralScore = result?.viralScore ?? null;
  const loading    = isRunning;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const clearFile = () => {
    setVideoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generate = () => {
    const activeTopic = source.trim() || suggestedSources[0];
    const snap = { topic: activeTopic, url: videoUrl.trim(), filename: videoFile?.name, trend: selectedTrend };
    run(`Нарезка · ${activeTopic.slice(0,30)}`, async () => {
      const res = await fetch("/api/factory-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction: "clips", topic: snap.topic, trendContext: snap.trend ?? undefined,
          videoSource: { url: snap.url || undefined, filename: snap.filename || undefined },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      return json as {content:string;viralScore:number};
    });
  };

  const copy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Шаг 1: Описание / исходный материал */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">1</div>
          <h3 className="text-sm font-semibold text-white">О чём видео</h3>
        </div>
        <textarea
          value={source} onChange={(e) => setSource(e.target.value)}
          placeholder="Опиши видео — AI составит план нарезки"
          rows={2}
          className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/40 transition-colors resize-none"
        />
        <div className="flex flex-wrap gap-2">
          {suggestedSources.map((t) => (
            <button key={t} onClick={() => setSource(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${source === t ? "bg-blue-600/80 text-white" : "bg-white/[0.04] text-slate-500 hover:text-slate-300 border border-white/[0.06]"}`}>
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Шаг 2: Источник видео */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">2</div>
          <h3 className="text-sm font-semibold text-white">Источник видео <span className="text-slate-600 font-normal">(необязательно)</span></h3>
        </div>

        {/* URL */}
        <div className="mb-3">
          <label className="text-xs text-slate-500 mb-1.5 block flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" /> Ссылка на видео
          </label>
          <input
            value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=... или VK / TikTok"
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/40 transition-colors"
          />
        </div>

        {/* File upload */}
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Или загрузи файл
          </label>
          {videoFile ? (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-900/20 border border-blue-500/25">
              <FileVideo className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-sm text-white flex-1 truncate">{videoFile.name}</span>
              <span className="text-xs text-slate-500">{(videoFile.size / 1024 / 1024).toFixed(1)} МБ</span>
              <button onClick={clearFile} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/[0.10] bg-white/[0.02] hover:bg-white/[0.05] text-sm text-slate-500 hover:text-slate-300 transition-all"
            >
              <Upload className="w-4 h-4" />
              Выбрать видео-файл
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFile}
            className="hidden"
          />
          <p className="text-[11px] text-slate-600 mt-1.5">Файл используется как контекст для AI — видео не загружается на сервер</p>
        </div>
      </motion.div>

      {/* Тренды */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <TrendsSelector
          selectedTrend={selectedTrend}
          onSelect={setSelectedTrend}
          accentColor="text-blue-400"
        />
      </motion.div>

      <div className="px-4 py-3 rounded-xl bg-blue-900/15 border border-blue-500/20 text-xs text-blue-300">
        AI составит план нарезки: какие моменты вырезать, тайминг, что добавить, в каком порядке публиковать.
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={generate} disabled={loading}
        className="w-full py-4 rounded-2xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw className="w-5 h-5" /></motion.div>Составляю план нарезки...</>
        ) : (
          <><Scissors className="w-5 h-5" />Создать план нарезки</>
        )}
      </motion.button>

      <AnimatePresence mode="wait">
        {error && !loading && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        {content && !loading && (
          <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {viralScore && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-slate-400">Потенциал нарезки:</span>
                <span className="text-xs font-bold text-blue-400">{viralScore}/100</span>
              </div>
            )}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">План нарезки</span>
                <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-slate-400 hover:text-white transition-colors">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" />Скопировано</> : <><Copy className="w-3.5 h-3.5" />Копировать</>}
                </button>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>
            <button onClick={generate}
              className="w-full py-3 rounded-2xl border border-white/[0.06] text-sm text-slate-400 hover:text-white hover:border-blue-500/25 transition-all flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Ещё вариант
            </button>
            <BrollSection script={content} topic={source.trim() || suggestedSources[0]} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BrollSection({ script, topic }: { script: string; topic: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors text-left"
      >
        <Scissors className="w-4 h-4 text-slate-600 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-sm text-slate-400">Нужен b-roll?</span>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Если исходного видео нет — сгенерируй промпты для Kling / Runway
          </p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-600 flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/[0.05]"
          >
            <div className="p-4 space-y-2">
              <p className="text-xs text-slate-500 pb-1">
                Если исходное видео уже есть — промпты не нужны, просто следуй плану нарезки выше.
                Промпты ниже — для создания недостающих кадров (b-roll) через Kling или Runway.
              </p>
              <VideoPromptPanel script={script} direction="clips" topic={topic} bgKey="clips-videoprompt" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ClipsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("script");
  return (
    <DirectionLayout
      title="Нарезка"
      subtitle="Длинные видео → Reels / Shorts / TikTok"
      accentColor="text-blue-400"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "script" && <ScriptTab />}
      {activeTab === "plan" && <ContentPlanTab directionLabel="Нарезка роликов" directionId="clips" />}
      {activeTab === "create" && (
        <div className="p-6">
          <ApiKeyPlaceholder
            serviceName="Видео-редактор"
            description="Для автоматической нарезки видео нужен API видео-редактора (например Shotstack или Creatomate). Скоро настроим."
            envKey="SHOTSTACK_API_KEY"
          />
        </div>
      )}
      {activeTab === "autopost" && <AutopostTab directionId="clips" directionLabel="Нарезка" />}
    </DirectionLayout>
  );
}
