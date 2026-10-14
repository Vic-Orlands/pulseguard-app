"use client";

import Link from "next/link";
import { useState } from "react";
import { useAI } from "@/components/ai/shell";
import { Empty, Panel, aiSend, usd, useAIData } from "@/lib/ai/client";
import type { TraceRow } from "@/lib/ai/types";

const examples = [
  `where type = "generation" | extend prompt = user_prompt(input) | limit 20`,
  `where error_type = "rate_limit" | summarize calls = count() by request_model | sort calls desc`,
  `where type = "tool" | extend tool = has_tool(tool_name) | limit 20`,
];

export default function TracesPage() {
  const { slug, projectId, from, to } = useAI();
  const { data, error } = useAIData<{ traces: TraceRow[] }>("traces");
  const [query, setQuery] = useState(examples[0]);
  const [table, setTable] = useState<{ columns: string[]; rows: unknown[][] } | null>(null);
  const [queryError, setQueryError] = useState("");

  async function runQuery() {
    setQueryError("");
    try {
      const result = await aiSend<{ columns: string[]; rows: unknown[][] }>(projectId, `query?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, "POST", { q: query });
      setTable(result);
    } catch (reason) {
      setQueryError(reason instanceof Error ? reason.message : "Query failed");
    }
  }

  return (
    <div className="space-y-4">
      <Panel title="Observation query">
        <textarea
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-20 w-full rounded-lg border border-pg-border bg-[#1c1c1f] p-3 font-mono text-xs text-pg-text"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {examples.map((example) => (
            <button key={example} type="button" onClick={() => setQuery(example)} className="rounded-full border border-pg-border px-2 py-1 text-[11px] text-pg-muted">
              {example.split("|")[0]}
            </button>
          ))}
          <button type="button" onClick={() => void runQuery()} className="rounded-full bg-[#e2e2e2] px-3 py-1 text-[11px] text-[#18181b]">
            Run
          </button>
        </div>
        {queryError ? <p className="mt-2 text-xs text-red-300">{queryError}</p> : null}
        {table ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr>{table.columns.map((column) => <th key={column} className="py-1 pr-3 font-normal text-pg-subtle">{column}</th>)}</tr>
              </thead>
              <tbody>
                {table.rows.slice(0, 20).map((row, index) => (
                  <tr key={index} className="border-t border-pg-border">
                    {row.map((cell, cellIndex) => <td key={cellIndex} className="max-w-xs truncate py-1 pr-3">{String(cell ?? "")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Panel>
      {!data ? <Empty error={error} label="Loading traces" /> : (
        <Panel title="Traces">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-pg-subtle">
              <tr>
                <th className="py-2 font-normal">Name</th>
                <th className="font-normal">User</th>
                <th className="font-normal">Model</th>
                <th className="font-normal">Duration</th>
                <th className="font-normal">Cost</th>
                <th className="font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.traces.map((trace) => (
                <tr key={trace.traceId} className="border-t border-pg-border">
                  <td className="py-2">
                    <Link href={`/projects/${slug}/ai/traces/${trace.traceId}`} className="text-pg-text no-underline hover:underline">{trace.name}</Link>
                  </td>
                  <td>{trace.userId}</td>
                  <td>{trace.model}</td>
                  <td>{Math.round(trace.durationMs)} ms</td>
                  <td>{usd(trace.cost)}</td>
                  <td className={trace.status === "error" ? "text-red-300" : "text-emerald-300"}>{trace.errorType || trace.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
