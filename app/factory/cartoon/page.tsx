"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Copy, Check, AlertCircle, Zap, Shield, Play, Video, ExternalLink, Loader2, CheckCircle2, Download, Volume2, Mic } from "lucide-react";
import { useVideoGen } from "@/lib/hooks/use-video-gen";
import DirectionLayout, { type Tab } from "@/components/factory/DirectionLayout";
import ContentPlanTab from "@/components/factory/ContentPlanTab";
import TrendsSelector, { type TrendItem } from "@/components/factory/TrendsSelector";
import AutopostTab from "@/components/factory/AutopostTab";
import VideoPromptPanel from "@/components/factory/VideoPromptPanel";
import { useBgTask } from "@/lib/hooks/use-bg-task";
import { SPARTAN_CHARACTER_URL } from "@/lib/data/assets";
import { PLATFORMS, DIRECTION_DEFAULT_PLATFORMS } from "@/lib/data/platforms";
import { cn } from "@/lib/utils";

const suggestedTopics = [
  "Почему мерч никогда не умрёт — монолог Спартанца",
  "Спартанец объясняет: что такое DTF печать за 60 секунд",
  "Как выбрать франшизу и не облажаться — советы воина",
  "История АДОНИС от Казани до 100 городов",
  "Спартанец VS типичные страхи предпринимателя",
  "Утро спартанца: день из жизни партнёра АДОНИС",
];

