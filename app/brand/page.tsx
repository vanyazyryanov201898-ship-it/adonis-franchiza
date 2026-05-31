"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Upload, Type, Target, Users, Sparkles,
  Check, Plus, X, Save, Image, RefreshCw, Zap,
  MessageSquare, Star, Shield, Flame, Heart, Copy, Download, Trash2,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

// ─── Constants ─────────────────────────────────────────────────
const defaultColors = [
  { hex: "#8b5cf6", name: "Основной" },
  { hex: "#3b82f6", name: "Акцент" },
  { hex: "#10b981", name: "Успех" },
  { hex: "#f59e0b", name: "Золото" },
];

const voiceStyles = [
  { id: "expert",    label: "Экспертный",    desc: "Авторитетно, факты, аргументы",         icon: Shield, color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-500/30",   example: "«По нашим данным, 87% партнёров выходят в прибыль за 4 месяца»" },
  { id: "inspiring", label: "Вдохновляющий", desc: "Мотивация, история, результат",          icon: Flame,  color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-500/30", example: "«Твой бизнес начинается с решения. Сегодня — лучший день»" },
  { id: "friendly",  label: "Дружелюбный",   desc: "Неформально, близко, по-человечески",   icon: Heart,  color: "text-pink-400",   bg: "bg-pink-400/10",   border: "border-pink-500/30",   example: "«Слушай, мы разобрали это с нуля — смотри, как всё просто»" },
  { id: "premium",   label: "Премиальный",   desc: "Статусно, уверенно, без лишних слов",   icon: Star,   color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-500/30",  example: "«ADONIS — производство мирового уровня. Ваш бизнес. Ваши правила»" },
];

const audienceSegments = [
  { id: "employee",    label: "Сотрудники в найме",         desc: "25–40 лет, хотят свой бизнес",             active: true },
  { id: "entrepreneur",label: "Начинающие предприниматели", desc: "20–35 лет, ищут нишу",                     active: true },
  { id: "investor",    label: "Инвесторы / партнёры",       desc: "30–50 лет, ищут вложения",                 active: false },
  { id: "franchise",   label: "Покупатели франшиз",         desc: "28–45 лет, сравнивают предложения",        active: true },
];

const logoSlots = [
  { id: "main",        label: "Основной логотип",   desc: "Для светлых фонов",   hint: "SVG / PNG / WEBP" },
  { id: "dark",        label: "На тёмном фоне",     desc: "Монохром / инверсия", hint: "SVG / PNG" },
  { id: "icon",        label: "Иконка 1:1",         desc: "Фавикон и аватарки",  hint: "PNG / ICO" },
  { id: "transparent", label: "Прозрачный PNG",     desc: "Для наложений",       hint: "PNG с альфа" },
];

const defaultMessages = [
  "Производство полного цикла от 500 изделий",
  "Партнёрство с гарантированной поддержкой",
  "ROI от 340% в первый год",
];

const STORAGE_KEY = "adonis_brand_settings";

// ─── Component ─────────────────────────────────────────────────
export default function BrandPage() {
  // Brand identity
  const [brandName, setBrandName]     = useState("ADONIS");
  const [tagline, setTagline]         = useState("Производство. Партнёрство. Результат.");
  const [messages, setMessages]       = useState(defaultMessages);
  const [newMessage, setNewMessage]   = useState("");

  // Colors
  const [colors, setColors]           = useState(defaultColors);
  const [newColor, setNewColor]       = useState("#8b5cf6");
  const [showAddColor, setShowAddColor] = useState(false);
  const [editingColorIdx, setEditingColorIdx] = useState<number | null>(null);
  const [editingColorName, setEditingColorName] = useState("");

  // Voice & audience
  const [selectedVoice, setSelectedVoice] = useState("inspiring");
  const [segments, setSegments]           = useState(audienceSegments);

  // Logos — store both the "uploaded" flag and the data URL for preview
  const [logoImages, setLogoImages]       = useState<Record<string, string>>({});
  const fileInputRef                      = useRef<HTMLInputElement>(null);
  const [pendingSlot, setPendingSlot]     = useState<string | null>(null);

  // UI state
  const [isSaving, setIsSaving]   = useState(false);
  const [saved, setSaved]         = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  // AI Voice Analysis
  const [voiceSamples, setVoiceSamples] = useState(["", "", ""]);
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const [voiceProfile, setVoiceProfile] = useState<{
    tone: string; vocabulary: string; keyPhrases: string[];
    emotionalTriggers: string[]; doUse: string[]; avoid: string[]; summary: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem("adonis_voice_profile");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // ── Load from localStorage on mount ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.brandName)     setBrandName(data.brandName);
      if (data.tagline)       setTagline(data.tagline);
      if (data.messages)      setMessages(data.messages);
      if (data.colors)        setColors(data.colors);
      if (data.selectedVoice) setSelectedVoice(data.selectedVoice);
      if (data.segments)      setSegments(data.segments);
      if (data.logoImages)    setLogoImages(data.logoImages);
    } catch {}
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // ── Save to localStorage ──
  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        brandName, tagline, messages, colors, selectedVoice, segments, logoImages,
      }));
    } catch {}
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  // ── Colors ──
  const addColor = () => {
    if (colors.length < 6) {
      setColors([...colors, { hex: newColor, name: `Цвет ${colors.length + 1}` }]);
      setShowAddColor(false);
    }
  };

  const removeColor = (i: number) => {
    if (colors.length > 1) setColors(colors.filter((_, j) => j !== i));
  };

  const startEditColorName = (i: number) => {
    setEditingColorIdx(i);
    setEditingColorName(colors[i].name);
  };

  const finishEditColorName = () => {
    if (editingColorIdx !== null) {
      setColors(colors.map((c, i) => i === editingColorIdx ? { ...c, name: editingColorName || c.name } : c));
    }
    setEditingColorIdx(null);
  };

  // ── Audience ──
  const toggleSegment = (id: string) =>
    setSegments(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));

  // ── Messages ──
  const addMessage = () => {
    if (newMessage.trim() && messages.length < 5) {
      setMessages([...messages, newMessage.trim()]);
      setNewMessage("");
    }
  };

  // ── Logo upload — real file picker ──
  const handleLogoUpload = (slotId: string) => {
    setPendingSlot(slotId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingSlot) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoImages(prev => ({ ...prev, [pendingSlot]: dataUrl }));
      showToast(`Логотип «${logoSlots.find(s => s.id === pendingSlot)?.label}» загружен!`);
    };
    reader.readAsDataURL(file);
    // reset input so same file can be re-selected
    e.target.value = "";
    setPendingSlot(null);
  };

  const removeLogo = (slotId: string) => {
    setLogoImages(prev => { const n = { ...prev }; delete n[slotId]; return n; });
  };

  // ── Copy AI prompt ──
  const builtPrompt = `Ты создаёшь контент для бренда ${brandName}. Слоган: «${tagline}». Голос: ${voiceStyles.find(v => v.id === selectedVoice)?.label}. Аудитория: ${segments.filter(s => s.active).map(s => s.label).join(", ")}. Ключевые сообщения: ${messages.join("; ")}. Цвета бренда: ${colors.map(c => c.hex).join(", ")}. Всегда делай CTA к франшизе ADONIS.`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt || builtPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // ── Generate enhanced prompt via Claude ──
  const generateWithClaude = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "description",
          topic: `Бренд ${brandName}: ${tagline}. Голос: ${voiceStyles.find(v => v.id === selectedVoice)?.label}. Аудитория: ${segments.filter(s => s.active).map(s => s.label).join(", ")}.`,
          platform: "Universal",
          tone: voiceStyles.find(v => v.id === selectedVoice)?.label || "Доверительный",
        }),
      });
      const data = await res.json();
      if (data.content) {
        setGeneratedPrompt(data.content);
        showToast("AI промпт сгенерирован!");
      }
    } catch {
      showToast("Ошибка генерации промпта");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── AI Voice Analysis ──
  const analyzeVoice = async () => {
    const nonEmpty = voiceSamples.filter(Boolean);
    if (nonEmpty.length < 1) return;
    setIsAnalyzingVoice(true);
    try {
      const res = await fetch("/api/brand-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ samples: nonEmpty }),
      });
      const data = await res.json();
      if (data.profile) {
        setVoiceProfile(data.profile);
        try { localStorage.setItem("adonis_voice_profile", JSON.stringify(data.profile)); } catch {}
        showToast("Голос бренда проанализирован!");
      }
    } catch {
      showToast("Ошибка анализа");
    } finally {
      setIsAnalyzingVoice(false);
    }
  };

  // ── Export brand kit ──
  const exportBrandKit = () => {
    const kit = {
      brandName, tagline, messages, colors, voice: selectedVoice,
      audience: segments.filter(s => s.active).map(s => s.label),
      prompt: generatedPrompt || builtPrompt,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(kit, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${brandName.toLowerCase()}_brand_kit.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("Бренд-кит скачан!");
  };

  const activeVoice = voiceStyles.find(v => v.id === selectedVoice)!;

  return (
    <AppLayout title="Бренд" subtitle="Настройки айдентики, голоса и стратегии ADONIS">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.svg"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="p-6 space-y-6">

        {/* Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-sm text-emerald-300 shadow-lg"
            >
              <Check className="w-4 h-4" />
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Banner */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/10"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 font-medium">Настройки бренда сохранены! AI будет использовать их при генерации контента.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top action bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Настройки бренда</h2>
            <p className="text-xs text-slate-500 mt-0.5">Изменения сохраняются локально и применяются в AI генераторе</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportBrandKit}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs text-slate-400 hover:text-white hover:border-violet-500/30 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Экспорт
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl btn-ai text-sm font-semibold text-white disabled:opacity-70"
            >
              {isSaving ? <><RefreshCw className="w-4 h-4 animate-spin" />Сохранение...</> : <><Save className="w-4 h-4" />Сохранить</>}
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── Left column ─────────────────────────────────── */}
          <div className="xl:col-span-2 space-y-5">

            {/* Brand Identity */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-5">
                <Type className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">Айдентика бренда</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Название бренда</label>
                  <input
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:border-violet-500/40 transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Слоган / Tagline</label>
                  <input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:border-violet-500/40 transition-all"
                  />
                </div>
              </div>

              {/* Key Messages */}
              <div className="mt-4">
                <label className="text-xs text-slate-500 mb-2 block">Ключевые сообщения (до 5)</label>
                <div className="space-y-2 mb-2">
                  {messages.map((msg, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <div className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-violet-400">{i + 1}</span>
                      </div>
                      <span className="text-xs text-slate-300 flex-1">{msg}</span>
                      <button onClick={() => setMessages(messages.filter((_, j) => j !== i))} className="text-slate-600 hover:text-red-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                {messages.length < 5 && (
                  <div className="flex gap-2">
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addMessage()}
                      placeholder="Добавьте ключевое сообщение..."
                      className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-600 outline-none focus:border-violet-500/40 transition-all"
                    />
                    <button onClick={addMessage} className="px-3 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 hover:bg-violet-500/30 transition-all">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Color Palette */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-5">
                <Palette className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-semibold text-white">Цветовая палитра</h3>
                <span className="text-[10px] text-slate-500 ml-auto">{colors.length}/6 цветов</span>
              </div>

              <div className="flex flex-wrap gap-4">
                {colors.map((color, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-1.5 group relative"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl border-2 border-white/10 cursor-pointer hover:scale-105 transition-transform shadow-lg relative"
                      style={{ backgroundColor: color.hex, boxShadow: `0 4px 20px ${color.hex}40` }}
                    >
                      <button
                        onClick={() => removeColor(i)}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#09091a] border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-2.5 h-2.5 text-slate-400" />
                      </button>
                    </div>

                    {/* Editable color name */}
                    {editingColorIdx === i ? (
                      <input
                        autoFocus
                        value={editingColorName}
                        onChange={(e) => setEditingColorName(e.target.value)}
                        onBlur={finishEditColorName}
                        onKeyDown={(e) => e.key === "Enter" && finishEditColorName()}
                        className="w-16 text-center text-[10px] bg-white/[0.08] border border-violet-500/40 rounded-md px-1 py-0.5 text-white outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => startEditColorName(i)}
                        className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                        title="Кликни чтобы переименовать"
                      >
                        {color.name}
                      </button>
                    )}
                    <span className="text-[9px] text-slate-600 font-mono">{color.hex}</span>
                  </motion.div>
                ))}

                {/* Add Color */}
                {colors.length < 6 && (
                  <div className="flex flex-col items-center gap-1.5">
                    <AnimatePresence>
                      {showAddColor ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <input
                            type="color"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            className="w-14 h-14 rounded-2xl cursor-pointer border-0 bg-transparent"
                          />
                          <div className="flex gap-1">
                            <button onClick={addColor} className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] hover:bg-emerald-500/30 transition-all">OK</button>
                            <button onClick={() => setShowAddColor(false)} className="px-2 py-1 rounded-lg bg-white/[0.04] text-slate-500 text-[10px] hover:bg-white/[0.08] transition-all">×</button>
                          </div>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => setShowAddColor(true)}
                          className="w-14 h-14 rounded-2xl border-2 border-dashed border-white/[0.12] flex items-center justify-center text-slate-600 hover:text-slate-400 hover:border-white/[0.2] transition-all"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </AnimatePresence>
                    {!showAddColor && <span className="text-[10px] text-slate-600">Добавить</span>}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-600 mt-3">Кликни на название цвета чтобы переименовать</p>
            </div>

            {/* Tone of Voice */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-5">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Голос бренда (Tone of Voice)</h3>
                <span className="text-[10px] text-slate-500 ml-auto">AI использует при генерации</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {voiceStyles.map((style) => {
                  const Icon = style.icon;
                  const isSelected = selectedVoice === style.id;
                  return (
                    <motion.button
                      key={style.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedVoice(style.id)}
                      className={`p-4 rounded-xl text-left border transition-all ${isSelected ? `${style.border} ${style.bg}` : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? style.bg : "bg-white/[0.04]"}`}>
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? style.color : "text-slate-500"}`} />
                        </div>
                        <span className={`text-sm font-semibold ${isSelected ? "text-white" : "text-slate-400"}`}>{style.label}</span>
                        {isSelected && <Check className={`w-3.5 h-3.5 ${style.color} ml-auto`} />}
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">{style.desc}</p>
                      <p className={`text-[11px] italic ${isSelected ? "text-slate-300" : "text-slate-600"}`}>{style.example}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right column ────────────────────────────────── */}
          <div className="space-y-5">

            {/* Logos */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-5">
                <Image className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Логотипы</h3>
              </div>
              <div className="space-y-3">
                {logoSlots.map((slot) => {
                  const imgSrc = logoImages[slot.id];
                  return (
                    <div key={slot.id}>
                      {imgSrc ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05]">
                          {/* Image preview */}
                          <div className="w-12 h-12 rounded-xl border border-emerald-500/30 overflow-hidden flex items-center justify-center bg-white/[0.05] flex-shrink-0">
                            <img src={imgSrc} alt={slot.label} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-white">{slot.label}</div>
                            <div className="text-[10px] text-emerald-400/70">Загружен ✓</div>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => handleLogoUpload(slot.id)}
                              className="text-slate-500 hover:text-violet-400 transition-colors p-1"
                              title="Заменить"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeLogo(slot.id)}
                              className="text-slate-500 hover:text-red-400 transition-colors p-1"
                              title="Удалить"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleLogoUpload(slot.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/[0.08] hover:border-violet-500/25 hover:bg-white/[0.02] transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center group-hover:border-violet-500/20 transition-all">
                            <Upload className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
                          </div>
                          <div className="text-left flex-1">
                            <div className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">{slot.label}</div>
                            <div className="text-[10px] text-slate-600">{slot.hint}</div>
                          </div>
                          <Plus className="w-3.5 h-3.5 text-slate-700 group-hover:text-violet-400 transition-colors" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Target Audience */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-5">
                <Target className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-white">Целевая аудитория</h3>
                <span className="text-[10px] text-slate-500 ml-auto">{segments.filter(s => s.active).length} активных</span>
              </div>
              <div className="space-y-2">
                {segments.map((seg) => (
                  <button
                    key={seg.id}
                    onClick={() => toggleSegment(seg.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border transition-all ${seg.active ? "border-violet-500/25 bg-violet-500/[0.06]" : "border-white/[0.05] bg-white/[0.02] opacity-60 hover:opacity-80"}`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${seg.active ? "bg-violet-500 border-violet-500" : "border-white/20 bg-transparent"}`}>
                      {seg.active && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">{seg.label}</div>
                      <div className="text-[10px] text-slate-500">{seg.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Brand Prompt */}
            <div className="p-5 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-900/15 to-blue-900/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">AI Промпт бренда</h3>
                <div className="ml-auto flex gap-1.5">
                  <button
                    onClick={copyPrompt}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.06] text-[11px] text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedPrompt ? <><Check className="w-3 h-3 text-emerald-400" />Скопировано</> : <><Copy className="w-3 h-3" />Копировать</>}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] font-mono text-[10px] text-slate-400 leading-relaxed mb-3 min-h-[80px]">
                {generatedPrompt || builtPrompt}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={generateWithClaude}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl btn-ai text-xs font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isGenerating ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Claude генерирует...</>
                ) : (
                  <><Zap className="w-3.5 h-3.5" />Улучшить промпт через Claude</>
                )}
              </motion.button>

              <div className="flex items-center gap-1.5 mt-3 text-[11px] text-violet-400">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Применяется автоматически при генерации контента
              </div>
            </div>

            {/* Color Preview */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Предпросмотр бренда</h3>
              </div>
              <div
                className="rounded-xl p-4 text-white"
                style={{ background: `linear-gradient(135deg, ${colors[0]?.hex || "#8b5cf6"} 0%, ${colors[1]?.hex || "#3b82f6"} 100%)` }}
              >
                <div className="text-lg font-bold mb-0.5">{brandName}</div>
                <div className="text-sm opacity-80">{tagline}</div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                    {activeVoice.label}
                  </div>
                  <div className="text-xs opacity-70">{segments.filter(s => s.active).length} сегментов</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ─── AI Голос бренда ───────────────────────────────────── */}
        <div className="mt-6 p-6 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-900/10 to-violet-900/10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Голос бренда</h3>
              <p className="text-xs text-slate-500 mt-0.5">Вставь 1-3 лучших поста — AI изучит твой стиль и будет писать так же</p>
            </div>
            {voiceProfile && (
              <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">Профиль активен</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {voiceSamples.map((sample, i) => (
              <textarea
                key={i}
                value={sample}
                onChange={(e) => setVoiceSamples((prev) => prev.map((s, j) => j === i ? e.target.value : s))}
                placeholder={`Пример ${i + 1}: вставь один из своих лучших постов...`}
                rows={5}
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500/40 transition-colors resize-none leading-relaxed"
              />
            ))}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={analyzeVoice}
              disabled={isAnalyzingVoice || !voiceSamples.some(Boolean)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-ai text-sm text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isAnalyzingVoice ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Анализирую стиль...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Проанализировать голос</>
              )}
            </motion.button>
            {voiceProfile && (
              <button
                onClick={() => { setVoiceProfile(null); try { localStorage.removeItem("adonis_voice_profile"); } catch {} }}
                className="text-xs text-slate-600 hover:text-red-400 transition-colors"
              >
                Сбросить профиль
              </button>
            )}
          </div>

          {/* Voice Profile Result */}
          {voiceProfile && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Тон</p>
                <p className="text-sm text-white">{voiceProfile.tone}</p>
                <p className="text-xs text-slate-500 mt-1">{voiceProfile.vocabulary}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Ключевые фразы</p>
                <div className="flex flex-wrap gap-1.5">
                  {voiceProfile.keyPhrases?.map((p, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-violet-500/15 text-violet-300 text-[11px]">{p}</span>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Триггеры</p>
                <div className="flex flex-wrap gap-1.5">
                  {voiceProfile.emotionalTriggers?.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-300 text-[11px]">{t}</span>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500 mb-2">Использовать</p>
                <ul className="space-y-1">
                  {voiceProfile.doUse?.map((d, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-red-500 mb-2">Избегать</p>
                <ul className="space-y-1">
                  {voiceProfile.avoid?.map((a, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <X className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 md:col-span-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500 mb-2">Инструкция для AI</p>
                <p className="text-xs text-slate-300 leading-relaxed">{voiceProfile.summary}</p>
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
