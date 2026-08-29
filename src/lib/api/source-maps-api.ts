import { csrfHeaders } from "@/lib/security/csrf";

const url = process.env.NEXT_PUBLIC_API_URL;

export type SourceMapFile = {
  id: string;
  projectId: string;
  release: string;
  fileName: string;
  byteSize: number;
  createdAt: string;
};

const headers = (projectId: string, extra?: Record<string, string>) => ({
  ...csrfHeaders(),
  "X-Project-ID": projectId,
  ...extra,
});

export async function listSourceMaps(projectId: string): Promise<SourceMapFile[]> {
  const res = await fetch(`${url}/api/source-maps?project_id=${projectId}`, {
    credentials: "include",
    headers: headers(projectId),
  });
  if (!res.ok) {
    throw new Error("Failed to load source maps");
  }
  return res.json();
}

export async function uploadSourceMap(
  projectId: string,
  release: string,
  fileName: string,
  mapJson: string,
): Promise<SourceMapFile> {
  const res = await fetch(`${url}/api/source-maps?project_id=${projectId}`, {
    method: "POST",
    credentials: "include",
    headers: headers(projectId, { "Content-Type": "application/json" }),
    body: JSON.stringify({ release, fileName, mapJson }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "" }));
    throw new Error(body.error || "Failed to upload source map");
  }
  return res.json();
}

export async function deleteSourceMap(projectId: string, id: string): Promise<void> {
  const res = await fetch(`${url}/api/source-maps/${id}?project_id=${projectId}`, {
    method: "DELETE",
    credentials: "include",
    headers: headers(projectId),
  });
  if (!res.ok) {
    throw new Error("Failed to delete source map");
  }
}
