"use client";

import { useEffect, useRef } from "react";
import type { DaySpend, ThrottlePoint } from "@/lib/ai/types";

const palette = ["#7dd3fc", "#fbbf24", "#86efac", "#c4b5fd", "#fda4af", "#a1a1aa"];

export function SpendChart({ series }: { series: DaySpend[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    let disposed = false;
    let chart: { dispose: () => void; resize: () => void } | null = null;
    void import("echarts").then((echarts) => {
      if (disposed) {
        return;
      }
      const instance = echarts.init(node, undefined, { renderer: "canvas" });
      chart = instance;
      const providers = Array.from(new Set(series.flatMap((day) => Object.keys(day.providers))));
      instance.setOption({
        backgroundColor: "transparent",
        tooltip: { trigger: "axis" },
        legend: { textStyle: { color: "#a1a1aa" }, top: 0 },
        grid: { left: 48, right: 16, top: 36, bottom: 28 },
        xAxis: { type: "category", data: series.map((day) => day.day.slice(5)), axisLabel: { color: "#a1a1aa" } },
        yAxis: { type: "value", axisLabel: { color: "#a1a1aa" }, splitLine: { lineStyle: { color: "#27272a" } } },
        series: providers.map((provider, index) => ({
          name: provider,
          type: "bar",
          stack: "cost",
          data: series.map((day) => day.providers[provider] ?? 0),
          itemStyle: { color: palette[index % palette.length] },
        })),
      });
    });
    const onResize = () => chart?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      chart?.dispose();
    };
  }, [series]);
  return <div ref={ref} className="h-72 w-full" />;
}

export function ThrottleChart({ series }: { series: ThrottlePoint[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    let disposed = false;
    let chart: { dispose: () => void; resize: () => void } | null = null;
    void import("echarts").then((echarts) => {
      if (disposed) {
        return;
      }
      const instance = echarts.init(node);
      chart = instance;
      const keys = ["rate_limit", "provider_overloaded", "quota_exhausted", "timeout", "context_length"] as const;
      instance.setOption({
        backgroundColor: "transparent",
        tooltip: { trigger: "axis" },
        legend: { textStyle: { color: "#a1a1aa" }, top: 0 },
        grid: { left: 40, right: 16, top: 36, bottom: 28 },
        xAxis: { type: "category", data: series.map((point) => point.hour.slice(5, 13)), axisLabel: { color: "#a1a1aa" } },
        yAxis: { type: "value", axisLabel: { color: "#a1a1aa" }, splitLine: { lineStyle: { color: "#27272a" } } },
        series: keys.map((key, index) => ({
          name: key,
          type: "line",
          smooth: true,
          showSymbol: false,
          data: series.map((point) => point[key]),
          lineStyle: { color: palette[index], width: 2 },
        })),
      });
    });
    const onResize = () => chart?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      chart?.dispose();
    };
  }, [series]);
  return <div ref={ref} className="h-72 w-full" />;
}
