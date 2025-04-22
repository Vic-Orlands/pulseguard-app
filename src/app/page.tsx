"use client";

import { motion } from "motion/react";
import {
  ArrowRight,
  Eye,
  Activity,
  Layers,
  BarChart,
  GitBranch,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Animated background with circular lines
const AnimatedBackground = () => {
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
};

// Feature card component
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <motion.div
    className="p-6 bg-black/20 backdrop-blur-sm rounded-lg border border-blue-900/30"
    whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(0, 0, 255, 0.2)" }}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="mb-4 p-3 bg-blue-600/20 inline-flex rounded-full">
      <Icon className="h-6 w-6 text-blue-400" />
    </div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </motion.div>
);

// Navbar component
const Navbar = () => (
  <header className="w-full py-4 px-6 backdrop-blur-sm bg-transparent z-10">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="flex items-center">
        <motion.div
          className="mr-2 relative"
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-80"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
        </motion.div>
        <span className="text-xl font-bold text-white">PulseGuard</span>
      </div>
      <nav className="hidden md:flex space-x-8">
        <a href="#features" className="text-gray-300 hover:text-white">
          Features
        </a>
        <a href="#architecture" className="text-gray-300 hover:text-white">
          How it Works
        </a>
        <a href="#docs" className="text-gray-300 hover:text-white">
          Documentation
        </a>
      </nav>
      <div>
        <motion.button
          className="bg-blue-600 text-white cursor-pointer px-4 py-2 rounded-md hover:bg-blue-700 transition mr-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => (window.location.href = "/signup")}
        >
          Login
        </motion.button>
        <motion.button
          className="bg-transparent text-white cursor-pointer px-4 py-2 rounded-md border border-blue-600 hover:bg-blue-900/30 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => (window.location.href = "/signup")}
        >
          Sign Up
        </motion.button>
      </div>
    </div>
  </header>
);

// Hero section
const Hero = () => (
  <section className="min-h-screen flex items-center justify-center relative px-6">
    <div className="max-w-4xl mx-auto text-center z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Badge className="mb-4 bg-blue-800 text-white">
          Announcing our new product
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Full-Stack Observability for Modern Cloud Apps
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          {/* Unify your logs, traces, and metrics into a powerful observability
          pipeline with PulseGuard */}
          Track errors, session replays, and see performance metrics of your
          application easily with PulseGuard
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <motion.button
            className="bg-blue-600 text-white cursor-pointer px-6 py-3 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.href = "/signup")}
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </motion.button>
          <motion.button
            className="bg-transparent text-white cursor-pointer px-6 py-3 rounded-md border border-blue-600 hover:bg-blue-900/30 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.href = "/dashboard")}
          >
            View Demo <Eye className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  </section>
);

// Features section
const Features = () => (
  <section id="features" className="py-20 px-6 relative">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.h2
          className="text-3xl font-bold mb-4 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Powerful Features
        </motion.h2>
        <motion.p
          className="text-xl text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Everything you need to monitor and troubleshoot your applications
        </motion.p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard
          icon={Activity}
          title="Real-time Monitoring"
          description="Track application performance in real-time with customizable dashboards and alerts."
        />
        <FeatureCard
          icon={Layers}
          title="Distributed Tracing"
          description="Follow requests across your distributed system to identify bottlenecks and errors."
        />
        <FeatureCard
          icon={BarChart}
          title="Advanced Analytics"
          description="Gain insights from comprehensive metrics and powerful visualization tools."
        />
        <FeatureCard
          icon={Eye}
          title="Error Tracking"
          description="Instantly detect and diagnose errors with detailed stack traces and context."
        />
        <FeatureCard
          icon={GitBranch}
          title="CI/CD Integration"
          description="Seamlessly integrate with your development workflow and deployment pipeline."
        />
        <FeatureCard
          icon={Mail}
          title="Intelligent Alerts"
          description="Receive notifications through your preferred channels when issues arise."
        />
      </div>
    </div>
  </section>
);

