"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CodeIcon,
  CpuIcon,
  DatabaseIcon,
  GlobeIcon,
  Layers01Icon,
  Message01Icon,
  PlugsIcon,
  WorkflowCircle01Icon,
  Zap,
} from "@/components/phosphor-icons";
import { usd } from "@/lib/ai/client";
import type { SpanRow } from "@/lib/ai/types";
import type { Span } from "@/types/dashboard";

const kindIcon: Record<string, typeof CpuIcon> = {
  workflow: WorkflowCircle01Icon,
  agent: CpuIcon,
  retrieval: DatabaseIcon,
  chat: Message01Icon,
  http: GlobeIcon,
  tool: PlugsIcon,
  function: CodeIcon,
  embeddings: Layers01Icon,
  stream: Zap,
};

const kinds = [
  ["workflow", "Workflow", "#818cf8"],
  ["agent", "Agent", "#fbbf24"],
  ["retrieval", "Retrieval", "#2dd4bf"],
  ["chat", "Chat", "#a78bfa"],
  ["http", "HTTP", "#fb923c"],
  ["tool", "Tool", "#34d399"],
  ["function", "Function", "#38bdf8"],
  ["embeddings", "Embeddings", "#f472b6"],
  ["stream", "Stream", "#22d3ee"],
] as const;

const kindColor = Object.fromEntries(kinds.map(([id, , color]) => [id, color]));

type Node = { span: SpanRow; children: Node[]; depth: number; step: number };

export function TraceInspector({
  projectId,
  slug,
  traceId,
  surface = "app",
}: {
  projectId: string;
  slug: string;
  traceId: string;
  surface?: "ai" | "app";
}) {
  const [aiSpans, setAiSpans] = useState<SpanRow[] | null>(null);
  const [httpSpans, setHttpSpans] = useState<SpanRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const base = process.env.NEXT_PUBLIC_API_URL;
    setAiSpans(null);
    setHttpSpans(null);
    setError("");
    void Promise.all([
      fetch(`${base}/api/projects/${projectId}/ai/traces/${traceId}`, { credentials: "include", signal: controller.signal })
        .then(async (response) => (response.ok ? ((await response.json()) as { spans: SpanRow[] }) : { spans: [] }))
        .then((body) => setAiSpans(body.spans ?? []))
        .catch(() => setAiSpans([])),
      fetch(`${base}/api/traces/${traceId}?project_id=${projectId}`, { credentials: "include", signal: controller.signal })
        .then(async (response) => (response.ok ? ((await response.json()) as { spans?: Span[] }) : { spans: [] }))
        .then((body) => setHttpSpans((body.spans ?? []).map(fromHTTP)))
        .catch(() => setHttpSpans([])),
    ]).catch((reason: unknown) => {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setError(reason instanceof Error ? reason.message : "Unable to load trace");
    });
    return () => controller.abort();
  }, [projectId, traceId]);

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!aiSpans || !httpSpans) return <p className="text-sm text-pg-muted">Loading trace</p>;
  return (
    <TraceView
      traceId={traceId}
      spans={mergeSpans(httpSpans, aiSpans)}
      requestHref={surface === "ai" ? `/projects/${slug}?tab=traces&trace=${traceId}` : undefined}
      aiHref={surface === "app" ? `/projects/${slug}/ai/traces/${traceId}` : undefined}
    />
  );
}

