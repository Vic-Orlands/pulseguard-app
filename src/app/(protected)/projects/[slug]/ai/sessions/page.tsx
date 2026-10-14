"use client";

import { Empty, Panel, usd, useAIData } from "@/lib/ai/client";
import type { SessionRow } from "@/lib/ai/types";

export default function SessionsPage() {
  const { data, error } = useAIData<{ sessions: SessionRow[] }>("sessions");
  if (!data) return <Empty error={error} label="Loading sessions" />;
  return (
    <Panel title="Sessions">
      <Grouped rows={data.sessions} idLabel="Session" id={(row) => row.sessionId} />
    </Panel>
  );
}

export function Grouped({ rows, idLabel, id }: { rows: SessionRow[]; idLabel: string; id: (row: SessionRow) => string }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="text-xs text-pg-subtle">
        <tr>
          <th className="py-2 font-normal">{idLabel}</th>
          <th className="font-normal">User</th>
          <th className="font-normal">Calls</th>
          <th className="font-normal">Errors</th>
          <th className="font-normal">Cost</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={id(row)} className="border-t border-pg-border">
            <td className="py-2">{id(row)}</td>
            <td>{row.userId}</td>
            <td>{row.calls}</td>
            <td>{row.errors}</td>
            <td>{usd(row.cost)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
