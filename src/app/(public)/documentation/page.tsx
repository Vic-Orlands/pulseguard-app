"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Shield,
  Code,
  Database,
  Zap,
  Github,
  AlertTriangle,
  Info,
} from "lucide-react";
import AnimatedBackground from "@/components/background-color";
import { Footer, Navbar } from "../../page";

const DocumentationPage = () => {
  const [copiedCode, setCopiedCode] = useState("");

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(""), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const CodeBlock = ({ children, id, language = "bash" }) => (
    <div className="relative group">
      <div className="flex items-center justify-between bg-gray-900 text-gray-100 px-4 py-2 rounded-t-lg border-b border-gray-700">
        <span className="text-sm font-mono text-gray-400">{language}</span>
        <button
          onClick={() => copyToClipboard(children, id)}
          className="flex items-center gap-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
        >
          {copiedCode === id ? (
            <>
              <Check size={16} className="text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-950 text-gray-100 p-4 rounded-b-lg overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <AnimatedBackground />
      <Navbar />

      <section className="min-h-screen flex items-center justify-center relative px-6">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Integrate PulseGuard in Minutes
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Start monitoring errors, tracking performance, and gaining
              insights into your application's health with just a few lines of
              code.
            </p>
          </div>

          {/* Data Collection Section */}
          <div className="mb-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <Database className="text-blue-600" size={28} />
                <h3 className="text-2xl font-bold text-gray-900">
                  What Data We Collect
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-500 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Error Information
                      </h4>
                      <p className="text-gray-600">
                        Stack traces, error messages, and exception details to
                        help you debug issues quickly.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Zap className="text-yellow-500 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Performance Metrics
                      </h4>
                      <p className="text-gray-600">
                        Page load times, API response times, and resource usage
                        statistics.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Info className="text-blue-500 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Context Data
                      </h4>
                      <p className="text-gray-600">
                        Browser information, user agent, URL, and timestamp for
                        better debugging context.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Privacy & Security
                  </h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <Check className="text-green-500" size={16} />
                      No personal data collection
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-green-500" size={16} />
                      Data encrypted in transit
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-green-500" size={16} />
                      GDPR compliant
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-green-500" size={16} />
                      Optional user identification
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Quick Setup Guide
              </h3>
              <p className="text-gray-600">
                Follow these simple steps to get PulseGuard running in your
                application
              </p>
            </div>

            {/* Step 1 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h4 className="text-xl font-bold text-gray-900">
                  Install the SDK
                </h4>
              </div>

              <p className="text-gray-600 mb-4">
                Install the PulseGuard SDK using your preferred package manager:
              </p>

              <div className="space-y-4">
                <CodeBlock id="npm-install">
                  npm install pulseguard-sdk
                </CodeBlock>
                <CodeBlock id="yarn-install">yarn add pulseguard-sdk</CodeBlock>
                <CodeBlock id="pnpm-install">pnpm add pulseguard-sdk</CodeBlock>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h4 className="text-xl font-bold text-gray-900">
                  Initialize PulseGuard
                </h4>
              </div>

              <p className="text-gray-600 mb-4">
                Add the initialization code to your application's entry point
                (e.g., _app.js, main.js, or index.js):
              </p>

              <CodeBlock
                id="setup-code"
                language="javascript"
              >{`import { setupPulseguard } from "pulseguard-sdk";

setupPulseguard({
  projectId: "your-project-id-from-dashboard",
  userId: currentUser.id,
  issueTrackerUrl: "https://github.com/myorg/myproject/issues",
});`}</CodeBlock>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h4 className="text-xl font-bold text-gray-900">
                  Next.js Specific Setup
                </h4>
              </div>

              <p className="text-gray-600 mb-4">
                For Next.js applications, initialize PulseGuard in your _app.js
                file:
              </p>

              <CodeBlock
                id="nextjs-setup"
                language="javascript"
              >{`// pages/_app.js or app/layout.js
import { setupPulseguard } from "pulseguard-sdk";
import { useEffect } from 'react';

// Initialize once when app starts
if (typeof window !== 'undefined') {
  setupPulseguard({
    projectId: process.env.NEXT_PUBLIC_PULSEGUARD_PROJECT_ID,
    userId: "user-123", // Optional: current user ID
    issueTrackerUrl: "https://github.com/myorg/myproject/issues",
    environment: process.env.NODE_ENV,
  });
}

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}`}</CodeBlock>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <h4 className="text-xl font-bold text-gray-900">
                  Environment Variables
                </h4>
              </div>

              <p className="text-gray-600 mb-4">
                Add your PulseGuard project ID to your environment variables:
              </p>

              <CodeBlock id="env-vars" language="bash">{`# .env.local
NEXT_PUBLIC_PULSEGUARD_PROJECT_ID=your-project-id-from-dashboard`}</CodeBlock>
            </div>

            {/* Configuration Options */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <Code className="text-purple-600" size={28} />
                <h4 className="text-xl font-bold text-gray-900">
                  Configuration Options
                </h4>
              </div>

              <p className="text-gray-600 mb-4">
                Customize PulseGuard behavior with these configuration options:
              </p>

              <CodeBlock
                id="config-options"
                language="javascript"
              >{`setupPulseguard({
  // Required
  projectId: "your-project-id",
  
  // Optional configurations
  userId: "current-user-id",              // Link errors to specific users
  issueTrackerUrl: "https://github.com/myorg/myproject/issues",
  environment: "production",              // Environment identifier
  release: "1.0.0",                      // App version/release
  
  // Error filtering
  ignoreErrors: ["ChunkLoadError"],       // Ignore specific error types
  sampleRate: 1.0,                       // Sample rate (0.0 to 1.0)
  
  // Performance monitoring
  enablePerformance: true,               // Track performance metrics
  enableUserInteractions: true,          // Track user clicks/interactions
  
  // Privacy settings
  beforeSend: (event) => {
    // Filter or modify events before sending
    return event;
  }
});`}</CodeBlock>
            </div>

            {/* Manual Error Reporting */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <AlertTriangle className="text-orange-600" size={28} />
                <h4 className="text-xl font-bold text-gray-900">
                  Manual Error Reporting
                </h4>
              </div>

              <p className="text-gray-600 mb-4">
                Manually capture errors and custom events:
              </p>

              <CodeBlock
                id="manual-reporting"
                language="javascript"
              >{`import { captureError, captureMessage } from "pulseguard-sdk";

// Capture exceptions
try {
  riskyFunction();
} catch (error) {
  captureError(error, {
    tags: { section: "payment" },
    extra: { userId: user.id }
  });
}

// Log custom messages
captureMessage("User completed checkout", "info", {
  tags: { feature: "ecommerce" },
  extra: { orderId: "12345" }
});`}</CodeBlock>
            </div>

            {/* Testing */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <Check className="text-green-600" size={28} />
                <h4 className="text-xl font-bold text-gray-900">
                  Test Your Integration
                </h4>
              </div>

              <p className="text-gray-600 mb-4">
                Verify that PulseGuard is working correctly by triggering a test
                error:
              </p>

              <CodeBlock
                id="test-integration"
                language="javascript"
              >{`// Add this button temporarily to test
<button onClick={() => {
  throw new Error("PulseGuard test error - integration working!");
}}>
  Test PulseGuard Integration
</button>`}</CodeBlock>

              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  <strong>✅ Success!</strong> If you see this error in your
                  PulseGuard dashboard within a few minutes, your integration is
                  working correctly.
                </p>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
            <p className="text-blue-100 mb-6">
              Our documentation and support team are here to help you get the
              most out of PulseGuard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                View Documentation
              </button>
              <button className="px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center gap-2 justify-center">
                <Github size={20} />
                GitHub Examples
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DocumentationPage;
