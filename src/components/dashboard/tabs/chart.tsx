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
import { ChevronDown, BarChart3, TrendingUp } from "lucide-react";

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
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
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
    <div className="flex items-center gap-6 text-sm mb-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-gray-500 rounded-sm"></div>
        <span className="text-gray-400">unknown Total: 6</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
        <span className="text-red-400">error Total: 10</span>
      </div>
    </div>
  );

  const renderChart = () => {
    if (chartType === "bar") {
      return (
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
          />
          <Tooltip content={<CustomTooltip />} />
          {activePoint.x && (
            <ReferenceLine
              x={activePoint.x}
              stroke="#64748B"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          )}
          {activePoint.y && (
            <ReferenceLine
              y={activePoint.y}
              stroke="#64748B"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          )}
          <Bar
            dataKey="unknown"
            stackId="logs"
            fill="#6B7280"
            barSize={8}
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="error"
            stackId="logs"
            fill="#EF4444"
            barSize={8}
            radius={[1, 1, 0, 0]}
          />
        </BarChart>
      );
    } else {
      return (
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
          />
          <Tooltip content={<CustomTooltip />} />
          {activePoint.x && (
            <ReferenceLine
              x={activePoint.x}
              stroke="#64748B"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          )}
          {activePoint.y && activePoint.y > 0 && (
            <ReferenceLine
              y={activePoint.y}
              stroke="#64748B"
              strokeWidth={1}
              strokeDasharray="2 2"
            />
          )}
          <Line
            type="monotone"
            dataKey="unknown"
            stroke="#6B7280"
            strokeWidth={2}
            dot={{ fill: "#6B7280", strokeWidth: 0, r: 3 }}
            activeDot={{ r: 4, fill: "#6B7280" }}
          />
          <Line
            type="monotone"
            dataKey="error"
            stroke="#EF4444"
            strokeWidth={2}
            dot={{ fill: "#EF4444", strokeWidth: 0, r: 3 }}
            activeDot={{ r: 4, fill: "#EF4444" }}
          />
        </LineChart>
      );
    }
  };

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg font-mono">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isCollapsed ? "-rotate-90" : ""
              }`}
            />
            <span className="text-sm font-medium">Logs volume</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 mr-2">Loki</span>
          <button
            onClick={() => setChartType(chartType === "bar" ? "line" : "bar")}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
            title={`Switch to ${chartType === "bar" ? "line" : "bar"} chart`}
          >
            {chartType === "bar" ? (
              <TrendingUp className="w-4 h-4 text-gray-400 hover:text-white" />
            ) : (
              <BarChart3 className="w-4 h-4 text-gray-400 hover:text-white" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-4">
          <CustomLegend />
          <div className="h-64 bg-gray-800 rounded p-2">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsVolumeChart;
