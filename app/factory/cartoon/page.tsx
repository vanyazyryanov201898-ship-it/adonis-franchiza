"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Copy, Check, AlertCircle, Zap, Shield, Play, Video, ExternalLink, Loader2 } from "lucide-react";
import DirectionLayout, { type Tab } from "@/components/factory/DirectionLayout";
import ContentPlanTab from "@/components/factory/ContentPlanTab";
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

function ScriptTab({ onScriptGenerated }: { onScriptGenerated: (script: string, topic: string) => void }) {
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
      onScriptGenerated(json.content, activeTopic);
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

const CARTOON_MODELS = [
  { id: "kling-3", label: "Kling 3.0", desc: "Быстро · ~6 кредитов" },
  { id: "wan-2.7", label: "Wan 2.7",   desc: "Анимация · ~10 кредитов" },
  { id: "sora-2",  label: "Sora 2",    desc: "Качество · ~40 кредитов" },
];

type RenderState = "idle" | "submitting" | "polling" | "done" | "error";

function CreateVideoTab({ script, topic }: { script: string | null; topic: string }) {
  const [prompt, setPrompt]     = useState(() =>
    script
      ? `Cartoon animation of Spartan warrior mascot (small spartan in helmet, energetic, funny). Topic: "${topic}". Script: ${script.slice(0, 300)}. Style: 2D cartoon animation, Pixar-like, vibrant colors, dynamic movement, brand colors pink and dark.`
      : ""
  );
  const [model, setModel]       = useState("kling-3");
  const [renderState, setRenderState] = useState<RenderState>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pollRef                 = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const startPolling = (id: string) => {
    setRenderState("polling");
    setProgress(5);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/higgsfield/status/${id}`);
        const data = await res.json();
        if (data.status === "completed" && data.url) {
          clearInterval(pollRef.current!);
          setVideoUrl(data.url);
          setRenderState("done");
        } else if (data.status === "failed") {
          clearInterval(pollRef.current!);
          setErrorMsg(data.error || "Ошибка генерации");
          setRenderState("error");
        } else {
          setProgress((p) => Math.min(p + 3, 90));
        }
      } catch { /* продолжаем поллинг */ }
    }, 4000);
  };

  const createVideo = async () => {
    if (!prompt.trim()) return;
    setRenderState("submitting");
    setErrorMsg(null);
    setVideoUrl(null);
    setProgress(0);
    try {
      const res = await fetch("/api/higgsfield/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), model, type: "cartoon" }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || `HTTP ${res.status}`); setRenderState("error"); return; }
      startPolling(data.id);
    } catch (e: any) {
      setErrorMsg(e?.message || "Ошибка сети");
      setRenderState("error");
    }
  };

  const reset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setRenderState("idle"); setVideoUrl(null); setProgress(0); setErrorMsg(null);
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
          <Video className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Создать мультяшное видео · Higgsfield AI</h3>
          <p className="text-xs text-slate-500">Анимация Спартанца по твоему монологу</p>
        </div>
      </div>

      {/* Model selector */}
      <div>
        <p className="text-xs font-medium text-slate-400 mb-2">Модель</p>
        <div className="grid grid-cols-3 gap-2">
          {CARTOON_MODELS.map((m) => (
            <button key={m.id} onClick={() => setModel(m.id)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                model === m.id ? "border-pink-500/40 bg-pink-500/10" : "border-white/[0.06] hover:border-white/[0.12]"
              }`}>
              <span className={`text-xs font-semibold ${model === m.id ? "text-white" : "text-slate-400"}`}>{m.label}</span>
              <span className="text-[10px] text-slate-600 mt-0.5">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt */}
      <div>
        <label className="text-xs font-medium text-slate-400 mb-1.5 block">Промпт для анимации</label>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5}
          placeholder="Опиши мультяшного Спартанца и что он делает..."
          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-pink-500/40 transition-colors resize-none leading-relaxed"
        />
      </div>

      {renderState === "idle" && (
        <button onClick={createVideo} disabled={!prompt.trim()}
          className="w-full py-4 rounded-2xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
          <Play className="w-5 h-5" /> Генерировать анимацию
        </button>
      )}

      {renderState === "submitting" && (
        <div className="w-full py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center gap-3 text-sm text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Отправляю в Higgsfield...
        </div>
      )}

      {renderState === "polling" && (
        <div className="p-5 rounded-2xl border border-pink-500/20 bg-pink-900/10 space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
            <span className="text-sm text-white font-medium">Анимирую Спартанца... {progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/[0.06]">
            <motion.div className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
              animate={{ width: `${Math.max(progress, 5)}%` }} transition={{ duration: 0.8 }} />
          </div>
          <p className="text-xs text-slate-500">Higgsfield AI генерирует — обычно 1–3 минуты</p>
        </div>
      )}

      {renderState === "done" && videoUrl && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-900/10 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-white font-semibold">Анимация готова!</span>
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

export default function CartoonPage() {
  const [activeTab, setActiveTab] = useState<Tab>("script");
  const [script, setScript]       = useState<string | null>(null);
  const [topic, setTopic]         = useState(suggestedTopics[0]);

  return (
    <DirectionLayout
      title="Мультяшки"
      subtitle="Спартанец АДОНИС · Юмор · Стендап · Истории"
      accentColor="text-pink-400"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "script" && (
        <ScriptTab
          onScriptGenerated={(s, t) => { setScript(s); setTopic(t); }}
        />
      )}
      {activeTab === "plan" && <ContentPlanTab directionLabel="Мультяшки Спартанец" directionId="cartoon" />}
      {activeTab === "create" && <CreateVideoTab script={script} topic={topic} />}
      {activeTab === "autopost" && <AutopostTab directionId="cartoon" directionLabel="Мультяшки" />}
    </DirectionLayout>
  );
}
