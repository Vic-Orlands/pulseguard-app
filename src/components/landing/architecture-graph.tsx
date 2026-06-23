"use client";

import { useState } from "react";
import {
  ArrowDown,
  Cpu,
  Database,
  Layers,
  LayoutGrid,
  Network,
  Radio,
} from "lucide-react";
import { useTheme } from "next-themes";

const nodes = {
  app: {
    name: "Next.js Application",
    shortName: "Next.js",
    sub: "Telemetry generation",
    icon: Cpu,
    details: [
      "Captures client-side exceptions with the TelemetryProvider",
      "Propagates request context across browser and backend boundaries",
      "Exports records without blocking application work",
    ],
  },
  otel: {
    name: "OpenTelemetry Collector",
    shortName: "OTel Collector",
    sub: "Filtering and routing",
    icon: Network,
    details: [
      "Accepts OTLP HTTP and gRPC telemetry records",
      "Batches events and applies memory-aware processing",
      "Routes logs, traces, and metrics to their dedicated stores",
    ],
  },
  loki: {
    name: "Grafana Loki",
    shortName: "Loki",
    sub: "Structured log storage",
    icon: Database,
    details: [
      "Indexes stream labels for high-volume logs",
      "Retains trace identifiers for direct correlation",
      "Supports focused log queries when an incident begins",
    ],
  },
  tempo: {
    name: "Grafana Tempo",
    shortName: "Tempo",
    sub: "Trace waterfalls",
    icon: Layers,
    details: [
      "Stores distributed trace waterfalls efficiently",
      "Lets teams inspect every span in one request path",
      "Links trace context back to logs and metrics",
    ],
  },
  prometheus: {
    name: "Prometheus",
    shortName: "Prometheus",
    sub: "Metrics backend",
    icon: Radio,
    details: [
      "Scrapes collector metrics continuously",
      "Supports alerts with standard PromQL rules",
      "Tracks latency, errors, and system health",
    ],
  },
  grafana: {
    name: "Grafana Dashboards",
    shortName: "Grafana",
    sub: "Unified visualization",
    icon: LayoutGrid,
    details: [
      "Brings logs, traces, and metrics into one workspace",
      "Makes cross-signal investigation immediate",
      "Supports team access and shared operational context",
    ],
  },
};

type NodeKey = keyof typeof nodes;

