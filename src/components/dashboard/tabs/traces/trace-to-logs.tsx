import { HugeiconsIcon } from "@/components/phosphor-icons";
import { ArrowDown01Icon, ArrowRight01Icon, BarChartIcon, Clock01Icon, DatabaseIcon, GlobeIcon, HierarchyFilesIcon, InformationCircleIcon, Loading02Icon, Tag01Icon, UngroupItemsIcon, WorkflowCircle01Icon } from "@/components/phosphor-icons";
import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  Server,
} from "@/components/phosphor-icons";
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

  // Tree View Component
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
              "flex items-center p-2.5 rounded-lg cursor-pointer ml-2 border",
              level > 0 && "ml-6",
              isSelected
                ? "bg-primary text-primary-foreground font-semibold border-primary"
                : "border-border hover:bg-muted/50 text-foreground"
            )}
            style={{
              marginLeft: `${level * 24 + 20}px`,
              position: "relative",
            }}
            onMouseDown={handleNodeClick}
          >
            {/* Connection lines */}
            {level > 0 && (
              <>
                <div
                  className="absolute border-l border-border"
                  style={{
                    left: `-${level * 24 - 6}px`,
                    top: "0",
                    height: "100%",
                  }}
                />
                <div
                  className="absolute border-t border-border"
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
                  ? "hover:bg-muted cursor-pointer"
                  : "cursor-default"
              )}
              onMouseDown={handleToggleClick}
            >
              {hasChildren ? (
                isExpanded ? (
                  <HugeiconsIcon icon={ArrowDown01Icon} className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5 text-muted-foreground" />
                )
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
              )}
            </div>

            <div className="flex-1 flex items-center justify-between min-w-0">
              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className={cn(
                    "font-semibold text-xs truncate",
                    isSelected ? "text-primary-foreground" : "text-foreground"
                  )}
                  title={node.name}
                >
                  {node.name}
                </span>
                <span
                  className={cn(
                    "text-[10px] truncate",
                    isSelected ? "text-primary-foreground/75" : "text-muted-foreground"
                  )}
                  title={node.serviceName}
                >
                  {node.serviceName}
                </span>
              </div>
              <div className="text-right flex items-center gap-2 ml-4 flex-shrink-0">
                <span
                  className={cn(
                    "text-xs font-mono font-medium",
                    isSelected ? "text-primary-foreground/90" : "text-primary"
                  )}
                >
                  {node.duration.toFixed(2)}ms
                </span>
                {node.httpStatus && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-2 py-0.5 border-none shadow-none",
                      node.httpStatus >= 400
                        ? "bg-red-500/10 text-red-600"
                        : "bg-emerald-500/10 text-emerald-600",
                      isSelected && (node.httpStatus >= 400 ? "bg-red-500/30 text-white" : "bg-emerald-500/30 text-white")
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

  // Span Card Component for Waterfall View
  const SpanCard = memo(
    ({ span, level = 0 }: { span: Span; level?: number }) => {
      return (
        <div className="relative" style={{ marginLeft: `${level * 32}px` }}>
          {/* Connection lines */}
          {level > 0 && (
            <>
              <div
                className="absolute border-l border-border"
                style={{
                  left: `-${level * 32 - 16}px`,
                  top: "0",
                  height: "100%",
                }}
              />
              <div
                className="absolute border-t border-border"
                style={{
                  left: `-${level * 32 - 16}px`,
                  top: "50%",
                  width: "24px",
                }}
              />
            </>
          )}

          <Card
            className="bg-card border border-border hover:bg-muted cursor-pointer transition-all duration-200 mb-3 relative overflow-hidden shadow-none rounded-lg"
            onClick={() => handleSpanSelect(span)}
          >
            <CardContent className="p-4 relative z-10">
              <div className="flex justify-between items-center mb-3">
                <div className="min-w-0 flex-1">
                  <div
                    className="text-foreground font-semibold text-xs truncate"
                    title={span.name}
                  >
                    {span.name}
                  </div>
                  <div
                    className="text-[10px] text-muted-foreground truncate"
                    title={span.serviceName}
                  >
                    {span.serviceName}
                  </div>
                </div>
                <div className="text-right flex items-center gap-3 ml-4 flex-shrink-0">
                  <div className="text-primary font-semibold text-xs">
                    {span.duration.toFixed(2)} ms
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "bg-emerald-500/10 text-emerald-600 border-none shadow-none text-[10px] py-0.5",
                      span.httpStatus >= 400 &&
                        "bg-red-500/10 text-red-600"
                    )}
                  >
                    {span.httpStatus || "OK"}
                  </Badge>
                </div>
              </div>

              {/* Duration bar */}
              <div className="w-full bg-muted border border-border rounded-full h-1.5 mb-3">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    span.httpStatus >= 400 ? "bg-red-500" : "bg-primary"
                  )}
                  style={{
                    width: `${Math.min(
                      (span.duration / metrics.maxDuration) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>

              {/* Key attributes */}
              {span.attributes && Object.keys(span.attributes).length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                  {Object.entries(span.attributes)
                    .slice(0, 4)
                    .map(([key, val]) => (
                      <div key={key} className="flex justify-start truncate">
                        <span className="text-muted-foreground font-medium truncate" title={key}>
                          {key}:
                        </span>
                        <span
                          className="font-mono text-foreground text-right truncate ml-2"
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

  // Waterfall Timeline Component
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
        <div className="px-4 py-4">{renderSpanHierarchy(roots)}</div>
      </div>
    );
  }, [spans, metrics.maxDuration]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <HugeiconsIcon icon={Loading02Icon} className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) return <CustomErrorMessage error="Failed to fetch trace data." />;

  if (!trace || spans.length === 0) {
    return <div className="p-6 text-muted-foreground text-xs">No spans available.</div>;
  }

  return (
    <Card className="bg-card border border-border shadow-none rounded-lg text-foreground">
      <CardHeader className="p-4 border-b border-border/50 space-y-4">
        {/* Breadcrumbs */}
        {breadcrumbPath.length > 0 && (
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              {breadcrumbPath.map((span, i) => (
                <React.Fragment key={span.spanId}>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      className="text-primary hover:text-primary/80 cursor-pointer text-xs"
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
          {[
            {
              label: "Services",
              value: metrics.serviceCount,
              icon: <Server className="w-4 h-4 text-blue-500" />,
              theme: "bg-card border-border",
              bg: "bg-blue-500/10 border-blue-500/20",
            },
            {
              label: "Spans",
              value: metrics.spanCount,
              icon: <HugeiconsIcon icon={BarChartIcon} className="w-4 h-4 text-amber-500" />,
              theme: "bg-card border-border",
              bg: "bg-amber-500/10 border-amber-500/20",
            },
            {
              label: "Duration",
              value: `${metrics.totalDuration} ms`,
              icon: <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-emerald-500" />,
              theme: "bg-card border-border",
              bg: "bg-emerald-500/10 border-emerald-500/20",
            },
          ].map((metric) => (
            <Card
              key={metric.label}
              className="bg-card border border-border shadow-none rounded-lg"
            >
              <CardContent className="flex items-center h-full justify-between p-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {metric.value}
                  </p>
                </div>
                <div className={cn("p-2 rounded border", metric.bg)}>
                  {metric.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toggle Mode */}
        <div className="flex justify-end items-center gap-1.5">
          <Button
            onClick={() => setMode("waterfall")}
            variant={mode === "waterfall" ? "default" : "outline"}
            className="text-xs h-8 shadow-none border-border cursor-pointer flex items-center gap-1.5"
          >
            <HugeiconsIcon icon={HierarchyFilesIcon} className="w-3.5 h-3.5" />
            Waterfall
          </Button>
          <Button
            onClick={() => setMode("tree")}
            variant={mode === "tree" ? "default" : "outline"}
            className="text-xs h-8 shadow-none border-border cursor-pointer flex items-center gap-1.5"
          >
            <HugeiconsIcon icon={UngroupItemsIcon} className="w-3.5 h-3.5" />
            Tree
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Main Visualization */}
        {mode === "waterfall" && (
          <Card className="bg-card border border-border rounded-lg shadow-none">
            <CardHeader className="py-3 px-4 border-b border-border/50">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <HugeiconsIcon icon={BarChartIcon} className="w-4 h-4 text-primary" />
                Span Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">{WaterfallTimeline}</CardContent>
          </Card>
        )}

        {mode === "tree" && (
          <Card className="bg-card border border-border rounded-lg shadow-none">
            <CardHeader className="py-3 px-4 border-b border-border/50">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <HugeiconsIcon icon={UngroupItemsIcon} className="w-4 h-4 text-primary" />
                Span Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pl-0">
              <div className="space-y-1">
                {spanTree.map((node) => (
                  <TreeNode key={node.spanId} node={node} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Dependency Map */}
        <Card className="mt-6 bg-card border border-border shadow-none rounded-lg">
          <CardHeader className="py-3 px-4 border-b border-border/50">
            <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <HugeiconsIcon icon={WorkflowCircle01Icon} className="w-4 h-4 text-primary" />
              Service Dependency Map
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {metrics.services.map((svc, i) => (
                <React.Fragment key={svc}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-muted border border-border rounded-full flex items-center justify-center">
                      <Server className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground text-xs font-semibold">
                      {svc}
                    </span>
                  </div>
                  {i < metrics.services.length - 1 && (
                    <HugeiconsIcon icon={ArrowRight01Icon} className="text-muted-foreground w-4 h-4" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </CardContent>

      {/* Span Details Sheet */}
      <Sheet open={!!selectedSpan} onOpenChange={() => setSelectedSpan(null)}>
        <SheetContent className="overflow-y-auto p-6">
          {selectedSpan ? (
            <div className="space-y-6 text-foreground">
              <SheetHeader className="p-0 border-b border-border/50 pb-4 mb-4">
                <SheetTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 text-primary" />
                  Span Details
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-card border border-border rounded-lg p-4 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-foreground mb-1">
                      {selectedSpan.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">{selectedSpan.serviceName}</p>
                  </div>

                  {/* Timing Panel */}
                  <div className="bg-muted border border-border rounded-lg p-3 min-w-[240px]">
                    <div className="flex items-center gap-1.5 mb-2">
                      <HugeiconsIcon icon={Clock01Icon} className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-foreground">
                        Timing
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[10px] text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="text-primary font-mono font-semibold">
                          {selectedSpan.duration.toFixed(2)} ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Started:</span>
                        <span className="text-foreground font-mono">
                          {format(new Date(selectedSpan.startTime), "MMM dd, yyyy | h:mmaaa")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ended:</span>
                        <span className="text-foreground font-mono">
                          {format(new Date(selectedSpan.endTime), "MMM dd, yyyy | h:mmaaa")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <section className="bg-card border border-border rounded-lg p-4 shadow-none">
                    <SectionHeader
                      title="Basic Information"
                      icon={Server}
                      color="text-primary"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InfoCard label="Span ID" value={selectedSpan.spanId} />
                      <InfoCard
                        label="Trace ID"
                        value={selectedSpan.traceId}
                      />
                    </div>
                  </section>

                  {/* HTTP Information */}
                  <section className="bg-card border border-border rounded-lg p-4 shadow-none">
                    <SectionHeader
                      title="HTTP Information"
                      icon={GlobeIcon}
                      color="text-primary"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <section className="bg-card border border-border rounded-lg p-4 shadow-none">
                        <SectionHeader
                          title="Custom Attributes"
                          icon={Tag01Icon}
                          color="text-primary"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  {/* Resources */}
                  <section className="bg-card border border-border rounded-lg p-4 shadow-none">
                    <SectionHeader
                      title="Resources"
                      icon={DatabaseIcon}
                      color="text-primary"
                    />
                    <div className="space-y-3">
                      {Object.entries(selectedSpan.resources).map(
                        ([key, val]) => (
                          <div
                            key={key}
                            className="border-b border-border pb-2.5 last:border-0 last:pb-0"
                          >
                            <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-1">
                              {key}
                            </div>
                            <div className="text-xs text-foreground font-mono break-all">
                              {String(val ?? "-")}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 flex items-center justify-center">
              <div className="text-muted-foreground text-xs">No span selected</div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
};

export default TraceToLogsComponent;

// reusable components
const InfoCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ComponentType<{ className?: string }>;
}) => (
  <div className="bg-muted border border-border rounded-lg p-3 hover:bg-muted/85 transition-colors text-foreground">
    <div className="flex items-center gap-1.5 mb-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
      <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">{label}</span>
    </div>
    <div className="font-mono text-xs break-all">{value}</div>
  </div>
);

const SectionHeader = ({
  title,
  icon: Icon,
  color = "text-muted-foreground",
}: {
  title: string;
  icon: any;
  color?: string;
}) => (
  <div className="flex items-center gap-1.5 mb-4">
    {Icon && (
      typeof Icon === "function" ? (
        <Icon className={cn("w-4 h-4", color)} />
      ) : (
        <HugeiconsIcon icon={Icon} className={cn("w-4 h-4", color)} />
      )
    )}
    <h3 className={cn("text-xs font-semibold", color)}>{title}</h3>
  </div>
);
