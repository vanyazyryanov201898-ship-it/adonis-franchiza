"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, RefreshCw, Copy, Check, Download,
  Trash2, AlertCircle, Zap, Flame, CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { useBgTask } from "@/lib/use-bg-task";
import DirectionLayout, { type Tab } from "@/components/factory/DirectionLayout";
import ContentPlanTab from "@/components/factory/ContentPlanTab";
import AutopostTab from "@/components/factory/AutopostTab";
import TrendsSelector, { type TrendItem } from "@/components/factory/TrendsSelector";
import { PLATFORMS } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// ─── Shared data ──────────────────────────────────────────────────────────────

const topics = [
  "Как я запустил студию за 14 дней",
  "Почему выбрал франшизу, а не с нуля",
  "Реальные цифры: мой первый месяц в АДОНИС",
  "Как окупить вложения за 4.5 месяца",
  "Как работает печать DTF и UV DTF",
  "Какой мерч сейчас берут корпораты",
  "Почему бизнес на мерче не умрёт никогда",
  "5 ниш где мерч нужен всегда",
  "Год назад я сидел в найме. Сегодня...",
  "Кейс Кирьяк и Мария — 16 млн за год",
  "Кейс: корпоративные подарки для банка",
  "Кейс Сергей Ставрополь — 10 млн с нуля",
];

const tones = ["Доверительный", "Экспертный", "Эмоциональный", "Провокационный", "Лёгкий"];

const contentGoals = [
  { id: "expert",    label: "Экспертный",  emoji: "🎓" },
  { id: "story",     label: "История",     emoji: "❤️" },
  { id: "case",      label: "Кейс",        emoji: "📊" },
  { id: "entertain", label: "Развлечение", emoji: "😄" },
  { id: "sell",      label: "Продающий",   emoji: "💰" },
];

type PostResult = {
  content: string;
  viralScore: number;
  viralAnalysis?: { positives: string[]; improvements: string[] };
  platform: string;
  topic: string;
};

// ─── Calendar helper ──────────────────────────────────────────────────────────

function addToCalendar(post: PostResult) {
  try {
    const STORAGE_KEY = "adonis_calendar_v1";
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const pid = PLATFORMS.find(p => p.label.toLowerCase() === post.platform.toLowerCase())?.id ?? "instagram";
    const newPost = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      directionId: "posts",
      platformId: pid,
      topic: post.topic,
      scheduledDate: format(new Date(), "yyyy-MM-dd"),
      scheduledTime: "19:00",
      viralScore: post.viralScore,
      status: "draft",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, newPost]));
    return true;
  } catch { return false; }
}

// ─── Script Tab ───────────────────────────────────────────────────────────────

