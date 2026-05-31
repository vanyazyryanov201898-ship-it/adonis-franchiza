"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Repeat2, Sparkles, Copy, Check, RefreshCw, ChevronDown, ChevronUp,
  AlertCircle,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const PLATFORMS = [
  { id: "tiktok",    name: "TikTok",          color: "#fe2c55", abbr: "TT" },
  { id: "instagram", name: "Instagram Reels",  color: "#e91e8c", abbr: "IG" },
  { id: "youtube",   name: "YouTube Shorts",   color: "#ff4444", abbr: "YT" },
  { id: "telegram",  name: "Telegram",         color: "#26a5e4", abbr: "Tg" },
  { id: "vk",        name: "VK Клипы",         color: "#0077ff", abbr: "VK" },
  { id: "email",     name: "Email-рассылка",   color: "#10b981", abbr: "Em" },
  { id: "whatsapp",  name: "WhatsApp",         color: "#25d366", abbr: "WA" },
  { id: "rutube",    name: "Rutube",           color: "#003087", abbr: "Rt" },
];

type Variation = { platform: string; format: string; content: string };

function VariationCard({ v, index }: { v: Variation; index: number }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(index < 3);
  const platform = PLATFORMS.find((p) => p.name === v.platform || v.platform.includes(p.name.split(" ")[0]));

  const handleCopy = () => {
    navigator.clipboard.writeText(v.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{
              color: platform?.color ?? "#8b5cf6",
              backgroundColor: `${platform?.color ?? "#8b5cf6"}20`,
              border: `1px solid ${platform?.color ?? "#8b5cf6"}35`,
            }}
          >
            {platform?.abbr ?? v.platform.slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{v.platform}</p>
            <p className="text-[11px] text-slate-500">{v.format}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-slate-400 hover:text-white transition-colors"
          >
            {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Скопировано</> : <><Copy className="w-3.5 h-3.5" /> Копировать</>}
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/[0.04]">
              <pre className="mt-3 text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {v.content}
              </pre>
              <div className="mt-3 text-[11px] text-slate-600">
                {v.content.length} символов
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RepurposePage() {
  const [originalContent, setOriginalContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["tiktok", "instagram", "telegram", "youtube"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!originalContent.trim()) return;
    setIsGenerating(true);
    setVariations([]);
    setError(null);

    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalContent, platforms: selectedPlatforms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка сервера");
      setVariations(data.variations || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout title="Репурпозинг" subtitle="Один контент → адаптация под все платформы">
      <div className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* ─── Left: Input ──────────────────────────────────── */}
          <div className="xl:col-span-2 space-y-5">

            {/* Original content */}
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Repeat2 className="w-4 h-4 text-violet-400" />
                Исходный контент
              </h3>
              <textarea
                value={originalContent}
                onChange={(e) => setOriginalContent(e.target.value)}
                placeholder="Вставь сюда свой пост, сценарий, идею или любой текст — AI адаптирует его под каждую платформу..."
                rows={10}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-violet-500/40 transition-colors resize-none leading-relaxed"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                <span>{originalContent.length} символов</span>
                {originalContent.length > 0 && (
                  <button onClick={() => setOriginalContent("")} className="hover:text-red-400 transition-colors">
                    Очистить
                  </button>
                )}
              </div>
            </div>

            {/* Platform selector */}
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-white mb-4">Платформы</h3>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => {
                  const active = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left border transition-all text-xs font-medium ${
                        active ? "text-white" : "border-white/[0.06] text-slate-500 hover:text-slate-400"
                      }`}
                      style={active ? { borderColor: `${p.color}40`, backgroundColor: `${p.color}12` } : {}}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ color: p.color, backgroundColor: `${p.color}20` }}
                      >
                        {p.abbr}
                      </div>
                      {p.name}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-600 mt-3">
                Выбрано: {selectedPlatforms.length} из {PLATFORMS.length}
              </p>
            </div>

            {/* Generate button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={isGenerating || !originalContent.trim() || !selectedPlatforms.length}
              className="w-full py-4 rounded-2xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <RefreshCw className="w-5 h-5" />
                  </motion.div>
                  AI адаптирует контент...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Адаптировать под {selectedPlatforms.length} платформ
                </>
              )}
            </motion.button>
          </div>

          {/* ─── Right: Results ───────────────────────────────── */}
          <div className="xl:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Адаптации
                {variations.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-400 text-xs font-bold">
                    {variations.length}
                  </span>
                )}
              </h3>
              {variations.length > 0 && (
                <p className="text-xs text-slate-600">
                  Нажми на карточку чтобы развернуть
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Loading */}
            {isGenerating && (
              <div className="p-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-900/15 to-blue-900/10 flex flex-col items-center gap-5">
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-violet-500/15 flex items-center justify-center"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Repeat2 className="w-7 h-7 text-violet-400" />
                </motion.div>
                <div className="text-center">
                  <p className="text-white font-semibold mb-1">Claude адаптирует контент</p>
                  <p className="text-slate-500 text-sm">Создаю {selectedPlatforms.length} версий...</p>
                </div>
                <div className="flex gap-1.5">
                  {selectedPlatforms.map((id, i) => {
                    const p = PLATFORMS.find((pl) => pl.id === id);
                    return (
                      <motion.div
                        key={id}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                        style={{ color: p?.color, backgroundColor: `${p?.color}20` }}
                      >
                        {p?.abbr}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variations */}
            {!isGenerating && variations.length > 0 && (
              <div className="space-y-3">
                {variations.map((v, i) => (
                  <VariationCard key={i} v={v} index={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isGenerating && !error && variations.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[360px] text-center p-6 rounded-2xl border border-dashed border-white/[0.08]">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
                  <Repeat2 className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-500 font-medium mb-2">Один контент — до 8 адаптаций</p>
                <p className="text-slate-600 text-sm max-w-xs">
                  Вставь любой текст слева, выбери платформы и AI мгновенно создаст уникальные версии для каждой
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
