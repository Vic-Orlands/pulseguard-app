import { DashboardData, Log, Trace } from "@/types/dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface TimeRange {
  start?: string;
  end?: string;
}

// fetch all metrics
export async function fetchMetrics(projectId: string) {
  if (!projectId) {
    throw new Error("Missing projectId in fetchLogs");
  }

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

    const metrics = await res.json();
    if (!Array.isArray(metrics)) {
      throw new Error(
        "Expected an array of metrics, received: " + JSON.stringify(metrics)
      );
    }
    return metrics;
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
): Promise<Trace> {
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
    const traces: Trace = await res.json();
    return traces;
  } catch (error) {
    console.error("Error fetching traces:", error);
    throw error;
  }
}

// function fetches all traces
export async function fetchLogToTrace(traceId: string): Promise<Trace> {
  try {
    const res = await fetch(`${API_URL}/api/traces/${traceId}`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch traces: ${errorText || res.statusText}`);
    }
    const traces: Trace = await res.json();
    return traces;
  } catch (error) {
    console.error("Error fetching traces:", error);
    throw error;
  }
}

// fetch user sessions
export async function fetchSessions(
  projectId: string,
  start: string,
  end: string
) {
  if (!projectId) {
    throw new Error("Missing projectId in fetchSessions");
  }

  const url = new URL(`${API_URL}/api/sessions`);
  url.searchParams.set("project_id", projectId);
  url.searchParams.set("start", start);
  url.searchParams.set("end", end);

  try {
    const res = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Failed to fetch sessions: ${errorText || res.statusText} (Status: ${
          res.status
        })`
      );
    }

    const sessions = await res.json();
    if (!Array.isArray(sessions)) {
      throw new Error(
        `Expected an array of sessions, received: ${JSON.stringify(sessions)}`
      );
    }
    return sessions;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
}

// fetch all overview data
export async function fetchDashboardData(
  projectId: string
): Promise<DashboardData> {
  const url = new URL(`${API_URL}/api/dashboard`);
  url.searchParams.set("project_id", projectId);

  try {
    const res = await fetch(url.toString(), {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch dashboard data: ${res.status}`);
    }

    const data = await res.json();
    return (
      data || {
        alerts: [],
        metrics: [],
        errors: [],
        total_errors: 0,
        error_rate: 0,
        sessions: [],
      }
    );
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
}
