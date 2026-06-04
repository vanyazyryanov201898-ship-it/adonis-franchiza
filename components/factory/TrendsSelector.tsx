"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, RefreshCw, X, ChevronDown, Zap, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type TrendItem = {
  id: number;
  title: string;
  viralScore: number;
  views: number;
  engagement: number;
  trend: string;
  category: string;
  growth: number;
  hooks: string[];
};

interface TrendsSelectorProps {
  onSelect: (trend: TrendItem | null) => void;
  selectedTrend: TrendItem | null;
  accentColor?: string;
}

export default function TrendsSelector({
  onSelect,
  selectedTrend,
  accentColor = "text-cyan-400",
}: TrendsSelectorProps) {
  const [open, setOpen] = useState(false);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: "франшиза мерч бизнес",
          categories: ["Бизнес", "Мерч", "Франшиза", "Личный бренд", "Маркетинг"],
        }),
      });
      const json = await res.json();
      if (json.topics) {
        setTrends(json.topics);
        setLoaded(true);
      }
    } catch {
      // silent fail — trends are optional
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!open && !loaded) fetchTrends();
    setOpen((v) => !v);
  };

  const select = (trend: TrendItem) => {
    onSelect(trend.id === selectedTrend?.id ? null : trend);
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
      {/* Header */}
      <button
        onClick={handleOpen}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors text-left"
      >
        <TrendingUp className={cn("w-4 h-4 flex-shrink-0", selectedTrend ? accentColor : "text-slate-600")} />
        <span className={cn("text-sm font-medium flex-1", selectedTrend ? "text-white" : "text-slate-500")}>
          {selectedTrend ? (
            <span className="flex items-center gap-2">
              С учётом тренда:
              <span className={cn("font-semibold", accentColor)}>
                {selectedTrend.title.length > 40 ? selectedTrend.title.slice(0, 40) + "…" : selectedTrend.title}
              </span>
            </span>
          ) : (
            "Добавить тренды (необязательно)"
          )}
        </span>
        {selectedTrend && (
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(null); }}
            className="p-1 rounded-lg hover:bg-white/[0.08] text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-600 flex-shrink-0" />
        </motion.div>
      </button>

      {/* Dropdown */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-2 space-y-2 border-t border-white/[0.05]">
              {loading && (
                <div className="flex items-center gap-2 py-4 justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                  </motion.div>
                  <span className="text-sm text-slate-500">Загружаю актуальные тренды...</span>
                </div>
              )}

              {!loading && !loaded && (
                <button
                  onClick={fetchTrends}
                  className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-slate-400 hover:text-white hover:bg-white/[0.07] transition-all flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" /> Загрузить тренды
                </button>
              )}

              {!loading && loaded && trends.length > 0 && (
                <>
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold mb-2">
                    Выбери тренд для привязки сценария
                  </p>
                  {trends.map((trend) => {
                    const isSelected = selectedTrend?.id === trend.id;
                    return (
                      <button
                        key={trend.id}
                        onClick={() => select(trend)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border transition-all",
                          isSelected
                            ? "border-cyan-500/40 bg-cyan-900/15"
                            : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.10]"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-semibold text-white leading-tight">{trend.title}</span>
                              <span className="text-[9px] text-slate-500">{trend.trend}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500">
                              <span className="text-emerald-400 font-semibold">{trend.viralScore}%</span>
                              <span>+{trend.growth}% роста</span>
                              <span>{trend.category}</span>
                            </div>
                            {isSelected && trend.hooks.length > 0 && (
                              <div className="mt-2 text-[11px] text-slate-400 italic">
                                «{trend.hooks[0]}»
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
                              <Check className="w-3 h-3 text-cyan-400" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  <button
                    onClick={fetchTrends}
                    className="w-full py-2 rounded-xl text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" /> Обновить тренды
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
