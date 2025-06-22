"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api/user-api";

import type { UserProps } from "@/types/user";
import { logoutUser } from "@/lib/api/user-api";

interface AuthContextType {
  user: UserProps | null;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserProps | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProps | null>(null);

  // fetch user func
  const fetchUser = useCallback(async () => {
    try {
      const userData: UserProps = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // logout user func
  const logout = useCallback(async () => {
    try {
      const res = await logoutUser();
      if (!res) {
        throw new Error("Error logging out");
      }

      setUser(null);
      router.push("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, fetchUser, logout }}>
      {children || loading}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
