import { useEffect, useState } from "react";
import type { FormMode } from "@/types/form";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<FormMode>("login");

  // Set hydrated to true on client-side after mount
  useEffect(() => {
    setHydrated(true);

    const stored = localStorage.getItem("auth_mode") as FormMode;
    if (stored) {
      setMode(stored);
    }
  }, []);

  const toggleMode = (newMode: FormMode) => {
    setMode(newMode);
    localStorage.setItem("auth_mode", newMode);
  };

  return { mode, toggleMode, hydrated };
}
