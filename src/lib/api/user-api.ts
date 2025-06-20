import { SignupFormData, LoginFormData } from "@/types/user";

const url = process.env.NEXT_PUBLIC_API_URL;

//register user
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

// login user
export const loginUser = async (data: LoginFormData) => {
  try {
    const response = await fetch(`${url}/api/users/login`, {
      method: "POST",
      credentials: "include",
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

// logs out user
export const logoutUser = async () => {
  try {
    const res = await fetch(`${url}/api/users/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Error logging out: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
};
