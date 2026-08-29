import { csrfHeaders } from "@/lib/security/csrf";

const url = process.env.NEXT_PUBLIC_API_URL;

const headers = (projectId: string) => ({
  "Content-Type": "application/json",
  ...csrfHeaders(),
  "X-Project-ID": projectId,
});

export type ProjectIntegration = {
  id: string;
  project_id: string;
  provider: string;
  config: Record<string, unknown>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

async function parseError(res: Response, fallback: string) {
  try {
    const body = await res.json();
    return body.error || body.message || fallback;
  } catch {
    return fallback;
  }
}

export async function listIntegrations(
  projectId: string,
): Promise<ProjectIntegration[]> {
  const res = await fetch(`${url}/api/integrations?project_id=${projectId}`, {
    credentials: "include",
    headers: headers(projectId),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to load integrations"));
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function upsertIntegration(
  projectId: string,
  provider: string,
  config: Record<string, string>,
  enabled = true,
): Promise<ProjectIntegration> {
  const res = await fetch(`${url}/api/integrations?project_id=${projectId}`, {
    method: "POST",
    credentials: "include",
    headers: headers(projectId),
    body: JSON.stringify({ provider, config, enabled }),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to save integration"));
  }
  return res.json();
}

export async function deleteIntegration(
  projectId: string,
  integrationId: string,
): Promise<void> {
  const res = await fetch(
    `${url}/api/integrations/${integrationId}?project_id=${projectId}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: headers(projectId),
    },
  );
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to disconnect"));
  }
}

export async function setIntegrationEnabled(
  projectId: string,
  integrationId: string,
  enabled: boolean,
): Promise<void> {
  const res = await fetch(
    `${url}/api/integrations/${integrationId}/enabled?project_id=${projectId}`,
    {
      method: "PUT",
      credentials: "include",
      headers: headers(projectId),
      body: JSON.stringify({ enabled }),
    },
  );
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to update integration"));
  }
}

export async function testIntegration(
  projectId: string,
  integrationId: string,
): Promise<void> {
  const res = await fetch(
    `${url}/api/integrations/${integrationId}/test?project_id=${projectId}`,
    {
      method: "POST",
      credentials: "include",
      headers: headers(projectId),
    },
  );
  if (!res.ok) {
    throw new Error(await parseError(res, "Test failed"));
  }
}
