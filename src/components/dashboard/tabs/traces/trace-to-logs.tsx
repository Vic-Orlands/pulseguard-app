import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  Server,
  BarChart3,
  Workflow,
  ArrowRight,
  ListTree,
  Ungroup,
  ChevronRight,
  ChevronDown,
  Info,
  Loader2,
  LucideProps,
  Clock,
  Globe,
  Tag,
  Database,
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
import CustomErrorMessage from "../../shared/error-message";

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
      setSelectedSpan(span); // Also set for the detail sheet
      updateBreadcrumbs(span);
    },
    [updateBreadcrumbs]
  );

  const toggleNodeExpansion = useCallback(
    (spanId: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(spanId)) {
          newSet.delete(spanId);
        } else {
          newSet.add(spanId);
        }
        return newSet;
      });
    },
    []
  );

  // Tree View Component - Fixed clicking and expansion issues
  const TreeNode = React.memo(
    ({ node, level = 0 }: { node: SpanNode; level?: number }) => {
      const isExpanded = expandedNodes.has(node.spanId);
      const isSelected = selectedTreeSpan?.spanId === node.spanId;
      const hasChildren = node.children && node.children.length > 0;

      const handleNodeClick = useCallback(
        (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          handleTreeSpanSelect(node);
        },
        [node]
      );

      const handleToggleClick = useCallback(
        (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (hasChildren) {
            toggleNodeExpansion(node.spanId, e);
          }
        },
        [node.spanId, hasChildren]
      );

      return (
        <div className="select-none">
          <div
            className={cn(
              "flex items-center p-3 rounded-lg cursor-pointer border-l-4 ml-2",
              level > 0 && "ml-6",
              isSelected
                ? "bg-cyan-900/40 border-l-cyan-400 shadow-lg shadow-cyan-500/10"
                : "border-1 border-gray-800 hover:bg-gray-800/30"
            )}
            style={{
              marginLeft: `${level * 24 + 20}px`,
              position: "relative",
            }}
            onMouseDown={handleNodeClick}
          >
            {/* Connection lines for better visual hierarchy */}
            {level > 0 && (
              <>
                <div
                  className="absolute border-l bg-cyan-400/30 border-cyan-400/30"
                  style={{
                    left: `-${level * 24 - 6}px`,
                    top: "0",
                    height: "100%",
                  }}
                />
                <div
                  className="absolute border-t bg-cyan-400/30 border-cyan-400/30"
                  style={{
                    left: `-${level * 24 - 6}px`,
                    top: "50%",
                    width: "20px",
                  }}
                />
              </>
            )}

            {/* Expand/Collapse Button */}
            <div
              className={cn(
                "w-6 h-6 flex items-center justify-center rounded-sm mr-3 transition-colors",
                hasChildren
                  ? "hover:bg-gray-700/50 cursor-pointer"
                  : "cursor-default"
              )}
              onMouseDown={handleToggleClick}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-cyan-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                )
              ) : (
                <div className="w-2 h-2 rounded-full bg-gray-500/50" />
              )}
            </div>

            <div className="flex-1 flex items-center justify-between min-w-0">
              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className={cn(
                    "font-medium text-sm truncate",
                    isSelected ? "text-cyan-200" : "text-white"
                  )}
                  title={node.name}
                >
                  {node.name}
                </span>
                <span
                  className="text-xs text-gray-400 truncate"
                  title={node.serviceName}
                >
                  {node.serviceName}
                </span>
              </div>
              <div className="text-right flex items-center gap-2 ml-4 flex-shrink-0">
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
                      "text-xs px-2 py-0.5",
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

          {/* Children */}
          {isExpanded && hasChildren && (
            <div className="mt-1 space-y-1">
              {node.children?.map((child) => (
                <TreeNode key={child.spanId} node={child} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      );
    }
  );
  TreeNode.displayName = "TreeNode";

  // Span Card Component for Waterfall View - Improved indentation design
  const SpanCard = memo(
    ({ span, level = 0 }: { span: Span; level?: number }) => {
      return (
        <div className="relative" style={{ marginLeft: `${level * 32}px` }}>
          {/* Connection lines for hierarchy visualization */}
          {level > 0 && (
            <>
              <div
                className="absolute border-l-2 border-gray-600/30"
                style={{
                  left: `-${level * 32 - 16}px`,
                  top: "0",
                  height: "100%",
                }}
              />
              <div
                className="absolute border-t-2 border-gray-600/30"
                style={{
                  left: `-${level * 32 - 16}px`,
                  top: "50%",
                  width: "24px",
                }}
              />
            </>
          )}

          <Card
            className={cn(
              "bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50 cursor-pointer transition-all duration-200 mb-3 relative overflow-hidden",
              level > 0 && "border-l-4 border-l-cyan-500/30"
            )}
            onClick={() => handleSpanSelect(span)}
          >
            {/* Gradient accent for depth */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none"
              style={{ opacity: Math.min(level * 0.1, 0.3) }}
            />

            <CardContent className="relative z-10">
              <div className="flex justify-between items-center mb-3">
                <div className="min-w-0 flex-1">
                  <div
                    className="text-white font-semibold text-base truncate"
                    title={span.name}
                  >
                    {span.name}
                  </div>
                  <div
                    className="text-sm text-gray-400 truncate"
                    title={span.serviceName}
                  >
                    {span.serviceName}
                  </div>
                </div>
                <div className="text-right flex items-center gap-3 ml-4 flex-shrink-0">
                  <div className="text-cyan-400 font-bold text-base">
                    {span.duration.toFixed(2)} ms
                  </div>
                  <Badge
                    className={cn(
                      "bg-green-600/20 text-green-400 border-green-500/30",
                      span.httpStatus >= 400 &&
                        "bg-red-600/20 text-red-400 border-red-500/30"
                    )}
                  >
                    {span.httpStatus || "OK"}
                  </Badge>
                </div>
              </div>

              {/* Duration bar */}
              <div className="w-full bg-gray-700/50 rounded-full h-2 mb-3">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      (span.duration / metrics.maxDuration) * 100,
                      100
                    )}%`,
                    background:
                      span.httpStatus >= 400
                        ? "linear-gradient(to right, #ff4d4f, #ff7875)"
                        : "linear-gradient(to right, #00f0ff, #00b4d8)",
                  }}
                />
              </div>

              {/* Key attributes */}
              {span.attributes && Object.keys(span.attributes).length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                  {Object.entries(span.attributes)
                    .slice(0, 4)
                    .map(([key, val]) => (
                      <div key={key} className="flex justify- truncate">
                        <span className="text-gray-500 truncate" title={key}>
                          {key}:
                        </span>
                        <span
                          className="font-mono text-right truncate ml-2"
                          title={String(val || "-")}
                        >
                          {String(val || "-")}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }
  );
  SpanCard.displayName = "SpanCard";

  // Waterfall Timeline Component - Improved hierarchy visualization
  const WaterfallTimeline = useMemo(() => {
    // Build hierarchy map
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

    // Render hierarchy recursively
    const renderSpanHierarchy = (
      nodes: SpanNode[],
      level = 0
    ): React.ReactNode[] => {
      return nodes.flatMap((node) => [
        <SpanCard key={node.spanId} span={node} level={level} />,
        ...(node.children ? renderSpanHierarchy(node.children, level + 1) : []),
      ]);
    };

    return (
      <div className="relative">
        <div className="px-6 bg-gray-900/30">{renderSpanHierarchy(roots)}</div>
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

  if (error) return <CustomErrorMessage error="Failed to fetch trace data." />;

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
            <CardContent className="p-0">{WaterfallTimeline}</CardContent>
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
            <CardContent className="pl-0">
              <div>
                {spanTree.map((node) => (
                  <TreeNode key={node.spanId} node={node} />
                ))}
              </div>
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
        <SheetContent className="sm:w-[64%] bg-slate-900 border-slate-700 overflow-y-auto">
          {selectedSpan ? (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Info className="w-6 h-6" />
                  Span Details
                </SheetTitle>
              </SheetHeader>

              <div className="p-6 pt-0 space-y-8">
                {/* Header Section with timing info */}
                <section className="flex justify-between items-start mb-8 bg-slate-800/30 border border-slate-700 rounded-xl p-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedSpan.name}
                    </h2>
                    <p className="text-slate-400">{selectedSpan.serviceName}</p>
                  </div>

                  {/* Timing Panel */}
                  <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-700/50 rounded-xl p-4 min-w-[280px]">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-400 font-semibold">
                        Timing
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">
                          Duration:
                        </span>
                        <span className="text-blue-300 font-mono font-semibold">
                          {selectedSpan.duration.toFixed(2)} ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Started:</span>
                        <span className="text-slate-300 font-mono text-xs">
                          {format(
                            selectedSpan.startTime,
                            "MMM dd, yyyy | h:mmaaa"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300 text-sm">Ended:</span>
                        <span className="text-slate-300 font-mono text-xs">
                          {format(
                            selectedSpan.endTime,
                            "MMM dd, yyyy | h:mmaaa"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Main Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <section className="bg-slate-800/20 border border-slate-700 rounded-xl p-6">
                      <SectionHeader
                        title="Basic Information"
                        icon={Server}
                        color="text-emerald-400"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard label="Span ID" value={selectedSpan.spanId} />
                        <InfoCard
                          label="Trace ID"
                          value={selectedSpan.traceId}
                        />
                      </div>
                    </section>

                    {/* HTTP Information */}
                    <section className="bg-slate-800/20 border border-slate-700 rounded-xl p-6">
                      <SectionHeader
                        title="HTTP Information"
                        icon={Globe}
                        color="text-orange-400"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                          label="Status"
                          value={selectedSpan.httpStatus || "OK"}
                        />
                        <InfoCard
                          label="Request"
                          value={
                            selectedSpan.httpMethod && selectedSpan.httpUrl
                              ? `${selectedSpan.httpMethod} ${selectedSpan.httpUrl}`
                              : "-"
                          }
                        />
                        <InfoCard
                          label="Route"
                          value={selectedSpan.attributes["next.route"] || "-"}
                        />
                        <InfoCard
                          label="Span Type"
                          value={
                            selectedSpan.attributes["next.span_type"] || "-"
                          }
                        />
                      </div>
                    </section>

                    {/* Custom Attributes */}
                    {(() => {
                      const customAttributes = Object.entries(
                        selectedSpan.attributes || {}
                      ).filter(([key]) => !key.startsWith("next."));

                      if (customAttributes.length === 0) return null;

                      return (
                        <section className="bg-slate-800/20 border border-slate-700 rounded-xl p-6">
                          <SectionHeader
                            title="Custom Attributes"
                            icon={Tag}
                            color="text-purple-400"
                          />

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
                  </div>

                  {/* Right Column - Resources */}
                  <div className="space-y-6">
                    <section className="bg-slate-800/20 border border-slate-700 rounded-xl p-6">
                      <SectionHeader
                        title="Resources"
                        icon={Database}
                        color="text-cyan-400"
                      />
                      <div className="space-y-3">
                        {Object.entries(selectedSpan.resources).map(
                          ([key, val]) => (
                            <div
                              key={key}
                              className="border-b border-slate-700/50 pb-3 last:border-0 last:pb-0"
                            >
                              <div className="text-xs font-medium text-slate-400 mb-1">
                                {key}
                              </div>
                              <div className="text-sm text-white font-mono break-all">
                                {String(val ?? "-")}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </section>
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="min-h-screen bg-slate-900 p-6 flex items-center justify-center">
              <div className="text-slate-400">No span selected</div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
};

export default TraceToLogsComponent;

// resuable components
const InfoCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ComponentType<LucideProps>;
}) => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/70 transition-colors">
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      <span className="text-sm font-medium text-slate-400">{label}</span>
    </div>
    <div className="text-white font-mono text-sm break-all">{value}</div>
  </div>
);

const SectionHeader = ({
  title,
  icon: Icon,
  color = "text-slate-300",
}: {
  title: string;
  icon: React.ComponentType<LucideProps>;
  color: string;
}) => (
  <div className="flex items-center gap-2 mb-4">
    {Icon && <Icon className={`w-5 h-5 ${color}`} />}
    <h3 className={`text-lg font-semibold ${color}`}>{title}</h3>
  </div>
);
