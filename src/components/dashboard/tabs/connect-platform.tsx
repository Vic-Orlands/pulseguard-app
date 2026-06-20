import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
      <div className="flex items-center justify-between bg-card text-foreground px-4 py-2 rounded-t-lg border border-border border-b-0">
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
        <button
          onClick={() => copyToClipboard(children, id)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-muted hover:bg-muted/80 border border-border rounded text-[10px] text-foreground cursor-pointer transition-colors shadow-none"
        >
          {copiedCode === id ? (
            <>
              <HugeiconsIcon icon={Tick01Icon} size={12} className="text-emerald-500" />
              <span className="text-emerald-500 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <HugeiconsIcon icon={Copy01Icon} size={12} className="text-muted-foreground" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-muted text-foreground p-4 rounded-b-lg border border-border overflow-x-auto">
        <code className="text-xs font-mono">{children}</code>
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
            <h2 className="text-sm font-semibold text-foreground mb-1">
              Installation
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Get started with PulseGuard in seconds
            </p>
            <CodeBlock id="npm-install">npm install pulseguard</CodeBlock>
          </div>
        );

      case "usage":
        return (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1">
              Usage
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Choose your preferred integration method
            </p>

            <Tabs defaultValue="react" className="w-full">
              <TabsList className="bg-muted border border-border shadow-none mb-2">
                <TabsTrigger
                  value="react"
                  className="data-[state=active]:bg-card data-[state=active]:text-foreground text-xs"
                >
                  React
                </TabsTrigger>
                <TabsTrigger
                  value="manual"
                  className="data-[state=active]:bg-card data-[state=active]:text-foreground text-xs"
                >
                  Manual Setup
                </TabsTrigger>
                <TabsTrigger
                  value="error-boundary"
                  className="data-[state=active]:bg-card data-[state=active]:text-foreground text-xs"
                >
                  Error Boundary
                </TabsTrigger>
              </TabsList>

              <TabsContent value="react" className="mt-4 space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-2">
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
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    This enables error tracking, trace/span context, and
                    pageview tracking automatically.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-2">
                    2. Track Page-Level Interactions (Optional)
                  </h3>
                  <CodeBlock id="use-telemetry" language="jsx">{`"use client";
import { useTelemetry } from "pulseguard";

useTelemetry({
    userId: "user-123",
    pageId: "/dashboard",
});`}</CodeBlock>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Adds click event tracking, performance metrics (Web
                    Vitals), and pageview logs.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="manual" className="mt-4">
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-2">
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
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Manually initializes telemetry for non-React apps or
                    environments.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="error-boundary" className="mt-4">
                <div>
                  <h3 className="text-xs font-semibold text-foreground mb-2">
                    React Error Boundary (Optional)
                  </h3>
                  <CodeBlock
                    id="error-boundary"
                    language="jsx"
                  >{`import { ErrorBoundary } from "pulseguard";

<ErrorBoundary>
    <App />
</ErrorBoundary>`}</CodeBlock>
                  <p className="text-muted-foreground text-xs leading-relaxed">
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
            <h2 className="text-sm font-semibold text-foreground mb-1">
              Manually Report Errors
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
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
            <h2 className="text-sm font-semibold text-foreground mb-1">
              How It Works
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Under the hood architecture
            </p>
            <div className="space-y-2.5">
              {[
                "Leverages @opentelemetry/api for span/trace context",
                "Uses context to suppress duplicate errors",
                "Sends errors to /api/telemetry/error",
                "Enriches with user, session, and route data",
                "Integrates with OpenTelemetry Collector (Tempo, Loki, Prometheus)",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2.5 p-3 bg-muted rounded-lg border border-border"
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} className="text-primary w-4 h-4" />
                  <span className="text-foreground text-xs">
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
                                className="bg-card border border-border text-foreground px-1.5 py-0.5 rounded text-xs font-mono"
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
            <h2 className="text-sm font-semibold text-foreground mb-1">
              API Reference
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Complete API documentation
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-semibold mb-3 text-foreground font-mono">
                  &lt;TelemetryProvider /&gt;
                </h3>
                <div className="overflow-x-auto bg-card border border-border rounded-lg">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted border-b border-border">
                        <th className="px-4 py-2.5 text-left font-semibold text-foreground text-xs">
                          Prop
                        </th>
                        <th className="px-4 py-2.5 text-left font-semibold text-foreground text-xs">
                          Type
                        </th>
                        <th className="px-4 py-2.5 text-left font-semibold text-foreground text-xs">
                          Required
                        </th>
                        <th className="px-4 py-2.5 text-left font-semibold text-foreground text-xs">
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
                          className="hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors"
                        >
                          <td className="px-4 py-2.5 font-mono text-xs text-primary">
                            {row.prop}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                            {row.type}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-foreground">
                            {row.required}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">
                            {row.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold mb-2 text-foreground font-mono">
                  useTelemetry(options)
                </h3>
                <p className="mb-3 text-muted-foreground text-xs leading-relaxed">
                  Tracks pageviews, performance, and user interactions.
                </p>
                <div className="overflow-x-auto bg-card border border-border rounded-lg">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted border-b border-border">
                        <th className="px-4 py-2.5 text-left font-semibold text-foreground text-xs">
                          Option
                        </th>
                        <th className="px-4 py-2.5 text-left font-semibold text-foreground text-xs">
                          Type
                        </th>
                        <th className="px-4 py-2.5 text-left font-semibold text-foreground text-xs">
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
                          className="hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors"
                        >
                          <td className="px-4 py-2.5 font-mono text-xs text-primary">
                            {row.option}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                            {row.type}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">
                            {row.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold mb-2 text-foreground font-mono">
                  initPulseguard(config)
                </h3>
                <p className="mb-3 text-muted-foreground text-xs">
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
                <h3 className="text-xs font-semibold mb-2 text-foreground font-mono">
                  reportError(error, extra?)
                </h3>
                <p className="mb-3 text-muted-foreground text-xs">
                  Send manual error reports:
                </p>
                <CodeBlock
                  id="report-error"
                  language="javascript"
                >{`reportError(new Error("Whoops"), { component: "Header" });`}</CodeBlock>
              </div>

              <div>
                <h3 className="text-xs font-semibold mb-2 text-foreground font-mono">
                  &lt;ErrorBoundary /&gt;
                </h3>
                <p className="text-muted-foreground text-xs">
                  Wraps part of your app to auto-capture uncaught React errors.
                </p>
              </div>
            </div>
          </div>
        );

      case "error-payload":
        return (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1">
              Example Error Payload
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
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
            <h2 className="text-sm font-semibold text-foreground mb-1">
              Security
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Privacy and security considerations
            </p>
            <div className="space-y-3">
              {[
                "Errors are sent via HTTPS",
                "Sensitive fields (e.g., cookies, tokens) are not collected by default",
                "User info is optional and customizable",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-foreground"
                >
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span className="text-foreground text-xs">{item}</span>
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
    <div className="text-foreground">
      <div className="max-w-4xl mx-auto">
        <div className="flex w-[15%] h-[70vh] fixed left-10">
          <nav className="w-full space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-xs text-left px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
