"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Upload, Type, Target, Users, Sparkles,
  Check, Plus, X, Save, Image, RefreshCw, Zap,
  MessageSquare, Star, Shield, Flame, Heart,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const defaultColors = [
  { hex: "#8b5cf6", name: "Основной" },
  { hex: "#3b82f6", name: "Акцент" },
  { hex: "#10b981", name: "Успех" },
  { hex: "#f59e0b", name: "Золото" },
];

const voiceStyles = [
  {
    id: "expert",
    label: "Экспертный",
    desc: "Авторитетно, факты, аргументы",
    icon: Shield,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-500/30",
    example: "«По нашим данным, 87% партнёров выходят в прибыль за 4 месяца»",
  },
  {
    id: "inspiring",
    label: "Вдохновляющий",
    desc: "Мотивация, история, результат",
    icon: Flame,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-500/30",
    example: "«Твой бизнес начинается с решения. Сегодня — лучший день»",
  },
  {
    id: "friendly",
    label: "Дружелюбный",
    desc: "Неформально, близко, по-человечески",
    icon: Heart,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-500/30",
    example: "«Слушай, мы разобрали это с нуля — смотри, как всё просто»",
  },
  {
    id: "premium",
    label: "Премиальный",
    desc: "Статусно, уверенно, без лишних слов",
    icon: Star,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-500/30",
    example: "«ADONIS — производство мирового уровня. Ваш бизнес. Ваши правила»",
  },
];

const audienceSegments = [
  { id: "employee", label: "Сотрудники в найме", desc: "25–40 лет, хотят свой бизнес", active: true },
  { id: "entrepreneur", label: "Начинающие предприниматели", desc: "20–35 лет, ищут нишу", active: true },
  { id: "investor", label: "Инвесторы / партнёры", desc: "30–50 лет, ищут вложения", active: false },
  { id: "franchise", label: "Покупатели франшиз", desc: "28–45 лет, сравнивают предложения", active: true },
];

const logoSlots = [
  { id: "main", label: "Основной логотип", desc: "Для светлых фонов", hint: "SVG / PNG / WEBP" },
  { id: "dark", label: "На тёмном фоне", desc: "Монохром / инверсия", hint: "SVG / PNG" },
  { id: "icon", label: "Иконка 1:1", desc: "Фавикон и аватарки", hint: "PNG / ICO" },
  { id: "transparent", label: "Прозрачный PNG", desc: "Для наложений", hint: "PNG с альфа" },
];

const keyMessages = [
  "Производство полного цикла от 500 изделий",
  "Партнёрство с гарантированной поддержкой",
  "ROI от 340% в первый год",
];

export default function BrandPage() {
  const [colors, setColors] = useState(defaultColors);
  const [newColor, setNewColor] = useState("#8b5cf6");
  const [showAddColor, setShowAddColor] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("inspiring");
  const [segments, setSegments] = useState(audienceSegments);
  const [brandName, setBrandName] = useState("ADONIS");
  const [tagline, setTagline] = useState("Производство. Партнёрство. Результат.");
  const [messages, setMessages] = useState(keyMessages);
  const [newMessage, setNewMessage] = useState("");
  const [uploadedLogos, setUploadedLogos] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addColor = () => {
    if (colors.length < 6) {
      setColors([...colors, { hex: newColor, name: `Цвет ${colors.length + 1}` }]);
      setShowAddColor(false);
    }
  };

  const removeColor = (index: number) => {
    if (colors.length > 1) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  const toggleSegment = (id: string) => {
    setSegments(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const addMessage = () => {
    if (newMessage.trim() && messages.length < 5) {
      setMessages([...messages, newMessage.trim()]);
      setNewMessage("");
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1500);
  };

  return (
    <AppLayout title="Бренд" subtitle="Настройки айдентики, голоса и стратегии ADONIS">
      <div className="p-6 space-y-6">

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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left Column */}
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

              <div className="flex flex-wrap gap-3">
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
                    <span className="text-[10px] text-slate-500 font-mono">{color.hex}</span>
                    <span className="text-[10px] text-slate-600">{color.name}</span>
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
                            <button onClick={addColor} className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] hover:bg-emerald-500/30 transition-all">
                              OK
                            </button>
                            <button onClick={() => setShowAddColor(false)} className="px-2 py-1 rounded-lg bg-white/[0.04] text-slate-500 text-[10px] hover:bg-white/[0.08] transition-all">
                              ×
                            </button>
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
                      className={`p-4 rounded-xl text-left border transition-all ${
                        isSelected
                          ? `${style.border} ${style.bg}`
                          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? style.bg : "bg-white/[0.04]"}`}>
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? style.color : "text-slate-500"}`} />
                        </div>
                        <span className={`text-sm font-semibold ${isSelected ? "text-white" : "text-slate-400"}`}>
                          {style.label}
                        </span>
                        {isSelected && <Check className={`w-3.5 h-3.5 ${style.color} ml-auto`} />}
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2">{style.desc}</p>
                      <p className={`text-[11px] italic ${isSelected ? "text-slate-300" : "text-slate-600"}`}>
                        {style.example}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-5">

            {/* Logos */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-5">
                <Image className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Логотипы</h3>
              </div>
              <div className="space-y-3">
                {logoSlots.map((slot) => (
                  <div key={slot.id} className="relative">
                    {uploadedLogos[slot.id] ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05]">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-white">{slot.label}</div>
                          <div className="text-[10px] text-emerald-400/70">Загружен</div>
                        </div>
                        <button
                          onClick={() => setUploadedLogos(prev => ({ ...prev, [slot.id]: false }))}
                          className="text-slate-600 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setUploadedLogos(prev => ({ ...prev, [slot.id]: true }))}
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
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-5">
                <Target className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-white">Целевая аудитория</h3>
              </div>
              <div className="space-y-2">
                {segments.map((seg) => (
                  <button
                    key={seg.id}
                    onClick={() => toggleSegment(seg.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border transition-all ${
                      seg.active
                        ? "border-violet-500/25 bg-violet-500/[0.06]"
                        : "border-white/[0.05] bg-white/[0.02] opacity-60 hover:opacity-80"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      seg.active
                        ? "bg-violet-500 border-violet-500"
                        : "border-white/20 bg-transparent"
                    }`}>
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

            {/* AI Prompt Preview */}
            <div className="p-5 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-900/15 to-blue-900/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">AI Промпт бренда</h3>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] font-mono text-[10px] text-slate-400 leading-relaxed">
                Ты создаёшь контент для бренда <span className="text-violet-300">{brandName}</span>. Слоган: «<span className="text-white">{tagline}</span>». Голос: <span className="text-cyan-300">{voiceStyles.find(v => v.id === selectedVoice)?.label}</span>. Аудитория: предприниматели 25-45 лет. Всегда делай CTA к франшизе.
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-[11px] text-violet-400">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Применяется автоматически при генерации
              </div>
            </div>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3.5 rounded-2xl btn-ai text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Сохранение...
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Сохранено!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Сохранить настройки бренда
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
