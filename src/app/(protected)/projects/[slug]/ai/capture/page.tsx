"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useAI } from "@/components/ai/shell";
import { Empty, Panel, aiSend, useAIData } from "@/lib/ai/client";
import type { CapturePolicy } from "@/lib/ai/types";

export default function CapturePage() {
  const { projectId } = useAI();
  const { data, error } = useAIData<CapturePolicy>("capture");
  const [policy, setPolicy] = useState<CapturePolicy | null>(null);
  useEffect(() => setPolicy(data), [data]);
  if (!policy) return <Empty error={error} label="Loading capture policy" />;
  const rows: Array<[keyof CapturePolicy, string]> = [
    ["captureInput", "Capture prompts"],
    ["captureOutput", "Capture completions"],
    ["captureTools", "Capture tool payloads"],
  ];
  return (
    <Panel title="Privacy">
      <p className="mb-4 text-sm text-pg-muted">Emails, payment numbers, and high-entropy secrets are redacted before storage. Turning capture off drops the payload entirely.</p>
      <div className="space-y-3">
        {rows.map(([key, label]) => (
          <label key={key} className="flex items-center justify-between text-sm">
            {label}
            <Switch
              checked={policy[key]}
              onCheckedChange={(checked) => {
                const next = { ...policy, [key]: checked };
                setPolicy(next);
                void aiSend(projectId, "capture", "PUT", next);
              }}
            />
          </label>
        ))}
      </div>
    </Panel>
  );
}
