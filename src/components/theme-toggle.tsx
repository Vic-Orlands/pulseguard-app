"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "@/components/phosphor-icons";

/**
 * Theme toggle. Auth screens use the floating `.pg-theme-toggle` utility.
 * Pass `className` to place it inline (for example in the documentation header).
 */
export function ThemeToggle({
  id,
  className,
}: {
  id?: string;
  className?: string;
}) {
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
      className={className ?? "pg-theme-toggle"}
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
