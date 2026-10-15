"use client";

import type { SpanRow } from "@/lib/ai/types";

const typeColor: Record<string, string> = {
  generation: "bg-sky-400",
  agent: "bg-amber-300",
  tool: "bg-emerald-400",
  retrieval: "bg-violet-300",
  embedding: "bg-pink-300",
  mcp: "bg-orange-300",
  span: "bg-zinc-500",
  event: "bg-zinc-600",
};

export function Waterfall({
  spans,
  selected,
  onSelect,
  aiOnly,
}: {
  spans: SpanRow[];
  selected: string;
  onSelect: (id: string) => void;
  aiOnly: boolean;
}) {
  const visible = aiOnly ? spans.filter((span) => span.type !== "span" && span.type !== "event") : spans;
  const end = visible.reduce((max, span) => Math.max(max, span.offsetMs + span.durationMs), 1);
  return (
    <div className="space-y-1">
      {visible.map((span) => (
        <button
          key={span.spanId}
          type="button"
          onClick={() => onSelect(span.spanId)}
          className={`grid w-full grid-cols-[180px_1fr] items-center gap-3 rounded-md px-2 py-1 text-left ${selected === span.spanId ? "bg-pg-group" : "bg-transparent hover:bg-pg-group/60"}`}
        >
          <span className="truncate text-xs text-pg-text">
            {span.name}
            {span.slow ? <span className="ml-2 text-[10px] text-amber-300">slow</span> : null}
          </span>
          <span className="relative h-5">
            <span
              className={`absolute top-1 h-3 rounded-sm ${typeColor[span.type] ?? "bg-zinc-500"} ${span.status === "error" ? "opacity-100 ring-1 ring-red-400" : ""}`}
              style={{ left: `${(span.offsetMs / end) * 100}%`, width: `${Math.max((span.durationMs / end) * 100, 1.2)}%` }}
            />
          </span>
        </button>
      ))}
    </div>
  );
}
