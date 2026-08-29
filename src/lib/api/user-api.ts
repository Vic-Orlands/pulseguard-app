import type { UpdateUserData } from "@/types/user";
import type { LoginFormData, SignupFormData } from "@/types/form";
import {
  clearCsrfToken,
  jsonAuthConfig,
  setCsrfToken,
} from "@/lib/security/csrf";

const url = process.env.NEXT_PUBLIC_API_URL;

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

export const loginUser = async (data: LoginFormData) => {
  try {
    const response = await fetch(`${url}/api/users/login`, {
      method: "POST",
      ...jsonAuthConfig(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      return error;
    }

    const result = await response.json();
    setCsrfToken(result?.csrf_token);
    return result;
  } catch (error) {
    throw error;
  }
};

export const sendResetPasswordEmail = async (email: string) => {
  try {
    const response = await fetch(`${url}/api/forgot-password`, {
      method: "POST",
      ...jsonAuthConfig(),
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

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const response = await fetch(`${url}/api/reset-password`, {
      method: "POST",
      ...jsonAuthConfig(),
      body: JSON.stringify({
        token,
        new_password: newPassword,
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

export const logoutUser = async () => {
  try {
    const res = await fetch(`${url}/api/users/logout`, {
      method: "POST",
      ...jsonAuthConfig(),
    });

    if (!res.ok && res.status !== 204) {
      throw new Error(`Error logging out: ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return res.json();
    }

    return true;
  } finally {
    clearCsrfToken();
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await fetch(`${url}/api/users/me`, {
      ...jsonAuthConfig(),
    });

    if (res.status === 401) return null;
    if (!res.ok) throw new Error("Failed to fetch user");

    const data = await res.json();
    if (data && typeof data === "object") {
      setCsrfToken(data.csrf_token);
      delete data.csrf_token;
    }
    return data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

export const updateUser = async (userData: UpdateUserData) => {
  try {
    const res = await fetch(`${url}/api/users/me`, {
      method: "PUT",
      ...jsonAuthConfig(),
      body: JSON.stringify(userData),
    });

    if (!res.ok) throw new Error(`Error: ${res.statusText}`);

    return await res.json();
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
};

export const deleteUser = async () => {
  try {
    const res = await fetch(`${url}/api/users/me`, {
      method: "DELETE",
      ...jsonAuthConfig(),
    });

    if (!res.ok) throw new Error(`Error: ${res.statusText}`);

    return await res.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    return null;
  }
};
