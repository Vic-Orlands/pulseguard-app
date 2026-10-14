"use client";

import { SpendChart } from "@/components/ai/charts";
import { Empty, Panel, usd, useAIData } from "@/lib/ai/client";
import type { DaySpend, ModelRow } from "@/lib/ai/types";

export default function CostsPage() {
  const { data, error } = useAIData<{ spend: number; series: DaySpend[]; models: ModelRow[] }>("costs");
  if (!data) return <Empty error={error} label="Loading costs" />;
  return (
    <div className="space-y-4">
      <p className="text-2xl">{usd(data.spend)}</p>
      <Panel title="Daily cost">
        <SpendChart series={data.series} />
      </Panel>
    </div>
  );
}
