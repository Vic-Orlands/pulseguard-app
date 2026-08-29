"use client";

import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Copy01Icon, Tick01Icon } from "@/components/phosphor-icons";
import React, { useState } from "react";

interface CodeBlockProps {
  children: string;
  id: string;
  language?: string;
}

const ConnectPlatformPage = () => {
  const [copiedCode, setCopiedCode] = useState("");

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
      <div className="flex items-center justify-between bg-pg-group text-foreground px-4 py-2 rounded-t-lg">
        <span className="text-xs font-mono text-pg-muted">{language}</span>
        <button
          onClick={() => copyToClipboard(children, id)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-pg-surface hover:bg-pg-overlay rounded-lg text-[10px] text-foreground cursor-pointer transition-colors"
        >
          {copiedCode === id ? (
            <>
              <HugeiconsIcon icon={Tick01Icon} size={12} />
              <span className="font-medium">Copied</span>
            </>
          ) : (
            <>
              <HugeiconsIcon icon={Copy01Icon} size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-pg-group/70 text-foreground p-4 rounded-b-lg overflow-x-auto">
        <code className="text-xs font-mono">{children}</code>
      </pre>
    </div>
  );

  const Section = ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-pg-text">{title}</h2>
        <p className="text-xs text-pg-muted mt-0.5">{description}</p>
      </div>
      {children}
    </section>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-10">
      <Section title="Installation" description="Get started with PulseGuard in seconds">
        <CodeBlock id="npm-install">npm install pulseguard</CodeBlock>
      </Section>

      <Section title="Usage" description="Every integration path, in one place">
        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-semibold text-pg-text mb-2">
              React — wrap your app
            </h3>
            <CodeBlock id="react-provider" language="jsx">{`import { TelemetryProvider } from "pulseguard";

<TelemetryProvider
    projectId={currentProjectId}
    issueTrackerUrl={trackerUrl}
>
    <Layout />
</TelemetryProvider>`}</CodeBlock>
            <h3 className="text-xs font-semibold text-pg-text mb-2 mt-5">
              Track page-level interactions
            </h3>
            <CodeBlock id="use-telemetry" language="jsx">{`"use client";
import { useTelemetry } from "pulseguard";

useTelemetry({
    userId: "user-123",
    pageId: "/dashboard",
});`}</CodeBlock>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-pg-text mb-2">
              Manual setup
            </h3>
            <CodeBlock id="manual-init" language="javascript">{`import { initPulseguard } from "pulseguard";

initPulseguard({
    projectId: "pulseguard-prod",
    userId: "user-123",
    issueTrackerUrl: "https://tracker.example.com",
});`}</CodeBlock>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-pg-text mb-2">
              Error Boundary
            </h3>
            <CodeBlock id="error-boundary" language="jsx">{`import { ErrorBoundary } from "pulseguard";

<ErrorBoundary>
    <App />
</ErrorBoundary>`}</CodeBlock>
          </div>
        </div>
      </Section>

      <Section title="Manual error reporting" description="Send custom error reports with context">
        <CodeBlock id="manual-error" language="javascript">{`import { reportError } from "pulseguard";

try {
    throw new Error("Something broke");
} catch (err) {
    reportError(err, { context: "manual trigger" });
}`}</CodeBlock>
      </Section>

      <Section title="How it works" description="What the SDK does after you install it">
        <div className="space-y-2">
          {[
            "Leverages @opentelemetry/api for span/trace context",
            "Uses context to suppress duplicate errors",
            "Sends errors to /api/telemetry/error",
            "Enriches with user, session, and route data",
            "Integrates with OpenTelemetry Collector (Tempo, Loki, Prometheus)",
          ].map((item) => (
            <div key={item} className="rounded-lg bg-pg-group px-4 py-3 text-xs text-pg-text">
              {item}
            </div>
          ))}
        </div>
      </Section>

      <Section title="API reference" description="Props and helpers you can use">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-pg-group">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-pg-muted">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-pg-muted">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-pg-muted">Required</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-pg-muted">Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["projectId", "string", "Yes", "Your PulseGuard project ID"],
                ["issueTrackerUrl", "string", "No", "Link to your external issue tracker"],
                ["children", "ReactNode", "Yes", "Your app layout or page"],
                ["userId", "string", "No", "Optional user ID for useTelemetry"],
                ["pageId", "string", "No", "Optional page route"],
              ].map((row) => (
                <tr key={row[0]} className="hover:bg-pg-group/60">
                  <td className="px-4 py-2.5 font-mono text-xs">{row[0]}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-pg-muted">{row[1]}</td>
                  <td className="px-4 py-2.5 text-xs">{row[2]}</td>
                  <td className="px-4 py-2.5 text-xs text-pg-muted">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Example error payload" description="What data gets sent to your telemetry endpoint">
        <CodeBlock id="error-payload" language="json">{`{
    "message": "TypeError: undefined is not a function",
    "stack": "...",
    "user": { "id": "123", "email": "alice@acme.dev" },
    "traceId": "e40f8b7b46...",
    "spanId": "0d4f1b...",
    "timestamp": "2025-07-20T12:34:56.123Z"
}`}</CodeBlock>
      </Section>

      <Section title="Security" description="Privacy defaults in the SDK">
        <div className="space-y-2">
          {[
            "Errors are sent via HTTPS",
            "Sensitive fields (cookies, tokens) are not collected by default",
            "User info is optional and customizable",
          ].map((item) => (
            <div key={item} className="rounded-lg bg-pg-group px-4 py-3 text-xs text-pg-text">
              {item}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default ConnectPlatformPage;
