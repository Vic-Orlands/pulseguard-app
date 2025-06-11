interface UpdateUserData {
  email?: string;
  password?: string;
}
const url = process.env.NEXT_PUBLIC_API_URL;

export const deleteProject = async (slug: string) => {
  try {
    const response = await fetch(`${url}/api/projects/${slug}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete project: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${url}/api/users/me`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to get current user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (userData: UpdateUserData) => {
  try {
    const response = await fetch(`${url}/api/users/me`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
