"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type PulseChartType = "line" | "bar" | "area";

export interface PulseChartSeries {
  name: string;
  data: number[];
}

interface PulseChartProps {
  type?: PulseChartType;
  series: PulseChartSeries[];
  categories: string[];
  height?: number;
  colors?: string[];
  stacked?: boolean;
}

export function PulseChart({
  type = "area",
  series,
  categories,
  height = 240,
  colors,
  stacked = false,
}: PulseChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const palette = colors ?? ["#34d399", "#f87171", "#60a5fa", "#fbbf24"];
  const muted = isDark ? "#a1a1aa" : "#71717a";
  const grid = isDark ? "#3f3f46" : "#e4e4e7";
  const tooltipBg = isDark ? "#242428" : "#ffffff";
  const hostRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const measure = () => {
      const next = { width: el.clientWidth, height: el.clientHeight };
      setBox((prev) =>
        prev.width === next.width && prev.height === next.height ? prev : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = useMemo(
    () =>
      categories.map((label, index) => {
        const row: Record<string, string | number> = { label };
        series.forEach((item) => {
          row[item.name] = item.data[index] ?? 0;
        });
        return row;
      }),
    [categories, series],
  );

  const tooltipStyle = {
    backgroundColor: tooltipBg,
    border: `1px solid ${grid}`,
    borderRadius: 8,
    fontSize: 11,
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    color: isDark ? "#fafafa" : "#18181b",
    boxShadow: "0 12px 32px rgba(0,0,0,0.16)",
  };

  const axis = {
    tick: { fill: muted, fontSize: 10, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" },
    axisLine: false as const,
    tickLine: false as const,
  };

  const shared = (
    <>
      <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="label" {...axis} minTickGap={18} />
      <YAxis {...axis} width={32} />
      <Tooltip
        contentStyle={tooltipStyle}
        cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}
      />
      {series.length > 1 ? (
        <Legend
          iconSize={8}
          formatter={(value) => (
            <span style={{ marginRight: 12, color: muted }}>{value}</span>
          )}
          wrapperStyle={{
            fontSize: 11,
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            color: muted,
            paddingTop: 8,
          }}
        />
      ) : null}
    </>
  );

  const ready = box.width > 8 && box.height > 8;
  const chartType = type === "bar" ? "bar" : "area";

  return (
    <div ref={hostRef} className="w-full min-w-0 min-h-[160px]" style={{ height }}>
      {ready ? (
        <ResponsiveContainer width={box.width} height={box.height} minWidth={1} minHeight={1}>
          {chartType === "bar" ? (
            <BarChart data={data} barCategoryGap="28%">
              {shared}
              {series.map((item, index) => (
                <Bar
                  key={item.name}
                  dataKey={item.name}
                  fill={palette[index % palette.length]}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                  stackId={stacked ? "stack" : undefined}
                />
              ))}
            </BarChart>
          ) : (
            <AreaChart data={data}>
              {shared}
              {series.map((item, index) => (
                <Area
                  key={item.name}
                  type="monotone"
                  dataKey={item.name}
                  stroke={palette[index % palette.length]}
                  fill={palette[index % palette.length]}
                  fillOpacity={0.18}
                  strokeWidth={2}
                  stackId={stacked ? "stack" : undefined}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
