import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Check, ChevronRight } from "lucide-react";

interface CodeBlockProps {
  children: string;
  id: string;
  language?: string;
}

const ConnectPlatformPage = () => {
  const [copiedCode, setCopiedCode] = useState("");
  const [activeSection, setActiveSection] = useState("installation");

  const copyToClipboard = async (text: string, id: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(""), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const CodeBlock = ({ children, id, language = "bash" }: CodeBlockProps) => (
    <div className="relative group mb-4">
      <div className="flex items-center justify-between bg-slate-900 text-purple-100 px-4 py-2 rounded-t-lg border-b border-slate-700">
        <span className="text-sm font-mono text-slate-300">{language}</span>
        <button
          onClick={() => copyToClipboard(children, id)}
          className="flex items-center gap-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-sm transition-colors"
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
      <pre className="bg-slate-950 text-slate-100 p-4 rounded-b-lg overflow-x-auto">
        <code className="text-sm">{children}</code>
      </pre>
    </div>
  );

  const navigationItems = [
    { id: "installation", label: "Installation" },
    { id: "usage", label: "Usage" },
    { id: "manual-error", label: "Manual Error Reporting" },
    { id: "how-it-works", label: "How It Works" },
    { id: "api-reference", label: "API Reference" },
    { id: "error-payload", label: "Example Error Payload" },
    { id: "security", label: "Security" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "installation":
        return (
          <div>
            <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Installation
            </h2>
            <p className="text-sm text-slate-300 mb-6">
              Get started with PulseGuard in seconds
            </p>
            <CodeBlock id="npm-install">npm install pulseguard</CodeBlock>
          </div>
        );

      case "usage":
        return (
          <div>
            <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Usage
            </h2>
            <p className="text-sm text-slate-300 mb-2">
              Choose your preferred integration method
            </p>

            <Tabs defaultValue="react" className="w-full">
              <TabsList className="bg-slate-900 border border-slate-700 mb-2">
                <TabsTrigger
                  value="react"
                  className="data-[state=active]:bg-purple-600"
                >
                  React
                </TabsTrigger>
                <TabsTrigger
                  value="manual"
                  className="data-[state=active]:bg-purple-600"
                >
                  Manual Setup
                </TabsTrigger>
                <TabsTrigger
                  value="error-boundary"
                  className="data-[state=active]:bg-purple-600"
                >
                  Error Boundary
                </TabsTrigger>
              </TabsList>

              <TabsContent value="react" className="mt-6">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-md font-semibold mb-4 text-purple-300">
                      1. Wrap Your App with TelemetryProvider
                    </h3>
                    <CodeBlock
                      id="react-provider"
                      language="jsx"
                    >{`import { TelemetryProvider } from "pulseguard";

<TelemetryProvider
    projectId={currentProjectId}
    issueTrackerUrl={trackerUrl}
>
    <Layout />
    // {children}
</TelemetryProvider>`}</CodeBlock>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      This enables error tracking, trace/span context, and
                      pageview tracking automatically.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-md font-semibold mb-4 text-purple-300">
                      2. Track Page-Level Interactions (Optional)
                    </h3>
                    <CodeBlock id="use-telemetry" language="jsx">{`"use client";
import { useTelemetry } from "pulseguard";

useTelemetry({
    userId: "user-123",
    pageId: "/dashboard",
});`}</CodeBlock>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Adds click event tracking, performance metrics (Web
                      Vitals), and pageview logs.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="manual" className="mt-6">
                <div>
                  <h3 className="text-md font-semibold mb-4 text-purple-300">
                    Manual Setup (non-React / CLI apps)
                  </h3>
                  <CodeBlock
                    id="manual-init"
                    language="javascript"
                  >{`import { initPulseguard } from "pulseguard";

initPulseguard({
    projectId: "pulseguard-prod",
    userId: "user-123",
    issueTrackerUrl: "https://tracker.example.com",
});`}</CodeBlock>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Manually initializes telemetry for non-React apps or
                    environments.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="error-boundary" className="mt-6">
                <div>
                  <h3 className="text-md font-semibold mb-4 text-purple-300">
                    React Error Boundary (Optional)
                  </h3>
                  <CodeBlock
                    id="error-boundary"
                    language="jsx"
                  >{`import { ErrorBoundary } from "pulseguard";

<ErrorBoundary>
    <App />
</ErrorBoundary>`}</CodeBlock>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Captures runtime React errors automatically.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );

      case "manual-error":
        return (
          <div>
            <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Manually Report Errors
            </h2>
            <p className="text-sm text-slate-300 mb-6">
              Send custom error reports with context
            </p>
            <CodeBlock
              id="manual-error"
              language="javascript"
            >{`import { reportError } from "pulseguard";

try {
    throw new Error("Something broke");
} catch (err) {
    reportError(err, { context: "manual trigger" });
}`}</CodeBlock>
          </div>
        );

      case "how-it-works":
        return (
          <div>
            <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-sm text-slate-300 mb-2">
              Under the hood architecture
            </p>
            <div className="space-y-2">
              {[
                "Leverages @opentelemetry/api for span/trace context",
                "Uses context to suppress duplicate errors",
                "Sends errors to /api/telemetry/error",
                "Enriches with user, session, and route data",
                "Integrates with OpenTelemetry Collector (Tempo, Loki, Prometheus)",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-4 bg-slate-900/50 rounded-lg"
                >
                  <ChevronRight className="text-purple-400 w-5 h-5" />
                  <span className="text-slate-200 text-sm">
                    {item.includes("@opentelemetry/api") ||
                    item.includes("/api/telemetry/error")
                      ? item
                          .split(
                            /(@opentelemetry\/api|\/api\/telemetry\/error)/
                          )
                          .map((part, i) =>
                            part === "@opentelemetry/api" ||
                            part === "/api/telemetry/error" ? (
                              <code
                                key={i}
                                className="bg-slate-400 text-slate-900 px-2 py-1 rounded text-sm"
                              >
                                {part}
                              </code>
                            ) : (
                              part
                            )
                          )
                      : item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case "api-reference":
        return (
          <div>
            <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              API Reference
            </h2>
            <p className="text-slate-300 text-sm mb-6">
              Complete API documentation
            </p>

            <div className="space-y-12">
              <div>
                <h3 className="text-md font-semibold mb-6 text-purple-300">
                  <code>&lt;TelemetryProvider /&gt;</code>
                </h3>
                <div className="overflow-x-auto bg-slate-900/30 rounded-lg">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-900">
                        <th className="px-6 py-4 text-left font-semibold text-purple-300 border-b border-slate-700">
                          Prop
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-purple-300 border-b border-slate-700">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-purple-300 border-b border-slate-700">
                          Required
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-purple-300 border-b border-slate-700">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          prop: "projectId",
                          type: "string",
                          required: "Yes",
                          description: "Your PulseGuard project ID",
                        },
                        {
                          prop: "issueTrackerUrl",
                          type: "string",
                          required: "No",
                          description: "Link to your external issue tracker",
                        },
                        {
                          prop: "children",
                          type: "ReactNode",
                          required: "Yes",
                          description: "Your app layout or page",
                        },
                      ].map((row, index) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-sm text-green-400 border-b border-slate-800">
                            {row.prop}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-blue-400 border-b border-slate-800">
                            {row.type}
                          </td>
                          <td className="px-6 py-4 text-slate-300 border-b border-slate-800">
                            {row.required}
                          </td>
                          <td className="px-6 py-4 text-slate-300 border-b border-slate-800">
                            {row.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold mb-4 text-purple-300">
                  <code>useTelemetry(options)</code>
                </h3>
                <p className="mb-6 text-slate-300 text-sm leading-relaxed">
                  Tracks pageviews, performance, and user interactions.
                </p>
                <div className="overflow-x-auto bg-slate-900/30 rounded-lg">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-900">
                        <th className="px-6 py-4 text-left font-semibold text-purple-300 border-b border-slate-700">
                          Option
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-purple-300 border-b border-slate-700">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-purple-300 border-b border-slate-700">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          option: "userId",
                          type: "string",
                          description: "Optional user ID",
                        },
                        {
                          option: "pageId",
                          type: "string",
                          description: "Optional page route",
                        },
                        {
                          option: "trackInteractions",
                          type: "boolean",
                          description: "Enable click tracking (default: true)",
                        },
                      ].map((row, index) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-sm text-green-400 border-b border-slate-800">
                            {row.option}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-blue-400 border-b border-slate-800">
                            {row.type}
                          </td>
                          <td className="px-6 py-4 text-slate-300 border-b border-slate-800">
                            {row.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-md font-semibold mb-4 text-purple-300">
                  <code>initPulseguard(config)</code>
                </h3>
                <p className="mb-4 text-slate-300 text-sm">
                  For non-React usage.
                </p>
                <CodeBlock
                  id="init-config"
                  language="javascript"
                >{`initPulseguard({
    projectId: "pulseguard-prod",
    userId: "user-123",
    issueTrackerUrl: "https://tracker.io/..."
});`}</CodeBlock>
              </div>

              <div>
                <h3 className="text-md font-semibold mb-4 text-purple-300">
                  <code>reportError(error, extra?)</code>
                </h3>
                <p className="mb-4 text-slate-300 text-sm">
                  Send manual error reports:
                </p>
                <CodeBlock
                  id="report-error"
                  language="javascript"
                >{`reportError(new Error("Whoops"), { component: "Header" });`}</CodeBlock>
              </div>

              <div>
                <h3 className="text-md font-semibold mb-4 text-purple-300">
                  <code>&lt;ErrorBoundary /&gt;</code>
                </h3>
                <p className="text-slate-300 text-sm">
                  Wraps part of your app to auto-capture uncaught React errors.
                </p>
              </div>
            </div>
          </div>
        );

      case "error-payload":
        return (
          <div>
            <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Example Error Payload
            </h2>
            <p className="text-sm text-slate-300 mb-6">
              See what data gets sent to your telemetry endpoint
            </p>
            <CodeBlock id="error-payload" language="json">{`{
    "message": "TypeError: undefined is not a function",
    "stack": "...",
    "user": {
        "id": "123",
        "email": "alice@acme.dev"
    },
    "traceId": "e40f8b7b46...",
    "spanId": "0d4f1b...",
    "timestamp": "2025-07-20T12:34:56.123Z"
}`}</CodeBlock>
          </div>
        );

      case "security":
        return (
          <div>
            <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Security
            </h2>
            <p className="text-sm text-slate-300 mb-2">
              Privacy and security considerations
            </p>
            <div className="space-y-4">
              {[
                "Errors are sent via HTTPS",
                "Sensitive fields (e.g., cookies, tokens) are not collected by default",
                "User info is optional and customizable",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-green-900/20 rounded-lg border border-green-700/30"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex w-[15%] h-[70vh] fixed left-10">
          <nav>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-sm text-left px-3 py-2 rounded-lg transition-all duration-200 hover:bg-slate-800/50 ${
                  activeSection === item.id
                    ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-l-4 border-purple-400 text-purple-300 font-medium"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="w-[100%] ml-auto">
          <div className="prose prose-invert max-w-none">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default ConnectPlatformPage;
