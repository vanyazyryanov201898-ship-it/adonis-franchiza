"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, TrendingUp, Users, Film, Flame, Activity } from "lucide-react";
import { aiActivityFeed } from "@/lib/mock-data";

const typeConfig = {
  generate: { icon: Sparkles, color: "text-violet-400", bg: "bg-violet-400/10" },
  post: { icon: Send, color: "text-blue-400", bg: "bg-blue-400/10" },
  analyze: { icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  lead: { icon: Users, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  render: { icon: Film, color: "text-orange-400", bg: "bg-orange-400/10" },
  viral: { icon: Flame, color: "text-red-400", bg: "bg-red-400/10" },
};

const newEvents = [
  { id: 100, time: "только что", action: "Viral хит!", detail: "Ролик набрал 50K за 30 минут", type: "viral" },
  { id: 101, time: "только что", action: "Новый лид", detail: "Заявка на франшизу из TikTok", type: "lead" },
  { id: 102, time: "только что", action: "AI генерация", detail: "Создан сценарий «Бизнес 2026»", type: "generate" },
];

export default function AIActivityFeed() {
  const [feed, setFeed] = useState(aiActivityFeed);
  const [eventIndex, setEventIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = newEvents[eventIndex % newEvents.length];
      setFeed((prev) => [
        { ...newEvent, id: Date.now() },
        ...prev.slice(0, 5),
      ]);
      setEventIndex((i) => i + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [eventIndex]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">AI Активность</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">Live</span>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-2.5 overflow-hidden" style={{ maxHeight: "280px" }}>
        <AnimatePresence initial={false}>
          {feed.map((event, index) => {
            const config = typeConfig[event.type as keyof typeof typeConfig];
            const Icon = config?.icon || Sparkles;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3 group"
              >
                {/* Icon */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${config?.bg || "bg-violet-400/10"}`}>
                  <Icon className={`w-3.5 h-3.5 ${config?.color || "text-violet-400"}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-white">{event.action}</span>
                    <span className="text-[10px] text-slate-600 flex-shrink-0">{event.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{event.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/[0.05]">
        <button className="w-full text-xs text-violet-400 hover:text-violet-300 transition-colors">
          Смотреть всю активность →
        </button>
      </div>
    </motion.div>
  );
}
