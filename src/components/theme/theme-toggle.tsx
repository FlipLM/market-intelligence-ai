"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-slate-400 ${className}`}
      >
        <span className="w-4 h-4 block" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer select-none active:scale-95 ${
        isDark
          ? "bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 border-white/[0.08] hover:border-white/20"
          : "bg-slate-100 hover:bg-slate-200 text-indigo-600 border-slate-200 hover:border-slate-300 shadow-sm"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}

