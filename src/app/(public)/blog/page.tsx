"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Shield,
  Zap,
  Eye,
  Activity,
  AlertTriangle,
  BarChart3,
  Database,
  Globe,
  Smartphone,
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

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-300 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// Framework Badge Component
function FrameworkBadge({ name, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium hover:bg-white/20 transition-all duration-300 cursor-default"
    >
      {name}
    </motion.div>
  );
}

// Integration Step Component
function IntegrationStep({ step, title, description, code, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
      className="relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
    >
      <div className="flex items-start gap-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
          {step}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
          <p className="text-gray-300 mb-4">{description}</p>
          {code && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-green-400 font-mono">{code}</code>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PulseGuardAbout() {
  const features = [
    {
      icon: AlertTriangle,
      title: "Real-Time Error Tracking",
      description:
        "Instantly capture and analyze JavaScript errors, unhandled promises, and runtime exceptions across your entire application stack.",
    },
    {
      icon: Activity,
      title: "Performance Monitoring",
      description:
        "Track Core Web Vitals, page load times, and user interactions to optimize your application's performance and user experience.",
    },
    {
      icon: Eye,
      title: "User Session Replay",
      description:
        "Watch exactly what users experienced when errors occurred with detailed session recordings and interaction timelines.",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Gain insights with custom dashboards, error trends, performance metrics, and user behavior analytics powered by OpenTelemetry.",
    },
    {
      icon: Shield,
      title: "Smart Error Grouping",
      description:
        "Automatically group similar errors using fingerprinting algorithms to reduce noise and focus on critical issues.",
    },
    {
      icon: Zap,
      title: "Instant Alerts",
      description:
        "Get notified immediately when critical errors occur with customizable alerting rules and multiple notification channels.",
    },
  ];

  const frameworks = [
    "React",
    "Vue.js",
    "Angular",
    "Svelte",
    "Next.js",
    "Nuxt.js",
    "Gatsby",
    "Remix",
    "SolidJS",
    "Alpine.js",
    "Vanilla JS",
  ];

  const integrationSteps = [
    {
      step: 1,
      title: "Install PulseGuard SDK",
      description:
        "Add our lightweight SDK to your project with a single command.",
      code: "npm install @pulseguard/sdk",
    },
    {
      step: 2,
      title: "Initialize in Your App",
      description:
        "Configure PulseGuard with your project key and environment settings.",
      code: `import PulseGuard from '@pulseguard/sdk';
            PulseGuard.init({
              dsn: 'YOUR_PROJECT_DSN',
              environment: 'production',
              enableTracing: true
            });`,
    },
    {
      step: 3,
      title: "Deploy & Monitor",
      description:
        "Deploy your application and start receiving real-time error reports and performance insights immediately.",
    },
  ];

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  PulseGuard
                </h1>
              </div>
              <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                The next-generation error monitoring and observability platform
                that keeps your frontend applications running smoothly in
                production.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25"
                >
                  Start Monitoring
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  View Documentation
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Comprehensive Application Monitoring
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Built on modern OpenTelemetry standards, PulseGuard provides
                end-to-end visibility into your application&apos;s health,
                performance, and user experience.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Framework Support Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Works with Every Framework
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
                PulseGuard seamlessly integrates with all modern JavaScript
                frameworks and libraries, providing consistent monitoring across
                your entire tech stack.
              </p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {frameworks.map((framework, index) => (
                <FrameworkBadge
                  key={framework}
                  name={framework}
                  delay={index * 0.05}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
              >
                <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">
                  Web Applications
                </h3>
                <p className="text-gray-300">
                  SPAs, MPAs, and PWAs with full client-side monitoring
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
              >
                <Smartphone className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">
                  Mobile Apps
                </h3>
                <p className="text-gray-300">
                  React Native and hybrid mobile applications
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
              >
                <Database className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">
                  Server-Side
                </h3>
                <p className="text-gray-300">
                  Node.js backends and serverless functions
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Integration Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Production-Ready in Minutes
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Get started with PulseGuard in your production environment with
                just a few lines of code. No complex setup or infrastructure
                changes required.
              </p>
            </motion.div>

            <div className="space-y-8">
              {integrationSteps.map((step, index) => (
                <IntegrationStep
                  key={step.step}
                  step={step.step}
                  title={step.title}
                  description={step.description}
                  code={step.code}
                  delay={index * 0.2}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Guard Your Application&apos;s Pulse?
              </h2>
              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Join thousands of developers who trust PulseGuard to keep their
                applications running smoothly and their users happy.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25"
                >
                  Start Free Trial
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-lg rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  Schedule Demo
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
