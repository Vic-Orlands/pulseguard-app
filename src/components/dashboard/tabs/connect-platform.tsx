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
    <div className="relative group mb-4 overflow-hidden rounded-lg">
      <div className="pg-code-header flex items-center justify-between px-4 py-2">
        <span className="text-xs font-mono">{language}</span>
        <button
          onClick={() => copyToClipboard(children, id)}
          className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[10px] text-zinc-300 transition-colors hover:bg-white/10 cursor-pointer"
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
      <pre className="pg-code overflow-x-auto p-4">
        <code className="text-xs font-mono text-zinc-200">{children}</code>
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
    <section className="max-w-3xl space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-pg-text">{title}</h2>
        <p className="mt-0.5 max-w-xl text-xs text-pg-muted">{description}</p>
      </div>
      {children}
    </section>
  );

  return (
    <div className="mr-auto max-w-3xl space-y-10 pb-10">
      <Section
        title="How this project is connected"
        description="Telemetry is scoped by project ID, not by Google OAuth or a vendor integration"
      >
        <div className="max-w-xl space-y-2 text-xs leading-relaxed text-pg-muted">
          <p>
            Sessions, errors, logs, and traces for this dashboard belong to the
            project you have open.
          </p>
          <p>
            This PulseGuard app sends those events when its SDK{" "}
            <span className="font-mono text-pg-text">projectId</span> matches
            this project&apos;s ID — the same value shown in the sidebar.
          </p>
          <p>
            The Integrations tab is only for outbound alerts (Slack, GitHub, and
            so on). It does not ingest telemetry.
          </p>
        </div>
      </Section>

      <Section title="Installation" description="Add the SDK to the app you want to observe">
        <CodeBlock id="npm-install">npm install pulseguard</CodeBlock>
      </Section>

      <Section title="Usage" description="Pass this project's ID so data lands in this dashboard">
        <div className="space-y-8">
          <div>
            <h3 className="mb-2 text-xs font-semibold text-pg-text">
              React — wrap your app
            </h3>
            <CodeBlock id="react-provider" language="jsx">{`import { TelemetryProvider } from "pulseguard";

<TelemetryProvider projectId={currentProjectId}>
    <Layout />
</TelemetryProvider>`}</CodeBlock>
            <h3 className="mb-2 mt-5 text-xs font-semibold text-pg-text">
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
            <h3 className="mb-2 text-xs font-semibold text-pg-text">
              Manual setup
            </h3>
            <CodeBlock id="manual-init" language="javascript">{`import { initPulseguard } from "pulseguard";

initPulseguard({
    projectId: "your-project-uuid",
    userId: "user-123",
});`}</CodeBlock>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold text-pg-text">
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

      <Section title="What gets sent" description="The SDK writes into this project over your signed-in session">
        <div className="space-y-2">
          {[
            "Errors, sessions, logs, and traces POST to /api/telemetry/* and are stored on this project",
            "Each event includes projectId, route, session, and optional trace/span IDs",
            "Duplicate errors are suppressed in the browser before they are sent",
            "Metrics still come from Prometheus when the collector is running; they are not project-filtered",
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
                ["projectId", "string", "Yes", "UUID of the PulseGuard project that should receive data"],
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
            "Events are sent over HTTPS with your session cookie",
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
