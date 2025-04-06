import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for logs based on the screenshot
export const logs = [
  {
    id: 1,
    timestamp: "2025-03-11 03:01:24",
    level: "INFO",
    body: "[Fast Refresh] done in 554ms",
  },
  {
    id: 2,
    timestamp: "2025-03-11 03:01:23",
    level: "INFO",
    body: "[Fast Refresh] rebuilding",
  },
  {
    id: 3,
    timestamp: "2025-03-11 02:59:48",
    level: "INFO",
    body: "[Fast Refresh] done in 958ms",
  },
  {
    id: 4,
    timestamp: "2025-03-11 02:59:47",
    level: "INFO",
    body: "[Fast Refresh] rebuilding",
  },
  {
    id: 5,
    timestamp: "2025-03-11 02:59:41",
    level: "INFO",
    body: "[Fast Refresh] done in 3052ms",
  },
  {
    id: 6,
    timestamp: "2025-03-11 02:59:38",
    level: "INFO",
    body: "[Fast Refresh] rebuilding",
  },
  {
    id: 7,
    timestamp: "2025-03-11 02:57:50",
    level: "INFO",
    body: "[Fast Refresh] done in 636ms",
  },
  {
    id: 8,
    timestamp: "2025-03-11 02:57:50",
    level: "INFO",
    body: "[Fast Refresh] rebuilding",
  },
  {
    id: 9,
    timestamp: "2025-03-11 02:57:41",
    level: "ERROR",
    body: "Warning: Cannot update a component (`%s`) while rendering a different component (`%s`). To locate the bad setState() call inside `%s`, follow the stack trace as described in https://reactjs.org/link/setstate-in-render",
  },
  {
    id: 10,
    timestamp: "2025-03-11 02:57:39",
    level: "INFO",
    body: "[Fast Refresh] done in 914ms",
  },
  {
    id: 11,
    timestamp: "2025-03-11 02:57:38",
    level: "INFO",
    body: "[Fast Refresh] rebuilding",
  },
  { id: 12, timestamp: "2025-03-11 02:57:37", level: "INFO", body: "empty" },
  {
    id: 13,
    timestamp: "2025-03-11 02:57:31",
    level: "WARN",
    body: "[WARN] 57:31.13 AuthService - No authenticated user:",
  },
  {
    id: 14,
    timestamp: "2025-03-11 02:57:30",
    level: "ERROR",
    body: "Failed to fetch user email:",
  },
  {
    id: 15,
    timestamp: "2025-03-11 02:57:30",
    level: "ERROR",
    body: "Failed to fetch user email:",
  },
  {
    id: 16,
    timestamp: "2025-03-11 02:57:09",
    level: "WARN",
    body: "[WARN] 57:09.795 LoginForm - Login error:",
  },
  {
    id: 17,
    timestamp: "2025-03-11 02:57:09",
    level: "WARN",
    body: "[WARN] 57:09.786 AuthService - Login failed:",
  },
  {
    id: 18,
    timestamp: "2025-03-11 02:56:53",
    level: "WARN",
    body: "[WARN] 56:53.628 AuthService - No authenticated user:",
  },
  {
    id: 19,
    timestamp: "2025-03-11 02:56:52",
    level: "WARN",
    body: "[WARN] 56:52.311 AuthService - No authenticated user:",
  },
  {
    id: 20,
    timestamp: "2025-03-11 02:56:52",
    level: "INFO",
    body: "[Fast Refresh] done in 494ms",
  },
];

function LogOverview() {
  const [logsExpanded, setLogsExpanded] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Mock time histogram data based on the screenshot
  const timeHistogram = [
    { time: "02:53:21", count: 5 },
    { time: "02:57:31", count: 8 },
    { time: "03:04:01", count: 1 },
  ];

  // Toggle log expansion
  const toggleLogExpansion = (id: number) => {
    setLogsExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Get color based on log level
  const getLevelColor = (level: string) => {
    switch (level) {
      case "ERROR":
        return "text-red-500";
      case "WARN":
        return "text-yellow-500";
      case "INFO":
      default:
        return "text-blue-500";
    }
  };

  return (
    <div>
      {/* Log count and time period */}
      <div className="flex items-center text-sm text-gray-600 mb-2">
        <span>26 Logs</span>
        <span className="mx-2">|</span>
        <span>3/11/25 2:49:06 AM to Now</span>
      </div>

      {/* Time histogram visualization */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <div className="flex items-end h-20 w-full">
          {timeHistogram.map((item, i) => (
            <div key={i} className="flex flex-col items-center mx-1 flex-1">
              <div className="w-full flex justify-center space-x-0.5">
                {/* Create small colored boxes to represent different log types */}
                <div className="w-3 h-3 bg-purple-600 mb-0.5"></div>
                <div className="w-3 h-3 bg-yellow-500 mb-0.5"></div>
                <div className="w-3 h-3 bg-blue-500 mb-0.5"></div>
              </div>
              <div
                className="w-full bg-gray-200 rounded-sm"
                style={{
                  height: `${(item.count / 10) * 100}%`,
                  minHeight: "8px",
                }}
              ></div>
              <div className="text-xs text-gray-500 mt-1">{item.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup banner */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Logging for your backend?</h3>
              <p className="text-sm text-gray-600">
                You&apos;re just a few lines away from getting visibility in
                your backend logs.
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="h-8">
              Hide
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white h-8">
              Open setup
            </Button>
          </div>
        </div>
      </div>

      {/* Logs table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">Timestamp</TableHead>
              <TableHead className="w-24">Level</TableHead>
              <TableHead>Body</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow
                key={log.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleLogExpansion(log.id)}
              >
                <TableCell className="font-mono text-xs text-gray-600">
                  {log.timestamp}
                </TableCell>
                <TableCell>
                  <span className={getLevelColor(log.level)}>{log.level}</span>
                </TableCell>
                <TableCell className="font-mono text-xs">{log.body}</TableCell>
                <TableCell>
                  <button className="p-1 rounded hover:bg-gray-100">
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        logsExpanded[log.id] ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default LogOverview;
