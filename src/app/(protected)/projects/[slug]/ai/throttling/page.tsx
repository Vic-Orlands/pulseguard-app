"use client";

import { ThrottleChart } from "@/components/ai/charts";
import { Empty, Panel, useAIData } from "@/lib/ai/client";
import type { Headroom, ThrottlePoint } from "@/lib/ai/types";

export default function ThrottlingPage() {
  const { data, error } = useAIData<{ series: ThrottlePoint[]; headroom: Headroom }>("throttling");
  if (!data) return <Empty error={error} label="Loading throttling" />;
  const head = data.headroom;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Requests left" value={head.remainingRequests?.toLocaleString() ?? "—"} />
        <Stat label="Minutes to exhaust" value={head.minutesToExhaust === null ? "—" : head.minutesToExhaust.toFixed(1)} />
        <Stat label="Retry after" value={head.retryAfterMs ? `${head.retryAfterMs} ms` : "—"} />
      </div>
      <Panel title="Throttle classes">
        <ThrottleChart series={data.series} />
      </Panel>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <section className="rounded-xl border border-pg-border bg-[#161618] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-pg-subtle">{label}</p>
      <p className="mt-2 text-xl">{value}</p>
    </section>
  );
}
