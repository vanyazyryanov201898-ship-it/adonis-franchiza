"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2, Copy, Check, ChevronDown, ChevronUp,
  RefreshCw, Sparkles, Info, Settings2, Play, Loader2, CheckCircle2, AlertCircle, ExternalLink,
} from "lucide-react";
import { useBgTask } from "@/lib/hooks/use-bg-task";
import { useVideoGen } from "@/lib/hooks/use-video-gen";
import { cn } from "@/lib/utils";

type VideoPromptItem = {
  tool: string;
  prompt?: string;
  negativePrompt?: string;
  // flat settings (new compact format)
  duration?: string;
  ratio?: string;
  camera?: string;
  // legacy nested settings
  settings?: Record<string, string | number>;
  tip?: string;
  avatarNote?: string;
  backgroundPrompt?: string;
  scriptReady?: boolean;
};

const TOOL_COLORS: Record<string, { bg: string; border: string; color: string; dot: string }> = {
  "Kling 2.0":        { bg: "bg-violet-900/15", border: "border-violet-500/30", color: "text-violet-400", dot: "#8b5cf6" },
  "Runway Gen-3 Alpha":{ bg: "bg-blue-900/15",  border: "border-blue-500/30",  color: "text-blue-400",   dot: "#3b82f6" },
  "Sora":             { bg: "bg-emerald-900/15", border: "border-emerald-500/30", color: "text-emerald-400", dot: "#10b981" },
  "HeyGen":           { bg: "bg-amber-900/15",  border: "border-amber-500/30", color: "text-amber-400",  dot: "#f59e0b" },
};

