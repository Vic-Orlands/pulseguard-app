"use client";

import { useState } from "react";
import { useAI } from "@/components/ai/shell";
import { Empty, Panel, aiSend, useAIData } from "@/lib/ai/client";
import type { APIKeyRow } from "@/lib/ai/types";

export default function KeysPage() {
  const { projectId } = useAI();
  const { data, error } = useAIData<{ keys: APIKeyRow[]; ingestURL: string; gatewayURL: string }>("keys");
  const [token, setToken] = useState("");
  if (!data) return <Empty error={error} label="Loading keys" />;
  return (
    <div className="space-y-4">
      <Panel title="Send data without an SDK">
        <p className="text-sm text-pg-muted">Point an OpenTelemetry exporter at the ingest URL, or set an OpenAI-compatible base URL to the gateway. Authorize with a secret key that has the ingest or gateway scope.</p>
        <p className="mt-3 font-mono text-xs">OTLP {data.ingestURL}</p>
        <p className="mt-1 font-mono text-xs">Gateway {data.gatewayURL}</p>
      </Panel>
      <Panel title="Keys">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-pg-subtle">
            <tr>
              <th className="py-2 font-normal">Name</th>
              <th className="font-normal">Prefix</th>
              <th className="font-normal">Kind</th>
              <th className="font-normal">Scopes</th>
            </tr>
          </thead>
          <tbody>
            {data.keys.map((key) => (
              <tr key={key.id} className="border-t border-pg-border">
                <td className="py-2">{key.name}</td>
                <td className="font-mono text-xs">{key.prefix}</td>
                <td>{key.kind}</td>
                <td>{key.scopes.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          className="mt-3 rounded-md bg-[#e2e2e2] px-3 py-1.5 text-sm text-[#18181b]"
          onClick={() => {
            void aiSend<{ token: string }>(projectId, "keys", "POST", { name: "rotated", kind: "secret", scopes: "ingest,read,gateway" })
              .then((created) => setToken(created.token));
          }}
        >
          Create secret key
        </button>
        {token ? <p className="mt-2 font-mono text-xs">Copy this token now. It is stored only as a hash. {token}</p> : null}
      </Panel>
    </div>
  );
}
