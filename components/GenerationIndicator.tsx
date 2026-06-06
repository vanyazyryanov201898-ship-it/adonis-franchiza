"use client";

import { useEffect, useReducer } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { bgStore, type BgTask } from "@/lib/stores/bg-store";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function GenerationIndicator() {
  const [, tick] = useReducer((x: number) => x + 1, 0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => bgStore.subscribe(tick), []);

  const running = bgStore.getRunning();
  // Show running + recently finished (last 5 sec)
  const allTasks = bgStore.getAll().filter(
    (t) => t.status === "running" || (t.finishedAt !== undefined && Date.now() - t.finishedAt < 5000)
  );

  if (allTasks.length === 0) return null;

  const hasRunning = running.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.95 }}
        className="fixed bottom-5 right-5 z-50 max-w-sm"
      >
        {/* Collapsed pill */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shadow-xl text-sm font-medium transition-all",
            hasRunning
              ? "bg-[#0d0d1a] border-violet-500/40 text-white"
              : "bg-[#0d0d1a] border-emerald-500/30 text-emerald-400"
          )}
        >
          {hasRunning ? (
            <Loader2 className="w-4 h-4 text-violet-400 animate-spin flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span className="max-w-[180px] truncate">
            {hasRunning
              ? `Генерирую: ${running[0]?.label}${running.length > 1 ? ` +${running.length - 1}` : ""}`
              : "Готово"}
          </span>
          {allTasks.length > 1 && (
            expanded ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" />
          )}
        </button>

        {/* Expanded list */}
        <AnimatePresence>
          {expanded && allTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-1.5"
            >
              <div className="bg-[#0d0d1a] border border-white/[0.10] rounded-2xl shadow-xl p-3 space-y-1.5">
                {allTasks.map((task) => (
                  <div key={task.key} className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/[0.04]">
                    {task.status === "running" && (
                      <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin flex-shrink-0" />
                    )}
                    {task.status === "done" && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    )}
                    {task.status === "error" && (
                      <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-white truncate block">{task.label}</span>
                      {task.status === "error" && (
                        <span className="text-[10px] text-red-400 truncate block">{task.error}</span>
                      )}
                    </div>
                    {task.status !== "running" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); bgStore.clear(task.key); }}
                        className="text-slate-600 hover:text-slate-400 transition-colors"
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
