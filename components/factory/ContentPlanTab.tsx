"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { PLATFORMS, DIRECTION_DEFAULT_PLATFORMS } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import { useBgTask } from "@/lib/use-bg-task";

interface ContentPlanTabProps {
  directionLabel: string;
  directionId?: string;
  defaultPlatforms?: string[];
}

type PlanItem = {
  day: number;
  weekday: string;
  platform: string;
  format: string;
  goal: string;
  topic: string;
  hook: string;
  bestTime: string;
  viralScore: number;
};

const goalColors: Record<string, string> = {
  expert:    "bg-violet-500/20 text-violet-300",
  story:     "bg-blue-500/20 text-blue-300",
  case:      "bg-emerald-500/20 text-emerald-300",
  entertain: "bg-pink-500/20 text-pink-300",
  sell:      "bg-orange-500/20 text-orange-300",
};

const goalLabels: Record<string, string> = {
  expert:    "Эксперт",
  story:     "История",
  case:      "Кейс",
  entertain: "Развлечение",
  sell:      "Продажа",
};

export default function ContentPlanTab({ directionLabel, directionId, defaultPlatforms }: ContentPlanTabProps) {
  const initialPlatforms =
    defaultPlatforms ??
    (directionId ? DIRECTION_DEFAULT_PLATFORMS[directionId] : null) ??
    ["tiktok", "instagram", "youtube"];

  const [selectedPlatformIds, setSelectedPlatformIds] = useState<string[]>(initialPlatforms);
  const [frequency, setFrequency] = useState(5);

  const bgKey = directionId ? `content-plan-${directionId}` : "content-plan";
  const { run, isRunning, result, error } = useBgTask<{ plan: PlanItem[] }>(bgKey);
  const plan = result?.plan ?? null;
  const loading = isRunning;

  const togglePlatform = (id: string) => {
    setSelectedPlatformIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectedLabels = PLATFORMS
    .filter((p) => selectedPlatformIds.includes(p.id))
    .map((p) => p.label);

  const generate = () => {
    if (selectedPlatformIds.length === 0) return;
    const snap = { niche: `${directionLabel} — АДОНИС франшиза`, platforms: selectedLabels, frequency };
    run(`План · ${directionLabel}`, async () => {
      const res = await fetch("/api/content-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snap),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      return json as { plan: PlanItem[] };
    });
  };

  return (
    <div className="p-6 space-y-4">
      {/* Platform selector */}
      <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Платформы</p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => {
            const active = selectedPlatformIds.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                  active
                    ? "text-white border-transparent"
                    : "bg-white/[0.03] text-slate-500 border-white/[0.06] hover:text-slate-300 hover:border-white/[0.12]"
                )}
                style={active ? { backgroundColor: p.bgColor, borderColor: p.color + "60" } : {}}
              >
                <span
                  className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black"
                  style={active ? { color: p.color } : { color: "#64748b" }}
                >
                  {p.shortLabel}
                </span>
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Frequency */}
      <div className="flex items-center gap-4 px-4 py-3 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <span className="text-xs text-slate-400 flex-shrink-0">Постов в неделю:</span>
        <input
          type="range" min={3} max={7} step={1}
          value={frequency}
          onChange={(e) => setFrequency(Number(e.target.value))}
          className="flex-1 accent-violet-500"
        />
        <span className="text-sm font-bold text-white w-4 text-center">{frequency}</span>
      </div>

      {/* Header + generate button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">30-дневный контент-план</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedPlatformIds.length > 0
              ? selectedLabels.join(", ")
              : <span className="text-red-400">Выбери хотя бы одну платформу</span>}
          </p>
        </div>
        <button
          onClick={generate}
          disabled={loading || selectedPlatformIds.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl btn-ai text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw className="w-4 h-4" /></motion.div> Генерирую...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> {plan ? "Перегенерировать" : "Создать план"}</>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!plan && !loading && !error && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[220px] text-center p-6 rounded-2xl border border-dashed border-white/[0.08]">
            <CalendarDays className="w-10 h-10 text-slate-600 mb-3" />
            <p className="text-slate-500 text-sm">Выбери платформы и нажми «Создать план»</p>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[200px] gap-4">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 to-cyan-600/30 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <CalendarDays className="w-6 h-6 text-violet-400" />
            </motion.div>
            <p className="text-slate-400 text-sm">Claude составляет план для «{directionLabel}»...</p>
          </motion.div>
        )}

        {plan && !loading && (
          <motion.div key="plan" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            {plan.map((item, i) => {
              const platform = PLATFORMS.find((p) => p.label.toLowerCase() === item.platform.toLowerCase());
              return (
                <motion.div key={item.day}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/[0.05] flex flex-col items-center justify-center">
                    <span className="text-[10px] text-slate-500">{item.weekday}</span>
                    <span className="text-xs font-bold text-white leading-none">{item.day}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={platform ? { color: platform.color, backgroundColor: platform.bgColor } : { color: "#94a3b8" }}
                      >
                        {item.platform}
                      </span>
                      <span className="text-[10px] text-slate-500">{item.format}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${goalColors[item.goal] || "bg-white/10 text-slate-400"}`}>
                        {goalLabels[item.goal] || item.goal}
                      </span>
                      <span className="ml-auto text-[10px] text-emerald-400 font-medium">{item.viralScore}%</span>
                    </div>
                    <p className="text-xs text-white font-medium leading-tight mb-1">{item.topic}</p>
                    <p className="text-[11px] text-slate-500 italic leading-tight">"{item.hook}"</p>
                  </div>
                  <div className="flex-shrink-0 text-[10px] text-slate-600">{item.bestTime}</div>
                </motion.div>
              );
            })}
            <button onClick={generate}
              className="w-full py-2.5 rounded-xl border border-white/[0.06] text-xs text-slate-500 hover:text-slate-300 hover:border-violet-500/25 transition-all flex items-center justify-center gap-2 mt-2">
              <RefreshCw className="w-3.5 h-3.5" /> Сгенерировать заново
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
