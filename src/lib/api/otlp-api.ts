import { Log, Trace } from "@/types/dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface TimeRange {
  start?: string;
  end?: string;
}

// fetch all metrics
export async function fetchMetrics(projectId: string) {
  const url = new URL(`${API_URL}/api/metrics`);
  url.searchParams.set("project_id", projectId);

  try {
    const res = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Failed to fetch metrics: ${errorText || res.statusText}`
      );
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
}

// function fetches all logs
export async function fetchLogs(
  projectId: string,
  timeRange?: TimeRange
): Promise<Log[]> {
  if (!projectId) {
    throw new Error("Missing projectId in fetchLogs");
  }

  const url = new URL(`${API_URL}/api/logs`);
  url.searchParams.set("project_id", projectId);
  if (timeRange?.start) url.searchParams.set("start", timeRange.start);
  if (timeRange?.end) url.searchParams.set("end", timeRange.end);

  try {
    const res = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch logs: ${errorText || res.statusText}`);
    }
    const logs: Log[] = await res.json();
    return logs;
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
}

// function fetches all traces
export async function fetchTraces(
  projectId: string,
  timeRange?: TimeRange
): Promise<Trace[]> {
  if (!projectId) {
    throw new Error("Missing projectId in fetchTraces");
  }

  const url = new URL(`${API_URL}/api/traces`);
  url.searchParams.set("project_id", projectId);
  if (timeRange?.start) url.searchParams.set("start", timeRange.start);
  if (timeRange?.end) url.searchParams.set("end", timeRange.end);

  try {
    const res = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch traces: ${errorText || res.statusText}`);
    }
    const traces: Trace[] = await res.json();
    return traces;
  } catch (error) {
    console.error("Error fetching traces:", error);
    throw error;
  }
}

export async function fetchDashboard(projectId: string) {
  const res = await fetch(`${API_URL}/api/dashboard?project_id=${projectId}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  return res.json();
}
