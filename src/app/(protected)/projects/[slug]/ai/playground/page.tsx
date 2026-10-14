"use client";

import { useState } from "react";
import { useAI } from "@/components/ai/shell";
import { Panel, aiSend } from "@/lib/ai/client";

const models = ["gpt-4.1", "claude-sonnet-4.5", "gemini-2.5-flash", "llama-3.3-70b"];

export default function PlaygroundPage() {
  const { projectId } = useAI();
  const [model, setModel] = useState(models[0]);
  const [prompt, setPrompt] = useState("What is the status of invoice 1042?");
  const [output, setOutput] = useState("");
  const [ttft, setTtft] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Prompt">
        <select value={model} onChange={(event) => setModel(event.target.value)} className="mb-2 w-full rounded-lg border border-pg-border bg-[#1c1c1f] px-3 py-2 text-sm">
          {models.map((item) => <option key={item}>{item}</option>)}
        </select>
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="h-40 w-full rounded-lg border border-pg-border bg-[#1c1c1f] p-3 text-sm" />
        <button
          type="button"
          className="mt-2 rounded-md bg-[#e2e2e2] px-3 py-1.5 text-sm text-[#18181b]"
          onClick={() => {
            setError("");
            void aiSend<{ output: string; ttftMs: string }>(projectId, "playground", "POST", { model, prompt })
              .then((result) => {
                setOutput(result.output);
                setTtft(result.ttftMs);
              })
              .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Playground failed"));
          }}
        >
          Run
        </button>
        {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
      </Panel>
      <Panel title="Completion">
        <p className="mb-2 text-xs text-pg-muted">TTFT {ttft || "—"} ms</p>
        <pre className="whitespace-pre-wrap text-sm">{output || "The completion appears here."}</pre>
      </Panel>
    </div>
  );
}
