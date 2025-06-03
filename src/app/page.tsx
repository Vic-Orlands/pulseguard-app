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
  X,
  Github,
  Linkedin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PulseGuardLogo } from "@/components/Icons";
import AnimatedBackground from "@/components/background-color";
import Link from "next/link";

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
export const Navbar = () => (
  <header className="w-full py-4 px-6 backdrop-blur-sm bg-transparent z-10">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <Link href="/">
        <div className="flex items-center">
          <PulseGuardLogo />
          <span className="text-xl font-bold text-white">PulseGuard</span>
        </div>
      </Link>
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
          onClick={() => (window.location.href = "/signin")}
        >
          Login
        </motion.button>
        <motion.button
          className="bg-transparent text-white cursor-pointer px-4 py-2 rounded-md border border-blue-600 hover:bg-blue-900/30 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => (window.location.href = "/signin")}
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
          Track and monitor errors logs, traces, and performance metrics of your
          application easily with PulseGuard
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <motion.button
            className="bg-blue-600 text-white cursor-pointer px-6 py-3 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.href = "/projects")}
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </motion.button>
          <motion.button
            className="bg-transparent text-white cursor-pointer px-6 py-3 rounded-md border border-blue-600 hover:bg-blue-900/30 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.href = "/demo")}
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
const footerLink: {
  title: string;
  links: string[];
}[] = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Integrations", "Documentation"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Security"],
  },
];

const svgIcons: {
  href: string;
  label: string;
  icon: React.JSX.Element;
}[] = [
  {
    href: "https://x.com/MezieIV",
    label: "Twitter",
    icon: <X />,
  },
  {
    href: "https://www.linkedin.com/in/victor-innocent/",
    label: "LinkedIn",
    icon: <Linkedin />,
  },
  {
    href: "https://github.com/Vic-Orlands/pulseguard",
    label: "GitHub",
    icon: <Github />,
  },
];

export const Footer = () => (
  <footer className="py-12 px-6 border-t border-blue-900/30 text-white bg-black/20 backdrop-blur-sm">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between">
        <div className="mb-6 md:mb-0">
          <div className="flex items-center">
            <PulseGuardLogo />
            <span className="text-xl font-bold text-white">PulseGuard</span>
          </div>
          <p className="text-gray-400 mt-2">
            Full-stack observability platform
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {footerLink.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2 text-slate-400">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.toLowerCase().replace(/\s+/g, "-")}
                      aria-label={link}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-blue-900/30 flex flex-col md:flex-row justify-between items-center">
        <p className="text-slate-400 mb-4 md:mb-0">
          © {new Date().getFullYear()} PulseGuard. All rights reserved.
        </p>
        <div className="flex items-center space-x-4">
          {svgIcons.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="text-gray-400 hover:text-white transition-colors flex items-center justify-center"
            >
              <span className="sr-only">{social.label}</span>
              {social.icon}
            </a>
          ))}
        </div>
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
    </div>
  );
}
