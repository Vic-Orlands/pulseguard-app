"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AgentGraph } from "@/components/ai/graph";
import { Waterfall } from "@/components/ai/waterfall";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Empty, Panel, useAIData } from "@/lib/ai/client";
import type { SpanRow } from "@/lib/ai/types";

export default function TraceDetailPage() {
  const params = useParams<{ traceId: string }>();
  const { data, error } = useAIData<{ traceId: string; spans: SpanRow[] }>(`traces/${params.traceId}`);
  const [selected, setSelected] = useState("");
  const [aiOnly, setAiOnly] = useState(true);
  if (!data) {
    return <Empty error={error} label="Loading trace" />;
  }
  const current = data.spans.find((span) => span.spanId === selected) ?? data.spans[0];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg">Trace {data.traceId.slice(0, 12)}</h1>
        <label className="flex items-center gap-2 text-xs text-pg-muted">
          <input type="checkbox" checked={aiOnly} onChange={(event) => setAiOnly(event.target.checked)} />
          AI spans
        </label>
      </div>
      <Tabs defaultValue="waterfall">
        <TabsList>
          <TabsTrigger value="waterfall">Waterfall</TabsTrigger>
          <TabsTrigger value="graph">Agent graph</TabsTrigger>
        </TabsList>
        <TabsContent value="waterfall">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <Panel title="Spans">
              <Waterfall spans={data.spans} selected={current?.spanId ?? ""} onSelect={setSelected} aiOnly={aiOnly} />
            </Panel>
            <Panel title={current?.name ?? "Span"}>
              {current ? (
                <div className="space-y-3 text-sm">
                  <p className="text-xs text-pg-muted">{current.type} · {Math.round(current.durationMs)} ms · {current.model || current.toolName}</p>
                  <pre className="whitespace-pre-wrap rounded-lg bg-[#1c1c1f] p-3 text-xs">{current.input || "No input"}</pre>
                  <pre className="whitespace-pre-wrap rounded-lg bg-[#1c1c1f] p-3 text-xs">{current.output || "No output"}</pre>
                </div>
              ) : null}
            </Panel>
          </div>
        </TabsContent>
        <TabsContent value="graph">
          <AgentGraph traceId={params.traceId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
