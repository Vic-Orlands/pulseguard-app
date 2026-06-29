import { HugeiconsIcon } from "@hugeicons/react";
import { AnalyticsUpIcon, ArrowDown01Icon, BarChartIcon } from "@hugeicons/core-free-icons";
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from "recharts";

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

interface LogsVolumeChartProps {}

const LogsVolumeChart: React.FC<LogsVolumeChartProps> = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [activePoint, setActivePoint] = useState<{
    x: string | null;
    y: number | null;
  }>({ x: null, y: null });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-md p-2.5 shadow-none text-popover-foreground">
          <p className="text-muted-foreground text-[10px] mb-1 font-semibold">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs font-semibold" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleMouseMove = (data: any) => {
    if (data && data.activeLabel !== undefined) {
      const totalValue =
        data.activePayload?.reduce(
          (sum: number, entry: any) => sum + entry.value,
          0
        ) || 0;
      setActivePoint({ x: data.activeLabel, y: totalValue });
    }
  };

  const handleMouseLeave = () => {
    setActivePoint({ x: null, y: null });
  };

  const CustomLegend = () => (
    <div className="flex items-center gap-4 text-xs mb-3 font-semibold">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
        <span className="text-muted-foreground">Unknown Total: 6</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-destructive rounded-full"></div>
        <span className="text-destructive">Error Total: 10</span>
      </div>
    </div>
  );

  const renderChart = () => {
    if (chartType === "bar") {
      return (
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            interval={1}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--accent)", opacity: 0.15 }} />
          {activePoint.x && (
            <ReferenceLine
              x={activePoint.x}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          )}
          {activePoint.y && (
            <ReferenceLine
              y={activePoint.y}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          )}
          <Bar
            dataKey="unknown"
            stackId="logs"
            fill="var(--muted-foreground)"
            barSize={6}
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="error"
            stackId="logs"
            fill="var(--destructive)"
            barSize={6}
            radius={[1, 1, 0, 0]}
          />
        </BarChart>
      );
    } else {
      return (
        <LineChart
          data={data}
          margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            interval={1}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
          />
          <Tooltip content={<CustomTooltip />} />
          {activePoint.x && (
            <ReferenceLine
              x={activePoint.x}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          )}
          {activePoint.y && activePoint.y > 0 && (
            <ReferenceLine
              y={activePoint.y}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          )}
          <Line
            type="monotone"
            dataKey="unknown"
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            dot={{ fill: "var(--muted-foreground)", strokeWidth: 0, r: 2.5 }}
            activeDot={{ r: 3.5, fill: "var(--muted-foreground)" }}
          />
          <Line
            type="monotone"
            dataKey="error"
            stroke="var(--destructive)"
            strokeWidth={1.5}
            dot={{ fill: "var(--destructive)", strokeWidth: 0, r: 2.5 }}
            activeDot={{ r: 3.5, fill: "var(--destructive)" }}
          />
        </LineChart>
      );
    }
  };

  return (
    <Card className="bg-card border border-border p-4 rounded-lg shadow-none text-foreground">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors text-xs font-semibold"
          >
            <HugeiconsIcon icon={ArrowDown01Icon} className={`w-3.5 h-3.5 transition-transform ${
                                      isCollapsed ? "-rotate-90" : ""
                                    }`} />
            <span>Logs volume</span>
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[10px] text-muted-foreground mr-1">Loki</span>
          <button
            onClick={() => setChartType(chartType === "bar" ? "line" : "bar")}
            className="p-1 hover:bg-muted rounded transition-colors"
            title={`Switch to ${chartType === "bar" ? "line" : "bar"} chart`}
          >
            {chartType === "bar" ? (
              <HugeiconsIcon icon={AnalyticsUpIcon} className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            ) : (
              <HugeiconsIcon icon={BarChartIcon} className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-3">
          <CustomLegend />
          <div className="h-48 bg-muted/10 rounded border border-border/50 p-2">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  );
};

export default LogsVolumeChart;
