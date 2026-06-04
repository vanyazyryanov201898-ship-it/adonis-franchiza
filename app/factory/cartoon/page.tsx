"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Sparkles, RefreshCw, Copy, Check, AlertCircle, Zap, Shield } from "lucide-react";
import DirectionLayout, { type Tab } from "@/components/factory/DirectionLayout";
import ContentPlanTab from "@/components/factory/ContentPlanTab";
import ApiKeyPlaceholder from "@/components/factory/ApiKeyPlaceholder";
import TrendsSelector, { type TrendItem } from "@/components/factory/TrendsSelector";
import AutopostTab from "@/components/factory/AutopostTab";
import VideoPromptPanel from "@/components/factory/VideoPromptPanel";
import { useBgTask } from "@/lib/use-bg-task";

const suggestedTopics = [
  "Почему мерч никогда не умрёт — монолог Спартанца",
  "Спартанец объясняет: что такое DTF печать за 60 секунд",
  "Как выбрать франшизу и не облажаться — советы воина",
  "История АДОНИС от Казани до 100 городов",
  "Спартанец VS типичные страхи предпринимателя",
  "Утро спартанца: день из жизни партнёра АДОНИС",
];

function ScriptTab() {
  const [topic, setTopic]   = useState("");
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [copied, setCopied] = useState(false);

  const { run, isRunning, result, error } = useBgTask<{content:string;viralScore:number}>("cartoon-script");
  const content    = result?.content ?? null;
  const viralScore = result?.viralScore ?? null;
  const loading    = isRunning;

  const generate = () => {
    const activeTopic = topic.trim() || suggestedTopics[0];
    run(`Спартанец · ${activeTopic.slice(0,30)}`, async () => {
      const res = await fetch("/api/factory-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: "cartoon", topic: activeTopic, trendContext: selectedTrend ?? undefined }),
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
      {/* Mascot info card */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl border border-pink-500/20 bg-pink-900/10 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white mb-0.5">Спартанец АДОНИС</p>
          <p className="text-xs text-slate-400 leading-relaxed">Мини-спартанец в шлеме — маскот бренда. Энергичный, прямолинейный, с юмором. Говорит от первого лица, рассказывает про мерч и франшизу как настоящий воин.</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-xs font-bold text-pink-400">1</div>
          <h3 className="text-sm font-semibold text-white">Тема для Спартанца</h3>
        </div>
        <input value={topic} onChange={(e) => setTopic(e.target.value)}
          placeholder="Что расскажет Спартанец на этот раз?"
          className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-pink-500/40 transition-colors"
        />
        <div className="flex flex-wrap gap-2">
          {suggestedTopics.map((t) => (
            <button key={t} onClick={() => setTopic(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${topic === t ? "bg-pink-600/80 text-white" : "bg-white/[0.04] text-slate-500 hover:text-slate-300 border border-white/[0.06]"}`}>
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      <TrendsSelector
        selectedTrend={selectedTrend}
        onSelect={setSelectedTrend}
        accentColor="text-pink-400"
      />

      <motion.button
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={generate} disabled={loading}
        className="w-full py-4 rounded-2xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw className="w-5 h-5" /></motion.div>Спартанец думает...</>
        ) : (
          <><Sparkles className="w-5 h-5" />Написать монолог Спартанца</>
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
                <Zap className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-xs text-slate-400">Вирусный потенциал:</span>
                <span className="text-xs font-bold text-pink-400">{viralScore}/100</span>
              </div>
            )}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Монолог · Спартанец АДОНИС</span>
                <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-slate-400 hover:text-white transition-colors">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" />Скопировано</> : <><Copy className="w-3.5 h-3.5" />Копировать</>}
                </button>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>
            <button onClick={generate}
              className="w-full py-3 rounded-2xl border border-white/[0.06] text-sm text-slate-400 hover:text-white hover:border-pink-500/25 transition-all flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Ещё вариант
            </button>
            <VideoPromptPanel
              script={content}
              direction="cartoon"
              topic={topic.trim() || suggestedTopics[0]}
              bgKey="cartoon-videoprompt"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CartoonPage() {
  const [activeTab, setActiveTab] = useState<Tab>("script");
  return (
    <DirectionLayout
      title="Мультяшки"
      subtitle="Спартанец АДОНИС · Юмор · Стендап · Истории"
      accentColor="text-pink-400"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "script" && <ScriptTab />}
      {activeTab === "plan" && <ContentPlanTab directionLabel="Мультяшки Спартанец" directionId="cartoon" />}
      {activeTab === "create" && (
        <div className="p-6">
          <ApiKeyPlaceholder
            serviceName="Kling 2.0 API"
            description="Для генерации мультяшного видео нужен Kling 2.0 или аналогичный сервис анимации. Скоро подключим."
            envKey="KLING_API_KEY"
          />
        </div>
      )}
      {activeTab === "autopost" && <AutopostTab directionId="cartoon" directionLabel="Мультяшки" />}
    </DirectionLayout>
  );
}
