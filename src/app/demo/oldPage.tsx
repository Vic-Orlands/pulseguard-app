"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Shield,
  Zap,
  Activity,
  TrendingUp,
  Bell,
  ChevronRight,
  Play,
  Pause,
  Eye,
  CheckCircle,
  XCircle,
  BarChart3,
  Globe,
  Users,
  Clock,
} from "lucide-react";
import AnimatedBackground from "@/components/background-color";

// Live Error Feed Component
function LiveErrorFeed() {
  const [errors, setErrors] = useState([
    {
      id: 1,
      type: "error",
      message: "Database connection timeout",
      service: "API Gateway",
      time: "2s ago",
      severity: "high",
    },
    {
      id: 2,
      type: "warning",
      message: "High memory usage detected",
      service: "Web Server",
      time: "5s ago",
      severity: "medium",
    },
    {
      id: 3,
      type: "info",
      message: "Deployment completed successfully",
      service: "CI/CD",
      time: "12s ago",
      severity: "low",
    },
  ]);

  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const newError = {
        id: Date.now(),
        type: ["error", "warning", "info"][Math.floor(Math.random() * 3)],
        message: [
          "Rate limit exceeded for API endpoint",
          "SSL certificate expires in 7 days",
          "New user registration spike detected",
          "Cache miss ratio above threshold",
          "Background job queue growing",
          "Third-party service responding slowly",
        ][Math.floor(Math.random() * 6)],
        service: [
          "API Gateway",
          "Web Server",
          "Database",
          "CDN",
          "Auth Service",
        ][Math.floor(Math.random() * 5)],
        time: "now",
        severity: ["high", "medium", "low"][Math.floor(Math.random() * 3)],
      };

      setErrors((prev) => [newError, ...prev.slice(0, 4)]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const getIcon = (type) => {
    switch (type) {
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "high":
        return "border-l-red-500 bg-red-500/5";
      case "medium":
        return "border-l-yellow-500 bg-yellow-500/5";
      default:
        return "border-l-green-500 bg-green-500/5";
    }
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Live Error Feed
        </h3>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      <div className="space-y-3 max-h-64 overflow-hidden">
        <AnimatePresence>
          {errors.map((error, index) => (
            <motion.div
              key={error.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`border-l-4 p-3 rounded-r-lg ${getSeverityClass(
                error.severity
              )}`}
            >
              <div className="flex items-start gap-3">
                {getIcon(error.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">
                    {error.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      {error.service}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-400">{error.time}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Metrics Dashboard Component
function MetricsDashboard() {
  const [activeMetric, setActiveMetric] = useState(0);

  const metrics = [
    {
      label: "Error Rate",
      value: "0.03%",
      change: "-23%",
      trend: "down",
      color: "text-green-400",
    },
    {
      label: "Response Time",
      value: "245ms",
      change: "+12%",
      trend: "up",
      color: "text-yellow-400",
    },
    {
      label: "Uptime",
      value: "99.98%",
      change: "+0.1%",
      trend: "up",
      color: "text-green-400",
    },
    {
      label: "Alerts",
      value: "7",
      change: "-42%",
      trend: "down",
      color: "text-green-400",
    },
  ];

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        System Metrics
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
              activeMetric === index
                ? "bg-white/10 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                : "bg-white/5 hover:bg-white/8"
            }`}
            onClick={() => setActiveMetric(index)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-2xl font-bold text-white mb-1">
              {metric.value}
            </div>
            <div className="text-sm text-gray-400 mb-2">{metric.label}</div>
            <div
              className={`text-xs font-medium ${metric.color} flex items-center gap-1`}
            >
              <TrendingUp
                className={`w-3 h-3 ${
                  metric.trend === "down" ? "rotate-180" : ""
                }`}
              />
              {metric.change}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Features showcase
function FeatureCard({ icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-black/30 transition-all duration-300 group"
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

export default function PulseguardDemo() {
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSection((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Docs
            </a>
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

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              >
                Monitor Your Apps
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Like a Guardian
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-gray-300 mb-8 leading-relaxed"
              >
                Real-time error monitoring, intelligent alerts, and
                comprehensive analytics to keep your applications running
                smoothly 24/7.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold flex items-center gap-2 hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                >
                  Get Started Free
                  <ChevronRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  Live Demo
                </motion.button>
              </motion.div>
            </div>

            <div className="space-y-6">
              <LiveErrorFeed />
              <MetricsDashboard />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Powerful Features for Modern Applications
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to monitor, debug, and optimize your
              applications in one comprehensive platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Real-Time Monitoring"
              description="Instant error detection and alerting with millisecond precision. Get notified the moment something goes wrong."
              delay={0.1}
            />

            <FeatureCard
              icon={<Bell className="w-8 h-8" />}
              title="Smart Alerts"
              description="Intelligent alert system that reduces noise and focuses on what matters most to your application's health."
              delay={0.2}
            />

            <FeatureCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Advanced Analytics"
              description="Deep insights into error patterns, performance trends, and user impact with beautiful visualizations."
              delay={0.3}
            />

            <FeatureCard
              icon={<Globe className="w-8 h-8" />}
              title="Multi-Platform"
              description="Support for web, mobile, and server applications across all major programming languages and frameworks."
              delay={0.4}
            />

            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Team Collaboration"
              description="Seamless team workflows with role-based access, comments, and integrated communication tools."
              delay={0.5}
            />

            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Historical Data"
              description="Complete error history and trend analysis to identify patterns and prevent future issues."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-black/40 to-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-12">
              Trusted by Developers Worldwide
            </h2>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: "50K+", label: "Applications Monitored" },
                { number: "99.9%", label: "Uptime Guaranteed" },
                { number: "2M+", label: "Errors Caught Daily" },
                { number: "<10ms", label: "Alert Response Time" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
              Ready to Guard Your Applications?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who trust Pulseguard to keep their
              applications running smoothly.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-blue-500/25"
            >
              Start Your Free Trial
            </motion.button>

            <p className="text-sm text-gray-500 mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
