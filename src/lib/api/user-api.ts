import { SignupFormData, LoginFormData, UpdateUserData } from "@/types/user";

const url = process.env.NEXT_PUBLIC_API_URL;

const headerConfig = {
  credentials: "include" as const,
  headers: { "Content-Type": "application/json" },
};

// SETTINGS - USER API FUNCTIONS
// Register user
export const registerUser = async (data: SignupFormData) => {
  try {
    const response = await fetch(`${url}/api/users/register`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const error = await response.json();
      return error;
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};

// Login user
export const loginUser = async (data: LoginFormData) => {
  try {
    const response = await fetch(`${url}/api/users/login`, {
      method: "POST",
      ...headerConfig,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      return error;
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};

// forgot password
export const sendResetPasswordEmail = async (email: string) => {
  try {
    const response = await fetch(`${url}/api/users/forgot-password`, {
      method: "POST",
      ...headerConfig,
      body: email,
    });

    if (!response.ok) {
      const error = await response.json();
      return error;
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};

// logs out user
export const logoutUser = async () => {
  try {
    const res = await fetch(`${url}/api/users/logout`, {
      method: "POST",
      ...headerConfig,
    });

    if (!res.ok) {
      throw new Error(`Error logging out: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
};

// get current user
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

// update user
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

// delete user
export const deleteUser = async () => {
  try {
    const res = await fetch(`${url}/api/users/me`, {
      method: "DELETE",
      ...headerConfig,
    });

    if (!res.ok) throw new Error(`Error: ${res.statusText}`);

    return await res.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    return null;
  }
};
