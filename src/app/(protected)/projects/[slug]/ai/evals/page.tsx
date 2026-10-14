"use client";

import { useState } from "react";
import { useAI } from "@/components/ai/shell";
import { Empty, Panel, aiSend, useAIData } from "@/lib/ai/client";
import type { DatasetRow, EvalRun, EvaluatorRow } from "@/lib/ai/types";

export default function EvalsPage() {
  const { projectId } = useAI();
  const datasets = useAIData<{ datasets: DatasetRow[] }>("datasets");
  const evaluators = useAIData<{ evaluators: EvaluatorRow[] }>("evaluators");
  const runs = useAIData<{ runs: EvalRun[] }>("evals/runs");
  const [message, setMessage] = useState("");
  if (!datasets.data || !evaluators.data || !runs.data) {
    return <Empty error={datasets.error || evaluators.error || runs.error} label="Loading evals" />;
  }
  const dataset = datasets.data.datasets[0];
  const evaluator = evaluators.data.evaluators[0];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Datasets">
        {datasets.data.datasets.map((item) => (
          <div key={item.id} className="mb-3">
            <p className="text-sm">{item.name}</p>
            <ul className="mt-1 text-xs text-pg-muted">
              {item.items.map((row) => <li key={row.id}>{row.input} → {row.expected}</li>)}
            </ul>
          </div>
        ))}
      </Panel>
      <Panel title="Evaluators">
        {evaluators.data.evaluators.map((item) => (
          <p key={item.id} className="text-sm">{item.name} · {item.kind}</p>
        ))}
        <button
          type="button"
          className="mt-3 rounded-md bg-[#e2e2e2] px-3 py-1.5 text-sm text-[#18181b]"
          onClick={() => {
            if (!dataset || !evaluator) return;
            void aiSend<EvalRun>(projectId, "evals/run", "POST", { datasetId: dataset.id, evaluatorId: evaluator.id })
              .then((run) => setMessage(`Mean score ${run.meanScore.toFixed(2)}`));
          }}
        >
          Run {evaluator?.name ?? "eval"}
        </button>
        {message ? <p className="mt-2 text-xs text-pg-muted">{message}</p> : null}
        <ul className="mt-3 space-y-1 text-xs text-pg-muted">
          {runs.data.runs.map((run) => <li key={run.id}>{run.meanScore.toFixed(2)} · {run.createdAt}</li>)}
        </ul>
      </Panel>
    </div>
  );
}
