"use client";

import { motion } from "motion/react";
import Head from "next/head";
import {
  Footer,
  Navbar,
} from "../../../components/dashboard/tabs/traces/trace-to-logs";
import AnimatedBackground from "@/components/background-color";
import Architecture from "./architecture";
import { useState } from "react";

export default function AboutPage() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <AnimatedBackground />
      <Navbar />

      <div className="relative min-h-screen overflow-hidden">
        <Head>
          <title>About PulseGuard | Modern Error Tracking</title>
        </Head>

        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute border border-indigo-400/10 rounded-full"
              style={{
                width: `${Math.random() * 400 + 100}px`,
                height: `${Math.random() * 400 + 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                rotate: Math.random() * 360,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: Math.random() * 15 + 15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <motion.h1
              className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Why PulseGuard?
            </motion.h1>
            <motion.p
              className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Modern error tracking that gives you complete visibility into your
              application&apos;s health.
            </motion.p>
          </div>

          {/* Problem/Solution Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                The Problem
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Traditional error tracking is reactive, fragmented, and lacks
                  context.
                </p>
                <p>When errors occur, developers waste hours:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Searching through logs across multiple systems</li>
                  <li>Reproducing issues without proper context</li>
                  <li>Missing patterns that could prevent future errors</li>
                  <li>Losing valuable time in war rooms</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Our Solution
              </h2>
              <div className="space-y-4 text-gray-300">
                <p>PulseGuard provides complete error observability:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Real-time error detection with full stack traces</li>
                  <li>Automatic correlation with logs, metrics, and traces</li>
                  <li>Intelligent error grouping and prioritization</li>
                  <li>Historical trends and impact analysis</li>
                  <li>One-click access to all debugging context</li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* How It Works - Diagram Section */}
          <div className="mb-24">
            <motion.h2
              className="text-3xl font-bold text-white mb-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              How PulseGuard Works
            </motion.h2>

            {/* Architectural Diagram */}
            <div className="relative bg-gray-800/50 rounded-xl p-8 border border-gray-700">
              {/* Diagram Components */}
              <div className="grid grid-cols-5 gap-4 items-center">
                {/* Application */}
                <motion.div
                  className="bg-indigo-500/20 p-4 rounded-lg border border-indigo-400 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <div className="w-16 h-16 mx-auto mb-2 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-white font-medium">Your Application</p>
                </motion.div>

                {/* Arrow */}
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <svg
                    className="w-12 h-12 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </motion.div>

                {/* PulseGuard Collector */}
                <motion.div
                  className="bg-pink-500/20 p-4 rounded-lg border border-pink-400 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <div className="w-16 h-16 mx-auto mb-2 bg-pink-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </div>
                  <p className="text-white font-medium">PulseGuard Agent</p>
                </motion.div>

                {/* Arrow */}
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <svg
                    className="w-12 h-12 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </motion.div>

                {/* Processing Pipeline */}
                <motion.div
                  className="bg-green-500/20 p-4 rounded-lg border border-green-400 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                >
                  <div className="w-16 h-16 mx-auto mb-2 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      />
                    </svg>
                  </div>
                  <p className="text-white font-medium">Processing Pipeline</p>
                </motion.div>
              </div>

              {/* Second Row */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                {/* Data Flow Animation */}
                <motion.div
                  className="col-span-3 relative h-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                >
                  <motion.div
                    className="absolute h-1 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"
                    style={{ width: "100%" }}
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>
              </div>

              {/* Third Row */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                {["Loki (Logs)", "Tempo (Traces)", "Prometheus (Metrics)"].map(
                  (item, index) => (
                    <motion.div
                      key={index}
                      className="bg-purple-500/20 p-4 rounded-lg border border-purple-400 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                    >
                      <div className="w-16 h-16 mx-auto mb-2 bg-purple-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                          />
                        </svg>
                      </div>
                      <p className="text-white font-medium">{item}</p>
                    </motion.div>
                  )
                )}
              </div>

              {/* Fourth Row */}
              <div className="mt-8 flex justify-center">
                <motion.div
                  className="relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                >
                  {/* Animated connector lines */}
                  <motion.svg
                    width="800"
                    height="100"
                    viewBox="0 0 800 100"
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                  >
                    <motion.path
                      d="M50,0 Q300,50 400,100"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeDasharray="10 5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                    />
                    <motion.path
                      d="M400,0 L400,100"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeDasharray="10 5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                    />
                    <motion.path
                      d="M750,0 Q500,50 400,100"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeDasharray="10 5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                    />
                    <motion.path
                      d="M400,0 450,2500,100"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeDasharray="10 5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                    />
                    <motion.path
                      d="M750,0 Q500,50 400,100"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeDasharray="10 5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </motion.svg>

                  <div className="bg-blue-500/20 p-6 rounded-lg border border-blue-400 text-center relative z-10">
                    <div className="w-20 h-20 mx-auto mb-4 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <p className="text-white font-medium text-xl">Dashboard</p>
                    <p className="text-gray-300 mt-2">
                      Real-time visualization & alerts
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Architecture Dialog Trigger */}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setOpenModal(true)}
                className="cursor-pointer px-6 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                View Detailed Architecture
              </button>
            </div>
          </div>

          {/* Custom Modal */}
          {openModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/70"
                onClick={() => setOpenModal(false)}
              />

              {/* Modal Content */}
              <div className="relative w-[90vw] h-[90vh] bg-gray-900 rounded-xl">
                <div className="p-6 border-b border-gray-700">
                  <motion.h2
                    className="text-2xl font-bold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    PulseGuard System Architecture Details
                  </motion.h2>
                  <button
                    onClick={() => setOpenModal(false)}
                    className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="overflow-y-auto h-[calc(90vh-120px)]">
                  <Architecture />
                </div>
              </div>
            </div>
          )}

          {/* Detailed Explanation */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-white mb-8">
              The PulseGuard Architecture
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="w-6 h-6 bg-indigo-500 rounded-full mr-3 flex items-center justify-center text-sm">
                    1
                  </span>
                  Error Detection
                </h3>
                <p className="text-gray-300">
                  PulseGuard agents monitor your applications in real-time,
                  capturing errors with full stack traces, context, and
                  environmental data. Our lightweight SDKs support all major
                  languages and frameworks.
                </p>
              </motion.div>

              <motion.div
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="w-6 h-6 bg-pink-500 rounded-full mr-3 flex items-center justify-center text-sm">
                    2
                  </span>
                  Context Enrichment
                </h3>
                <p className="text-gray-300">
                  Each error is automatically enriched with relevant logs
                  (Loki), distributed traces (Tempo), and metrics (Prometheus)
                  from the same time period, giving you complete debugging
                  context.
                </p>
              </motion.div>

              <motion.div
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="w-6 h-6 bg-green-500 rounded-full mr-3 flex items-center justify-center text-sm">
                    3
                  </span>
                  Intelligent Processing
                </h3>
                <p className="text-gray-300">
                  Our pipeline groups similar errors, calculates impact scores,
                  and correlates with deployment markers. Machine learning
                  identifies emerging patterns before they become critical.
                </p>
              </motion.div>

              <motion.div
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="w-6 h-6 bg-blue-500 rounded-full mr-3 flex items-center justify-center text-sm">
                    4
                  </span>
                  Visualization & Alerting
                </h3>
                <p className="text-gray-300">
                  The unified dashboard shows error trends, affected users, and
                  correlated telemetry. Custom alerts notify teams through
                  Slack, email, or PagerDuty based on severity.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-pink-500/10 rounded-xl p-8 border border-indigo-400/30">
            <motion.h2
              className="text-3xl font-bold text-white mb-6 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Why Developers Love PulseGuard
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Complete Context",
                  description:
                    "All debugging data in one place - errors, logs, traces, and metrics correlated automatically.",
                  icon: "M13 10V3L4 14h7v7l9-11h-7z",
                },
                {
                  title: "Blazing Fast",
                  description:
                    "Process millions of errors per second with our optimized pipeline and storage engine.",
                  icon: "M13 10V3L4 14h7v7l9-11h-7z",
                },
                {
                  title: "Smart Insights",
                  description:
                    "AI-powered error grouping and anomaly detection surfaces what matters most.",
                  icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-800/50 rounded-lg p-6 border border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4 border border-indigo-400/30">
                    <svg
                      className="w-6 h-6 text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={item.icon}
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-300">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
