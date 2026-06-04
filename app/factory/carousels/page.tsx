"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, Sparkles, RefreshCw, Copy, Check, Download,
  Trash2, AlertCircle, Zap, Flame, ChevronLeft, ChevronRight,
  CalendarDays, X,
} from "lucide-react";
import Link from "next/link";
import { useBgTask } from "@/lib/use-bg-task";
import DirectionLayout, { type Tab } from "@/components/factory/DirectionLayout";
import ContentPlanTab from "@/components/factory/ContentPlanTab";
import AutopostTab from "@/components/factory/AutopostTab";
import ApiKeyPlaceholder from "@/components/factory/ApiKeyPlaceholder";
import TrendsSelector, { type TrendItem } from "@/components/factory/TrendsSelector";
import { PLATFORMS } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pickImages } from "@/lib/carousel-images";

// ─── Types ────────────────────────────────────────────────────────────────────

type CarouselSlide = { n: number; heading: string; text: string };
type CarouselData = {
  cover: string; subtitle: string;
  slides: CarouselSlide[];
  hashtags: string; caption: string;
};

type CarouselResult = {
  data: CarouselData;
  viralScore: number;
  viralAnalysis?: { positives: string[]; improvements: string[] };
  platform: string;
  topic: string;
  slideImages: string[];
};

// ─── Shared data ──────────────────────────────────────────────────────────────

const topics = [
  "5 причин открыть бизнес на мерче прямо сейчас",
  "Как партнёр АДОНИС заработал 16 млн за год",
  "Рынок мерча в России 2024: цифры и тренды",
  "DTF vs шелкотрафарет: что выбрать",
  "Как открыть студию брендирования за 14 дней",
  "Топ-5 ниш где мерч нужен всегда",
  "Франшиза vs бизнес с нуля: честное сравнение",
  "Как окупается студия мерча: реальные цифры",
  "История АДОНИС: от Казани до 100 городов",
  "Топ-7 ошибок новичков в бизнесе на мерче",
];

const contentGoals = [
  { id: "expert",    label: "Экспертный",  emoji: "🎓" },
  { id: "story",     label: "История",     emoji: "❤️" },
  { id: "case",      label: "Кейс",        emoji: "📊" },
  { id: "entertain", label: "Развлечение", emoji: "😄" },
  { id: "sell",      label: "Продающий",   emoji: "💰" },
];

const CAROUSEL_PLATFORMS = ["instagram", "tiktok", "vk"];

// ─── Calendar helper ──────────────────────────────────────────────────────────

