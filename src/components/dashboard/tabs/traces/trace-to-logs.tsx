import { HugeiconsIcon } from "@/components/phosphor-icons";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  HierarchyFilesIcon,
  InformationCircleIcon,
  Loading02Icon,
  Tag01Icon,
  UngroupItemsIcon,
} from "@/components/phosphor-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { cn, formatDurationMs, formatRelativeTime } from "@/lib/utils";
import { format } from "date-fns";
import type { Span } from "@/types/dashboard";
import { fetchLogToTrace } from "@/lib/api/otlp-api";
import CustomErrorMessage from "../../shared/error-message";

interface SpanNode extends Span {
  children?: SpanNode[];
  depth: number;
}

const SERVICE_COLORS = [
  "bg-sky-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];

function serviceColor(name: string, services: string[]): string {
  const index = Math.max(0, services.indexOf(name));
  return SERVICE_COLORS[index % SERVICE_COLORS.length] ?? "bg-primary";
}

function spanStatus(span: Span): "error" | "ok" {
  return span.httpStatus >= 400 ? "error" : "ok";
}

const TraceToLogsComponent = ({
  traceId,
  projectId,
}: {
  traceId: string;
  projectId?: string;
}) => {
  const {
    data: trace,
    error,
    isLoading,
  } = useSWR(
    traceId ? `trace-${traceId}-${projectId || ""}` : null,
    () => fetchLogToTrace(traceId, projectId),
    { revalidateOnFocus: false },
  );

  const [mode, setMode] = useState<"waterfall" | "tree">("waterfall");
  const [selectedSpan, setSelectedSpan] = useState<Span | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const spans = useMemo(() => trace?.spans || [], [trace]);

  const spanTree = useMemo(() => {
    const spanMap = new Map<string, SpanNode>();
    const roots: SpanNode[] = [];
    spans.forEach((span) => {
      spanMap.set(span.spanId, { ...span, children: [], depth: 0 });
    });
    spans.forEach((span) => {
      const node = spanMap.get(span.spanId);
      if (!node) return;
      if (span.parentSpanId && spanMap.has(span.parentSpanId)) {
        const parent = spanMap.get(span.parentSpanId);
        node.depth = (parent?.depth ?? 0) + 1;
        parent?.children?.push(node);
      } else {
        roots.push(node);
      }
    });
    return roots;
  }, [spans]);

  const flatSpans = useMemo(() => {
    const list: SpanNode[] = [];
    const walk = (nodes: SpanNode[]) => {
      nodes.forEach((node) => {
        list.push(node);
        if (node.children) walk(node.children);
      });
    };
    walk(spanTree);
    return list;
  }, [spanTree]);

  const metrics = useMemo(() => {
    const services = Array.from(
      new Set(spans.map((span) => span.serviceName).filter(Boolean)),
    );
    const starts = spans.map((span) => new Date(span.startTime).getTime());
    const ends = spans.map(
      (span) => new Date(span.endTime || span.startTime).getTime(),
    );
    const minStart = starts.length ? Math.min(...starts) : Date.now();
    const maxEnd = ends.length ? Math.max(...ends) : minStart + 1;
    const totalDuration = Math.max(
      maxEnd - minStart,
      ...spans.map((span) => span.duration || 0),
      1,
    );
    return {
      services,
      minStart,
      totalDuration,
      spanCount: spans.length,
      serviceCount: services.length,
      errorCount: spans.filter((span) => span.httpStatus >= 400).length,
    };
  }, [spans]);

  useEffect(() => {
    if (spanTree.length > 0) {
      setExpandedNodes(new Set(spanTree.map((node) => node.spanId)));
    }
  }, [spanTree]);

  const toggleNodeExpansion = useCallback((spanId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(spanId)) next.delete(spanId);
      else next.add(spanId);
      return next;
    });
  }, []);

  const TreeNode = ({ node }: { node: SpanNode }) => {
    const isExpanded = expandedNodes.has(node.spanId);
    const isSelected = selectedSpan?.spanId === node.spanId;
    const hasChildren = Boolean(node.children?.length);
    return (
      <div>
        <button
          type="button"
          onClick={() => setSelectedSpan(node)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors",
            isSelected ? "bg-pg-group" : "hover:bg-pg-group/70",
          )}
          style={{ paddingLeft: 8 + node.depth * 18 }}
        >
          <span
            className="flex h-5 w-5 items-center justify-center"
            onClick={(event) => hasChildren && toggleNodeExpansion(node.spanId, event)}
          >
            {hasChildren ? (
              <HugeiconsIcon
                icon={isExpanded ? ArrowDown01Icon : ArrowRight01Icon}
                className="h-3.5 w-3.5 text-pg-muted"
              />
            ) : (
              <span className={cn("h-1.5 w-1.5 rounded-full", serviceColor(node.serviceName, metrics.services))} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium">{node.name}</span>
            <span className="block truncate text-[10px] text-pg-muted">
              {node.serviceName}
              {node.httpMethod ? ` · ${node.httpMethod}` : ""}
              {node.httpUrl ? ` ${node.httpUrl}` : ""}
            </span>
          </span>
          <span className="shrink-0 font-mono text-[11px] text-pg-muted">
            {formatDurationMs(node.duration)}
          </span>
          {node.httpStatus ? (
            <Badge
              className={cn(
                "border-none py-0 text-[10px] shadow-none",
                spanStatus(node) === "error"
                  ? "bg-red-500/10 text-red-600"
                  : "bg-emerald-500/10 text-emerald-600",
              )}
            >
              {node.httpStatus}
            </Badge>
          ) : null}
        </button>
        {isExpanded && hasChildren
          ? node.children?.map((child) => <TreeNode key={child.spanId} node={child} />)
          : null}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <HugeiconsIcon icon={Loading02Icon} className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) return <CustomErrorMessage error="Failed to fetch trace data." />;
  if (!trace || spans.length === 0) {
    return <div className="p-6 text-xs text-muted-foreground">No spans available.</div>;
  }

  return (
    <Card className="rounded-lg border border-border bg-card text-foreground shadow-none">
      <CardHeader className="space-y-4 border-b border-border/50 p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Spans", value: metrics.spanCount },
            { label: "Services", value: metrics.serviceCount },
            { label: "Duration", value: formatDurationMs(metrics.totalDuration) },
            { label: "Failed", value: metrics.errorCount },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-pg-group px-3 py-2">
              <p className="text-[10px] text-pg-muted">{item.label}</p>
              <p className="mt-1 text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-1.5">
          <Button
            onClick={() => setMode("waterfall")}
            variant={mode === "waterfall" ? "default" : "outline"}
            className="h-8 text-xs shadow-none"
          >
            <HugeiconsIcon icon={HierarchyFilesIcon} className="mr-1.5 h-3.5 w-3.5" />
            Waterfall
          </Button>
          <Button
            onClick={() => setMode("tree")}
            variant={mode === "tree" ? "default" : "outline"}
            className="h-8 text-xs shadow-none"
          >
            <HugeiconsIcon icon={UngroupItemsIcon} className="mr-1.5 h-3.5 w-3.5" />
            Tree
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {mode === "waterfall" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] text-pg-muted">
              <span>0 ms</span>
              <span>{formatDurationMs(metrics.totalDuration)}</span>
            </div>
            <div className="space-y-1.5">
              {flatSpans.map((span) => {
                const start = new Date(span.startTime).getTime();
                const offset = ((start - metrics.minStart) / metrics.totalDuration) * 100;
                const width = Math.max((span.duration / metrics.totalDuration) * 100, 1.5);
                return (
                  <button
                    type="button"
                    key={span.spanId}
                    onClick={() => setSelectedSpan(span)}
                    className={cn(
                      "grid w-full grid-cols-[minmax(140px,28%)_1fr_auto] items-center gap-3 rounded-lg px-2 py-1.5 text-left",
                      selectedSpan?.spanId === span.spanId ? "bg-pg-group" : "hover:bg-pg-group/60",
                    )}
                  >
                    <span className="min-w-0" style={{ paddingLeft: span.depth * 12 }}>
                      <span className="block truncate text-xs font-medium">{span.name}</span>
                      <span className="block truncate text-[10px] text-pg-muted">
                        {span.serviceName}
                      </span>
                    </span>
                    <span className="relative h-5 overflow-hidden rounded-md bg-pg-surface">
                      <span
                        className={cn(
                          "absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full",
                          spanStatus(span) === "error" ? "bg-red-500" : serviceColor(span.serviceName, metrics.services),
                        )}
                        style={{ left: `${Math.min(offset, 98)}%`, width: `${Math.min(width, 100 - offset)}%` }}
                      />
                    </span>
                    <span className="w-16 text-right font-mono text-[11px] text-pg-muted">
                      {formatDurationMs(span.duration)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {spanTree.map((node) => (
              <TreeNode key={node.spanId} node={node} />
            ))}
          </div>
        )}
      </CardContent>

      <Sheet open={!!selectedSpan} onOpenChange={() => setSelectedSpan(null)}>
        <SheetContent className="overflow-y-auto p-6">
          {selectedSpan ? (
            <div className="space-y-5">
              <SheetHeader className="p-0 pb-4">
                <SheetTitle className="flex items-center gap-1.5 text-sm font-semibold">
                  <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4 text-primary" />
                  Span details
                </SheetTitle>
              </SheetHeader>
              <div>
                <h2 className="text-sm font-semibold">{selectedSpan.name}</h2>
                <p className="mt-1 text-xs text-pg-muted">{selectedSpan.serviceName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-pg-group p-3">
                  <p className="text-[10px] text-pg-muted">Duration</p>
                  <p className="mt-1 font-mono">{formatDurationMs(selectedSpan.duration)}</p>
                </div>
                <div className="rounded-lg bg-pg-group p-3">
                  <p className="text-[10px] text-pg-muted">When</p>
                  <p className="mt-1">{formatRelativeTime(selectedSpan.startTime)}</p>
                </div>
                <div className="rounded-lg bg-pg-group p-3">
                  <p className="text-[10px] text-pg-muted">Request</p>
                  <p className="mt-1 break-all font-mono">
                    {selectedSpan.httpMethod
                      ? `${selectedSpan.httpMethod} ${selectedSpan.httpUrl || ""}`
                      : "—"}
                  </p>
                </div>
                <div className="rounded-lg bg-pg-group p-3">
                  <p className="text-[10px] text-pg-muted">Status</p>
                  <p className="mt-1">{selectedSpan.httpStatus || "OK"}</p>
                </div>
              </div>
              <p className="text-[10px] text-pg-muted">
                Started {format(new Date(selectedSpan.startTime), "MMM d, h:mmaaa")}
              </p>
              {Object.keys(selectedSpan.attributes || {}).length > 0 ? (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
                    <HugeiconsIcon icon={Tag01Icon} className="h-3.5 w-3.5" />
                    Attributes
                  </p>
                  <div className="space-y-2">
                    {Object.entries(selectedSpan.attributes).map(([key, value]) => (
                      <div key={key} className="rounded-lg bg-pg-group px-3 py-2">
                        <p className="text-[10px] text-pg-muted">{key}</p>
                        <p className="mt-0.5 break-all font-mono text-xs">{String(value ?? "—")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </Card>
  );
};

export default TraceToLogsComponent;
