"use client";

import { useEffect, useMemo, useState } from "react";
import { Background, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAIData } from "@/lib/ai/client";

type GraphResponse = {
  nodes: { id: string; label: string; type: string }[];
  edges: { source: string; target: string }[];
};

export function AgentGraph({ traceId }: { traceId?: string }) {
  const path = traceId ? `graph?trace_id=${encodeURIComponent(traceId)}` : "graph";
  const { data } = useAIData<GraphResponse>(path);
  const laid = useMemo(() => layout(data), [data]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="h-80" />;
  }
  return (
    <div className="h-80 overflow-hidden rounded-lg border border-pg-border">
      <ReactFlow nodes={laid.nodes} edges={laid.edges} fitView proOptions={{ hideAttribution: true }} colorMode="dark">
        <Background />
      </ReactFlow>
    </div>
  );
}

function layout(data: GraphResponse | null): { nodes: Node[]; edges: Edge[] } {
  if (!data) {
    return { nodes: [], edges: [] };
  }
  const children = new Map<string, string[]>();
  const targets = new Set<string>();
  for (const edge of data.edges) {
    const list = children.get(edge.source) ?? [];
    list.push(edge.target);
    children.set(edge.source, list);
    targets.add(edge.target);
  }
  const roots = data.nodes.filter((node) => !targets.has(node.id));
  const pos = new Map<string, { x: number; y: number }>();
  let row = 0;
  const walk = (id: string, depth: number) => {
    pos.set(id, { x: depth * 220, y: row * 72 });
    row += 1;
    for (const child of children.get(id) ?? []) {
      walk(child, depth + 1);
    }
  };
  roots.forEach((node) => walk(node.id, 0));
  data.nodes.forEach((node, index) => {
    if (!pos.has(node.id)) {
      pos.set(node.id, { x: 0, y: (roots.length + index) * 72 });
    }
  });
  return {
    nodes: data.nodes.map((node) => ({
      id: node.id,
      position: pos.get(node.id) ?? { x: 0, y: 0 },
      data: { label: node.label },
      style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #3f3f46", fontSize: 12 },
    })),
    edges: data.edges.map((edge) => ({ id: `${edge.source}-${edge.target}`, source: edge.source, target: edge.target })),
  };
}
