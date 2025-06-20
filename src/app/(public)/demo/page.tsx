"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Shield,
  Activity,
  Bell,
  Settings,
  Search,
  Filter,
  Play,
  Pause,
  Volume2,
  Maximize2,
  Download,
  Share2,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  BarChart3,
} from "lucide-react";

// Animated Background Component
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950"></div>
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-full h-full border border-blue-500/10 rounded-full"
          initial={{
            scale: 0.1 + i * 0.15,
            opacity: 0.3 - i * 0.05,
          }}
          animate={{
            scale: [0.1 + i * 0.15, 0.2 + i * 0.2, 0.1 + i * 0.15],
            opacity: [0.3 - i * 0.05, 0.15 - i * 0.02, 0.3 - i * 0.05],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          initial={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.3 + Math.random() * 0.4,
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Video Player Component
function VideoPlayer({ title, description, thumbnail, isActive, onClick }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 120; // 2 minutes demo video

  useEffect(() => {
    if (isPlaying && isActive) {
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isActive, duration]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      className={`relative bg-black/40 backdrop-blur-sm border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
        isActive
          ? "border-blue-500/50 shadow-lg shadow-blue-500/20"
          : "border-white/10 hover:border-white/20"
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
    >
      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>

        {/* Simulated Video Content */}
        <motion.div
          className="w-full h-full flex items-center justify-center"
          animate={isActive && isPlaying ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              {thumbnail}
            </div>
            <h3 className="text-white font-semibold">{title}</h3>
          </div>
        </motion.div>

        {/* Play Button Overlay */}
        {!isPlaying && (
          <motion.button
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying(true);
            }}
            whileHover={{ scale: 1.1 }}
          >
            <div className="w-16 h-16 bg-blue-500/80 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </motion.button>
        )}

        {/* Video Controls */}
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white" />
                )}
              </button>

              <div className="flex-1 bg-white/20 rounded-full h-1 overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              <span className="text-xs text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                <Volume2 className="w-4 h-4 text-white" />
              </button>

              <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </motion.div>
  );
}

// Live Dashboard Component
function LiveDashboard() {
  const [selectedTab, setSelectedTab] = useState("errors");
  const [selectedError, setSelectedError] = useState(null);
  const [filters, setFilters] = useState({ severity: "all", service: "all" });

  const [errors, setErrors] = useState([
    {
      id: 1,
      type: "error",
      message: "TypeError: Cannot read property 'id' of undefined",
      service: "User Service",
      timestamp: "2024-06-02T10:30:15Z",
      severity: "high",
      count: 23,
      stack:
        "at getUserProfile (user.js:45:12)\n  at processRequest (api.js:123:5)\n  at Server.handleRequest (server.js:67:8)",
      affected_users: 156,
      first_seen: "2024-06-02T09:15:30Z",
    },
    {
      id: 2,
      type: "warning",
      message: "Database connection pool exhausted",
      service: "Database Pool",
      timestamp: "2024-06-02T10:28:42Z",
      severity: "medium",
      count: 5,
      stack:
        "at Pool.connect (db-pool.js:89:15)\n  at queryDatabase (query.js:34:7)",
      affected_users: 23,
      first_seen: "2024-06-02T10:25:18Z",
    },
    {
      id: 3,
      type: "info",
      message: "Rate limit threshold reached for API endpoint",
      service: "API Gateway",
      timestamp: "2024-06-02T10:27:18Z",
      severity: "low",
      count: 12,
      stack:
        "at rateLimitMiddleware (middleware.js:156:9)\n  at processAPIRequest (gateway.js:78:4)",
      affected_users: 45,
      first_seen: "2024-06-02T10:20:05Z",
    },
  ]);

  const [metrics, setMetrics] = useState({
    total_errors: 1247,
    error_rate: 0.034,
    avg_response_time: 245,
    uptime: 99.97,
    active_users: 15234,
    requests_per_minute: 8945,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setMetrics((prev) => ({
        ...prev,
        total_errors: prev.total_errors + Math.floor(Math.random() * 3),
        error_rate: Math.max(
          0.001,
          prev.error_rate + (Math.random() - 0.5) * 0.002
        ),
        avg_response_time: Math.max(
          100,
          prev.avg_response_time + (Math.random() - 0.5) * 10
        ),
        active_users:
          prev.active_users + Math.floor((Math.random() - 0.5) * 20),
        requests_per_minute:
          prev.requests_per_minute + Math.floor((Math.random() - 0.5) * 100),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getErrorIcon = (type) => {
    switch (type) {
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "text-red-400 bg-red-500/10";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10";
      default:
        return "text-green-400 bg-green-500/10";
    }
  };

  const filteredErrors = errors.filter((error) => {
    if (filters.severity !== "all" && error.severity !== filters.severity)
      return false;
    if (filters.service !== "all" && error.service !== filters.service)
      return false;
    return true;
  });

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      {/* Dashboard Header */}
      <div className="border-b border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Live Error Dashboard
          </h2>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-4">
          {[
            {
              label: "Total Errors",
              value: metrics.total_errors.toLocaleString(),
              trend: "up",
            },
            {
              label: "Error Rate",
              value: `${metrics.error_rate.toFixed(3)}%`,
              trend: "down",
            },
            {
              label: "Avg Response",
              value: `${Math.round(metrics.avg_response_time)}ms`,
              trend: "up",
            },
            {
              label: "Uptime",
              value: `${metrics.uptime.toFixed(2)}%`,
              trend: "stable",
            },
            {
              label: "Active Users",
              value: metrics.active_users.toLocaleString(),
              trend: "up",
            },
            {
              label: "Requests/min",
              value: metrics.requests_per_minute.toLocaleString(),
              trend: "stable",
            },
          ].map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-lg font-semibold text-white">
                {metric.value}
              </div>
              <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                {metric.trend === "up" && (
                  <TrendingUp className="w-3 h-3 text-red-400" />
                )}
                {metric.trend === "down" && (
                  <TrendingDown className="w-3 h-3 text-green-400" />
                )}
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1">
          {["errors", "performance", "alerts"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                selectedTab === tab
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-4">
        {selectedTab === "errors" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Error List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Recent Errors
                </h3>
                <div className="flex items-center gap-2">
                  <select
                    value={filters.severity}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        severity: e.target.value,
                      }))
                    }
                    className="bg-black/40 border border-white/20 text-white text-sm rounded px-2 py-1"
                  >
                    <option value="all">All Severities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <button className="p-1 text-gray-400 hover:text-white">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredErrors.map((error) => (
                  <motion.div
                    key={error.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedError?.id === error.id
                        ? "border-blue-500/50 bg-blue-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                    onClick={() => setSelectedError(error)}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-start gap-3">
                      {getErrorIcon(error.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                              error.severity
                            )}`}
                          >
                            {error.severity}
                          </span>
                          <span className="text-xs text-gray-400">
                            {error.count} occurrences
                          </span>
                        </div>
                        <p className="text-white text-sm font-medium truncate">
                          {error.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <span>{error.service}</span>
                          <span>•</span>
                          <span>
                            {new Date(error.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Error Details */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Error Details
              </h3>
              {selectedError ? (
                <div className="bg-black/40 rounded-lg p-4 space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">
                      Error Message
                    </h4>
                    <p className="text-gray-300 text-sm bg-black/40 p-3 rounded font-mono">
                      {selectedError.message}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-2">Stack Trace</h4>
                    <pre className="text-gray-300 text-xs bg-black/40 p-3 rounded overflow-x-auto font-mono">
                      {selectedError.stack}
                    </pre>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Impact</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Affected Users:</span>
                          <span className="text-white">
                            {selectedError.affected_users}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Occurrences:</span>
                          <span className="text-white">
                            {selectedError.count}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">Timeline</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">First Seen:</span>
                          <span className="text-white">
                            {new Date(
                              selectedError.first_seen
                            ).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Last Seen:</span>
                          <span className="text-white">
                            {new Date(
                              selectedError.timestamp
                            ).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-black/40 rounded-lg p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Select an error to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === "performance" && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">
              Performance monitoring dashboard would be displayed here
            </p>
          </div>
        )}

        {selectedTab === "alerts" && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">
              Alert configuration panel would be displayed here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PulseguardLiveDemo() {
  const [activeVideo, setActiveVideo] = useState(0);

  const demoVideos = [
    {
      title: "Real-time Error Detection",
      description:
        "Watch how Pulseguard instantly captures and categorizes errors as they happen in your application.",
      thumbnail: <Zap className="w-8 h-8 text-blue-400" />,
    },
    {
      title: "Smart Alert System",
      description:
        "See intelligent alert routing and notification management that reduces noise and focuses on critical issues.",
      thumbnail: <Bell className="w-8 h-8 text-yellow-400" />,
    },
    {
      title: "Detailed Error Analysis",
      description:
        "Explore comprehensive error details, stack traces, and user impact analysis for faster debugging.",
      thumbnail: <Search className="w-8 h-8 text-green-400" />,
    },
    {
      title: "Team Collaboration",
      description:
        "Learn how teams can work together to resolve issues with comments, assignments, and status tracking.",
      thumbnail: <Users className="w-8 h-8 text-purple-400" />,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 p-6"
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-white">Pulseguard</span>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
              LIVE DEMO
            </span>
          </motion.div>

          <div className="flex items-center gap-4">
            <button className="text-gray-300 hover:text-white transition-colors">
              Back to Site
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
            >
              Start Free Trial
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Demo Introduction */}
      <section className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Experience Pulseguard
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Live in Action
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Explore our interactive demo to see how Pulseguard monitors,
            detects, and helps you resolve errors in real-time. No signup
            required – dive right in!
          </motion.p>
        </div>
      </section>

      {/* Video Demonstrations */}
      <section className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-white mb-8 text-center"
          >
            See How It Works
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {demoVideos.map((video, index) => (
              <VideoPlayer
                key={index}
                title={video.title}
                description={video.description}
                thumbnail={video.thumbnail}
                isActive={activeVideo === index}
                onClick={() => setActiveVideo(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Dashboard */}
      <section className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Interactive Live Dashboard
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Click around and explore the dashboard below. All data updates in
              real-time just like the actual application.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <LiveDashboard />
          </motion.div>
        </div>
      </section>

      {/* Feature Callouts */}
      <section className="relative z-10 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Activity className="w-8 h-8" />,
                title: "Real-time Updates",
                description:
                  "See errors as they happen with millisecond precision and instant notifications.",
              },
              {
                icon: <Search className="w-8 h-8" />,
                title: "Deep Analysis",
                description:
                  "Comprehensive stack traces, user impact metrics, and historical trend analysis.",
              },
              {
                icon: <Settings className="w-8 h-8" />,
                title: "Smart Filtering",
                description:
                  "Advanced filtering and search capabilities to find exactly what you need quickly.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-blue-400 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Protect Your Applications?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Start monitoring your applications with Pulseguard today. Setup
              takes less than 5 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-blue-500/25"
              >
                Start Free Trial
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border border-white/20 text-white text-lg font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                View Documentation
              </motion.button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              No credit card required • 14-day free trial • Full feature access
            </p>
          </motion.div>
        </div>
      </section>

      {/* Demo Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xl font-bold text-white">Pulseguard</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-white transition-colors">
                API Reference
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Status
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">
              This is a live demo environment. All data shown is simulated for
              demonstration purposes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
