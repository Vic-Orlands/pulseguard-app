import React, { useState, useEffect, useRef } from "react";
import ApexCharts from "apexcharts";
import {
  AlertTriangle,
  Activity,
  Users,
  Zap,
  Clock,
  Bug,
  Eye,
  Settings,
} from "lucide-react";

const ErrorMonitoringDashboard = () => {
  const [chartType, setChartType] = useState("congested");
  const [timeRange, setTimeRange] = useState("24h");
  const [selectedMetric, setSelectedMetric] = useState("errors");
  const timelineChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);

  // Mock data for different time periods
  const generateTimeSeriesData = (hours) => {
    const data = [];
    const now = new Date();
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now - i * 60 * 60 * 1000);
      data.push({
        time: time.toISOString(),
        timeLabel: time.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        errors:
          Math.floor(Math.random() * 50) + (i < 4 ? Math.random() * 100 : 0), // Spike in recent hours
        warnings: Math.floor(Math.random() * 30) + 10,
        events: Math.floor(Math.random() * 200) + 50,
        sessions: Math.floor(Math.random() * 500) + 100,
        errorDetails: {
          type: [
            "TypeError",
            "ReferenceError",
            "NetworkError",
            "ValidationError",
          ][Math.floor(Math.random() * 4)],
          severity: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)],
          affected: Math.floor(Math.random() * 50) + 1,
        },
      });
    }
    return data;
  };

  const [timeSeriesData, setTimeSeriesData] = useState(
    generateTimeSeriesData(24)
  );

  useEffect(() => {
    const hours = timeRange === "1h" ? 1 : timeRange === "24h" ? 24 : 168; // 7 days
    setTimeSeriesData(generateTimeSeriesData(hours));
  }, [timeRange]);

  // Initialize and update charts
  useEffect(() => {
    if (timelineChartRef.current && timeSeriesData.length) {
      const timelineOptions = {
        chart: {
          type: chartType === "congested" ? "line" : "area",
          height: 350,
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: false,
          },
          background: "transparent",
          parentHeightOffset: 0,
        },
        series: [
          {
            name: "Errors",
            data: timeSeriesData.map((d) => d.errors),
          },
          {
            name: "Warnings",
            data: timeSeriesData.map((d) => d.warnings),
          },
          {
            name: "Events",
            data: timeSeriesData.map((d) => d.events),
          },
        ],
        colors: ["#ef4444", "#f59e0b", "#3b82f6"],
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: chartType === "congested" ? "straight" : "smooth",
          width: 2,
        },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.3,
            opacityTo: 0,
            stops: [0, 90, 100],
          },
        },
        grid: {
          borderColor: "#374151",
          strokeDashArray: 3,
        },
        xaxis: {
          categories: timeSeriesData.map((d) => d.timeLabel),
          labels: {
            style: {
              colors: "#9ca3af",
              fontSize: "12px",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: "#9ca3af",
              fontSize: "12px",
            },
          },
        },
        tooltip: {
          custom: function ({ series, seriesIndex, dataPointIndex, w }) {
            const data = timeSeriesData[dataPointIndex];
            return `
              <div class="bg-gray-900/95 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 shadow-xl">
                <p class="text-purple-200 text-sm font-medium mb-2">
                  ${new Date(data.time).toLocaleString()}
                </p>
                <div class="space-y-1">
                  <p class="text-red-400 text-sm">
                    <span class="font-medium">Errors:</span> ${data.errors}
                  </p>
                  <p class="text-yellow-400 text-sm">
                    <span class="font-medium">Warnings:</span> ${data.warnings}
                  </p>
                  <p class="text-blue-400 text-sm">
                    <span class="font-medium">Events:</span> ${data.events}
                  </p>
                  <p class="text-green-400 text-sm">
                    <span class="font-medium">Sessions:</span> ${data.sessions}
                  </p>
                </div>
                <div class="mt-3 pt-2 border-t border-purple-500/20">
                  <p class="text-xs text-purple-300">
                    Most Common: ${data.errorDetails.type}
                  </p>
                  <p class="text-xs text-purple-300">
                    Severity: ${data.errorDetails.severity}
                  </p>
                  <p class="text-xs text-purple-300">
                    Users Affected: ${data.errorDetails.affected}
                  </p>
                </div>
              </div>
            `;
          },
        },
        legend: {
          labels: {
            colors: "#9ca3af",
          },
        },
      };

      const timelineChart = new ApexCharts(
        timelineChartRef.current,
        timelineOptions
      );
      timelineChart.render();

      return () => {
        timelineChart.destroy();
      };
    }
  }, [timeSeriesData, chartType]);

  // Pie chart initialization
  useEffect(() => {
    if (pieChartRef.current) {
      const errorTypes = [
        { name: "JavaScript Errors", value: 45, color: "#ef4444" },
        { name: "API Failures", value: 30, color: "#f97316" },
        { name: "Network Issues", value: 15, color: "#eab308" },
        { name: "Validation Errors", value: 10, color: "#8b5cf6" },
      ];

      const pieOptions = {
        chart: {
          type: "donut",
          height: 350,
          background: "transparent",
          parentHeightOffset: 0,
        },
        series: errorTypes.map((type) => type.value),
        labels: errorTypes.map((type) => type.name),
        colors: errorTypes.map((type) => type.color),
        dataLabels: {
          enabled: false,
        },
        stroke: {
          width: 0,
        },
        plotOptions: {
          pie: {
            donut: {
              size: "65%",
            },
          },
        },
        legend: {
          position: "bottom",
          labels: {
            colors: "#9ca3af",
          },
        },
        tooltip: {
          fillSeriesColor: true,
          theme: "dark",
        },
      };

      const pieChart = new ApexCharts(pieChartRef.current, pieOptions);
      pieChart.render();

      return () => {
        pieChart.destroy();
      };
    }
  }, []);

  // Bar chart initialization
  useEffect(() => {
    if (barChartRef.current && timeSeriesData.length) {
      const barOptions = {
        chart: {
          type: "bar",
          height: 350,
          toolbar: {
            show: false,
          },
          background: "transparent",
          parentHeightOffset: 0,
        },
        series: [
          {
            name: "Errors",
            data: timeSeriesData.slice(-12).map((d) => d.errors),
          },
        ],
        colors: ["#8b5cf6"],
        plotOptions: {
          bar: {
            borderRadius: 2,
            columnWidth: "60%",
          },
        },
        dataLabels: {
          enabled: false,
        },
        grid: {
          show: false,
        },
        xaxis: {
          categories: timeSeriesData.slice(-12).map((d) => d.timeLabel),
          labels: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          show: false,
        },
        tooltip: {
          enabled: false,
        },
      };

      const barChart = new ApexCharts(barChartRef.current, barOptions);
      barChart.render();

      return () => {
        barChart.destroy();
      };
    }
  }, [timeSeriesData]);

  const recentErrors = [
    {
      id: 1,
      type: "TypeError",
      message: "Cannot read property of undefined",
      count: 23,
      time: "2 min ago",
      severity: "High",
    },
    {
      id: 2,
      type: "NetworkError",
      message: "Failed to fetch user data",
      count: 15,
      time: "5 min ago",
      severity: "Medium",
    },
    {
      id: 3,
      type: "ValidationError",
      message: "Invalid email format",
      count: 8,
      time: "12 min ago",
      severity: "Low",
    },
    {
      id: 4,
      type: "ReferenceError",
      message: "Function not defined",
      count: 34,
      time: "18 min ago",
      severity: "High",
    },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "High":
        return "text-red-400 bg-red-500/20";
      case "Medium":
        return "text-yellow-400 bg-yellow-500/20";
      case "Low":
        return "text-green-400 bg-green-500/20";
      default:
        return "text-purple-400 bg-purple-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-2">
              Error Monitoring Dashboard
            </h1>
            <p className="text-purple-300">
              Real-time application health and error tracking
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 bg-purple-800/50 hover:bg-purple-700/50 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 bg-purple-800/50 hover:bg-purple-700/50 rounded-lg transition-colors">
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <div className="text-2xl font-bold text-red-300 mb-1">2,847</div>
          <div className="text-sm text-red-200">Total Errors (24h)</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-blue-400" />
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
              -5%
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-300 mb-1">98.7%</div>
          <div className="text-sm text-blue-200">Uptime</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-green-400" />
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
              +8%
            </span>
          </div>
          <div className="text-2xl font-bold text-green-300 mb-1">15,432</div>
          <div className="text-sm text-green-200">Active Sessions</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-purple-400" />
            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
              Alert
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-300 mb-1">156ms</div>
          <div className="text-sm text-purple-200">Avg Response Time</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-gray-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-purple-200">
            Error Timeline
          </h2>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800/50 border border-purple-500/30 text-purple-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            <button
              onClick={() =>
                setChartType(chartType === "congested" ? "smooth" : "congested")
              }
              className="bg-purple-700/50 hover:bg-purple-600/50 text-purple-200 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {chartType === "congested"
                ? "Switch to Smooth"
                : "Switch to Congested"}
            </button>
          </div>
        </div>

        <div ref={timelineChartRef} className="h-80" />
      </div>

      {/* Secondary Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Error Types Distribution */}
        <div className="bg-gray-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-200 mb-4">
            Error Distribution
          </h3>
          <div ref={pieChartRef} className="h-64" />
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { name: "JavaScript Errors", value: 45, color: "#ef4444" },
              { name: "API Failures", value: 30, color: "#f97316" },
              { name: "Network Issues", value: 15, color: "#eab308" },
              { name: "Validation Errors", value: 10, color: "#8b5cf6" },
            ].map((type, index) => (
              <div key={index} className="flex items-center text-xs">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: type.color }}
                ></div>
                <span className="text-purple-200">
                  {type.name} ({type.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Errors */}
        <div className="bg-gray-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-200 mb-4">
            Recent Critical Errors
          </h3>
          <div className="space-y-3">
            {recentErrors.map((error) => (
              <div
                key={error.id}
                className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-red-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-red-400 font-medium text-sm">
                        {error.type}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(
                          error.severity
                        )}`}
                      >
                        {error.severity}
                      </span>
                    </div>
                    <p className="text-purple-200 text-sm mb-2">
                      {error.message}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-purple-300">
                      <span className="flex items-center">
                        <Bug className="w-3 h-3 mr-1" />
                        {error.count} occurrences
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {error.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-gray-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-200 mb-4">
            Response Times
          </h3>
          <div ref={barChartRef} className="h-32" />
        </div>

        <div className="bg-gray-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-200 mb-4">
            Alert Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-purple-300">Critical Alerts</span>
              <span className="text-red-400 font-bold">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-300">Warnings</span>
              <span className="text-yellow-400 font-bold">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-300">Info</span>
              <span className="text-blue-400 font-bold">28</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-200 mb-4">
            System Health
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-purple-300">CPU Usage</span>
              <div className="flex items-center">
                <div className="w-16 h-2 bg-gray-700 rounded-full mr-2">
                  <div className="w-12 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-green-400 text-sm">75%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-300">Memory</span>
              <div className="flex items-center">
                <div className="w-16 h-2 bg-gray-700 rounded-full mr-2">
                  <div className="w-10 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-yellow-400 text-sm">62%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-300">Disk I/O</span>
              <div className="flex items-center">
                <div className="w-16 h-2 bg-gray-700 rounded-full mr-2">
                  <div className="w-6 h-2 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-green-400 text-sm">38%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMonitoringDashboard;