function ScriptTab({ onPostGenerated }: { onPostGenerated: (r: PostResult) => void }) {
  const [topic, setTopic]         = useState("");
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [platform, setPlatform]   = useState("instagram");
  const [tone, setTone]           = useState("Доверительный");
  const [goal, setGoal]           = useState("expert");
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [copied, setCopied]       = useState(false);
  const [addedToCalendar, setAddedToCalendar] = useState(false);

  const { run, isRunning, isDone, result, error, clear } = useBgTask<PostResult>("posts-script");

  useEffect(() => {
    if (isDone && result) onPostGenerated(result);
  }, [isDone, result]);

  const activeTopic = topic.trim() || selectedTopic;
  const activePlatformLabel = PLATFORMS.find(p => p.id === platform)?.label ?? "Instagram";

  const generate = () => {
    setAddedToCalendar(false);
    const snap = { topic: activeTopic, platform: activePlatformLabel, tone, goal, trend: selectedTrend };
    run(`Пост · ${activePlatformLabel}`, async () => {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "post", topic: snap.topic, platform: snap.platform, tone: snap.tone, goal: snap.goal,
          ...(snap.trend ? { trendContext: snap.trend } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return { content: data.content, viralScore: data.viralScore, viralAnalysis: data.viralAnalysis, platform: snap.platform, topic: snap.topic } as PostResult;
    });
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    if (!result) return;
    const blob = new Blob([result.content], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `post_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const loading = isRunning;

  return (
    <div className="space-y-3">
      {/* Platform */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">1</div>
          <h3 className="text-sm font-semibold text-white">Платформа</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button key={p.id} onClick={() => setPlatform(p.id)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                platform === p.id ? "text-white border-transparent" : "bg-white/[0.03] text-slate-500 border-white/[0.06] hover:text-slate-300")}
              style={platform === p.id ? { backgroundColor: p.bgColor, borderColor: p.color + "60" } : {}}>
              <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black"
                style={platform === p.id ? { color: p.color } : { color: "#64748b" }}>
                {p.shortLabel}
              </span>
              {p.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Тема */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">2</div>
          <h3 className="text-sm font-semibold text-white">Тема</h3>
        </div>
        <input value={topic} onChange={(e) => setTopic(e.target.value)}
          placeholder="Своя тема или выбери из предложенных"
          className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500/40 transition-colors" />
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <button key={t} onClick={() => { setSelectedTopic(t); setTopic(""); }}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                selectedTopic === t && !topic ? "bg-emerald-600/80 text-white" : "bg-white/[0.04] text-slate-500 hover:text-slate-300 border border-white/[0.06]")}>
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Тон + Цель */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">3</div>
          <h3 className="text-sm font-semibold text-white">Тон и цель</h3>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Тон</p>
            <div className="flex flex-wrap gap-1.5">
              {tones.map((t) => (
                <button key={t} onClick={() => setTone(t)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs border transition-all",
                    tone === t ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-white/[0.06] text-slate-500 hover:text-slate-300")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Цель</p>
            <div className="flex flex-wrap gap-1.5">
              {contentGoals.map((g) => (
                <button key={g.id} onClick={() => setGoal(g.id)}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all",
                    goal === g.id ? "border-orange-500/40 bg-orange-500/10 text-white" : "border-white/[0.06] text-slate-500 hover:text-slate-300")}>
                  <span>{g.emoji}</span> {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Тренды */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <TrendsSelector selectedTrend={selectedTrend} onSelect={setSelectedTrend} accentColor="text-emerald-400" />
      </motion.div>

      {/* Кнопка */}
      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={generate} disabled={loading}
        className="w-full py-4 rounded-2xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
        {loading ? (
          <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw className="w-5 h-5" /></motion.div>Claude пишет пост...</>
        ) : (
          <><Sparkles className="w-5 h-5" />Написать пост · {activePlatformLabel}</>
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

        {result && !loading && (
          <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {/* Result card */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-semibold text-white">Пост</span>
                  <span className="text-xs font-bold text-emerald-400">Viral Score: {result.viralScore}/100</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={copy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-slate-400 hover:text-white transition-colors">
                    {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" />Скопировано</> : <><Copy className="w-3.5 h-3.5" />Копировать</>}
                  </button>
                  <button onClick={download}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-slate-400 hover:text-white transition-colors">
                    <Download className="w-3.5 h-3.5" />.txt
                  </button>
                  <button onClick={clear}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:text-red-300 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed">{result.content}</pre>
            </div>

            {/* Viral analysis */}
            {result.viralAnalysis && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Почему такой score?</p>
                {result.viralAnalysis.positives?.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-emerald-400">
                    <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /><span>{p}</span>
                  </div>
                ))}
                {result.viralAnalysis.improvements?.map((imp, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-400/80">
                    <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /><span>{imp}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Add to calendar */}
            <button
              onClick={() => { const ok = addToCalendar(result); if (ok) setAddedToCalendar(true); }}
              disabled={addedToCalendar}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-medium transition-all",
                addedToCalendar
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-white/[0.08] bg-white/[0.03] text-slate-300 hover:text-white hover:border-emerald-500/30 hover:bg-emerald-500/5"
              )}>
              {addedToCalendar ? <><Check className="w-4 h-4" />Добавлено в календарь</> : <><CalendarDays className="w-4 h-4" />Добавить в автопостинг-календарь</>}
            </button>

            <button onClick={generate}
              className="w-full py-3 rounded-2xl border border-white/[0.06] text-sm text-slate-400 hover:text-white hover:border-emerald-500/25 transition-all flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Написать ещё вариант
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Publish Tab ──────────────────────────────────────────────────────────────

function PublishTab({ lastPost }: { lastPost: PostResult | null }) {
  const [addedToCalendar, setAddedToCalendar] = useState(false);

  if (!lastPost) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[200px] gap-3 text-center">
        <Send className="w-10 h-10 text-slate-600" />
        <p className="text-slate-500 text-sm">Сначала сгенерируй пост на вкладке «Сценарий»</p>
      </div>
    );
  }

  const platform = PLATFORMS.find(p => p.label === lastPost.platform);

  return (
    <div className="p-6 space-y-4">
      {/* Post preview */}
      <div className="p-5 rounded-2xl border bg-white/[0.02]"
        style={{ borderColor: (platform?.color ?? "#10b981") + "40" }}>
        <div className="flex items-center gap-2 mb-3">
          {platform && (
            <span className="w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center"
              style={{ backgroundColor: platform.bgColor, color: platform.color }}>
              {platform.shortLabel}
            </span>
          )}
          <span className="text-sm font-semibold text-white">{lastPost.platform}</span>
          <span className="ml-auto text-xs text-emerald-400 font-medium">{lastPost.viralScore}/100</span>
        </div>
        <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans leading-relaxed line-clamp-6">
          {lastPost.content}
        </pre>
      </div>

      {/* Add to calendar */}
      <button
        onClick={() => { const ok = addToCalendar(lastPost); if (ok) setAddedToCalendar(true); }}
        disabled={addedToCalendar}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-medium transition-all",
          addedToCalendar
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-white/[0.08] btn-ai text-white hover:border-emerald-500/30"
        )}>
        {addedToCalendar ? <><Check className="w-4 h-4" />Добавлено!</> : <><CalendarDays className="w-4 h-4" />Добавить в календарь автопостинга</>}
      </button>
      {addedToCalendar && (
        <Link href="/autopost" className="flex items-center justify-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors">
          Открыть календарь →
        </Link>
      )}

      {/* API placeholder */}
      <div className="p-4 rounded-2xl border border-dashed border-white/[0.10] text-center space-y-2">
        <p className="text-xs text-slate-500 font-medium">Прямая публикация через API</p>
        <div className="flex flex-wrap gap-2 justify-center text-[10px] text-slate-600">
          <span className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.06]">Meta Graph API</span>
          <span className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.06]">TikTok API</span>
          <span className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.06]">VK API</span>
          <span className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.06]">Telegram Bot API</span>
        </div>
        <p className="text-[10px] text-slate-600">Добавь API ключи в .env.local для прямой публикации</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PostsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("script");
  const [lastPost, setLastPost]   = useState<PostResult | null>(null);

  return (
    <DirectionLayout
      title="Посты"
      subtitle="Генерация постов под любую платформу · Публикация в календарь"
      accentColor="text-emerald-400"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      createTabLabel="Опубликовать"
      createTabIcon={Send}
    >
      {activeTab === "script"   && <ScriptTab onPostGenerated={setLastPost} />}
      {activeTab === "plan"     && <ContentPlanTab directionLabel="Посты" directionId="posts" />}
      {activeTab === "create"   && <PublishTab lastPost={lastPost} />}
      {activeTab === "autopost" && <AutopostTab directionId="posts" directionLabel="Посты" />}
    </DirectionLayout>
  );
}
