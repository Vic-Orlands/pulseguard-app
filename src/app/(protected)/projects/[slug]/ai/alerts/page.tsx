"use client";

import { useState } from "react";
import { useAI } from "@/components/ai/shell";
import { Empty, Panel, aiSend, useAIData } from "@/lib/ai/client";
import type { AlertRow } from "@/lib/ai/types";

export default function AlertsPage() {
  const { projectId } = useAI();
  const { data, error } = useAIData<{ alerts: AlertRow[] }>("alerts");
  const [name, setName] = useState("Error rate");
  const [saved, setSaved] = useState("");
  if (!data) return <Empty error={error} label="Loading alerts" />;
  return (
    <div className="space-y-4">
      <Panel title="Rules">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-pg-subtle">
            <tr>
              <th className="py-2 font-normal">Name</th>
              <th className="font-normal">Metric</th>
              <th className="font-normal">Threshold</th>
              <th className="font-normal">State</th>
            </tr>
          </thead>
          <tbody>
            {data.alerts.map((alert) => (
              <tr key={alert.id} className="border-t border-pg-border">
                <td className="py-2">{alert.name}</td>
                <td>{alert.metric} {alert.comparator} {alert.threshold}</td>
                <td>{alert.pendingForSeconds}s</td>
                <td>{alert.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Panel title="New rule">
        <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-pg-border bg-[#1c1c1f] px-3 py-2 text-sm" />
        <button
          type="button"
          className="mt-2 rounded-md bg-[#e2e2e2] px-3 py-1.5 text-sm text-[#18181b]"
          onClick={() => {
            void aiSend(projectId, "alerts", "POST", { name, metric: "error_rate", comparator: "gt", threshold: 0.05, pendingForSeconds: 60 })
              .then(() => setSaved("Rule created. Reload to see it."));
          }}
        >
          Create
        </button>
        {saved ? <p className="mt-2 text-xs text-pg-muted">{saved}</p> : null}
      </Panel>
    </div>
  );
}
