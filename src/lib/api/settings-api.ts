interface UpdateUserData {
  email?: string;
  password?: string;
}

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

export const getCurrentUser = async () => {
  try {
    const res = await fetch(`${url}/api/users/me`, {
      ...headerConfig,
    });

    if (res.status === 401) return null;
    if (!res.ok) throw new Error("Failed to fetch user");

    return await res.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

export const updateUser = async (userData: UpdateUserData) => {
  try {
    const res = await fetch(`${url}/api/users/me`, {
      method: "PUT",
      ...headerConfig,
      body: JSON.stringify(userData),
    });

    if (!res.ok) throw new Error(`Error: ${res.statusText}`);

    return await res.json();
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
};

export const updateProject = async (slug: string, data: Project) => {
  try {
    const res = await fetch(`${url}/api/projects/${slug}`, {
      method: "PUT",
      ...headerConfig,
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Error: ${res.statusText}`);

    return await res.json();
  } catch (error) {
    console.error("Error updating project:", error);
    return null;
  }
};