function PromptCard({ item, scriptText }: { item: VideoPromptItem; scriptText?: string }) {
  const [expandSettings, setExpandSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const colors = TOOL_COLORS[item.tool] ?? { bg: "bg-white/[0.03]", border: "border-white/[0.08]", color: "text-slate-400", dot: "#64748b" };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const CopyBtn = ({ text, id, label }: { text: string; id: string; label: string }) => (
    <button
      onClick={() => copy(text, id)}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] text-[10px] text-slate-400 hover:text-white transition-colors flex-shrink-0"
    >
      {copiedId === id ? <><Check className="w-3 h-3 text-emerald-400" />Скопировано</> : <><Copy className="w-3 h-3" />{label}</>}
    </button>
  );

  return (
    <div className={cn("rounded-2xl border p-4 space-y-3", colors.bg, colors.border)}>
      {/* Tool header */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors.dot }} />
        <span className={cn("text-sm font-semibold", colors.color)}>{item.tool}</span>
        {item.scriptReady && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            Скрипт готов
          </span>
        )}
      </div>

      {/* Main prompt */}
      {item.prompt && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Промпт</span>
            <CopyBtn text={item.prompt} id={`prompt-${item.tool}`} label="Промпт" />
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed bg-white/[0.03] rounded-xl px-3 py-2 border border-white/[0.05]">
            {item.prompt}
          </p>
        </div>
      )}

      {/* Negative prompt */}
      {item.negativePrompt && (
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1">Негативный промпт</span>
          <div className="flex items-start gap-2">
            <p className="text-[11px] text-slate-500 font-mono flex-1 leading-relaxed">{item.negativePrompt}</p>
            <CopyBtn text={item.negativePrompt} id={`neg-${item.tool}`} label="" />
          </div>
        </div>
      )}

      {/* HeyGen specific */}
      {item.avatarNote && (
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block mb-1">Аватар</span>
          <p className="text-xs text-slate-300 leading-relaxed">{item.avatarNote}</p>
        </div>
      )}
      {item.backgroundPrompt && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Фон (Background)</span>
            <CopyBtn text={item.backgroundPrompt} id={`bg-${item.tool}`} label="Фон" />
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed bg-white/[0.03] rounded-xl px-3 py-2 border border-white/[0.05]">
            {item.backgroundPrompt}
          </p>
        </div>
      )}
      {item.scriptReady && scriptText && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Скрипт для HeyGen</span>
            <CopyBtn text={scriptText} id={`script-${item.tool}`} label="Скрипт" />
          </div>
          <p className="text-[11px] text-slate-500 italic">Нажми «Скрипт» → вставь в поле Script в HeyGen</p>
        </div>
      )}

      {/* Settings — show flat fields or nested */}
      {(() => {
        const flatEntries: [string, string][] = [];
        if (item.duration) flatEntries.push(["duration", item.duration]);
        if (item.ratio) flatEntries.push(["ratio", item.ratio]);
        if (item.camera) flatEntries.push(["camera", item.camera]);
        const nestedEntries = item.settings ? Object.entries(item.settings) : [];
        const allEntries = flatEntries.length > 0 ? flatEntries : nestedEntries;
        if (allEntries.length === 0) return null;
        return (
          <div>
            <button onClick={() => setExpandSettings((v) => !v)}
              className="flex items-center gap-1.5 text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
              <Settings2 className="w-3 h-3" />
              Настройки
              {expandSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <AnimatePresence>
              {expandSettings && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-1.5">
                  <div className="flex flex-wrap gap-2">
                    {allEntries.map(([k, v]) => (
                      <span key={k} className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-slate-400">
                        <span className="text-slate-600">{k}:</span> {v}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })()}

      {/* Tip */}
      {item.tip && (
        <div className="flex items-start gap-1.5 pt-1 border-t border-white/[0.05]">
          <Info className="w-3 h-3 text-slate-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 leading-relaxed italic">{item.tip}</p>
        </div>
      )}
    </div>
  );
}

const HIGGS_MODELS = [
  { id: "kling3_0",            label: "Kling 3.0" },
  { id: "grok_video",          label: "Grok" },
  { id: "cinematic_studio_3_0",label: "Cinema" },
];

const HIGGS_DURATIONS = [
  { value: 5,  label: "5с",  credits: "~10 кр" },
  { value: 10, label: "10с", credits: "~20 кр" },
  { value: 15, label: "15с", credits: "~30 кр" },
];

function HiggsDirectGen({ bestPrompt }: { bestPrompt: string }) {
  const [model, setModel]       = useState("kling3_0");
  const [duration, setDuration] = useState(5);
  const [prompt, setPrompt]     = useState(bestPrompt);
  const { state, videoUrl, progress, error, generate: runGen, reset } = useVideoGen({ direction: "video-prompt" });

  const isLoading = state === "submitting" || state === "polling";
  const displayProgress = state === "submitting" ? 2 : progress;

  const generate = () => {
    if (!prompt.trim()) return;
    runGen({ prompt: prompt.trim(), model, duration, aspect_ratio: "9:16" });
  };

  return (
    <div className="p-4 rounded-2xl border border-violet-500/20 bg-violet-900/10 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-violet-400" />
        <span className="text-xs font-semibold text-violet-300">Сгенерировать сразу в Higgsfield</span>
      </div>

      {/* Model + Duration row */}
      <div className="flex gap-2">
        <div className="flex gap-1 flex-1">
          {HIGGS_MODELS.map((m) => (
            <button key={m.id} onClick={() => setModel(m.id)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                model === m.id ? "border-violet-500/40 bg-violet-500/15 text-white" : "border-white/[0.06] text-slate-500 hover:text-slate-300"
              }`}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {HIGGS_DURATIONS.map((d) => (
            <button key={d.value} onClick={() => setDuration(d.value)}
              className={`flex flex-col items-center px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                duration === d.value ? "border-violet-500/40 bg-violet-500/15 text-white" : "border-white/[0.06] text-slate-500 hover:text-slate-300"
              }`}>
              <span>{d.label}</span>
              <span className="text-[9px] text-slate-600">{d.credits}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt */}
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3}
        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-600 outline-none focus:border-violet-500/40 transition-colors resize-none"
      />

      {state === "idle" && (
        <button onClick={generate} disabled={!prompt.trim()}
          className="w-full py-2.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-xs text-violet-300 font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
          <Play className="w-3.5 h-3.5" /> Генерировать видео
        </button>
      )}

      {isLoading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
            <span className="text-xs text-slate-400">Генерирую... {displayProgress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.06]">
            <motion.div className="h-1.5 rounded-full bg-violet-500"
              animate={{ width: `${Math.max(displayProgress, 5)}%` }} transition={{ duration: 0.8 }} />
          </div>
        </div>
      )}

      {state === "done" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-white font-semibold">Видео готово!</span>
          </div>
          {videoUrl && <video src={videoUrl} controls className="w-full rounded-xl" />}
          <div className="flex gap-2">
            {videoUrl && (
              <a href={videoUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-xs text-emerald-300 hover:bg-emerald-500/25 transition-all">
                <ExternalLink className="w-3 h-3" /> Скачать
              </a>
            )}
            <button onClick={reset}
              className="flex-1 py-2 rounded-xl bg-white/[0.04] text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Ещё раз
            </button>
          </div>
        </motion.div>
      )}

      {state === "error" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs text-red-400">{error}</span>
          </div>
          <button onClick={reset} className="text-xs text-slate-500 hover:text-white transition-colors">
            Попробовать снова
          </button>
        </div>
      )}
    </div>
  );
}

interface VideoPromptPanelProps {
  script: string;
  direction: string;
  topic: string;
  bgKey: string;
}

export default function VideoPromptPanel({ script, direction, topic, bgKey }: VideoPromptPanelProps) {
  const { run, isRunning, isDone, result, error, clear } = useBgTask<{ prompts: VideoPromptItem[] }>(bgKey);

  const generate = () => {
    run(`Видео-промпты · ${topic.slice(0, 30)}`, async () => {
      const res = await fetch("/api/video-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, direction, topic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data as { prompts: VideoPromptItem[] };
    });
  };

  return (
    <div className="space-y-3">
      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">Видео-промпты для AI</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      {!isDone && !isRunning && (
        <button
          onClick={generate}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl border border-dashed border-violet-500/30 bg-violet-900/10 text-sm text-violet-300 hover:bg-violet-900/20 hover:border-violet-500/50 transition-all font-medium"
        >
          <Wand2 className="w-4 h-4" />
          Сгенерировать видео-промпты для Kling / Runway / HeyGen
        </button>
      )}

      {isRunning && (
        <div className="flex items-center justify-center gap-2.5 py-4 rounded-2xl border border-violet-500/20 bg-violet-900/10">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <RefreshCw className="w-4 h-4 text-violet-400" />
          </motion.div>
          <span className="text-sm text-slate-400">Создаю промпты для Kling, Runway, Sora, HeyGen...</span>
        </div>
      )}

      {error && !isRunning && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400">
          {error}
          <button onClick={generate} className="ml-auto text-slate-400 hover:text-white">Повторить</button>
        </div>
      )}

      {isDone && result?.prompts && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white">Промпты готовы</span>
              <span className="text-xs text-slate-500">{result.prompts.length} инструмента</span>
            </div>
            <button onClick={() => { clear(); }} className="text-[11px] text-slate-600 hover:text-red-400 transition-colors">
              Сбросить
            </button>
          </div>
          {result.prompts.map((item, i) => (
            <motion.div key={item.tool} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <PromptCard item={item} scriptText={script} />
            </motion.div>
          ))}
          <HiggsDirectGen bestPrompt={result.prompts[0]?.prompt ?? script.slice(0, 500)} />
          <button onClick={generate}
            className="w-full py-2.5 rounded-xl border border-white/[0.06] text-xs text-slate-500 hover:text-slate-300 hover:border-violet-500/25 transition-all flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Перегенерировать промпты
          </button>
        </motion.div>
      )}
    </div>
  );
}
