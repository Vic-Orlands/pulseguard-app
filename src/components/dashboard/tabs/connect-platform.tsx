"use client";

import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Copy01Icon, Delete02Icon, Tick01Icon } from "@/components/phosphor-icons";
import React, { useEffect, useState } from "react";
import type { Project } from "@/types/dashboard";
import { rotateProjectDSN } from "@/lib/api/projects-api";
import {
  deleteSourceMap,
  listSourceMaps,
  uploadSourceMap,
  type SourceMapFile,
} from "@/lib/api/source-maps-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CodeBlockProps {
  children: string;
  id: string;
  language?: string;
}

const ConnectPlatformPage = ({ project }: { project: Project }) => {
  const [copiedCode, setCopiedCode] = useState("");
  const [dsn, setDsn] = useState(project.dsn || "");
  const [rotating, setRotating] = useState(false);

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

  const dsnValue = dsn || "https://pg_your_key@api.pulseguard.dev/project-id";

  return (
    <div className="mr-auto max-w-3xl space-y-10 pb-10">
      <Section
        title="Project DSN"
        description="Customer apps authenticate with this DSN. It is not your PulseGuard login cookie."
      >
        <div className="flex items-center gap-1 rounded-lg bg-pg-group px-3 py-2">
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-pg-text">
            {dsnValue}
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard(dsnValue, "dsn")}
            className="rounded-md bg-transparent p-1 text-pg-muted hover:text-pg-text"
          >
            {copiedCode === "dsn" ? (
              <HugeiconsIcon icon={Tick01Icon} className="h-3.5 w-3.5" />
            ) : (
              <HugeiconsIcon icon={Copy01Icon} className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        <Button
          className="h-8 text-xs"
          loading={rotating}
          onClick={async () => {
            setRotating(true);
            try {
              const next = await rotateProjectDSN(project.slug);
              setDsn(next.dsn);
              toast.success("DSN rotated. Update the SDK in your app.");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Failed to rotate DSN");
            } finally {
              setRotating(false);
            }
          }}
        >
          Rotate DSN
        </Button>
        {project.firstEventAt ? (
          <p className="text-xs text-pg-muted">
            First event received {new Date(project.firstEventAt).toLocaleString()}
          </p>
        ) : (
          <p className="text-xs text-pg-muted">
            Waiting for the first event from your app.
          </p>
        )}
      </Section>

      <Section title="Installation" description="Add the SDK to the app you want to observe">
        <CodeBlock id="npm-install">npm install pulseguard</CodeBlock>
      </Section>

      <Section title="Usage" description="Pass this project's DSN so data lands in this dashboard">
        <div className="space-y-8">
          <div>
            <h3 className="mb-2 text-xs font-semibold text-pg-text">
              React — wrap your app
            </h3>
            <CodeBlock id="react-provider" language="jsx">{`import { TelemetryProvider } from "pulseguard";

<TelemetryProvider dsn="${dsnValue}">
    <Layout />
</TelemetryProvider>`}</CodeBlock>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold text-pg-text">
              Manual setup
            </h3>
            <CodeBlock id="manual-init" language="javascript">{`import { initPulseguard, reportError } from "pulseguard";

initPulseguard({
    dsn: "${dsnValue}",
    userId: "user-123",
    release: "1.0.0",
    commitSha: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    repositoryUrl: "https://github.com/your-org/your-app",
    environment: "production",
    captureClicks: true,
});`}</CodeBlock>
          </div>
        </div>
      </Section>

      <Section title="What gets sent" description="The SDK writes into this project over the public ingest API">
        <div className="space-y-2">
          {[
            "Errors, sessions, logs, and traces POST to /api/ingest/* using the DSN key",
            "Each event is scoped to this project. Rotate the DSN if the key leaks",
            "Duplicate errors are suppressed in the browser before they are sent",
            "Metrics are labeled with this project id when the collector is running",
            "Upload source maps with a matching release to de-minify JavaScript stack traces",
            "Add commitSha and repositoryUrl to link each error to its likely suspect deploy commit",
          ].map((item) => (
            <div key={item} className="rounded-lg bg-pg-group px-4 py-3 text-xs text-pg-text">
              {item}
            </div>
          ))}
        </div>
      </Section>

      <SourceMapsSection projectId={project.id} />
    </div>
  );
};

function SourceMapsSection({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<SourceMapFile[]>([]);
  const [release, setRelease] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      setItems(await listSourceMaps(projectId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load source maps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [projectId]);

  return (
    <section className="max-w-3xl space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-pg-text">Source maps</h2>
        <p className="mt-0.5 max-w-xl text-xs text-pg-muted">
          Store a map per release (about 1.5 MB each). Match the SDK{" "}
          <code>release</code> so incoming minified stack frames are de-minified.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[140px] flex-1">
          <label className="mb-1 block text-[11px] text-pg-muted">Release</label>
          <Input
            value={release}
            onChange={(event) => setRelease(event.target.value)}
            placeholder="1.4.2"
            className="h-9 text-sm"
          />
        </div>
        <label className="btn-primary inline-flex h-9 cursor-pointer items-center rounded-lg px-3 text-xs">
          {uploading ? "Uploading..." : "Upload .map"}
          <input
            type="file"
            accept=".map,application/json"
            className="hidden"
            disabled={uploading}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              if (!release.trim()) {
                toast.error("Set a release version first");
                return;
              }
              setUploading(true);
              try {
                const mapJson = await file.text();
                await uploadSourceMap(projectId, release.trim(), file.name, mapJson);
                toast.success("Source map uploaded");
                await load();
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "Failed to upload source map",
                );
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
      </div>
      {loading ? (
        <p className="text-xs text-pg-muted">Loading source maps...</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-pg-muted">No source maps uploaded yet.</p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-lg bg-pg-group px-3 py-2 text-xs"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-pg-text">{item.fileName}</p>
                <p className="text-[11px] text-pg-muted">
                  {item.release} · {(item.byteSize / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                className="rounded-md bg-transparent p-1 text-red-400 hover:bg-red-500/10"
                onClick={async () => {
                  try {
                    await deleteSourceMap(projectId, item.id);
                    await load();
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Failed to delete",
                    );
                  }
                }}
              >
                <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ConnectPlatformPage;
