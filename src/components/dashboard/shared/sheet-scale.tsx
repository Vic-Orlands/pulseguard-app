"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";

interface SheetScaleContextValue {
  openCount: number;
  increment: () => void;
  decrement: () => void;
}

const SheetScaleContext = createContext<SheetScaleContextValue | null>(null);

export function SheetScaleProvider({ children }: { children: ReactNode }) {
  const [openCount, setOpenCount] = useState(0);

  const increment = useCallback(() => {
    setOpenCount((count) => count + 1);
  }, []);

  const decrement = useCallback(() => {
    setOpenCount((count) => Math.max(0, count - 1));
  }, []);

  const value = useMemo(
    () => ({ openCount, increment, decrement }),
    [openCount, increment, decrement],
  );

  return (
    <SheetScaleContext.Provider value={value}>
      {children}
    </SheetScaleContext.Provider>
  );
}

export function useSheetScale() {
  return useContext(SheetScaleContext);
}

export function DashboardCanvas({ children }: { children: ReactNode }) {
  const ctx = useSheetScale();
  const isOpen = (ctx?.openCount ?? 0) > 0;

  return (
    <motion.div
      className="dashboard-canvas min-h-screen origin-left will-change-transform"
      animate={
        isOpen
          ? { scale: 0.965, x: -18, borderRadius: 16 }
          : { scale: 1, x: 0, borderRadius: 0 }
      }
      transition={{ type: "spring", stiffness: 260, damping: 32, mass: 0.8 }}
    >
      {children}
    </motion.div>
  );
}
