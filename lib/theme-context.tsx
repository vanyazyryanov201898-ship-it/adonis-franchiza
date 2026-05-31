"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "dark" | "light" | "system";
export type AccentColor = "violet" | "blue" | "emerald" | "rose" | "amber" | "cyan";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (a: AccentColor) => void;
  compact: boolean;
  setCompact: (v: boolean) => void;
  resolvedTheme: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function applyTheme(t: Theme) {
  const root = document.documentElement;
  const resolved =
    t === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : t;
  root.classList.remove("dark", "light");
  root.classList.add(resolved);
  return resolved as "dark" | "light";
}

function applyAccent(a: AccentColor) {
  document.documentElement.setAttribute("data-accent", a);
}

function applyCompact(v: boolean) {
  document.documentElement.classList.toggle("compact", v);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [accentColor, setAccentColorState] = useState<AccentColor>("violet");
  const [compact, setCompactState] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("adonis_theme") as Theme) || "dark";
    const savedAccent = (localStorage.getItem("adonis_accent") as AccentColor) || "violet";
    const savedCompact = localStorage.getItem("adonis_compact") === "true";

    setThemeState(savedTheme);
    setAccentColorState(savedAccent);
    setCompactState(savedCompact);

    const resolved = applyTheme(savedTheme);
    setResolvedTheme(resolved);
    applyAccent(savedAccent);
    applyCompact(savedCompact);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (savedTheme === "system") {
        const r = applyTheme("system");
        setResolvedTheme(r);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("adonis_theme", t);
    const resolved = applyTheme(t);
    setResolvedTheme(resolved);
  };

  const setAccentColor = (a: AccentColor) => {
    setAccentColorState(a);
    localStorage.setItem("adonis_accent", a);
    applyAccent(a);
  };

  const setCompact = (v: boolean) => {
    setCompactState(v);
    localStorage.setItem("adonis_compact", String(v));
    applyCompact(v);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor, compact, setCompact, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
