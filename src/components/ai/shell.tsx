"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import Lenis from "lenis";
import type { RangeKey } from "@/lib/ai/types";

type AIContextValue = {
  projectId: string;
  slug: string;
  name: string;
  range: RangeKey;
  from: string;
  to: string;
};

const AIContext = createContext<AIContextValue | null>(null);

export function useAI() {
  const value = useContext(AIContext);
  if (!value) {
    throw new Error("AI console context is missing");
  }
  return value;
}

const ranges: RangeKey[] = ["24h", "7d", "30d"];

function bounds(range: RangeKey) {
  const to = new Date();
  const from = new Date(to);
  const days = range === "24h" ? 1 : range === "7d" ? 7 : 30;
  from.setTime(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

const primary = [
  ["", "Overview"],
  ["/traces", "Traces"],
  ["/sessions", "Sessions"],
  ["/users", "Users"],
  ["/models", "Models"],
  ["/costs", "Costs"],
  ["/throttling", "Throttling"],
  ["/prompts", "Prompts"],
  ["/playground", "Playground"],
  ["/evals", "Evals"],
  ["/alerts", "Alerts"],
  ["/capture", "Capture"],
  ["/keys", "Keys"],
] as const;

const infra = [
  ["logs", "Logs"],
  ["metrics", "Metrics"],
  ["errors", "Errors"],
] as const;

export function Shell({
  projectId,
  slug,
  name,
  children,
}: {
  projectId: string;
  slug: string;
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [range, setRange] = useState<RangeKey>("7d");
  const scrollRef = useRef<HTMLDivElement>(null);
  const value = useMemo(() => ({ projectId, slug, name, range, ...bounds(range) }), [projectId, slug, name, range]);
  const base = `/projects/${slug}/ai`;

  useEffect(() => {
    const wrapper = scrollRef.current;
    const content = wrapper?.firstElementChild;
    if (!wrapper || !(content instanceof HTMLElement)) {
      return;
    }
    const lenis = new Lenis({ wrapper, content, autoRaf: true });
    return () => lenis.destroy();
  }, []);

  return (
    <AIContext.Provider value={value}>
      <div className="flex h-screen bg-[#1c1c1f] text-pg-text">
        <aside className="flex w-56 shrink-0 flex-col border-r border-pg-border bg-[#18181b]">
          <div className="px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-pg-subtle">PulseGuard AI</p>
            <p className="mt-1 truncate text-sm">{name}</p>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">
            {primary.map(([href, label]) => {
              const path = `${base}${href}`;
              const active = href === "" ? pathname === base : pathname.startsWith(path);
              return (
                <Link
                  key={label}
                  href={path}
                  className={`block rounded-md px-2.5 py-1.5 text-[13px] no-underline ${active ? "bg-pg-group text-pg-text" : "text-pg-muted hover:bg-pg-group/70 hover:text-pg-text"}`}
                >
                  {label}
                </Link>
              );
            })}
            <p className="px-2.5 pb-1 pt-4 text-[10px] uppercase tracking-[0.16em] text-pg-subtle">Infrastructure</p>
            {infra.map(([tab, label]) => (
              <Link
                key={tab}
                href={`/projects/${slug}?tab=${tab}`}
                className="block rounded-md px-2.5 py-1.5 text-[13px] text-pg-muted no-underline hover:bg-pg-group/70 hover:text-pg-text"
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-pg-border px-6">
            <p className="text-sm text-pg-muted">LLM telemetry</p>
            <div className="flex rounded-lg bg-pg-group p-1">
              {ranges.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRange(item)}
                  className={`rounded-md px-3 py-1 text-xs ${range === item ? "bg-[#1c1c1f] text-pg-text" : "bg-transparent text-pg-muted"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </header>
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="mx-auto w-full max-w-6xl px-6 py-6"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </AIContext.Provider>
  );
}
