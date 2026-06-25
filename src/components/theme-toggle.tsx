"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

/**
 * Floating theme toggle button — top-right corner on all full-page auth screens.
 * Uses the `.pg-theme-toggle` design system utility.
 */
export function ThemeToggle({ id }: { id?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      id={id ?? "pg-theme-toggle"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="pg-theme-toggle"
      title="Switch theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-orange-400" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-500" />
      )}
    </button>
  );
}