function addToCalendar(r: CarouselResult) {
  try {
    const STORAGE_KEY = "adonis_calendar_v1";
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const pid = PLATFORMS.find(p => p.label === r.platform)?.id ?? "instagram";
    existing.push({
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      directionId: "carousels", platformId: pid, topic: r.topic,
      scheduledDate: format(new Date(), "yyyy-MM-dd"),
      scheduledTime: "18:00", viralScore: r.viralScore, status: "draft",
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch { return false; }
}

// ─── Carousel Preview ─────────────────────────────────────────────────────────

function CarouselPreview({
  result,
  onClear,
  showExport = false,
}: {
  result: CarouselResult;
  onClear?: () => void;
  showExport?: boolean;
}) {
  const [slide, setSlide]         = useState(0);
  const [bgUrl, setBgUrl]         = useState("");
  const [copiedId, setCopiedId]   = useState<string | null>(null);
  const [addedToCalendar, setAddedToCalendar] = useState(false);

  const { data, viralScore, viralAnalysis, slideImages } = result;
  const totalSlides = data.slides.length + 1;
  const bgPhoto = bgUrl || slideImages[slide] || slideImages[0] || "";
  const isCover = slide === 0;
  const currentSlide = isCover ? null : data.slides[slide - 1];

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `carousel_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadTxt = () => {
    const lines = [
      `Обложка: ${data.cover}`, `Подзаголовок: ${data.subtitle}`, "",
      ...data.slides.map(s => `Слайд ${s.n}:\n${s.heading}\n${s.text}`),
      "", `Caption: ${data.caption}`, `Хэштеги: ${data.hashtags}`,
    ];
    const blob = new Blob([lines.join("\n\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `carousel_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-white">Карусель</span>
          <span className="text-xs font-bold text-emerald-400">Viral Score: {viralScore}/100</span>
        </div>
        {onClear && (
          <button onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:text-red-300 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Очистить
          </button>
        )}
      </div>

      {/* BG URL */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <span className="text-[11px] text-slate-500 flex-shrink-0">Фон слайдов:</span>
        <input type="text" value={bgUrl} onChange={(e) => setBgUrl(e.target.value)}
          placeholder="URL фото или оставь пустым (авто)"
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 outline-none" />
        {bgUrl && <button onClick={() => setBgUrl("")} className="text-slate-600 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>}
      </div>

      {/* Slide viewer */}
      <div className="max-w-sm mx-auto">
        <div className="relative rounded-2xl overflow-hidden aspect-square">
          {bgPhoto && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgPhoto})` }} />}
          <div className="absolute inset-0" style={{
            background: bgPhoto
              ? "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.75) 100%)"
              : "linear-gradient(135deg, #4c1d95 0%, #1e3a8a 100%)"
          }} />
          <div className="relative z-10 h-full flex flex-col justify-between p-7">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">ADONIS</span>
              <span className="text-[10px] text-white/50">{slide + 1} / {totalSlides}</span>
            </div>
            <div className={isCover ? "text-center" : ""}>
              {isCover ? (
                <>
                  <h2 className="text-2xl font-black text-white leading-tight mb-3 drop-shadow-lg">{data.cover}</h2>
                  <p className="text-sm text-white/80">{data.subtitle}</p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-black text-white leading-tight mb-3 drop-shadow-md">{currentSlide?.heading}</h3>
                  <p className="text-sm text-white/85 leading-relaxed">{currentSlide?.text}</p>
                </>
              )}
            </div>
            <div className={`flex gap-1 ${isCover ? "justify-center" : ""}`}>
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button key={i} onClick={() => setSlide(i)}
                  className={`h-1 rounded-full transition-all ${i === slide ? "w-6 bg-white" : "w-1.5 bg-white/30"}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0}
            className="p-2 rounded-xl bg-white/[0.06] text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-500">Слайд {slide + 1} из {totalSlides}</span>
          <button onClick={() => setSlide(s => Math.min(totalSlides - 1, s + 1))} disabled={slide === totalSlides - 1}
            className="p-2 rounded-xl bg-white/[0.06] text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Caption + hashtags */}
      <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Caption</p>
          <p className="text-sm text-slate-300 leading-relaxed">{data.caption}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Хэштеги</p>
          <p className="text-xs text-violet-400">{data.hashtags}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => copy(`${data.caption}\n\n${data.hashtags}`, "cap")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-slate-400 hover:text-white transition-colors">
            {copiedId === "cap" ? <><Check className="w-3.5 h-3.5 text-emerald-400" />Скопировано</> : <><Copy className="w-3.5 h-3.5" />Caption + хэштеги</>}
          </button>
          <button onClick={() => copy([`Обложка: ${data.cover}`, `${data.subtitle}`, ...data.slides.map(s => `Слайд ${s.n}: ${s.heading}\n${s.text}`)].join("\n\n"), "all")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-slate-400 hover:text-white transition-colors">
            {copiedId === "all" ? <><Check className="w-3.5 h-3.5 text-emerald-400" />Скопировано</> : <><Copy className="w-3.5 h-3.5" />Все слайды</>}
          </button>
          {showExport && (
            <>
              <button onClick={downloadJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-slate-400 hover:text-white transition-colors">
                <Download className="w-3.5 h-3.5" />.json
              </button>
              <button onClick={downloadTxt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-slate-400 hover:text-white transition-colors">
                <Download className="w-3.5 h-3.5" />.txt
              </button>
            </>
          )}
        </div>
      </div>

      {/* Viral analysis */}
      {viralAnalysis && (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Почему такой score?</p>
          {viralAnalysis.positives?.map((p, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-emerald-400">
              <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /><span>{p}</span>
            </div>
          ))}
          {viralAnalysis.improvements?.map((imp, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-amber-400/80">
              <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /><span>{imp}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add to calendar */}
      {showExport && (
        <button
          onClick={() => { addToCalendar(result); setAddedToCalendar(true); }}
          disabled={addedToCalendar}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-medium transition-all",
            addedToCalendar
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-white/[0.08] bg-white/[0.03] text-slate-300 hover:text-white hover:border-orange-500/30"
          )}>
          {addedToCalendar ? <><Check className="w-4 h-4" />Добавлено в календарь</> : <><CalendarDays className="w-4 h-4" />Добавить в автопостинг-календарь</>}
        </button>
      )}
    </div>
  );
}

// ─── Script Tab ───────────────────────────────────────────────────────────────

function ScriptTab({ onGenerated }: { onGenerated: (r: CarouselResult) => void }) {
  const [topic, setTopic]           = useState("");
  const [selectedTopic, setSelected]= useState(topics[0]);
  const [platform, setPlatform]     = useState("instagram");
  const [goal, setGoal]             = useState("expert");
  const [selectedTrend, setTrend]   = useState<TrendItem | null>(null);

  const { run, isRunning, isDone, result, error, clear } = useBgTask<CarouselResult>("carousels-script");

  useEffect(() => {
    if (isDone && result) onGenerated(result);
  }, [isDone, result]);

  const activeTopic = topic.trim() || selectedTopic;
  const platformLabel = PLATFORMS.find(p => p.id === platform)?.label ?? "Instagram";
  const loading = isRunning;

  const generate = () => {
    const snap = { topic: activeTopic, platform: platformLabel, goal };
    run(`Карусель · ${platformLabel}`, async () => {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "carousel", topic: snap.topic, platform: snap.platform, tone: "Доверительный", goal: snap.goal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      if (!data.carouselData) throw new Error("Не получили данные карусели");
      const imgs = pickImages(data.carouselData.slides.length + 1);
      return { data: data.carouselData, viralScore: data.viralScore, viralAnalysis: data.viralAnalysis, platform: snap.platform, topic: snap.topic, slideImages: imgs } as CarouselResult;
    });
  };

  return (
    <div className="space-y-3">
      {/* Platform */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xs font-bold text-orange-400">1</div>
          <h3 className="text-sm font-semibold text-white">Платформа</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {CAROUSEL_PLATFORMS.map((pid) => {
            const p = PLATFORMS.find(pl => pl.id === pid)!;
            return (
              <button key={pid} onClick={() => setPlatform(pid)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                  platform === pid ? "text-white border-transparent" : "bg-white/[0.03] text-slate-500 border-white/[0.06] hover:text-slate-300")}
                style={platform === pid ? { backgroundColor: p.bgColor, borderColor: p.color + "60" } : {}}>
                <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black"
                  style={platform === pid ? { color: p.color } : { color: "#64748b" }}>{p.shortLabel}</span>
                {p.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Тема */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xs font-bold text-orange-400">2</div>
          <h3 className="text-sm font-semibold text-white">Тема</h3>
        </div>
        <input value={topic} onChange={(e) => setTopic(e.target.value)}
          placeholder="Своя тема или выбери из предложенных"
          className="w-full mb-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-slate-600 outline-none focus:border-orange-500/40 transition-colors" />
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <button key={t} onClick={() => { setSelected(t); setTopic(""); }}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                selectedTopic === t && !topic ? "bg-orange-600/80 text-white" : "bg-white/[0.04] text-slate-500 hover:text-slate-300 border border-white/[0.06]")}>
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Цель */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xs font-bold text-orange-400">3</div>
          <h3 className="text-sm font-semibold text-white">Цель карусели</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {contentGoals.map((g) => (
            <button key={g.id} onClick={() => setGoal(g.id)}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all",
                goal === g.id ? "border-orange-500/40 bg-orange-500/10 text-white" : "border-white/[0.06] text-slate-500 hover:text-slate-300")}>
              <span>{g.emoji}</span> {g.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Тренды */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <TrendsSelector selectedTrend={selectedTrend} onSelect={setTrend} accentColor="text-orange-400" />
      </motion.div>

      {/* Кнопка */}
      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={generate} disabled={loading}
        className="w-full py-4 rounded-2xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
        {loading ? (
          <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><RefreshCw className="w-5 h-5" /></motion.div>Claude создаёт карусель...</>
        ) : (
          <><LayoutGrid className="w-5 h-5" />Создать карусель · {platformLabel}</>
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
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-8 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-900/15 to-pink-900/10 flex flex-col items-center gap-5 min-h-[180px] justify-center">
            <motion.div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-600/30 to-pink-600/30 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <LayoutGrid className="w-7 h-7 text-orange-400" />
            </motion.div>
            <div className="text-center">
              <p className="text-white font-semibold mb-1">Создаю карусель</p>
              <p className="text-slate-500 text-sm">Структурирую слайды · Пишу тексты · Подбираю хуки</p>
            </div>
          </motion.div>
        )}
        {result && !loading && (
          <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <CarouselPreview result={result} onClear={clear} />
            <button onClick={generate}
              className="w-full py-3 mt-3 rounded-2xl border border-white/[0.06] text-sm text-slate-400 hover:text-white hover:border-orange-500/25 transition-all flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Сгенерировать ещё вариант
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Export Tab ───────────────────────────────────────────────────────────────

function ExportTab({ lastResult }: { lastResult: CarouselResult | null }) {
  if (!lastResult) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[200px] gap-3 text-center">
        <LayoutGrid className="w-10 h-10 text-slate-600" />
        <p className="text-slate-500 text-sm">Сначала создай карусель на вкладке «Сценарий»</p>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-4">
      <CarouselPreview result={lastResult} showExport />
      <ApiKeyPlaceholder
        serviceName="Instagram Graph API"
        description="Для прямой публикации карусели в Instagram нужен API ключ Meta. Планируй через календарь автопостинга."
        envKey="META_ACCESS_TOKEN"
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CarouselsPage() {
  const [activeTab, setActiveTab]     = useState<Tab>("script");
  const [lastResult, setLastResult]   = useState<CarouselResult | null>(null);

  return (
    <DirectionLayout
      title="Карусели"
      subtitle="Генерация Instagram каруселей · Превью слайдов · Экспорт"
      accentColor="text-orange-400"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      createTabLabel="Превью & экспорт"
      createTabIcon={LayoutGrid}
    >
      {activeTab === "script"   && <ScriptTab onGenerated={setLastResult} />}
      {activeTab === "plan"     && <ContentPlanTab directionLabel="Карусели" directionId="carousels" />}
      {activeTab === "create"   && <ExportTab lastResult={lastResult} />}
      {activeTab === "autopost" && <AutopostTab directionId="carousels" directionLabel="Карусели" />}
    </DirectionLayout>
  );
}
