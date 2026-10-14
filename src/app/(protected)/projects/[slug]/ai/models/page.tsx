"use client";

import { Empty, Panel, usd, useAIData } from "@/lib/ai/client";
import type { ModelRow } from "@/lib/ai/types";

export default function ModelsPage() {
  const { data, error } = useAIData<{ models: ModelRow[] }>("models");
  if (!data) return <Empty error={error} label="Loading models" />;
  return (
    <Panel title="Models">
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-pg-subtle">
          <tr>
            <th className="py-2 font-normal">Model</th>
            <th className="font-normal">Calls</th>
            <th className="font-normal">Tokens</th>
            <th className="font-normal">Cost</th>
            <th className="font-normal">p95</th>
            <th className="font-normal">Throttle</th>
          </tr>
        </thead>
        <tbody>
          {data.models.map((model) => (
            <tr key={model.model} className="border-t border-pg-border">
              <td className="py-2">{model.model}</td>
              <td>{model.calls}</td>
              <td>{model.tokens.toLocaleString()}</td>
              <td>{usd(model.cost)}</td>
              <td>{Math.round(model.p95)} ms</td>
              <td>{model.throttlePct.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
