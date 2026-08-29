"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@/components/phosphor-icons";
import { AnalyticsUpIcon, ArrowDown01Icon, BarChartIcon } from "@/components/phosphor-icons";
import { PulseChart } from "@/components/dashboard/shared/apex-chart";

const data = [
  { time: "05:30", unknown: 0, error: 0 },
  { time: "05:35", unknown: 0, error: 0 },
  { time: "05:40", unknown: 0, error: 0 },
  { time: "05:45", unknown: 0, error: 0 },
  { time: "05:50", unknown: 0, error: 0 },
  { time: "05:55", unknown: 0, error: 0 },
  { time: "06:00", unknown: 0, error: 0 },
  { time: "06:05", unknown: 0, error: 0 },
  { time: "06:10", unknown: 0, error: 0 },
  { time: "06:15", unknown: 4.8, error: 0 },
  { time: "06:20", unknown: 2.5, error: 2.8 },
  { time: "06:25", unknown: 3.2, error: 2.4 },
  { time: "06:30", unknown: 1.8, error: 1.2 },
  { time: "06:35", unknown: 0, error: 0 },
  { time: "06:40", unknown: 3.5, error: 0 },
  { time: "06:45", unknown: 1.5, error: 0 },
  { time: "06:50", unknown: 2.2, error: 0 },
];

const LogsVolumeChart: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "area">("bar");

  return (
    <div className="rounded-lg bg-pg-group p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 text-pg-text transition-colors text-xs font-semibold bg-transparent"
        >
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
          />
          <span>Logs volume</span>
        </button>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[10px] text-pg-muted mr-1">Loki</span>
          <button
            onClick={() => setChartType(chartType === "bar" ? "area" : "bar")}
            className="p-1 rounded-lg hover:bg-pg-surface transition-colors bg-transparent"
            title={`Switch to ${chartType === "bar" ? "area" : "bar"} chart`}
          >
            {chartType === "bar" ? (
              <HugeiconsIcon icon={AnalyticsUpIcon} className="w-3.5 h-3.5" />
            ) : (
              <HugeiconsIcon icon={BarChartIcon} className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-3">
          <div className="flex items-center gap-4 text-xs mb-3 font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-pg-muted rounded-full" />
              <span className="text-pg-muted">Unknown Total: 6</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="text-pg-muted">Error Total: 10</span>
            </div>
          </div>
          <PulseChart
            type={chartType}
            stacked={chartType === "bar"}
            height={192}
            categories={data.map((point) => point.time)}
            series={[
              { name: "unknown", data: data.map((point) => point.unknown) },
              { name: "error", data: data.map((point) => point.error) },
            ]}
            colors={["#a1a1aa", "#f87171"]}
          />
        </div>
      )}
    </div>
  );
};

export default LogsVolumeChart;
