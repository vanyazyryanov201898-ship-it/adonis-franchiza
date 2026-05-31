"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, BarChart3, Zap, ArrowRight, X } from "lucide-react";

const STORAGE_KEY = "adonis_onboarded";

const steps = [
  {
    icon: Zap,
    color: "text-violet-400",
    bg: "bg-violet-500/15",
    border: "border-violet-500/25",
    subtitle: "Добро пожаловать",
    title: "ADONIS AI Platform",
    description:
      "Умная платформа для продажи франшиз через контент. Генерируй вирусные ролики, отслеживай тренды и автоматически публикуй на всех площадках — всё из одного места.",
  },
  {
    icon: Sparkles,
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    border: "border-blue-500/25",
    subtitle: "Шаг 1 из 2",
    title: "AI Генератор контента",
    description:
      "Claude AI анализирует тренды и создаёт сценарии, хуки и описания под вашу нишу за секунды. Просто выбери тему — платформа сделает остальное.",
  },
  {
    icon: BarChart3,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/25",
    subtitle: "Шаг 2 из 2",
    title: "Аналитика и автопостинг",
    description:
      "Следи за охватами, лидами и конверсиями в реальном времени. AI Автопилот публикует в нужное время на нужной платформе без твоего участия.",
  },
];

export default function OnboardingModal() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
    } catch {}
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setShow(false);
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
      router.push("/generator");
    }
  };

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="relative w-full max-w-md rounded-3xl border border-white/[0.1] overflow-hidden shadow-2xl"
            style={{ backgroundColor: "#0d0d1a" }}
          >
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>

            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative p-8">
              {/* Progress bar */}
              <div className="flex items-center gap-1.5 mb-8">
                {steps.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ width: i === step ? 32 : 16 }}
                    transition={{ duration: 0.4 }}
                    className={`h-1 rounded-full transition-colors duration-500 ${
                      i === step
                        ? "bg-violet-500"
                        : i < step
                        ? "bg-violet-500/50"
                        : "bg-white/[0.08]"
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${current.bg} border ${current.border} flex items-center justify-center mb-6`}
                  >
                    <Icon className={`w-7 h-7 ${current.color}`} />
                  </div>

                  <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
                    {current.subtitle}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">{current.title}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">{current.description}</p>
                </motion.div>
              </AnimatePresence>

              {/* Footer */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={dismiss}
                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  Пропустить
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={next}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-ai text-sm text-white font-semibold"
                >
                  {isLast ? "Начать работу" : "Далее"}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
