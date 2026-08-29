"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser, logoutUser } from "@/lib/api/user-api";
import { listWorkspaces, type Workspace } from "@/lib/api/workspace-api";
import type { UserProps } from "@/types/user";
import { AppLoader } from "@/components/shared/app-loader";
import { safeInternalRedirect } from "@/lib/security/safe-redirect";
import { getPostAuthPath } from "@/lib/last-project";

interface AuthContextType {
  user: UserProps | null;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserProps | null>>;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace) => void;
  fetchWorkspaces: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProps | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(
    null,
  );

  const shouldFetchUser =
    pathname === "/" ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/settings") ||
    pathname === "/onboarding";

  const fetchWorkspaces = useCallback(async () => {
    try {
      const wsData = await listWorkspaces();
      const safeWsData = Array.isArray(wsData) ? wsData : [];
      setWorkspaces(safeWsData);
      
      if (safeWsData.length > 0) {
        const storedWsId = localStorage.getItem(
          "pulseguard_active_workspace_id",
        );
        const found = safeWsData.find((w) => w.id === storedWsId);
        if (found) {
          setActiveWorkspaceState(found);
        } else {
          setActiveWorkspaceState(safeWsData[0]);
          localStorage.setItem("pulseguard_active_workspace_id", safeWsData[0].id);
        }
      } else {
        setActiveWorkspaceState(null);
      }
    } catch (err) {
      console.error("Error fetching workspaces:", err);
      setWorkspaces((prev) => (Array.isArray(prev) ? prev : []));
      setActiveWorkspaceState(null);
    }
  }, []);

  const setActiveWorkspace = useCallback((ws: Workspace) => {
    setActiveWorkspaceState(ws);
    localStorage.setItem("pulseguard_active_workspace_id", ws.id);
  }, []);

  // fetch user func
  const fetchUser = useCallback(async () => {
    try {
      const userData: UserProps = await getCurrentUser();
      setUser(userData);
      if (userData) {
        await fetchWorkspaces();
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchWorkspaces]);

  // logout user func
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      setWorkspaces([]);
      setActiveWorkspaceState(null);
      localStorage.removeItem("pulseguard_active_workspace_id");
      router.push("/signin");
      router.refresh();
    }
  }, [router]);

  useEffect(() => {
    if (shouldFetchUser) {
      fetchUser();
      return;
    }

    setUser(null);
    setLoading(false);
  }, [fetchUser, shouldFetchUser]);

  useEffect(() => {
    if (!loading && user) {
      const savedRedirect = localStorage.getItem(
        "pulseguard_post_auth_redirect",
      );
      if (savedRedirect) {
        localStorage.removeItem("pulseguard_post_auth_redirect");
        router.push(safeInternalRedirect(savedRedirect));
        return;
      }

      const isAcceptingInvite = pathname.startsWith("/accept-invite");
      if (
        workspaces.length === 0 &&
        pathname !== "/onboarding" &&
        !isAcceptingInvite
      ) {
        router.push("/onboarding");
      } else if (workspaces.length > 0 && pathname === "/onboarding") {
        router.push(getPostAuthPath());
      }
    }
  }, [user, workspaces, pathname, loading, router]);

  const hasRouteLoader =
    pathname.startsWith("/projects/") && pathname !== "/projects";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        fetchUser,
        logout,
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        fetchWorkspaces,
        loading,
      }}
    >
      {loading && shouldFetchUser && !hasRouteLoader ? (
        <AppLoader title="Loading PulseGuard..." />
      ) : (
        children
      )}
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
