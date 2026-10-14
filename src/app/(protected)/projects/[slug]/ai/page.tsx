"use client";

import { SpendChart } from "@/components/ai/charts";
import { Empty, Panel, pct, usd, useAIData } from "@/lib/ai/client";
import type { Overview } from "@/lib/ai/types";

export default function OverviewPage() {
  const { data, error } = useAIData<Overview>("overview");
  if (!data) {
    return <Empty error={error} label="Loading overview" />;
  }
  const cards = [
    ["Spend", usd(data.spend), pct(data.spendDelta)],
    ["Calls", data.calls.toLocaleString(), pct(data.callsDelta)],
    ["p95", `${Math.round(data.p95Ms)} ms`, `${Math.round(data.p95DeltaMs)} ms`],
    ["TTFT", `${Math.round(data.ttftMs)} ms`, `${Math.round(data.ttftDeltaMs)} ms`],
    ["Throttled", `${data.throttledPct.toFixed(1)}%`, `${data.throttledDeltaPts.toFixed(1)} pts`],
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map(([label, value, delta]) => (
          <section key={label} className="rounded-xl border border-pg-border bg-[#161618] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-pg-subtle">{label}</p>
            <p className="mt-2 text-xl">{value}</p>
            <p className="text-xs text-pg-muted">{delta}</p>
          </section>
        ))}
      </div>
      <Panel title="Spend by provider">
        <SpendChart series={data.series} />
      </Panel>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Panel title="Models">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-pg-subtle">
              <tr>
                <th className="py-2 font-normal">Model</th>
                <th className="font-normal">Calls</th>
                <th className="font-normal">Cost</th>
                <th className="font-normal">p95</th>
                <th className="font-normal">Errors</th>
              </tr>
            </thead>
            <tbody>
              {data.models.map((model) => (
                <tr key={model.model} className="border-t border-pg-border">
                  <td className="py-2">{model.model}</td>
                  <td>{model.calls}</td>
                  <td>{usd(model.cost)}</td>
                  <td>{Math.round(model.p95)} ms</td>
                  <td>{model.errorPct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Budgets">
          <div className="space-y-3">
            {data.budgets.map((budget) => (
              <div key={budget.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{budget.name}</span>
                  <span className="text-pg-muted">{budget.pct.toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800">
                  <div className="h-2 rounded-full bg-amber-300" style={{ width: `${Math.min(budget.pct, 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-pg-muted">
                  {usd(budget.spent)} of {usd(budget.limit)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
