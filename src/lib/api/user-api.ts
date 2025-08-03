import type { UpdateUserData } from "@/types/user";
import type { LoginFormData, SignupFormData } from "@/types/form";

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
    const response = await fetch(`${url}/api/forgot-password`, {
      method: "POST",
      ...headerConfig,
      body: JSON.stringify({ email }),
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

// reset password
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await fetch(`${url}/api/reset-password`, {
      method: "POST",
      ...headerConfig,
      body: JSON.stringify({
        token,
        password: newPassword,
      }),
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

// Optional: Add token validation function
export const validateResetToken = async (token: string) => {
  try {
    const response = await fetch(`${url}/api/validate-reset-token`, {
      method: "POST",
      ...headerConfig,
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { valid: false, error: error.message };
    }

    const result = await response.json();
    return { valid: true, ...result };
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error ? error.message : "Failed to validate token",
    };
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