export function TraceView({
  spans,
  traceId,
  requestHref,
  aiHref,
}: {
  spans: SpanRow[];
  traceId: string;
  requestHref?: string;
  aiHref?: string;
}) {
  const tree = useMemo(() => buildTree(spans), [spans]);
  const [selected, setSelected] = useState(() => initialSelection(spans));
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const current = spans.find((span) => span.spanId === selected) ?? spans[0];
  const summary = useMemo(() => summarize(spans, traceId), [spans, traceId]);
  const total = Math.max(summary.duration, 1);
  const visible = useMemo(() => flatten(tree, collapsed), [tree, collapsed]);
  const hasLLM = spans.some((span) => ["chat", "agent", "tool", "retrieval", "embeddings", "stream", "workflow"].includes(kindOf(span)));

  useEffect(() => {
    if (!spans.some((span) => span.spanId === selected)) {
      setSelected(spans[0]?.spanId ?? "");
    }
  }, [spans, selected]);

  if (spans.length === 0) {
    return <p className="text-sm text-pg-muted">No spans in this trace.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium text-pg-text">{summary.title}</h1>
          <div className="mt-1 flex flex-wrap gap-3 text-xs text-pg-muted">
            {requestHref ? <Link href={requestHref} className="text-pg-text underline-offset-2 hover:underline">Request trace</Link> : null}
            {aiHref && hasLLM ? <Link href={aiHref} className="text-pg-text underline-offset-2 hover:underline">AI trace</Link> : null}
          </div>
        </div>
        <p className="text-xs text-pg-subtle">{summary.startedLabel}</p>
      </div>

      <section className="grid gap-x-6 gap-y-3 rounded-xl border border-pg-border bg-pg-group/40 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Status" value={summary.status === "error" ? "error" : "success"} tone={summary.status === "error" ? "bad" : "good"} />
        <Stat label="Duration" value={ms(summary.duration)} />
        <Stat label="First token" value={summary.ttft > 0 ? ms(summary.ttft) : "—"} />
        <Stat label="Spans" value={String(spans.length)} extra={summary.errors > 0 ? `${summary.errors} error` : undefined} />
        <div>
          <p className="text-[11px] text-pg-subtle">Tokens</p>
          <p className="text-sm text-pg-text">{summary.tokensIn > 0 || summary.tokensOut > 0 ? `${compact(summary.tokensIn)} in → ${compact(summary.tokensOut)} out` : "—"}</p>
          <p className="text-[11px] text-pg-muted">cache {compact(summary.cache)} · reasoning {compact(summary.reasoning)}</p>
        </div>
        <Stat label="Cost" value={summary.cost > 0 ? usd(summary.cost) : "—"} />
        <Stat label="Started" value={summary.startedLabel} />
        <Stat label="Service" value={summary.service || "—"} />
        <Stat label="Environment" value={summary.environment || "—"} />
        <Stat label="Framework" value={summary.framework || "—"} />
        <CopyField label="User" value={summary.user} />
        <CopyField label="Conversation" value={summary.conversation} />
        <CopyField label="Trace ID" value={traceId} mono />
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.5fr)_340px]">
        <section className="min-w-0 rounded-xl border border-pg-border">
          <div className="flex flex-wrap items-center gap-3 border-b border-pg-border px-3 py-2">
            {kinds.map(([id, label, color]) => (
              <span key={id} className="inline-flex items-center gap-1.5 text-[11px] text-pg-muted">
                <KindGlyph kind={id} color={color} />
                {label}
              </span>
            ))}
            <span className="ml-auto flex gap-2">
              <button type="button" className="text-[11px] text-pg-muted hover:text-pg-text" onClick={() => setCollapsed(new Set())}>Expand all</button>
              <button type="button" className="text-[11px] text-pg-muted hover:text-pg-text" onClick={() => setCollapsed(new Set(parentIds(tree)))}>Collapse all</button>
            </span>
          </div>
          <div className="grid grid-cols-[minmax(180px,1.15fr)_128px_minmax(180px,1.3fr)] border-b border-pg-border px-3 py-1 text-[10px] uppercase tracking-wide text-pg-subtle">
            <span>Span</span>
            <span>Operation</span>
            <span className="relative h-4">
              {ticks(total).map((tick) => (
                <span key={tick} className="absolute top-0" style={{ left: `${(tick / total) * 100}%` }}>{Math.round(tick)}ms</span>
              ))}
            </span>
          </div>
          <div className="max-h-[640px] overflow-auto">
            {visible.map((node) => {
              const span = node.span;
              const failed = span.status === "error" || (span.httpStatus ?? 0) >= 400;
              const color = failed ? "#f87171" : kindColor[kindOf(span)] ?? "#a1a1aa";
              const open = !collapsed.has(span.spanId);
              return (
                <button
                  key={span.spanId}
                  type="button"
                  onClick={() => setSelected(span.spanId)}
                  className={`grid w-full grid-cols-[minmax(180px,1.15fr)_128px_minmax(180px,1.3fr)] items-center border-b border-pg-border/70 px-3 py-1.5 text-left ${selected === span.spanId ? "bg-pg-group" : "hover:bg-pg-group/50"}`}
                >
                  <span className="flex min-w-0 items-center gap-1.5" style={{ paddingLeft: node.depth * 14 }}>
                    {node.children.length > 0 ? (
                      <span
                        className="w-3 text-[10px] text-pg-subtle"
                        onClick={(event) => {
                          event.stopPropagation();
                          setCollapsed((prev) => {
                            const next = new Set(prev);
                            if (next.has(span.spanId)) next.delete(span.spanId);
                            else next.add(span.spanId);
                            return next;
                          });
                        }}
                      >
                        {open ? "▾" : "▸"}
                      </span>
                    ) : <span className="w-3" />}
                    <KindGlyph kind={kindOf(span)} color={color} />
                    <span className={`truncate text-xs ${failed ? "text-red-400" : "text-pg-text"}`}>{span.name}</span>
                    <span className="shrink-0 rounded-full bg-pg-surface px-1.5 text-[10px] tabular-nums text-pg-subtle">{node.step}</span>
                  </span>
                  <span className="truncate pr-2 text-[11px]" style={{ color }}>{span.operation || span.model || span.toolName || "—"}</span>
                  <span className="relative h-5">
                    <span
                      className="absolute top-1 flex h-3.5 items-center overflow-hidden rounded-sm px-1 text-[9px] font-medium text-white"
                      style={{
                        left: `${(span.offsetMs / total) * 100}%`,
                        width: `${Math.max((span.durationMs / total) * 100, 1.5)}%`,
                        background: color,
                      }}
                    >
                      {span.durationMs > total * 0.08 ? `${Math.round(span.durationMs)}ms` : ""}
                    </span>
                    {span.durationMs <= total * 0.08 ? (
                      <span className="absolute top-0.5 text-[10px] text-pg-muted" style={{ left: `calc(${(span.offsetMs / total) * 100}% + ${Math.max((span.durationMs / total) * 100, 1.5)}% + 4px)` }}>
                        {Math.round(span.durationMs)}ms
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {current ? <Detail span={current} /> : null}
      </div>
    </div>
  );
}

function Detail({ span }: { span: SpanRow }) {
  const [pretty, setPretty] = useState(true);
  const messages = chatMessages(span.input, span.output);
  const events = span.events ?? [];
  const attributes = span.attributes ?? {};
  return (
    <aside className="rounded-xl border border-pg-border p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-pg-text">{span.name}</p>
          <p className="text-[11px] text-pg-muted">{labelOf(kindOf(span))}{span.agentName ? ` · ${span.agentName}` : ""}</p>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <Field k="Duration" v={ms(span.durationMs)} />
        <Field k="First token" v={span.ttftMs ? ms(span.ttftMs) : "—"} />
        <Field k="Tokens" v={span.inputTokens || span.outputTokens ? `${compact(span.inputTokens ?? 0)} in → ${compact(span.outputTokens ?? 0)} out` : "—"} />
        <Field k="Cost" v={span.cost ? usd(span.cost) : "—"} />
        <Field k="Finish" v={span.finishReason || "—"} />
        <Field k="Operation" v={span.operation || "—"} />
        <Field k="Output" v={span.outputType || "—"} />
        <Field k="Conversation" v={span.sessionId || "—"} />
      </dl>
      <CopyField label="Span ID" value={span.spanId} mono />
      <div className="mt-4">
        <p className="mb-1 text-[10px] uppercase tracking-wide text-pg-subtle">Metadata</p>
        <pre className="max-h-28 overflow-auto rounded-lg bg-pg-surface p-2 text-[11px] text-pg-muted">{JSON.stringify(metadataOf(attributes), null, 2)}</pre>
      </div>
      <Tabs defaultValue="io" className="mt-4">
        <TabsList>
          <TabsTrigger value="io">Input / Output</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="events">Events {events.length}</TabsTrigger>
        </TabsList>
        <TabsContent value="io" className="mt-3">
          <div className="mb-2 flex justify-end gap-2 text-[11px]">
            <button type="button" className={pretty ? "text-pg-text" : "text-pg-subtle"} onClick={() => setPretty(true)}>Pretty</button>
            <button type="button" className={!pretty ? "text-pg-text" : "text-pg-subtle"} onClick={() => setPretty(false)}>JSON</button>
          </div>
          {pretty ? (
            <div className="space-y-2">
              {messages.length === 0 ? <p className="text-xs text-pg-muted">No input or output captured.</p> : messages.map((message, index) => (
                <div key={index} className="rounded-lg bg-pg-surface px-3 py-2">
                  <p className={`text-[10px] uppercase ${message.role === "assistant" ? "text-emerald-500" : "text-pg-subtle"}`}>{message.role}</p>
                  <p className="mt-1 whitespace-pre-wrap text-xs text-pg-text">{message.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-pg-surface p-2 text-[11px] text-pg-muted">{JSON.stringify(messages, null, 2)}</pre>
          )}
        </TabsContent>
        <TabsContent value="attributes" className="mt-3 max-h-64 overflow-auto">
          {Object.keys(attributes).length === 0 ? <p className="text-xs text-pg-muted">No attributes.</p> : (
            <dl className="space-y-1">
              {Object.entries(attributes).map(([key, value]) => (
                <div key={key} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-2 text-[11px]">
                  <dt className="truncate text-pg-subtle">{key}</dt>
                  <dd className="truncate text-pg-text">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </TabsContent>
        <TabsContent value="events" className="mt-3 space-y-2">
          {events.length === 0 ? <p className="text-xs text-pg-muted">No events.</p> : events.map((event, index) => (
            <div key={index} className="rounded-lg bg-pg-surface px-3 py-2 text-xs">
              <p className="text-pg-text">{event.name}</p>
              <p className="text-pg-muted">{event.body}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </aside>
  );
}

function Stat({ label, value, extra, tone }: { label: string; value: string; extra?: string; tone?: "good" | "bad" }) {
  const color = tone === "good" ? "text-emerald-500" : tone === "bad" ? "text-red-400" : "text-pg-text";
  return (
    <div>
      <p className="text-[11px] text-pg-subtle">{label}</p>
      <p className={`text-sm ${color}`}>
        {value}
        {extra ? <span className="ml-2 rounded-full bg-red-500/15 px-1.5 py-0.5 text-[11px] font-medium text-red-400">{extra}</span> : null}
      </p>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] text-pg-subtle">{k}</dt>
      <dd className="truncate text-pg-text">{v}</dd>
    </div>
  );
}

function CopyField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <Stat label={label} value="—" />;
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-pg-subtle">{label}</p>
      <button
        type="button"
        className={`max-w-full truncate text-left text-sm text-pg-text ${mono ? "font-mono text-xs" : ""}`}
        onClick={() => {
          void navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          });
        }}
      >
        {copied ? "Copied" : value}
      </button>
    </div>
  );
}

function summarize(spans: SpanRow[], traceId: string) {
  const root = spans.find((span) => !span.parentSpanId) ?? spans[0];
  const duration = spans.reduce((max, span) => Math.max(max, span.offsetMs + span.durationMs), 0);
  const tokensIn = spans.reduce((sum, span) => sum + (span.inputTokens ?? 0), 0);
  const tokensOut = spans.reduce((sum, span) => sum + (span.outputTokens ?? 0), 0);
  const cache = spans.reduce((sum, span) => sum + (span.cacheReadTokens ?? 0) + (span.cacheWriteTokens ?? 0), 0);
  const reasoning = spans.reduce((sum, span) => sum + (span.reasoningTokens ?? 0), 0);
  const cost = spans.reduce((sum, span) => sum + (span.cost || 0), 0);
  const ttft = spans.reduce((min, span) => (span.ttftMs && span.ttftMs > 0 ? Math.min(min, span.ttftMs) : min), Number.POSITIVE_INFINITY);
  const errors = spans.filter((span) => span.status === "error" || (span.httpStatus ?? 0) >= 400).length;
  const started = root?.start ? new Date(root.start) : null;
  return {
    title: root?.name || traceId.slice(0, 12),
    status: root?.status === "error" || (root?.httpStatus ?? 0) >= 400 ? "error" : "ok",
    duration,
    tokensIn,
    tokensOut,
    cache,
    reasoning,
    cost,
    ttft: Number.isFinite(ttft) ? ttft : 0,
    errors,
    service: first(spans, (span) => span.service),
    environment: first(spans, (span) => span.environment),
    framework: first(spans, (span) => span.framework),
    user: first(spans, (span) => span.userId),
    conversation: first(spans, (span) => span.sessionId),
    startedLabel: started && !Number.isNaN(started.getTime()) ? started.toLocaleString() : "—",
  };
}

function buildTree(spans: SpanRow[]): Node[] {
  const map = new Map<string, Node>();
  spans.forEach((span) => map.set(span.spanId, { span, children: [], depth: 0, step: 0 }));
  const roots: Node[] = [];
  spans.forEach((span) => {
    const node = map.get(span.spanId);
    if (!node) return;
    const parent = span.parentSpanId ? map.get(span.parentSpanId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  const setDepth = (nodes: Node[], depth: number) => {
    nodes.forEach((node) => {
      node.depth = depth;
      setDepth(node.children, depth + 1);
    });
  };
  setDepth(roots, 0);
  let step = 1;
  const number = (nodes: Node[]) => {
    nodes.forEach((node) => {
      node.step = step;
      step += 1;
      number(node.children);
    });
  };
  number(roots);
  return roots;
}

function flatten(nodes: Node[], collapsed: Set<string>): Node[] {
  const out: Node[] = [];
  const walk = (list: Node[]) => {
    list.forEach((node) => {
      out.push(node);
      if (!collapsed.has(node.span.spanId)) walk(node.children);
    });
  };
  walk(nodes);
  return out;
}

function parentIds(nodes: Node[]): string[] {
  const ids: string[] = [];
  const walk = (list: Node[]) => {
    list.forEach((node) => {
      if (node.children.length > 0) ids.push(node.span.spanId);
      walk(node.children);
    });
  };
  walk(nodes);
  return ids;
}

function mergeSpans(httpSpans: SpanRow[], aiSpans: SpanRow[]): SpanRow[] {
  const byId = new Map<string, SpanRow>();
  httpSpans.forEach((span) => byId.set(span.spanId, span));
  aiSpans.forEach((span) => {
    const previous = byId.get(span.spanId);
    byId.set(span.spanId, previous ? { ...previous, ...span, attributes: { ...(previous.attributes ?? {}), ...(span.attributes ?? {}) } } : span);
  });
  return withOffsets([...byId.values()]);
}

function withOffsets(spans: SpanRow[]): SpanRow[] {
  const starts = spans.map((span) => (span.start ? new Date(span.start).getTime() : Number.NaN)).filter((value) => !Number.isNaN(value));
  if (starts.length === 0) return spans;
  const origin = Math.min(...starts);
  return [...spans].sort((a, b) => new Date(a.start ?? 0).getTime() - new Date(b.start ?? 0).getTime()).map((span) => ({
    ...span,
    offsetMs: span.start ? Math.max(0, new Date(span.start).getTime() - origin) : span.offsetMs,
  }));
}

function fromHTTP(span: Span): SpanRow {
  const http = Boolean(span.httpMethod || span.httpUrl);
  const db = span.name.toLowerCase().includes("select") || span.name.toLowerCase().includes("insert") || span.attributes?.["db.system"];
  return {
    spanId: span.spanId,
    parentSpanId: span.parentSpanId,
    name: span.name,
    type: http ? "span" : "span",
    kind: span.attributes?.["pulseguard.display"] || (http ? "http" : db ? "function" : "function"),
    operation: span.attributes?.["pulseguard.operation"] || span.httpUrl || span.operation || span.name,
    start: span.startTime,
    offsetMs: 0,
    durationMs: span.duration,
    status: span.httpStatus >= 400 ? "error" : "ok",
    provider: "",
    model: "",
    input: "",
    output: "",
    slow: false,
    errorType: span.httpStatus >= 400 ? "http_error" : "",
    cost: 0,
    userId: "",
    toolName: "",
    agentName: "",
    httpStatus: span.httpStatus,
    service: span.serviceName,
    attributes: Object.fromEntries(
      Object.entries(span.attributes ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    ),
    events: [],
  };
}

function KindGlyph({ kind, color }: { kind: string; color: string }) {
  const Icon = kindIcon[kind] ?? CodeIcon;
  return <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />;
}

function initialSelection(spans: SpanRow[]) {
  const focus = spans.find((span) => kindOf(span) === "workflow" || kindOf(span) === "agent");
  return focus?.spanId ?? spans[0]?.spanId ?? "";
}

function kindOf(span: SpanRow) {
  if (span.kind) return span.kind;
  if (span.type === "generation") return "chat";
  if (span.type === "embedding") return "embeddings";
  return span.type || "function";
}

function labelOf(kind: string) {
  return kinds.find(([id]) => id === kind)?.[1] ?? kind;
}

function chatMessages(input: string, output: string) {
  const left = parseMessages(input);
  const right = parseMessages(output);
  if (left.length || right.length) return [...left, ...right];
  const fallback: { role: string; content: string }[] = [];
  if (input) fallback.push({ role: "user", content: input });
  if (output) fallback.push({ role: "assistant", content: output });
  return fallback;
}

function parseMessages(raw: string) {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return [];
    return value.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as { role?: string; content?: unknown };
      const content = typeof record.content === "string" ? record.content : JSON.stringify(record.content ?? "");
      return [{ role: record.role || "user", content }];
    });
  } catch {
    return [];
  }
}

function metadataOf(attributes: Record<string, string>) {
  const hidden = new Set(["pulseguard.events", "gen_ai.input.messages", "gen_ai.output.messages", "gen_ai.prompt", "gen_ai.completion"]);
  const out: Record<string, string> = {};
  Object.entries(attributes).forEach(([key, value]) => {
    if (!hidden.has(key)) out[key] = value.length > 180 ? `${value.slice(0, 180)}…` : value;
  });
  return out;
}

function ticks(total: number) {
  const step = niceStep(total / 5);
  const out: number[] = [];
  for (let value = 0; value <= total + step / 2; value += step) out.push(value);
  return out.slice(0, 6);
}

function niceStep(raw: number) {
  if (raw <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(raw));
  const error = raw / power;
  const nice = error >= 5 ? 5 : error >= 2 ? 2 : 1;
  return nice * power;
}

function compact(value: number) {
  if (value >= 1000) {
    const scaled = value / 1000;
    return `${scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1)}k`;
  }
  return String(value);
}

function ms(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
  return `${Math.round(value)}ms`;
}

function first(spans: SpanRow[], read: (span: SpanRow) => string | undefined) {
  for (const span of spans) {
    const value = read(span);
    if (value) return value;
  }
  return "";
}