function NodeButton({
  nodeKey,
  active,
  onClick,
}: {
  nodeKey: NodeKey;
  active: boolean;
  onClick: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const node = nodes[nodeKey];
  const Icon = node.icon;
  return (
    <button
      onClick={onClick}
      className={
        active
          ? "rounded-lg border border-[#ff5a1f] bg-[#ff5a1f]/10 px-2 py-2.5 sm:px-4 sm:py-3 text-center transition-colors"
          : "rounded-lg border border-[#dfdfda] bg-transparent px-2 py-2.5 sm:px-4 sm:py-3 text-center hover:border-[#9a9a95] dark:border-[#3b3b3b] dark:bg-[#121212] dark:hover:border-[#5a5a5a] transition-colors"
      }
      style={{
        backgroundColor: active
          ? undefined
          : isDark
            ? "#121212"
            : "transparent",
        borderColor: active ? "#ff5a1f" : isDark ? "#3b3b3b" : "#dfdfda",
      }}
    >
      <Icon className="mx-auto mb-1.5 text-[#ff5a1f]" size={16} />
      <span
        className="block text-[10px] sm:text-xs font-medium text-[#272725] dark:text-white"
        style={{ color: isDark ? "#f5f5f5" : "#272725" }}
      >
        <span className="inline sm:hidden">{node.shortName}</span>
        <span className="hidden sm:inline">{node.name}</span>
      </span>
      <span className="mt-1 hidden sm:block font-mono text-[9px] uppercase tracking-wider text-[#777772] dark:text-[#a3a3a3]">
        {node.sub}
      </span>
    </button>
  );
}

export function ArchitectureGraph() {
  const [activeKey, setActiveKey] = useState<NodeKey>("otel");
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const activeNode = nodes[activeKey];
  const ActiveIcon = activeNode.icon;

  const borderColor = isDark ? "#3b3b3b" : "#dfdfda";
  return (
    <section>
      <p className="pg-label">Pipeline architecture</p>
      <h2
        className="mt-4 w-full text-3xl font-semibold tracking-[-.065em] leading-[.95] lg:text-[5.5rem] lg:max-w-4xl"
        style={{ color: isDark ? "#f5f5f5" : "#272725" }}
      >
        Follow every signal through the stack.
      </h2>
      <p className="mt-4 max-w-xl text-sm font-light leading-6 text-[#73736e] dark:text-[#a3a3a3]">
        Select a node to see how telemetry moves from your application to the
        place where your team investigates it.
      </p>

      <section className="mt-5 grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
        <div
          className="rounded-lg border border-[#dfdfda] bg-transparent p-6 dark:border-[#3b3b3b] dark:bg-[#121212]"
          style={{
            borderColor,
            backgroundColor: isDark ? "#121212" : "transparent",
          }}
        >
          <div className="flex justify-center">
            <NodeButton
              nodeKey="app"
              active={activeKey === "app"}
              onClick={() => setActiveKey("app")}
            />
          </div>
          <ArrowDown
            className="mx-auto my-3 text-[#b1b1ac] dark:text-[#4a4a4a]"
            size={16}
          />
          <div className="flex justify-center">
            <NodeButton
              nodeKey="otel"
              active={activeKey === "otel"}
              onClick={() => setActiveKey("otel")}
            />
          </div>
          <div
            className="mx-auto my-5 h-7 w-[72%] border-x border-t border-[#d4d4cf] dark:border-[#3b3b3b]"
            style={{ borderColor }}
          />
          <div className="grid grid-cols-3 gap-3">
            <NodeButton
              nodeKey="loki"
              active={activeKey === "loki"}
              onClick={() => setActiveKey("loki")}
            />
            <NodeButton
              nodeKey="tempo"
              active={activeKey === "tempo"}
              onClick={() => setActiveKey("tempo")}
            />
            <NodeButton
              nodeKey="prometheus"
              active={activeKey === "prometheus"}
              onClick={() => setActiveKey("prometheus")}
            />
          </div>
          <div
            className="mx-auto my-5 h-7 w-[72%] border-x border-b border-[#d4d4cf] dark:border-[#3b3b3b]"
            style={{ borderColor }}
          />
          <div className="flex justify-center">
            <NodeButton
              nodeKey="grafana"
              active={activeKey === "grafana"}
              onClick={() => setActiveKey("grafana")}
            />
          </div>
        </div>

        <div
          className="w-full rounded-lg border border-[#dfdfda] p-6 dark:border-[#3b3b3b] sm:p-8"
          style={{
            borderColor,
            backgroundColor: isDark ? "#121212" : "transparent",
          }}
        >
          <div
            className="flex items-start justify-between border-b border-[#e6e6e1] pb-5 dark:border-[#303030]"
            style={{ borderColor }}
          >
            <div>
              <p className="pg-label">Selected node</p>
              <h4
                className="mt-2 text-xl font-medium text-[#272725] dark:text-white"
                style={{ color: isDark ? "#f5f5f5" : "#272725" }}
              >
                {activeNode.name}
              </h4>
            </div>
            <span
              className="grid size-10 place-items-center rounded-lg border border-[#dfdfda] text-[#ff5a1f] dark:border-[#3b3b3b]"
              style={{ borderColor }}
            >
              <ActiveIcon size={18} />
            </span>
          </div>
          <ul className="mt-6 space-y-4">
            {activeNode.details.map((detail) => (
              <li
                key={detail}
                className="flex gap-3 text-sm font-light leading-6 text-[#73736e] dark:text-[#a3a3a3]"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#ff5a1f]" />
                {detail}
              </li>
            ))}
          </ul>
          <div
            className="mt-8 border-t border-[#e6e6e1] pt-4 font-mono text-[10px] uppercase tracking-wider text-[#777772] dark:border-[#303030] dark:text-[#a3a3a3]"
            style={{ borderColor }}
          >
            Node id · {activeKey.toUpperCase()}
          </div>
        </div>
      </section>
    </section>
  );
}
