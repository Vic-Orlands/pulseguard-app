import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  Server,
  BarChart3,
  Workflow,
  ArrowRight,
  ListTree,
  Ungroup,
  ChevronRight,
  Info,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Span } from "@/types/dashboard";
import { fetchLogToTrace } from "@/lib/api/otlp-api";
import CustomErrorMessage from "../shared/error-message";

// Type definitions
interface SpanNode extends Span {
  children?: SpanNode[];
}

const TraceToLogsComponent = ({ traceId }: { traceId: string }) => {
  const {
    data: trace,
    error,
    isLoading,
  } = useSWR(
    traceId ? `trace-${traceId}` : null,
    () => fetchLogToTrace(traceId),
    {
      revalidateOnFocus: false,
    }
  );

  const [breadcrumbPath, setBreadcrumbPath] = useState<Span[]>([]);
  const [mode, setMode] = useState<"waterfall" | "tree">("waterfall");
  const [selectedSpan, setSelectedSpan] = useState<Span | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedTreeSpan, setSelectedTreeSpan] = useState<Span | null>(null);

  const spans = useMemo(() => trace?.spans || [], [trace]);

  // Memoized tree structure for spans
  const spanTree = useMemo(() => {
    const spanMap = new Map<string, SpanNode>();
    const roots: SpanNode[] = [];

    spans.forEach((span) => {
      spanMap.set(span.spanId, { ...span, children: [] });
    });

    spans.forEach((span) => {
      if (span.parentSpanId && spanMap.has(span.parentSpanId)) {
        spanMap
          .get(span.parentSpanId)
          ?.children?.push(spanMap.get(span.spanId)!);
      } else {
        roots.push(spanMap.get(span.spanId)!);
      }
    });

    return roots;
  }, [spans]);

  // Memoized metrics
  const metrics = useMemo(() => {
    const services = Array.from(
      new Set(spans.map((s) => s.serviceName).filter(Boolean))
    );
    const maxDuration = Math.max(...spans.map((s) => s.duration || 0));
    const startTimes = spans.map((s) => new Date(s.startTime).getTime());
    const minStartTime = Math.min(...startTimes);

    return {
      services,
      maxDuration,
      minStartTime,
      totalDuration: spans[0]?.duration.toFixed(2) || 0,
      spanCount: spans.length,
      serviceCount: services.length,
    };
  }, [spans]);

  useEffect(() => {
    if (spanTree.length > 0) {
      const rootIds = spanTree.map((node) => node.spanId);
      setExpandedNodes(new Set(rootIds));
    }
  }, [spanTree]);

  // Breadcrumb navigation
  const updateBreadcrumbs = useCallback(
    (span: Span) => {
      const path: Span[] = [];
      let current: Span | undefined = span;
      while (current) {
        path.unshift(current);
        current = spans.find((s) => s.spanId === current?.parentSpanId);
      }
      setBreadcrumbPath(path);
    },
    [spans]
  );

  const handleSpanSelect = useCallback(
    (span: Span) => {
      setSelectedSpan(span);
      updateBreadcrumbs(span);
    },
    [updateBreadcrumbs]
  );

  const handleTreeSpanSelect = useCallback(
    (span: Span) => {
      setSelectedTreeSpan(span);
      updateBreadcrumbs(span);
    },
    [updateBreadcrumbs]
  );

  const toggleNodeExpansion = useCallback((spanId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(spanId)) {
        newSet.delete(spanId);
      } else {
        newSet.add(spanId);
      }
      return newSet;
    });
  }, []);

  // Tree View Component - Memoized to prevent re-renders
  const TreeNode = React.memo(
    ({ node, level = 0 }: { node: SpanNode; level?: number }) => {
      const isExpanded = expandedNodes.has(node.spanId);
      const isSelected = selectedTreeSpan?.spanId === node.spanId;
      const hasChildren = node.children && node.children.length > 0;

      return (
        <div className="ml-4">
          <div
            className={cn(
              "flex items-center p-3 rounded-xl cursor-pointer hover:bg-gray-800/50 transition-all duration-200 border",
              isSelected
                ? "bg-cyan-900/50 border-cyan-500/70 shadow-lg shadow-cyan-500/20"
                : "border-transparent hover:border-gray-600/50"
            )}
            style={{ marginLeft: `${level * 20}px` }}
            onClick={() => handleTreeSpanSelect(node)}
          >
            <Button
              variant="ghost"
              className="p-0 h-auto w-4 mr-2"
              onClick={(e) => {
                e.stopPropagation();
                if (hasChildren) {
                  toggleNodeExpansion(node.spanId);
                }
              }}
              disabled={!hasChildren}
            >
              <ChevronRight
                className={cn(
                  "w-4 h-4 transition-transform",
                  hasChildren ? "text-cyan-400" : "text-gray-500",
                  isExpanded && "rotate-90"
                )}
              />
            </Button>
            <div className="flex-1 flex items-center justify-between">
              <div className="flex flex-col">
                <span
                  className={cn(
                    "font-medium text-sm",
                    isSelected ? "text-cyan-200" : "text-white"
                  )}
                >
                  {node.name}
                </span>
                <span className="text-xs text-gray-400">
                  {node.serviceName}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    "text-sm font-mono",
                    isSelected ? "text-cyan-300" : "text-cyan-400"
                  )}
                >
                  {node.duration.toFixed(2)}ms
                </span>
                {node.httpStatus && (
                  <Badge
                    className={cn(
                      "ml-2 text-xs",
                      node.httpStatus >= 400
                        ? "bg-red-600/20 text-red-400 border-red-500/30"
                        : "bg-green-600/20 text-green-400 border-green-500/30"
                    )}
                  >
                    {node.httpStatus}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {isExpanded &&
            hasChildren &&
            node.children?.map((child) => (
              <TreeNode key={child.spanId} node={child} level={level + 1} />
            ))}
        </div>
      );
    }
  );
  TreeNode.displayName = "TreeNode";

  // Span Card Component for Waterfall View - Memoized
  const SpanCard = memo(({ span }: { span: Span }) => {
    return (
      <Card
        className="bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50 cursor-pointer transition-all duration-200 mb-2"
        onClick={() => handleSpanSelect(span)}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-white font-semibold text-base">
                {span.name}
              </div>
              <div className="text-sm text-gray-400">{span.serviceName}</div>
            </div>
            <div className="text-right">
              <div className="text-cyan-400 font-bold text-base">
                {span.duration.toFixed(2)} ms
              </div>
              <Badge
                className={cn(
                  "ml-2 bg-green-600/20 text-green-400",
                  span.httpStatus >= 400 && "bg-red-600/20 text-red-400"
                )}
              >
                {span.httpStatus || "OK"}
              </Badge>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded h-2">
            <div
              className="h-2 rounded"
              style={{
                width: `${Math.min(
                  (span.duration / metrics.maxDuration) * 100,
                  100
                )}%`,
                background:
                  span.httpStatus >= 400
                    ? "#ff4d4f"
                    : "linear-gradient(to right, #00f0ff, #00b4d8)",
              }}
            />
          </div>
          {span.attributes && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-300">
              {Object.entries(span.attributes).map(([key, val]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-500">{key}</span>
                  <span className="font-mono text-right">
                    {String(val || "-")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  });
  SpanCard.displayName = "SpanCard";

  // Waterfall Timeline Component - Memoized
  const WaterfallTimeline = useMemo(() => {
    return (
      <div className="relative">
        <div className="h-10 bg-gray-900 flex items-center px-4 text-sm font-medium text-gray-300 border-b border-gray-700/30 rounded-t-lg">
          Timeline (ms)
        </div>
        <div className="space-y-2 p-4">
          {spans.map((span) => (
            <SpanCard key={span.spanId} span={span} />
          ))}
        </div>
      </div>
    );
  }, [spans, metrics.maxDuration]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error) <CustomErrorMessage error="Failed to fetch trace data." />;

  if (!trace || spans.length === 0) {
    return <div className="p-6 text-gray-300">No spans available.</div>;
  }

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl text-white">
      <CardHeader>
        {/* Breadcrumbs */}
        {breadcrumbPath.length > 0 && (
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              {breadcrumbPath.map((span, i) => (
                <React.Fragment key={span.spanId}>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
                      onClick={() => handleSpanSelect(span)}
                    >
                      {span.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {i < breadcrumbPath.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-3 gap-6 mb-4">
          {[
            {
              label: "Services",
              value: metrics.serviceCount,
              icon: <Server className="w-6 h-6 text-blue-400" />,
              theme:
                "bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/20",
              color: "blue",
            },
            {
              label: "Spans",
              value: metrics.spanCount,
              icon: <BarChart3 className="w-6 h-6 text-yellow-400" />,
              theme:
                "bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-yellow-500/20",
              color: "yellow",
            },
            {
              label: "Duration",
              value: `${metrics.totalDuration} ms`,
              icon: <ChevronRight className="w-6 h-6 text-green-400" />,
              theme:
                "bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/20",
              color: "green",
            },
          ].map((metric) => (
            <Card
              key={metric.label}
              className={`${metric.theme} backdrop-blur-lg hover:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-shadow`}
            >
              <CardContent className="flex items-center h-full justify-between">
                <div>
                  <p className={`text-sm font-medium text-${metric.color}-300`}>
                    {metric.label}
                  </p>
                  <p className={`text-3xl font-bold text-${metric.color}-400`}>
                    {metric.value}
                  </p>
                </div>
                <div className={`p-3 bg-${metric.color}-500/20 rounded-lg`}>
                  {metric.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toggle Mode */}
        <div className="flex justify-end items-center gap-3">
          <Button
            onClick={() => setMode("waterfall")}
            variant={mode === "waterfall" ? "default" : "secondary"}
            className="flex items-center gap-2"
          >
            <ListTree className="w-4 h-4" />
            Waterfall
          </Button>
          <Button
            onClick={() => setMode("tree")}
            variant={mode === "tree" ? "default" : "secondary"}
            className="flex items-center gap-2"
          >
            <Ungroup className="w-4 h-4" />
            Tree
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Main Visualization */}
        {mode === "waterfall" && (
          <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-white">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                Span Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>{WaterfallTimeline}</CardContent>
          </Card>
        )}

        {mode === "tree" && (
          <Card className="bg-gray-800/30 border-gray-700/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-white">
                <Ungroup className="w-6 h-6 text-purple-400" />
                Span Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {spanTree.map((node) => (
                <TreeNode key={node.spanId} node={node} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Service Dependency Map */}
        <Card className="mt-10 bg-gray-800/30 border-gray-700/50 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2 text-white">
              <Workflow className="w-6 h-6 text-pink-400" />
              Service Dependency Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-6">
              {metrics.services.map((svc, i) => (
                <React.Fragment key={svc}>
                  <div className="flex items-center gap-3 hover:scale-105 transition-transform">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                      <Server className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-cyan-300 text-base font-medium">
                      {svc}
                    </span>
                  </div>
                  {i < metrics.services.length - 1 && (
                    <ArrowRight className="text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </CardContent>

      {/* Span Details Sheet */}
      <Sheet open={!!selectedSpan} onOpenChange={() => setSelectedSpan(null)}>
        <SheetContent className="sm:w-[60%] bg-slate-900 border-slate-700 overflow-y-auto">
          {selectedSpan && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Info className="w-6 h-6" />
                  Span Details
                </SheetTitle>
              </SheetHeader>

              <div className="p-6 pt-0 space-y-8">
                {/* Basic Information Section */}
                <section>
                  <h3 className="text-lg font-semibold mb-4 text-cyan-300">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard label="Name" value={selectedSpan.name} />
                    <InfoCard
                      label="Service"
                      value={selectedSpan.serviceName}
                    />
                    <InfoCard label="Span ID" value={selectedSpan.spanId} />
                    <InfoCard label="Trace ID" value={selectedSpan.traceId} />
                  </div>
                </section>

                {/* Timing Information Section */}
                <section>
                  <h3 className="text-lg font-semibold mb-4 text-cyan-300">
                    Timing Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoCard
                      label="Duration"
                      value={`${selectedSpan.duration.toFixed(2)} ms`}
                    />
                    <InfoCard
                      label="Start Time"
                      value={format(
                        selectedSpan.startTime,
                        "MMM dd, yyyy | h:mmaaa"
                      )}
                    />
                    <InfoCard
                      label="End Time"
                      value={format(
                        selectedSpan.endTime,
                        "MMM dd, yyyy | h:mmaaa"
                      )}
                    />
                  </div>
                </section>

                {/* HTTP Information Section */}
                <section>
                  <h3 className="text-lg font-semibold mb-4 text-cyan-300">
                    HTTP Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      label="Request"
                      value={
                        selectedSpan.httpMethod && selectedSpan.httpUrl
                          ? `${selectedSpan.httpMethod} ${selectedSpan.httpUrl}`
                          : "-"
                      }
                    />
                    <InfoCard
                      label="Status"
                      value={selectedSpan.httpStatus || "OK"}
                    />
                    <InfoCard
                      label="Route"
                      value={selectedSpan.attributes["next.route"] || "-"}
                    />
                    <InfoCard
                      label="Span Type"
                      value={selectedSpan.attributes["next.span_type"] || "-"}
                    />
                  </div>
                </section>

                {/* Custom Attributes Section */}
                {(() => {
                  const customAttributes = Object.entries(
                    selectedSpan.attributes || {}
                  ).filter(([key]) => !key.startsWith("next."));

                  if (customAttributes.length === 0) return null;

                  return (
                    <section>
                      <h3 className="text-lg font-semibold mb-4 text-cyan-300">
                        Custom Attributes
                      </h3>
                      <Separator className="mb-4" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customAttributes.map(([key, val]) => (
                          <InfoCard
                            key={key}
                            label={key}
                            value={String(val ?? "-")}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })()}

                {/* Resources Section */}
                <section>
                  <h3 className="text-lg font-semibold mb-4 text-cyan-300">
                    Resources
                  </h3>
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedSpan.resources).map(
                      ([key, val]) => (
                        <InfoCard
                          key={key}
                          label={key}
                          value={String(val ?? "-")}
                        />
                      )
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
};

export default TraceToLogsComponent;

const InfoCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) => (
  <Card className="bg-gray-800/30 border-gray-700/50">
    <CardContent className="p-4">
      <div className="text-sm text-gray-400 font-medium mb-1">{label}</div>
      <div className="text-base text-white font-mono break-all">{value}</div>
    </CardContent>
  </Card>
);
