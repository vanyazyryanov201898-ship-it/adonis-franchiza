"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, RefreshCw, Copy, Check, AlertCircle, Zap } from "lucide-react";
import DirectionLayout, { type Tab } from "@/components/factory/DirectionLayout";
import ContentPlanTab from "@/components/factory/ContentPlanTab";
import TrendsSelector, { type TrendItem } from "@/components/factory/TrendsSelector";
import AutopostTab from "@/components/factory/AutopostTab";
import { useBgTask } from "@/lib/use-bg-task";
import { ExternalLink } from "lucide-react";

const suggestedTopics = [
  "Франшиза без большого капитала — как это возможно",
  "Почему 95% новых бизнесов закрываются и как попасть в 5%",
  "5 шагов от идеи до первой выручки с АДОНИС",
  "Мерч бизнес: мифы vs реальность",
  "Как партнёр из Ставрополя заработал 10 миллионов",
  "DTF печать — технология которая меняет рынок",
];

function ScriptTab() {
  const [topic, setTopic]   = useState("");
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [copied, setCopied] = useState(false);

  const { run, isRunning, result, error } = useBgTask<{content:string;viralScore:number}>("heygen-ai-script");
  const content    = result?.content ?? null;
  const viralScore = result?.viralScore ?? null;
  const loading    = isRunning;

  const generate = () => {
    const activeTopic = topic.trim() || suggestedTopics[0];
    run(`HeyGen AI · ${activeTopic.slice(0,30)}`, async () => {
      const res = await fetch("/api/factory-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: "heygen-ai", topic: activeTopic, trendContext: selectedTrend ?? undefined }),
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400">1</div>
          <h3 className="text-sm font-semibold text-white">Тема видео</h3>
        </div>
        <input value={topic} onChange={(e) => setTopic(e.target.value)}
          placeholder="Своя тема или выбери из предложенных"
          className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/40 transition-colors"
        />
        <div className="flex flex-wrap gap-2">
          {suggestedTopics.map((t) => (
            <button key={t} onClick={() => setTopic(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${topic === t ? "bg-violet-600/80 text-white" : "bg-white/[0.04] text-slate-500 hover:text-slate-300 border border-white/[0.06]"}`}>
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="px-4 py-3 rounded-xl bg-violet-900/15 border border-violet-500/20 text-xs text-violet-300">
        AI-аватар читает чётко и структурированно: хук → боль → решение → CTA. Никаких вводных слов.
      </div>

      <TrendsSelector
        selectedTrend={selectedTrend}
        onSelect={setSelectedTrend}
        accentColor="text-violet-400"
      />

      <motion.button
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={generate} disabled={loading}
        className="w-full py-4 rounded-2xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw className="w-5 h-5" /></motion.div>Пишу сценарий...</>
        ) : (
          <><Bot className="w-5 h-5" />Написать сценарий</>
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
                <Zap className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs text-slate-400">Вирусный потенциал:</span>
                <span className="text-xs font-bold text-violet-400">{viralScore}/100</span>
              </div>
            )}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Сценарий · HeyGen AI Аватар</span>
                <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-slate-400 hover:text-white transition-colors">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" />Скопировано</> : <><Copy className="w-3.5 h-3.5" />Копировать</>}
                </button>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>
            <button onClick={generate}
              className="w-full py-3 rounded-2xl border border-white/[0.06] text-sm text-slate-400 hover:text-white hover:border-violet-500/25 transition-all flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Ещё вариант
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeyGenAIInstructions() {
  const steps = [
    { n: 1, label: "Сгенерируй сценарий", desc: "Вкладка «Сценарий» → «Написать сценарий»" },
    { n: 2, label: "Скопируй СКРИПТ ДЛЯ АВАТАРА", desc: "Только блок текста под «СКРИПТ ДЛЯ АВАТАРА:» — без технических настроек" },
    { n: 3, label: "Открой HeyGen", desc: "heygen.com → Create Video → AI Avatars" },
    { n: 4, label: "Выбери аватар", desc: "Мужской деловой аватар, русскоязычный голос" },
    { n: 5, label: "Вставь скрипт", desc: "Поле Script → вставь текст. Пометки [БЫСТРО] / [ПАУЗА] → настрой темп вручную" },
    { n: 6, label: "Generate", desc: "Видео готово за 1-3 минуты" },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="p-4 rounded-2xl border border-violet-500/20 bg-violet-900/10">
        <p className="text-sm font-semibold text-violet-400 mb-1">HeyGen AI Аватар — как это работает</p>
        <p className="text-xs text-slate-400">
          Сценарий уже написан в нужном формате. Скопируй текст и вставь в HeyGen. Никаких промптов для генерации не нужно.
        </p>
      </div>
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.n} className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 flex-shrink-0 mt-0.5">
              {step.n}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{step.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <a href="https://www.heygen.com" target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-all text-sm font-medium">
        Открыть HeyGen <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

export default function HeyGenAIPage() {
  const [activeTab, setActiveTab] = useState<Tab>("script");
  return (
    <DirectionLayout
      title="HeyGen AI Аватар"
      subtitle="Структурный сценарий · Хук → Боль → Решение → CTA"
      accentColor="text-violet-400"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "script" && <ScriptTab />}
      {activeTab === "plan" && <ContentPlanTab directionLabel="HeyGen AI Аватар" directionId="heygen-ai" />}
      {activeTab === "create" && <HeyGenAIInstructions />}
      {activeTab === "autopost" && <AutopostTab directionId="heygen-ai" directionLabel="HeyGen AI Аватар" />}
    </DirectionLayout>
  );
}
