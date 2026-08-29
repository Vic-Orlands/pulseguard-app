import { jsonAuthConfig } from "@/lib/security/csrf";
import { HttpError } from "../utils";

export interface Project {
  id?: string;
  slug: string;
  name: string;
  description: string;
  dsn?: string;
  firstEventAt?: string | null;
}

const url = process.env.NEXT_PUBLIC_API_URL;

// SETTINGS - PROJECT API FUNCTIONS
export const createProject = async (data: {
  name: string;
  description: string;
  platform: string;
  workspaceId: string;
}): Promise<Project> => {
  const res = await fetch(`${url}/api/projects`, {
    method: "POST",
    ...jsonAuthConfig(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    let bodyText = "";
    try {
      if (contentType.includes("application/json")) {
        const e = await res.json();
        bodyText = e?.error || e?.message || JSON.stringify(e);
      } else {
        bodyText = await res.text();
      }
    } catch {
      bodyText = res.statusText;
    }
    throw new HttpError(bodyText || `HTTP ${res.status}`, res.status, bodyText);
  }

  return res.json();
};

export const updateProject = async (slug: string, data: Project) => {
  const res = await fetch(`${url}/api/projects/${slug}`, {
    method: "PUT",
    ...jsonAuthConfig(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    // Try to extract server error message (JSON or text)
    const contentType = res.headers.get("content-type") || "";
    let bodyText = "";
    try {
      if (contentType.includes("application/json")) {
        const e = await res.json();
        bodyText = e?.error || e?.message || JSON.stringify(e);
      } else {
        bodyText = await res.text();
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }

    // Construct a meaningful error
    const message = bodyText || res.statusText || `HTTP ${res.status}`;
    throw new HttpError(message, res.status, bodyText);
  }

  return res.json();
};

export const deleteProject = async (slug: string) => {
  try {
    const res = await fetch(`${url}/api/projects/${slug}`, {
      method: "DELETE",
      ...jsonAuthConfig(),
    });

    if (!res.ok) throw new Error(`Error: ${res.statusText}`);

    return await res.json();
  } catch (error) {
    console.error("Error deleting project:", error);
    return null;
  }
};

export const deleteAllProjects = async () => {
  try {
    const res = await fetch(`${url}/api/projects`, {
      method: "DELETE",
      ...jsonAuthConfig(),
    });
    if (!res.ok) throw new Error(`Error: ${res.statusText}`);

    return res === null ? null : await res.json();
  } catch (error) {
    console.error("Error deleting all projects:", error);
    return null;
  }
};

export const rotateProjectDSN = async (slug: string) => {
  const res = await fetch(`${url}/api/projects/${slug}/dsn/rotate`, {
    method: "POST",
    ...jsonAuthConfig(),
  });
  if (!res.ok) {
    throw new HttpError("Failed to rotate DSN", res.status);
  }
  return res.json() as Promise<{ dsn: string; slug: string; name: string }>;
};
