"use client";

import { useState } from "react";
import { useAI } from "@/components/ai/shell";
import { Empty, Panel, aiSend, useAIData } from "@/lib/ai/client";
import type { PromptRow } from "@/lib/ai/types";

export default function PromptsPage() {
  const { projectId } = useAI();
  const { data, error } = useAIData<{ prompts: PromptRow[] }>("prompts");
  const [name, setName] = useState("invoice-extract");
  const [body, setBody] = useState("Reply to {{ customer }}.");
  const [saved, setSaved] = useState("");
  if (!data) return <Empty error={error} label="Loading prompts" />;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Versions">
        <ul className="space-y-3">
          {data.prompts.map((prompt) => (
            <li key={prompt.id} className="rounded-lg border border-pg-border p-3">
              <p className="text-sm">{prompt.name} · v{prompt.version}</p>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-pg-muted">{prompt.body}</pre>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="New version">
        <input value={name} onChange={(event) => setName(event.target.value)} className="mb-2 w-full rounded-lg border border-pg-border bg-[#1c1c1f] px-3 py-2 text-sm" />
        <textarea value={body} onChange={(event) => setBody(event.target.value)} className="h-32 w-full rounded-lg border border-pg-border bg-[#1c1c1f] p-3 text-sm" />
        <button
          type="button"
          className="mt-2 rounded-md bg-[#e2e2e2] px-3 py-1.5 text-sm text-[#18181b]"
          onClick={() => {
            void aiSend(projectId, "prompts", "POST", { name, body }).then(() => setSaved("Saved a new version. Reload to see it."));
          }}
        >
          Save version
        </button>
        {saved ? <p className="mt-2 text-xs text-pg-muted">{saved}</p> : null}
      </Panel>
    </div>
  );
}
