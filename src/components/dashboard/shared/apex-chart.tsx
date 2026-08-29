"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

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
  const muted = isDark ? "#a1a1aa" : "#52525b";
  const grid = isDark ? "#3f3f46" : "#e4e4e7";
  const tooltipBg = isDark ? "#18181b" : "#ffffff";
  const tooltipBorder = isDark ? "#3f3f46" : "#e4e4e7";

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type,
        toolbar: { show: false },
        background: "transparent",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        stacked,
        animations: {
          enabled: true,
          speed: 560,
          animateGradually: { enabled: true, delay: 80 },
          dynamicAnimation: { enabled: true, speed: 280 },
        },
      },
      theme: { mode: isDark ? "dark" : "light" },
      colors: palette,
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: type === "bar" ? 0 : 2,
      },
      fill: {
        type: type === "bar" ? "solid" : "gradient",
        opacity: type === "bar" ? 0.85 : 0.18,
        gradient: {
          shadeIntensity: 0.35,
          opacityFrom: 0.38,
          opacityTo: 0.04,
          stops: [0, 90, 100],
        },
      },
      grid: {
        borderColor: grid,
        strokeDashArray: 3,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { left: 8, right: 8 },
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: muted, fontSize: "10px" },
          rotate: 0,
          hideOverlappingLabels: true,
        },
        tooltip: { enabled: false },
      },
      yaxis: {
        labels: {
          style: { colors: muted, fontSize: "10px" },
        },
      },
      legend: {
        fontSize: "11px",
        labels: { colors: muted },
        markers: { size: 4, strokeWidth: 0 },
        itemMargin: { horizontal: 10, vertical: 0 },
      },
      tooltip: {
        theme: isDark ? "dark" : "light",
        style: { fontSize: "11px" },
        fillSeriesColor: false,
      },
      plotOptions: {
        bar: {
          columnWidth: "42%",
          borderRadius: 3,
          borderRadiusApplication: "end",
        },
      },
      states: {
        hover: { filter: { type: "none" } },
        active: { filter: { type: "none" } },
      },
    }),
    [categories, grid, isDark, muted, palette, stacked, type],
  );

  void tooltipBg;
  void tooltipBorder;

  return (
    <div className="w-full">
      <ReactApexChart
        options={options}
        series={series}
        type={type}
        height={height}
        width="100%"
      />
    </div>
  );
}