function ScriptTab({ onScriptGenerated, onGoToCreate }: { onScriptGenerated: (script: string, topic: string) => void; onGoToCreate: () => void }) {
  const [topic, setTopic]   = useState("");
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState(DIRECTION_DEFAULT_PLATFORMS["cartoon"][0]);

  const { run, isRunning, result, error } = useBgTask<{content:string;viralScore:number;topic:string}>("cartoon-script");
  const content    = result?.content ?? null;
  const viralScore = result?.viralScore ?? null;
  const loading    = isRunning;

  // Restore parent state on remount if generation completed while away
  useEffect(() => {
    if (result?.content) onScriptGenerated(result.content, result.topic ?? suggestedTopics[0]);
  }, [result?.content]);

  const generate = () => {
    const activeTopic = topic.trim() || suggestedTopics[0];
    const platformLabel = PLATFORMS.find(p => p.id === platform)?.label ?? "TikTok";
    run(`Спартанец · ${activeTopic.slice(0,30)}`, async () => {
      const res = await fetch("/api/factory-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: "cartoon", topic: activeTopic, trendContext: selectedTrend ?? undefined, platform: platformLabel }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      return { content: json.content as string, viralScore: json.viralScore as number, topic: activeTopic };
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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
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
      </motion.div>

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
            <button onClick={onGoToCreate}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600/80 to-purple-600/80 hover:from-pink-600 hover:to-purple-600 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all">
              <Video className="w-4 h-4" />
              Создать видео по этому монологу →
            </button>
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

const DURATIONS = [
  { value: 5,  label: "5 сек",  credits: "~10 кр" },
  { value: 10, label: "10 сек", credits: "~20 кр" },
  { value: 15, label: "15 сек", credits: "~30 кр" },
];

const CARTOON_MODELS = [
  { id: "wan2_7",    label: "WAN 2.7",    desc: "Рекомендуем · 2–3 мин" },
  { id: "dop-turbo", label: "DOP Turbo",  desc: "Higgsfield · экспериментальный" },
  { id: "kling3_0",  label: "Kling 3.0",  desc: "Высокое качество · 10+ мин" },
];

// ~2.5 words/sec for Russian speech
const WORDS_PER_SEC = 2.5;

function extractDialogue(script: string | null, maxWords?: number): string {
  if (!script) return "";
  const lines = script.split("\n");
  const replicas = lines
    .filter((l) => l.includes("Реплика:") || l.includes("реплика:"))
    .map((l) => l.replace(/.*[Рр]еплика:\s*["«]?/, "").replace(/["»]?\s*$/, "").trim())
    .filter(Boolean);
  const fullText = replicas.join(" ");
  if (!maxWords) return fullText;
  const words = fullText.split(/\s+/);
  return words.slice(0, maxWords).join(" ");
}

function buildPrompt(topic: string, script: string | null): string {
  const sceneDesc = script ? script.slice(0, 400) : `Topic: "${topic}"`;
  return `Cartoon animation of ADONIS Spartan warrior mascot. Character: small energetic spartan in golden helmet with red plume, bold "ADONIS" text logo on chest armor plate, golden and dark-red colors. Background: professional merch printing workshop — large DTF printer, sewing machines, branded hoodies on hangers, inkjet printing equipment, busy production studio. Scene: ${sceneDesc}. Style: 2D Pixar-like flat cartoon animation, vibrant colors, dynamic movement, clean outlines. Audio: teenage Russian male voice speaking enthusiastically.`;
}

function CreateVideoTab({ script, topic }: { script: string | null; topic: string }) {
  const [prompt, setPrompt]       = useState(() => buildPrompt(topic, script));
  const [duration, setDuration]   = useState(5);
  const [audioText, setAudioText] = useState(() => extractDialogue(script, Math.round(5 * WORDS_PER_SEC)));
  const [model, setModel]         = useState("wan2_7");

  // Re-trim audio text when user picks a different duration
  useEffect(() => {
    setAudioText(extractDialogue(script, Math.round(duration * WORDS_PER_SEC)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);
  const [audioUrl, setAudioUrl]   = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError]     = useState<string | null>(null);

  const { state: renderState, videoUrl, progress, error: errorMsg, debugInfo, generate: runGen, reset, checkNow } = useVideoGen({ direction: "cartoon", topic });

  const createVideo = async () => {
    if (!prompt.trim()) return;

    // Generate ElevenLabs audio in parallel (non-blocking for video start)
    if (audioText.trim()) {
      setAudioLoading(true);
      setAudioError(null);
      fetch("/api/elevenlabs/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: audioText.trim() }),
      }).then(async (r) => {
        if (r.ok) {
          const blob = await r.blob();
          setAudioUrl(URL.createObjectURL(blob));
        } else {
          const err = await r.json().catch(() => ({}));
          setAudioError(err.error || `TTS ошибка ${r.status}`);
        }
      }).catch((e) => setAudioError(e.message))
        .finally(() => setAudioLoading(false));
    }

    runGen({
      prompt: prompt.trim(),
      model,
      duration,
      aspect_ratio: "9:16",
      image_url: SPARTAN_CHARACTER_URL,
    });
  };

  const handleReset = () => {
    reset();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioError(null);
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

      {/* Duration */}
      <div>
        <p className="text-xs font-medium text-slate-400 mb-2">Длительность</p>
        <div className="grid grid-cols-3 gap-2">
          {DURATIONS.map((d) => (
            <button key={d.value} onClick={() => setDuration(d.value)}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                duration === d.value ? "border-pink-500/40 bg-pink-500/10" : "border-white/[0.06] hover:border-white/[0.12]"
              }`}>
              <span className={`text-xs font-semibold ${duration === d.value ? "text-white" : "text-slate-400"}`}>{d.label}</span>
              <span className="text-[10px] text-slate-600 mt-0.5">{d.credits}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reference image preview */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <img src={SPARTAN_CHARACTER_URL} alt="Спартанец АДОНИС" className="w-12 h-20 rounded-lg object-cover flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-white mb-0.5">Референс персонажа</p>
          <p className="text-[10px] text-slate-500 leading-relaxed">Спартанец с лого ADONIS на груди и фоном производства мерча — всегда постоянный</p>
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

      {/* ElevenLabs voiceover */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Mic className="w-3.5 h-3.5 text-pink-400" />
          <label className="text-xs font-medium text-slate-400">Текст озвучки · ElevenLabs</label>
          <span className="ml-auto text-[10px] text-slate-500">
            ~{Math.round(duration * WORDS_PER_SEC)} слов · {duration} сек
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">AI</span>
        </div>
        <textarea value={audioText} onChange={(e) => setAudioText(e.target.value)} rows={3}
          placeholder="Реплики Спартанца для озвучки... (автозаполнение из монолога)"
          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-pink-500/40 transition-colors resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-[10px] text-slate-600">Аудио генерируется отдельно — слушай рядом с видео</p>
          <p className="text-[10px] text-slate-600">{audioText.trim().split(/\s+/).filter(Boolean).length} слов</p>
        </div>
      </div>

      {renderState === "idle" && (
        <button onClick={createVideo} disabled={!prompt.trim()}
          className="w-full py-4 rounded-2xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
          <Play className="w-5 h-5" /> Генерировать анимацию
        </button>
      )}

      {/* Audio loading/ready indicator (visible during polling and done) */}
      {(renderState === "polling" || renderState === "done") && audioText.trim() && (
        <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
          audioLoading ? "border-violet-500/20 bg-violet-500/5"
          : audioError  ? "border-red-500/20 bg-red-500/5"
          : audioUrl    ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-white/[0.06] bg-white/[0.02]"
        }`}>
          {audioLoading ? (
            <><Loader2 className="w-4 h-4 text-violet-400 animate-spin flex-shrink-0" />
              <span className="text-xs text-slate-400">Генерирую озвучку ElevenLabs...</span></>
          ) : audioError ? (
            <><AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400">{audioError}</span></>
          ) : audioUrl ? (
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Volume2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-emerald-400 font-medium">Озвучка готова · ElevenLabs</span>
              </div>
              <audio src={audioUrl} controls className="w-full h-8" style={{ colorScheme: "dark" }} />
              <a href={audioUrl} download="spartan-voice.mp3"
                className="mt-1.5 flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors">
                <Download className="w-3 h-3" /> Скачать аудио
              </a>
            </div>
          ) : null}
        </div>
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
          <p className="text-xs text-slate-500">Higgsfield AI генерирует — обычно 3–10 минут</p>
          <div className="flex items-center gap-4">
            <button onClick={checkNow} className="text-[10px] text-pink-400 hover:text-pink-300 transition-colors underline">
              Проверить готовность
            </button>
            <button onClick={reset} className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors underline">
              Отменить и начать заново
            </button>
          </div>
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
          <div className="flex items-center gap-2">
            <a href={`/api/download?url=${encodeURIComponent(videoUrl)}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-sm text-blue-300 font-medium transition-all">
              <Download className="w-4 h-4" /> Скачать видео
            </a>
            <a href={videoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-sm text-emerald-300 font-medium transition-all">
              <ExternalLink className="w-4 h-4" /> Открыть
            </a>
          </div>
          <button onClick={handleReset} className="w-full py-2 rounded-xl bg-white/[0.04] text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Создать ещё
          </button>
        </motion.div>
      )}

      {renderState === "done" && !videoUrl && (
        <div className="p-5 rounded-2xl border border-yellow-500/20 bg-yellow-900/10 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-white font-semibold">Готово, но URL не получен</span>
          </div>
          {debugInfo && <p className="text-xs text-slate-400 font-mono break-all">{debugInfo}</p>}
          <button onClick={handleReset} className="px-4 py-2 rounded-xl bg-white/[0.06] text-sm text-white hover:bg-white/[0.1] transition-colors">
            Попробовать снова
          </button>
        </div>
      )}

      {renderState === "error" && (
        <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-white font-semibold">Ошибка генерации</span>
          </div>
          <p className="text-sm text-red-400">{errorMsg}</p>
          <button onClick={handleReset} className="px-4 py-2 rounded-xl bg-white/[0.06] text-sm text-white hover:bg-white/[0.1] transition-colors">
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
          onGoToCreate={() => setActiveTab("create")}
        />
      )}
      {activeTab === "plan" && <ContentPlanTab directionLabel="Мультяшки Спартанец" directionId="cartoon" />}
      {activeTab === "create" && <CreateVideoTab script={script} topic={topic} />}
      {activeTab === "autopost" && <AutopostTab directionId="cartoon" directionLabel="Мультяшки" />}
    </DirectionLayout>
  );
}
