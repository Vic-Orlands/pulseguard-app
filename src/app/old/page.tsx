"use client";

import { motion } from "framer-motion";
import Head from "next/head";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900">
      <Head>
        <title>PulseGuard | Modern Error Tracking & Observability</title>
        <meta
          name="description"
          content="Real-time error tracking with full context. Detect, diagnose, and resolve issues faster than ever."
        />
      </Head>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        {/* Floating orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-indigo-500/20 to-pink-500/20"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: "blur(40px)",
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 30 + 30,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Circuit lines */}
        {[...Array(12)].map((_, i) => (
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
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <svg
                className="w-8 h-8 text-indigo-400"
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
              <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500">
                PulseGuard
              </span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center space-x-8"
          >
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-300 hover:text-white transition"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-gray-300 hover:text-white transition"
            >
              Pricing
            </a>
            <a
              href="/about"
              className="text-gray-300 hover:text-white transition"
            >
              About
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="hidden md:block"
          >
            <a
              href="#cta"
              className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 transition duration-150"
            >
              Get Started
            </a>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div className="text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500 leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Error Tracking <br className="hidden md:block" />
            with{" "}
            <span className="underline decoration-indigo-400">Superpowers</span>
          </motion.h1>
          <motion.p
            className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            PulseGuard gives you complete visibility into your application's
            health with real-time error tracking, automatic correlation, and
            actionable insights.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <a
              href="#cta"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 transition duration-150 shadow-lg"
            >
              Start Free Trial
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-3 border border-gray-700 text-base font-medium rounded-md text-white bg-gray-800/50 hover:bg-gray-700/50 transition duration-150"
            >
              See How It Works
            </a>
          </motion.div>
        </div>
      </div>

      {/* Logo Cloud */}
      <div className="relative z-10 bg-gray-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.p
            className="text-center text-sm uppercase tracking-wider text-gray-400 mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Trusted by engineering teams at
          </motion.p>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {["TechCorp", "Innova", "Vertex", "Nexus", "Quantum"].map(
              (company, i) => (
                <motion.div
                  key={i}
                  className="flex justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-gray-100">
                    {company}
                  </div>
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div
        id="features"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      >
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Never Miss a Critical Error Again
          </h2>
          <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
            PulseGuard combines error tracking with full observability context
            for faster debugging.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Full-Stack Error Tracking",
              description:
                "Capture errors across your entire stack with context-rich reports including stack traces, environment data, and user actions.",
              icon: "M13 10V3L4 14h7v7l9-11h-7z",
            },
            {
              title: "Automatic Correlation",
              description:
                "Errors automatically linked to relevant logs, traces, and metrics for complete debugging context.",
              icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
            },
            {
              title: "Real-Time Alerting",
              description:
                "Get notified through Slack, email, or PagerDuty when errors spike or new patterns emerge.",
              icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 hover:border-indigo-400 transition duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-6 border border-indigo-400/30">
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
                    d={feature.icon}
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="relative z-10 bg-gray-800/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              How PulseGuard Works
            </h2>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              A seamless integration that provides complete error observability.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline */}
            <div className="hidden md:block absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-indigo-500 to-pink-500 -ml-px"></div>

            {/* Steps */}
            <div className="space-y-16">
              {[
                {
                  step: "1",
                  title: "Error Detection",
                  description:
                    "PulseGuard agents monitor your applications in real-time, capturing errors with full stack traces and context.",
                  direction: "left",
                },
                {
                  step: "2",
                  title: "Context Enrichment",
                  description:
                    "Each error is automatically enriched with relevant logs, traces, and metrics from the same time period.",
                  direction: "right",
                },
                {
                  step: "3",
                  title: "Intelligent Processing",
                  description:
                    "Our pipeline groups similar errors, calculates impact scores, and correlates with deployment markers.",
                  direction: "left",
                },
                {
                  step: "4",
                  title: "Visualization & Alerting",
                  description:
                    "The unified dashboard shows error trends and affected users. Custom alerts notify your team through preferred channels.",
                  direction: "right",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className={`relative flex flex-col md:flex-row ${
                    item.direction === "left"
                      ? "md:flex-row"
                      : "md:flex-row-reverse"
                  } items-center`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl mb-4 md:mb-0">
                    {item.step}
                  </div>
                  <div
                    className={`flex-1 ${
                      item.direction === "left" ? "md:ml-8" : "md:mr-8"
                    } bg-gray-800/50 rounded-xl p-8 border border-gray-700`}
                  >
                    <h3 className="text-xl font-bold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-300">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700">
          <div className="p-6 border-b border-gray-700 flex items-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="ml-4 text-sm text-gray-400">
              dashboard.pulseguard.io
            </div>
          </div>
          <div className="p-8">
            <motion.div
              className="relative h-96 bg-gray-900 rounded-lg overflow-hidden"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {/* Mock dashboard content */}
              <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-4 p-4">
                {/* Error rate chart */}
                <div className="col-span-8 row-span-4 bg-gray-800/50 rounded border border-gray-700 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-white font-medium">Error Rate (24h)</h4>
                    <div className="text-sm text-gray-400">Last 24 hours</div>
                  </div>
                  <div className="relative h-40">
                    <div className="absolute bottom-0 left-0 right-0 grid grid-cols-24 h-full gap-px">
                      {[...Array(24)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="bg-gradient-to-t from-indigo-500 to-indigo-500/10"
                          initial={{ height: "0%" }}
                          whileInView={{
                            height: `${Math.random() * 70 + 30}%`,
                          }}
                          transition={{
                            duration: 0.8,
                            delay: i * 0.03,
                            type: "spring",
                            damping: 5,
                          }}
                          viewport={{ once: true }}
                        />
                      ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 grid grid-cols-24 h-full gap-px">
                      {[...Array(24)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="bg-gradient-to-t from-pink-500 to-pink-500/10"
                          initial={{ height: "0%" }}
                          whileInView={{
                            height: `${Math.random() * 50 + 10}%`,
                          }}
                          transition={{
                            duration: 0.8,
                            delay: i * 0.03 + 0.2,
                            type: "spring",
                            damping: 5,
                          }}
                          viewport={{ once: true }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top errors */}
                <div className="col-span-4 row-span-4 bg-gray-800/50 rounded border border-gray-700 p-4">
                  <h4 className="text-white font-medium mb-4">Top Errors</h4>
                  <div className="space-y-4">
                    {[
                      {
                        name: "NullPointerException",
                        count: "142",
                        change: "+12%",
                      },
                      { name: "TimeoutError", count: "87", change: "+34%" },
                      { name: "DBConnectionError", count: "53", change: "-5%" },
                      { name: "ValidationError", count: "42", change: "+8%" },
                    ].map((error, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                      >
                        <div className="text-sm text-gray-300 truncate">
                          {error.name}
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">
                            {error.count}
                          </span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              error.change.startsWith("+")
                                ? "bg-red-500/20 text-red-400"
                                : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {error.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error distribution */}
                <div className="col-span-6 row-span-2 bg-gray-800/50 rounded border border-gray-700 p-4">
                  <h4 className="text-white font-medium mb-4">
                    Error Distribution
                  </h4>
                  <div className="flex items-center h-16">
                    <div className="flex-1 h-2 bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-500 rounded-full"></div>
                  </div>
                </div>

                {/* Recent events */}
                <div className="col-span-6 row-span-2 bg-gray-800/50 rounded border border-gray-700 p-4">
                  <h4 className="text-white font-medium mb-4">Recent Events</h4>
                  <div className="space-y-2">
                    {[
                      "New error pattern detected",
                      "Error rate increased by 42%",
                      "Deployment v2.1.0 completed",
                      "Auto-resolution triggered",
                    ].map((event, i) => (
                      <div key={i} className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            i < 2 ? "bg-red-500" : "bg-indigo-500"
                          }`}
                        ></div>
                        <span className="text-sm text-gray-300">{event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        id="cta"
        className="relative z-10 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Ready to revolutionize your error tracking?
            </motion.h2>
            <motion.p
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              Join thousands of developers who ship more confidently with
              PulseGuard.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <a
                href="/signup"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 transition duration-150 shadow-lg"
              >
                Start Free Trial
              </a>
              <a
                href="/demo"
                className="px-8 py-3 border border-gray-700 text-base font-medium rounded-md text-white bg-gray-800/50 hover:bg-gray-700/50 transition duration-150"
              >
                Request Demo
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/80 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Guides
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    API Status
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
                Connect
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
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
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500">
                PulseGuard
              </span>
            </div>
            <p className="mt-4 md:mt-0 text-gray-400 text-sm">
              © {new Date().getFullYear()} PulseGuard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