// Architecture diagram
const Architecture = () => (
  <section id="architecture" className="py-20 px-6 relative">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.h2
          className="text-3xl font-bold mb-4 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          How It Works
        </motion.h2>
        <motion.p
          className="text-xl text-gray-300 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          A modern observability pipeline built for scale
        </motion.p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <motion.div
          className="bg-black/30 p-6 rounded-lg border border-blue-900/30 backdrop-blur-sm"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl font-bold text-blue-400 mb-4">
            1. Data Collection
          </h3>
          <p className="text-gray-300">
            Your application sends telemetry data through our lightweight SDK,
            capturing errors, performance metrics, and user interactions in
            real-time.
          </p>
        </motion.div>

        <motion.div
          className="bg-black/30 p-6 rounded-lg border border-blue-900/30 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-blue-400 mb-4">
            2. Processing Pipeline
          </h3>
          <p className="text-gray-300">
            Our distributed processing pipeline aggregates and analyzes your
            data using advanced algorithms to detect anomalies and patterns.
          </p>
        </motion.div>

        <motion.div
          className="bg-black/30 p-6 rounded-lg border border-blue-900/30 backdrop-blur-sm"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-blue-400 mb-4">
            3. Visualization
          </h3>
          <p className="text-gray-300">
            Access powerful dashboards and insights through our intuitive
            interface, with real-time alerts and detailed analytics.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="mt-12 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="bg-black/30 p-8 rounded-lg border border-blue-900/30 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-blue-400 mb-4 text-center">
            Observability Stack
          </h3>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <Badge className="bg-blue-900/50 text-blue-300">
              OpenTelemetry
            </Badge>
            <Badge className="bg-blue-900/50 text-blue-300">Prometheus</Badge>
            <Badge className="bg-blue-900/50 text-blue-300">Grafana</Badge>
            <Badge className="bg-blue-900/50 text-blue-300">Loki</Badge>
            <Badge className="bg-blue-900/50 text-blue-300">Tempo</Badge>
          </div>
        </div>

        <div className="bg-black/30 p-8 rounded-lg border border-blue-900/30 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-blue-400 mb-4 text-center">
            Built with Modern Tech
          </h3>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <Badge className="bg-blue-900/50 text-blue-300">Next.js 13</Badge>
            <Badge className="bg-blue-900/50 text-blue-300">TypeScript</Badge>
            <Badge className="bg-blue-900/50 text-blue-300">Tailwind CSS</Badge>
            <Badge className="bg-blue-900/50 text-blue-300">Neon DB</Badge>
            <Badge className="bg-blue-900/50 text-blue-300">Prisma ORM</Badge>
            <Badge className="bg-blue-900/50 text-blue-300">tRPC</Badge>
            <Badge className="bg-blue-900/50 text-blue-300">React Query</Badge>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

// Call to action section
const CTA = () => (
  <section className="pb-20 px-6 relative">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-7xl mx-auto bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 text-center border border-blue-500/20"
    >
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
      >
        Ready to build better applications?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-xl md:text-2xl mb-8 text-gray-300"
      >
        Join thousands of developers who are spending less time debugging and
        more time building.
      </motion.p>
      <motion.div
        className="flex justify-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white">
            See PulseGuard in action
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="py-12 px-6 border-t border-blue-900/30 bg-black/20 backdrop-blur-sm">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mr-2"></div>
            <span className="text-xl font-bold text-white">PulseGuard</span>
          </div>
          <p className="text-gray-400 mt-2">
            Full-stack observability platform
          </p>
        </div>
        <div className="flex gap-8">
          <a href="#" className="text-gray-400 hover:text-white">
            Documentation
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            GitHub
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            Contact
          </a>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-blue-900/30 text-center text-gray-400">
        <p>© {new Date().getFullYear()} PulseGuard. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// Main homepage
export default function Homepage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <AnimatedBackground />
      <Navbar />
      <Hero />
      <Features />
      <Architecture />
      <CTA />
      <Footer />

      {/* External Footer */}
      {/* <Footer /> */}
    </div>
  );
}
