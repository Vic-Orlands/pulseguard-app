"use client"

import React, { useState, useEffect } from 'react';
import { motion } from "motion/react";
import { 
  AlertTriangle, 
  Server, 
  Activity, 
  TrendingUp, 
  Clock, 
  Users, 
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  BarChart3,
  Layers,
  Globe
} from 'lucide-react';

export default function PulseGuardDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data - in real app this would come from your API
  const recentErrors = [
    {
      id: 1,
      message: "Database connection timeout",
      project: "Authentication Service",
      timestamp: "2 minutes ago",
      severity: "critical",
      count: 12
    },
    {
      id: 2,
      message: "Invalid API key in payment gateway",
      project: "E-commerce API",
      timestamp: "8 minutes ago",
      severity: "high",
      count: 5
    },
    {
      id: 3,
      message: "Memory leak detected in user session handler",
      project: "User Management",
      timestamp: "15 minutes ago",
      severity: "medium",
      count: 3
    },
    {
      id: 4,
      message: "Rate limit exceeded for external API",
      project: "Notification Service",
      timestamp: "23 minutes ago",
      severity: "low",
      count: 8
    }
  ];

  const activeAlerts = [
    {
      id: 1,
      title: "High Error Rate Detected",
      description: "Authentication Service experiencing 15% error rate",
      severity: "critical",
      time: "5 min ago"
    },
    {
      id: 2,
      title: "Database Performance Degraded",
      description: "Query response time increased by 300%",
      severity: "high",
      time: "12 min ago"
    },
    {
      id: 3,
      title: "Memory Usage Alert",
      description: "User Management service using 85% memory",
      severity: "medium",
      time: "18 min ago"
    }
  ];

  const projects = [
    { name: "Authentication Service", status: "critical", errors: 24, uptime: "99.2%" },
    { name: "E-commerce API", status: "warning", errors: 8, uptime: "99.7%" },
    { name: "User Management", status: "healthy", errors: 2, uptime: "99.9%" },
    { name: "Notification Service", status: "healthy", errors: 1, uptime: "100%" }
  ];

  const metrics = {
    totalErrors: 1247,
    errorRate: "2.3%",
    avgResponseTime: "145ms",
    uptime: "99.8%",
    activeUsers: 2456,
    apiCalls: "1.2M"
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-500/10 text-red-400';
      case 'high': return 'border-orange-500 bg-orange-500/10 text-orange-400';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      case 'low': return 'border-blue-500 bg-blue-500/10 text-blue-400';
      default: return 'border-gray-500 bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'healthy': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
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

      {/* Dashboard Content */}
      <div className="relative z-10 p-6">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  PulseGuard
                </h1>
                <p className="text-gray-400 mt-2">Error Monitoring & Observability Platform</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono text-blue-400">
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="text-gray-400">
                  {currentTime.toLocaleDateString()}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Metrics Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            {[
              { label: "Total Errors", value: metrics.totalErrors.toLocaleString(), icon: AlertTriangle, color: "text-red-400" },
              { label: "Error Rate", value: metrics.errorRate, icon: TrendingUp, color: "text-orange-400" },
              { label: "Avg Response Time", value: metrics.avgResponseTime, icon: Clock, color: "text-blue-400" },
              { label: "System Uptime", value: metrics.uptime, icon: Activity, color: "text-green-400" },
              { label: "Active Users", value: metrics.activeUsers.toLocaleString(), icon: Users, color: "text-purple-400" },
              { label: "API Calls", value: metrics.apiCalls, icon: Globe, color: "text-cyan-400" }
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  <span className="text-2xl font-bold text-white">{metric.value}</span>
                </div>
                <p className="text-gray-400 text-sm">{metric.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Errors */}
            <motion.div
              variants={itemVariants}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                  Recent Errors
                </h2>
                <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentErrors.map((error, index) => (
                  <motion.div
                    key={error.id}
                    className={`border rounded-lg p-4 ${getSeverityColor(error.severity)} hover:bg-opacity-20 transition-all duration-200`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-1">{error.message}</h3>
                        <p className="text-gray-400 text-sm">{error.project}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{error.count}</div>
                        <div className="text-xs text-gray-400">{error.timestamp}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Active Alerts */}
            <motion.div
              variants={itemVariants}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                  Active Alerts
                </h2>
                <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Manage
                </button>
              </div>
              <div className="space-y-4">
                {activeAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)} hover:bg-opacity-20 transition-all duration-200`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: -5 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white">{alert.title}</h3>
                      <span className="text-xs text-gray-400">{alert.time}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{alert.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Project Status */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Layers className="w-5 h-5 text-blue-400 mr-2" />
                Project Health Overview
              </h2>
              <button className="text-blue-400 hover:text-blue-300 text-sm flex items-center">
                <Server className="w-4 h-4 mr-1" />
                All Projects
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {projects.map((project, index) => (
                <motion.div
                  key={project.name}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white truncate">{project.name}</h3>
                    <div className={`flex items-center ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Errors (24h)</span>
                      <span className="text-white font-mono">{project.errors}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Uptime</span>
                      <span className="text-green-400 font-mono">{project.uptime}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* System Status Bar */}
          <motion.div
            variants={itemVariants}
            className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-green-400 font-medium">All Systems Operational</span>
                </div>
                <div className="text-gray-400 text-sm">
                  Last updated: {currentTime.toLocaleTimeString()}
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <Server className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="text-gray-400">4 Services</span>
                </div>
                <div className="flex items-center">
                  <Activity className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-gray-400">99.8% Uptime</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}