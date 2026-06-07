"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Sparkles, RefreshCw, Copy, Check, AlertCircle, Zap, ArrowRight, ExternalLink } from "lucide-react";
import DirectionLayout, { type Tab } from "@/components/factory/DirectionLayout";
import ContentPlanTab from "@/components/factory/ContentPlanTab";
import ApiKeyPlaceholder from "@/components/factory/ApiKeyPlaceholder";
import TrendsSelector, { type TrendItem } from "@/components/factory/TrendsSelector";
import AutopostTab from "@/components/factory/AutopostTab";
import { useBgTask } from "@/lib/hooks/use-bg-task";
import { PLATFORMS, DIRECTION_DEFAULT_PLATFORMS } from "@/lib/data/platforms";
import { cn } from "@/lib/utils";

const suggestedTopics = [
  "Как я открыл бизнес без опыта и заработал первый миллион",
  "Почему мерч — это бизнес который работает в любой кризис",
  "3 причины почему наёмный работник рискует больше предпринимателя",
  "Кейс партнёра Кирьяк: 16 млн рублей за год в Ростове",
  "Что происходит за 14 дней с момента подписания договора",
  "Честно о страхах: что мешает людям открыть бизнес",
];

const tones = [
  { id: "trust",   label: "Доверительный" },
  { id: "expert",  label: "Экспертный" },
  { id: "story",   label: "История" },
  { id: "provoke", label: "Провокационный" },
];

function ScriptTab() {
  const [topic, setTopic]     = useState("");
  const [tone, setTone]       = useState("trust");
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [copied, setCopied]   = useState(false);
  const [platform, setPlatform] = useState(DIRECTION_DEFAULT_PLATFORMS["heygen-live"][0]);

  const { run, isRunning, result, error, clear } = useBgTask<{content:string;viralScore:number}>("heygen-live-script");
  const content    = result?.content ?? null;
  const viralScore = result?.viralScore ?? null;
  const loading    = isRunning;

  const generate = () => {
    const activeTopic = topic.trim() || suggestedTopics[0];
    run(`HeyGen Живой · ${activeTopic.slice(0,30)}`, async () => {
      const res = await fetch("/api/factory-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: "heygen-live", topic: activeTopic, tone, trendContext: selectedTrend ?? undefined, platform: PLATFORMS.find(p => p.id === platform)?.label }),
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
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-400">1</div>
          <h3 className="text-sm font-semibold text-white">Тема видео</h3>
        </div>
        <input
          value={topic} onChange={(e) => setTopic(e.target.value)}
          placeholder="Своя тема или выбери из предложенных"
          className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-amber-500/40 transition-colors"
        />
        <div className="flex flex-wrap gap-2">
          {suggestedTopics.map((t) => (
            <button key={t} onClick={() => setTopic(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${topic === t ? "bg-amber-600/80 text-white" : "bg-white/[0.04] text-slate-500 hover:text-slate-300 border border-white/[0.06]"}`}>
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-400">2</div>
          <h3 className="text-sm font-semibold text-white">Тон подачи</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {tones.map((t) => (
            <button key={t.id} onClick={() => setTone(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${tone === t.id ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-white/[0.06] text-slate-500 hover:text-slate-300"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <TrendsSelector
          selectedTrend={selectedTrend}
          onSelect={setSelectedTrend}
          accentColor="text-amber-400"
        />
      </motion.div>

      <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
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
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={generate} disabled={loading}
        className="w-full py-4 rounded-2xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw className="w-5 h-5" /></motion.div>Пишу сценарий...</>
        ) : (
          <><Sparkles className="w-5 h-5" />Написать сценарий</>
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
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-slate-400">Вирусный потенциал:</span>
                <span className="text-xs font-bold text-amber-400">{viralScore}/100</span>
              </div>
            )}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Сценарий · HeyGen Живой</span>
                <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-slate-400 hover:text-white transition-colors">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" />Скопировано</> : <><Copy className="w-3.5 h-3.5" />Копировать</>}
                </button>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>
            <button onClick={generate}
              className="w-full py-3 rounded-2xl border border-white/[0.06] text-sm text-slate-400 hover:text-white hover:border-amber-500/25 transition-all flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Ещё вариант
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeyGenInstructions({ type }: { type: "live" | "ai" }) {
  const steps = [
    { n: 1, label: "Сгенерируй сценарий", desc: "На вкладке «Сценарий» → нажми «Написать сценарий»" },
    { n: 2, label: "Скопируй текст", desc: "Кнопка «Копировать» — берёт готовый скрипт" },
    { n: 3, label: "Открой HeyGen", desc: type === "live" ? "heygen.com → Create Video → Talking Photo / Avatar" : "heygen.com → Create Video → AI Avatar" },
    { n: 4, label: "Вставь скрипт", desc: "В поле Script — вставь скопированный текст" },
    { n: 5, label: "Выбери аватар и голос", desc: type === "live" ? "Загрузи фото или видео Ильи" : "Выбери AI-аватар из библиотеки" },
    { n: 6, label: "Запусти генерацию", desc: "Generate → видео готово за 1-3 минуты" },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-900/10">
        <p className="text-sm font-semibold text-amber-400 mb-1">
          {type === "live" ? "HeyGen Живой — как это работает" : "HeyGen AI Аватар — как это работает"}
        </p>
        <p className="text-xs text-slate-400">
          Сценарий — это скрипт для речи. Промпты здесь не нужны. Просто копируй и вставляй в HeyGen.
        </p>
      </div>

      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.n} className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-400 flex-shrink-0 mt-0.5">
              {step.n}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{step.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <a
        href="https://www.heygen.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all text-sm font-medium"
      >
        Открыть HeyGen
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

export default function HeyGenLivePage() {
  const [activeTab, setActiveTab] = useState<Tab>("script");
  return (
    <DirectionLayout
      title="HeyGen Живой"
      subtitle="Сценарий в голосе Ильи · Прямая личная подача"
      accentColor="text-amber-400"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "script" && <ScriptTab />}
      {activeTab === "plan" && <ContentPlanTab directionLabel="HeyGen Живой" directionId="heygen-live" />}
      {activeTab === "create" && <HeyGenInstructions type="live" />}
      {activeTab === "autopost" && <AutopostTab directionId="heygen-live" directionLabel="HeyGen Живой" />}
    </DirectionLayout>
  );
}
