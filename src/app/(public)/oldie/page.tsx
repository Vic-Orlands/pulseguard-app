"use client";

import AnimatedBackground from "@/components/background-color";
import { motion } from "motion/react";
import Head from "next/head";

// Custom PulseGuard logo component
const PulseGuardLogo = () => (
  <div className="flex items-center">
    <div className="mr-2 relative">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-80"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
    </div>
    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
      PulseGuard
    </span>
  </div>
);

// Feature card component for reusability
const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-blue-400 transition duration-300 group"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
  >
    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6 border border-blue-400/30 group-hover:bg-blue-500/30 transition-all duration-300">
      <svg
        className="w-6 h-6 text-blue-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d={icon}
        />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
);

// Timeline step component for how it works section
const TimelineStep = ({ step, title, description, direction }) => (
  <motion.div
    className={`relative flex flex-col md:flex-row ${
      direction === "left" ? "md:flex-row" : "md:flex-row-reverse"
    } items-center`}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
  >
    <div className="flex-shrink-0 relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl mb-4 md:mb-0 shadow-lg shadow-blue-500/20">
      {step}
    </div>
    <div
      className={`flex-1 ${
        direction === "left" ? "md:ml-8" : "md:mr-8"
      } bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-blue-400/50 transition duration-300`}
    >
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Head>
        <title>PulseGuard | Modern Error Tracking & Observability</title>
        <meta
          name="description"
          content="Real-time error tracking with full context. Detect, diagnose, and resolve issues faster than ever."
        />
      </Head>

      {/* Custom Animated Background */}
      <AnimatedBackground />

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PulseGuardLogo />
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
              className="px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition duration-150 shadow-lg shadow-blue-500/20"
            >
              Get Started
            </a>
          </motion.div>

          {/* Mobile menu button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="md:hidden"
          >
            <button className="text-gray-300 hover:text-white focus:outline-none">
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div className="text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Error Tracking <br className="hidden md:block" />
            with{" "}
            <span className="underline decoration-blue-400">Superpowers</span>
          </motion.h1>
          <motion.p
            className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            PulseGuard gives you complete visibility into your
            application&apos;s health with real-time error tracking, automatic
            correlation, and actionable insights.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <a
              href="#cta"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition duration-300 shadow-lg shadow-blue-500/20"
            >
              Start Free Trial
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-3 border border-gray-700 text-base font-medium rounded-md text-white bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition duration-300"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Animated Arrow */}
          <motion.div
            className="mt-16 flex justify-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 1,
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Logo Cloud */}
      <div className="relative z-10 bg-gray-800/30 backdrop-blur-sm py-12">
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
                  whileHover={{ scale: 1.05 }}
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
            <FeatureCard
              key={i}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>

        {/* Additional Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {[
            {
              title: "AI Error Analysis",
              description:
                "Our AI analyzes error patterns to provide actionable insights and suggest potential fixes.",
              icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
            },
            {
              title: "Custom Dashboards",
              description:
                "Build tailored dashboards to monitor the metrics and errors that matter most to your team.",
              icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
            },
            {
              title: "User Impact Tracking",
              description:
                "Identify which users are affected by specific errors to prioritize fixing the most critical issues.",
              icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
            },
          ].map((feature, i) => (
            <FeatureCard
              key={i}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div
        id="how-it-works"
        className="relative z-10 bg-gray-800/30 backdrop-blur-sm py-24"
      >
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
            <div className="hidden md:block absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 -ml-px"></div>

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
                <TimelineStep
                  key={i}
                  step={item.step}
                  title={item.title}
                  description={item.description}
                  direction={item.direction}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 shadow-xl shadow-blue-500/5">
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
                          className="bg-gradient-to-t from-blue-500 to-blue-500/10"
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
                          className="bg-gradient-to-t from-purple-500 to-purple-500/10"
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
                    <div className="flex-1 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
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
                            i < 2 ? "bg-red-500" : "bg-blue-500"
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

      {/* Pricing Section */}
      <div
        id="pricing"
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
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the plan that&apos;s right for your team.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Starter",
              price: "$29",
              description: "Perfect for small teams or side projects",
              features: [
                "Up to 10,000 errors/month",
                "7-day data retention",
                "Basic error grouping",
                "Email alerts",
                "5 team members",
              ],
            },
            {
              name: "Professional",
              price: "$99",
              description: "For growing teams with serious applications",
              features: [
                "Up to 100,000 errors/month",
                "30-day data retention",
                "Advanced error grouping",
                "Slack & PagerDuty integration",
                "Unlimited team members",
                "API access",
              ],
              featured: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              description: "For large-scale applications with complex needs",
              features: [
                "Unlimited errors",
                "1-year data retention",
                "Custom integrations",
                "Priority support",
                "Dedicated account manager",
                "SSO & advanced security",
              ],
            },
          ].map((plan, i) => (
            <motion.div
              key={i}
              className={`bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border ${
                plan.featured
                  ? "border-blue-400 shadow-lg shadow-blue-500/10"
                  : "border-gray-700"
              } flex flex-col`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold py-1 px-3 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">
                {plan.name}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  {plan.price}
                </span>
                {plan.price !== "Custom" && (
                  <span className="text-gray-400 ml-2">/month</span>
                )}
              </div>
              <p className="text-gray-300 mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href={plan.featured ? "#cta" : "#contact"}
                className={`mt-auto w-full py-3 rounded-md text-center font-medium transition duration-150 ${
                  plan.featured
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-gray-700/50 hover:bg-gray-600/50 text-white"
                }`}
              >
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </a>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative z-10 bg-gray-800/30 backdrop-blur-sm py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              What Our Customers Say
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "PulseGuard has reduced our debugging time by 70%. The error correlation feature alone has been a game-changer for us.",
                name: "Sarah Chen",
                title: "CTO at TechCorp",
              },
              {
                quote:
                  "We used to miss critical errors. Now with PulseGuard, we catch them immediately and often fix them before users even notice.",
                name: "Michael Rodriguez",
                title: "Engineering Lead at Innova",
              },
              {
                quote:
                  "The AI-powered insights have helped us identify error patterns we would have never caught manually. Worth every penny.",
                name: "Aisha Johnson",
                title: "VP Engineering at Vertex",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                className="bg-gray-800/40 backdrop-blur-sm p-8 rounded-xl border border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="mb-6">
                  {[...Array(5)].map((_, j) => (
                    <svg
                      key={j}
                      className="w-5 h-5 text-yellow-400 inline-block mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 italic mb-8">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-lg font-bold text-white">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-400">{testimonial.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        id="cta"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      >
        <motion.div
          className="bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-12 border border-blue-500/30 shadow-xl shadow-blue-500/5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Master Your Error Handling?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              Join thousands of engineering teams who trust PulseGuard to keep
              their applications running smoothly.
            </p>

            <div className="flex flex-col md:flex-row justify-center gap-4">
              <input
                type="email"
                placeholder="Enter your work email"
                className="px-6 py-3 rounded-md bg-gray-800/70 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80"
              />
              <button className="px-8 py-3 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition duration-150 shadow-lg shadow-blue-500/20">
                Start Free Trial
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/70 backdrop-blur-sm border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <PulseGuardLogo />
              <p className="mt-4 text-sm text-gray-400">
                Modern error tracking and observability for engineering teams.
              </p>
              <div className="mt-6 flex space-x-4">
                {["Twitter", "LinkedIn", "GitHub", "Discord"].map(
                  (social, i) => (
                    <a
                      key={i}
                      href="#"
                      className="text-gray-400 hover:text-white transition"
                    >
                      <span className="sr-only">{social}</span>
                      <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-xs">{social.charAt(0)}</span>
                      </div>
                    </a>
                  )
                )}
              </div>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                {["Features", "Pricing", "Integrations", "Docs", "API"].map(
                  (item, i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className="text-sm text-gray-400 hover:text-white transition"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                {["About", "Blog", "Careers", "Contact", "Privacy"].map(
                  (item, i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className="text-sm text-gray-400 hover:text-white transition"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                {[
                  "Community",
                  "Help Center",
                  "Status",
                  "Changelog",
                  "Roadmap",
                ].map((item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-white transition"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} PulseGuard. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
