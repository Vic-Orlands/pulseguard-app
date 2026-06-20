import { HttpError } from "../utils";

export interface Project {
  slug: string;
  name: string;
  description: string;
}

const url = process.env.NEXT_PUBLIC_API_URL;

const headerConfig = {
  credentials: "include" as const,
  headers: { "Content-Type": "application/json" },
};

// SETTINGS - PROJECT API FUNCTIONS
export const updateProject = async (slug: string, data: Project) => {
  const res = await fetch(`${url}/api/projects/${slug}`, {
    method: "PUT",
    ...headerConfig,
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
      ...headerConfig,
    });

    if (!res.ok) throw new Error(`Error: ${res.statusText}`);

    return await res.json();
  } catch (error) {
    console.error("Error deleting project:", error);
    return null;
  }
};

export const batchDeleteProjects = async (slugs: string[]) => {
  try {
    const results = [];
    for (const slug of slugs) {
      const res = await fetch(`${url}/api/projects/${slug}`, {
        method: "DELETE",
        ...headerConfig,
      });
      if (!res.ok) {
        console.error(`Error deleting project ${slug}:`, res.statusText);
        results.push({ slug, success: false, error: res.statusText });
      } else {
        results.push({ slug, success: true });
      }
    }
    return results;
  } catch (error) {
    console.error("Error deleting projects in batch:", error);
    return null;
  }
};

export const deleteAllProjects = async () => {
  try {
    const res = await fetch(`${url}/api/projects`, {
      method: "DELETE",
      ...headerConfig,
    });
    if (!res.ok) throw new Error(`Error: ${res.statusText}`);

    return res === null ? null : await res.json();
  } catch (error) {
    console.error("Error deleting all projects:", error);
    return null;
  }
};
