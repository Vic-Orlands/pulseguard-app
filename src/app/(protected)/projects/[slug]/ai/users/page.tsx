"use client";

import { Grouped } from "../sessions/page";
import { Empty, Panel, useAIData } from "@/lib/ai/client";
import type { SessionRow } from "@/lib/ai/types";

export default function UsersPage() {
  const { data, error } = useAIData<{ users: SessionRow[] }>("users");
  if (!data) return <Empty error={error} label="Loading users" />;
  return (
    <Panel title="Users">
      <Grouped rows={data.users} idLabel="User" id={(row) => row.userId} />
    </Panel>
  );
}
