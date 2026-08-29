import type { Alert } from "@/types/dashboard";

const url = process.env.NEXT_PUBLIC_API_URL;

const headers = (projectId?: string) => ({
  "Content-Type": "application/json",
  "X-CSRF-Token": "pulseguard-web",
  ...(projectId ? { "X-Project-ID": projectId } : {}),
});

export type AlertInput = {
  project_id: string;
  name: string;
  message?: string;
  type: string;
  threshold: number;
  window_minutes: number;
  severity: string;
  enabled?: boolean;
  notify_in_app?: boolean;
  notify_email?: boolean;
};

async function parseError(res: Response, fallback: string) {
  try {
    const body = await res.json();
    return body.error || body.message || fallback;
  } catch {
    return fallback;
  }
}

export async function listAlerts(projectId: string): Promise<Alert[]> {
  const res = await fetch(`${url}/api/alerts/${projectId}`, {
    credentials: "include",
    headers: headers(projectId),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to load alerts"));
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createAlert(input: AlertInput): Promise<Alert> {
  const res = await fetch(`${url}/api/alerts`, {
    method: "POST",
    credentials: "include",
    headers: headers(input.project_id),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to create alert"));
  }
  return res.json();
}

export async function updateAlert(
  projectId: string,
  alertId: string,
  input: Partial<AlertInput>,
): Promise<Alert> {
  const res = await fetch(`${url}/api/alerts/${alertId}`, {
    method: "PUT",
    credentials: "include",
    headers: headers(projectId),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to update alert"));
  }
  return res.json();
}

export async function deleteAlert(projectId: string, alertId: string): Promise<void> {
  const res = await fetch(`${url}/api/alerts/${alertId}`, {
    method: "DELETE",
    credentials: "include",
    headers: headers(projectId),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to delete alert"));
  }
}
