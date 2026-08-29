"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Home } from "@/components/phosphor-icons";
import { Logo } from "@/app/(auth)/signin/page";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageFooter } from "@/components/page-footer";

// Grid cell data — minimal status labels like the reference
const GRID_CELLS = [
  ["TIMEOUT", "", "OFFLINE", ""],
  ["", "DROPPED", "404", "LOST"],
  ["", "", "OFFLINE", "NULL"],
  ["VOID", "DROPPED", "", ""],
];

function AnimatedGrid() {
  const [active, setActive] = useState<{ r: number; c: number } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const row = Math.floor(Math.random() * GRID_CELLS.length);
      const col = Math.floor(Math.random() * GRID_CELLS[0].length);
      setActive({ r: row, c: col });
      setTimeout(() => setActive(null), 800);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-block text-left">
      <p className="text-[10px] font-mono tracking-[0.25em] text-pg-subtle mb-2">
        Error
      </p>
      <div className="border border-pg-border divide-y divide-pg-border">
        {GRID_CELLS.map((row, rIdx) => (
          <div key={rIdx} className="flex divide-x divide-pg-border">
            {row.map((cell, cIdx) => (
              <div
                key={cIdx}
                className={`w-[72px] h-[38px] flex items-center justify-center transition-colors duration-500 ${
                  active?.r === rIdx && active?.c === cIdx
                    ? "bg-pg-err-bg"
                    : "bg-transparent"
                }`}
              >
                {cell && (
                  <span
                    className={`text-[8px] font-mono tracking-wider transition-colors ${
                      active?.r === rIdx && active?.c === cIdx
                        ? "text-pg-err-txt"
                        : "text-pg-subtle"
                    }`}
                  >
                    {cell}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NotFound({
  message = "Sorry! The page you're looking for doesn't exist or has been moved.",
  backHref = "/",
  backLabel = "Go Home",
}: {
  message?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="bg-dot-pattern min-h-screen w-full relative overflow-hidden text-pg-text flex flex-col">
      <ThemeToggle id="not-found-theme-toggle" />

      <div className="absolute top-6 left-6 z-10">
        <Logo />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-24">
        <div className="flex flex-col items-start gap-10 max-w-lg w-full mx-auto">
          <div className="border border-pg-border px-8 py-4 self-center">
            <span
              className="font-serif tracking-[0.45em] text-[clamp(2.5rem,8vw,5rem)] text-pg-text select-none leading-none"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              4&nbsp;&nbsp;0&nbsp;&nbsp;4
            </span>
          </div>

          <AnimatedGrid />

          <div className="space-y-5">
            <p className="text-xs font-sans text-pg-subtle tracking-wide max-w-[300px] leading-relaxed">
              {message}
            </p>

            <div className="flex items-center gap-4">
              <Link href={backHref} className="btn-primary gap-2">
                <Home className="h-3.5 w-3.5" />
                {backLabel}
              </Link>
              <button
                onClick={() => window.history.back()}
                className="btn-back"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
