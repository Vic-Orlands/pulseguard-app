"use client";

import { useState, useEffect, useCallback, type ComponentType } from "react";
import { HugeiconsIcon } from "@/components/phosphor-icons";
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  Cancel01Icon,
  PlusSignIcon,
  Logout01Icon,
  Menu01Icon,
  Settings01Icon,
  UserIcon,
  CheckIcon,
  Home,
  Users,
  ChartLineData01Icon,
  Bug01Icon,
  ListViewIcon,
  HierarchyFilesIcon,
  Notification01Icon,
  PlugsIcon,
  Sun,
  Moon,
  Building,
  Key,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Loader2,
  ChevronRight,
  UserGroupIcon,
} from "@/components/phosphor-icons";
import type { PulseIconProps } from "@/components/phosphor-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { CustomAlertDialog } from "@/components/dashboard/shared/custom-alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Alert as DashboardAlert,
  NavItem,
  Project,
} from "@/types/dashboard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { normalizePostgresString } from "@/lib/utils";
import { useTheme } from "next-themes";
import { formatDistanceToNow } from "date-fns";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/lib/api/notifications-api";
import { Logo } from "@/app/(auth)/signin/page";
import { CreateWorkspaceModal } from "@/components/dashboard/shared/create-workspace-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HeaderProps {
  alerts: DashboardAlert[];
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
  project: Project;
}

const navItems: { id: NavItem; label: string; icon: ComponentType<PulseIconProps> }[] = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "sessions", label: "Sessions", icon: Users },
  { id: "metrics", label: "Metrics", icon: ChartLineData01Icon },
  { id: "errors", label: "Errors", icon: Bug01Icon },
  { id: "logs", label: "Logs", icon: ListViewIcon },
  { id: "traces", label: "Traces", icon: HierarchyFilesIcon },
  { id: "alerts", label: "Alerts", icon: Notification01Icon },
  { id: "teams", label: "Teams", icon: UserGroupIcon },
  { id: "integrations", label: "Integrations", icon: PlugsIcon },
  { id: "settings", label: "Settings", icon: Settings01Icon },
];

const url = process.env.NEXT_PUBLIC_API_URL;

export default function Header({
  alerts,
  activeTab,
  setActiveTab,
  project,
}: HeaderProps) {
  const { user, logout, workspaces, activeWorkspace, setActiveWorkspace } =
    useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const activeAlerts = alerts.filter((alert) => alert.enabled).length;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isOrgSwitcherOpen, setIsOrgSwitcherOpen] = useState(false);
  const [isCliModalOpen, setIsCliModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState(
    `pg_live_7a398be8e244f0b2a991c0e3a98dbcc21e${project.id.slice(-4)}`,
  );
  const [showModalApiKey, setShowModalApiKey] = useState(false);
  const [isApiKeyCopied, setIsApiKeyCopied] = useState(false);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);
  const [modalCodeTab, setModalCodeTab] = useState<"curl" | "node" | "python">(
    "curl",
  );
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] =
    useState(false);
  const [previewWorkspaceId, setPreviewWorkspaceId] = useState<string | null>(
    activeWorkspace?.id ?? null,
  );
  const [workspaceProjects, setWorkspaceProjects] = useState<
    Record<string, Project[]>
  >({});
  const [workspaceProjectLoading, setWorkspaceProjectLoading] = useState<
    Record<string, boolean>
  >({});
  const [workspaceProjectErrors, setWorkspaceProjectErrors] = useState<
    Record<string, string>
  >({});
  const [isProjectNavigationPending, setIsProjectNavigationPending] =
    useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await listNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread);
    } catch {
      // Keep the sidebar usable even if notifications fail.
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void loadNotifications();
    const timer = window.setInterval(() => {
      void loadNotifications();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [loadNotifications]);

  useEffect(() => {
    if (activeWorkspace?.id) {
      setPreviewWorkspaceId(activeWorkspace.id);
    }
  }, [activeWorkspace?.id]);

  const handleBackToProjects = () => {
    router.push("/projects");
  };

  const currentUser = user && normalizePostgresString(user.avatar);
  const previewProjects = previewWorkspaceId
    ? (workspaceProjects[previewWorkspaceId] ?? [])
    : [];
  const previewProjectsLoading = previewWorkspaceId
    ? workspaceProjectLoading[previewWorkspaceId]
    : false;
  const previewProjectsError = previewWorkspaceId
    ? workspaceProjectErrors[previewWorkspaceId]
    : "";

  const fetchWorkspaceProjects = async (workspaceId: string) => {
    if (!workspaceId || workspaceProjectLoading[workspaceId]) {
      return;
    }

    setWorkspaceProjectLoading((prev) => ({ ...prev, [workspaceId]: true }));
    setWorkspaceProjectErrors((prev) => ({ ...prev, [workspaceId]: "" }));

    try {
      const response = await fetch(
        `${url}/api/projects?workspaceId=${workspaceId}`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load projects");
      }

      const data: Project[] = await response.json();
      setWorkspaceProjects((prev) => ({ ...prev, [workspaceId]: data ?? [] }));
    } catch (error) {
      console.error("Error loading workspace projects:", error);
      setWorkspaceProjectErrors((prev) => ({
        ...prev,
        [workspaceId]: "Failed to load projects for this workspace.",
      }));
    } finally {
      setWorkspaceProjectLoading((prev) => ({ ...prev, [workspaceId]: false }));
    }
  };

  const handleWorkspacePreview = (workspaceId: string) => {
    setPreviewWorkspaceId(workspaceId);
    if (
      !workspaceProjects[workspaceId] &&
      !workspaceProjectLoading[workspaceId]
    ) {
      void fetchWorkspaceProjects(workspaceId);
    }
  };

  const handleProjectSelect = (workspaceId: string, slug: string) => {
    const workspace = workspaces.find((item) => item.id === workspaceId);
    if (!workspace) {
      return;
    }

    setActiveWorkspace(workspace);
    setIsOrgSwitcherOpen(false);
    setIsProjectNavigationPending(true);
    router.push(`/projects/${slug}`);
  };

  const getCodeSnippet = () => {
    switch (modalCodeTab) {
      case "node":
        return `const PulseGuard = require('@pulseguard/node');\nconst client = new PulseGuard({\n  apiKey: '${apiKey}',\n  projectId: '${project.id}'\n});\n\nclient.captureMessage('Server started');`;
      case "python":
        return `import pulseguard\n\npulseguard.init(\n    api_key="${apiKey}",\n    project_id="${project.id}"\n)\n\npulseguard.capture_message("Server started")`;
      default:
        return `curl -X POST https://api.pulseguard.dev/v1/telemetry \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"project_id": "${project.id}", "level": "info", "message": "Ping check"}'`;
    }
  };

  const sidebarInner = (
    <>
      <div className="px-4 pt-5 pb-4">
        <button
          type="button"
          onClick={handleBackToProjects}
          className="flex items-center gap-2.5 bg-transparent p-0"
        >
          <div className="scale-[0.72] origin-left h-8 w-8 overflow-hidden">
            <Logo />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-pg-text">
            PulseGuard
          </span>
        </button>
      </div>

      <div className="px-3 pb-3">
        <DropdownMenu
          open={isOrgSwitcherOpen}
          onOpenChange={(open) => {
            setIsOrgSwitcherOpen(open);
            if (open && activeWorkspace?.id) {
              handleWorkspacePreview(activeWorkspace.id);
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <button
              className="flex w-full items-center gap-2 rounded-lg bg-pg-group px-2.5 py-2 text-left transition-colors hover:bg-pg-surface"
              id="org-switcher-button"
            >
              <Building className="h-3.5 w-3.5 text-pg-muted shrink-0" />
              <span className="min-w-0 flex-1 truncate text-xs text-pg-text">
                {activeWorkspace?.name || "Workspace"}
                <span className="text-pg-faint"> / </span>
                {project.name}
              </span>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className="h-3.5 w-3.5 shrink-0"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[min(92vw,42rem)] bg-pg-modal text-pg-text rounded-lg p-0 z-50 text-left overflow-hidden"
            align="start"
            side="right"
            sideOffset={10}
          >
            <div className="grid md:grid-cols-[16rem_minmax(0,1fr)]">
              <div className="bg-pg-group/50">
                <div className="px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-pg-subtle">
                    Workspaces
                  </p>
                </div>
                <div className="max-h-80 space-y-1 overflow-y-auto p-2">
                  {workspaces.map((ws) => {
                    const isPreviewWorkspace = previewWorkspaceId === ws.id;
                    return (
                      <button
                        key={ws.id}
                        onClick={() => handleWorkspacePreview(ws.id)}
                        className={`w-full rounded-lg px-3 py-2.5 text-left transition-all ${
                          isPreviewWorkspace
                            ? "bg-pg-group text-pg-text"
                            : "text-pg-muted hover:bg-pg-group hover:text-pg-text"
                        }`}
                      >
                        <p className="min-w-0 truncate text-xs font-medium">
                          {ws.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setIsOrgSwitcherOpen(false);
                      setIsCreateWorkspaceModalOpen(true);
                    }}
                    className="flex w-full items-center gap-1 rounded-lg bg-transparent px-3 py-2.5 text-left text-xs font-medium text-pg-text transition-colors hover:bg-pg-group"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5" />
                    <span>Create Workspace</span>
                  </button>
                </div>
              </div>

              <div className="flex min-h-[22rem] flex-col">
                <div className="px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-pg-subtle">
                    Projects
                  </p>
                </div>
                <div className="flex-1 p-2">
                  {previewProjectsLoading ? (
                    <div className="flex h-full min-h-56 items-center justify-center gap-2 text-xs text-pg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading projects...</span>
                    </div>
                  ) : previewProjectsError ? (
                    <div className="flex h-full min-h-56 items-center justify-center p-3">
                      <div className="banner-error w-full">
                        {previewProjectsError}
                      </div>
                    </div>
                  ) : previewProjects.length > 0 ? (
                    <div className="grid gap-2 md:grid-cols-2">
                      {previewProjects.map((workspaceProject) => {
                        const isCurrentProject =
                          workspaceProject.id === project.id;
                        return (
                          <button
                            key={workspaceProject.id}
                            onClick={() =>
                              handleProjectSelect(
                                previewWorkspaceId!,
                                workspaceProject.slug,
                              )
                            }
                            disabled={isProjectNavigationPending}
                            className={`rounded-lg p-3 text-left transition-all ${
                              isCurrentProject
                                ? "bg-pg-group"
                                : "bg-transparent hover:bg-pg-group"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium text-pg-text">
                                  {workspaceProject.name}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-pg-muted">
                                  {workspaceProject.description ||
                                    "Open this project dashboard."}
                                </p>
                              </div>
                              {isCurrentProject ? null : (
                                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-pg-muted" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex h-full min-h-56 flex-col items-center justify-center px-6 text-center">
                      <p className="text-sm text-pg-text">
                        No projects in this workspace yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        {navItems.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`mb-0.5 flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] transition-colors duration-200 ${
                isSelected
                  ? "bg-pg-group text-pg-text font-medium"
                  : "bg-transparent text-pg-muted hover:bg-pg-group/70 hover:text-pg-text"
              }`}
            >
              <HugeiconsIcon icon={tab.icon} className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.id === "alerts" && activeAlerts > 0 ? (
                <span className="ml-auto text-[10px] text-pg-subtle">
                  {activeAlerts}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pb-4 space-y-2">
        <button
          type="button"
          onClick={handleBackToProjects}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-pg-muted transition-colors hover:bg-pg-group hover:text-pg-text bg-transparent"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          Projects
        </button>

        <button
          onClick={() => setIsCliModalOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-pg-muted transition-colors hover:bg-pg-group hover:text-pg-text bg-transparent"
        >
          <Key className="h-4 w-4 text-pg-muted" />
          Integration key
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-pg-muted transition-colors hover:bg-pg-group hover:text-pg-text bg-transparent"
            >
              <HugeiconsIcon icon={Notification01Icon} className="h-4 w-4" />
              Notifications
              {unreadCount > 0 ? (
                <span className="ml-auto text-[10px] text-pg-subtle">{unreadCount}</span>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-80 bg-pg-modal rounded-lg p-1 z-50 text-pg-text"
            align="start"
            side="top"
          >
            <div className="flex items-center justify-between px-2 py-2">
              <p className="text-xs font-semibold">Notifications</p>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="bg-transparent p-0 text-[11px] text-pg-muted hover:text-pg-text"
                  onClick={async () => {
                    await markAllNotificationsRead();
                    await loadNotifications();
                  }}
                >
                  Mark all read
                </button>
              ) : null}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-3 py-8 text-center text-xs text-pg-muted">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left hover:bg-pg-group bg-transparent"
                    onClick={async () => {
                      if (!item.read_at) {
                        await markNotificationRead(item.id);
                        await loadNotifications();
                      }
                      if (item.href) {
                        router.push(item.href);
                      }
                    }}
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="truncate text-xs font-medium text-pg-text">
                        {item.title}
                      </span>
                      {!item.read_at ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      ) : null}
                    </span>
                    <span className="line-clamp-2 text-[11px] text-pg-muted">
                      {item.body}
                    </span>
                    <span className="text-[10px] text-pg-subtle">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </button>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-2 text-left transition-colors hover:bg-pg-group"
              id="user-menu-avatar"
            >
              {currentUser ? (
                <img
                  src={currentUser}
                  alt="User"
                  className="h-8 w-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pg-group text-xs font-semibold text-pg-text">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-pg-text">
                  {user?.name || "User"}
                </span>
                <span className="block truncate text-[10px] text-pg-muted">
                  {user?.email || ""}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-52 bg-pg-modal rounded-lg p-1 z-50 text-left text-pg-text"
            align="start"
            side="top"
            forceMount
          >
            <div className="p-2">
              <p className="text-xs font-semibold text-pg-text truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-pg-subtle truncate mt-0.5">
                {user?.email || ""}
              </p>
            </div>
            <div className="p-1 space-y-0.5">
              <button
                onClick={() => setActiveTab("settings")}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-pg-muted hover:text-pg-text hover:bg-pg-group transition-colors text-left cursor-pointer bg-transparent border-0"
              >
                <HugeiconsIcon icon={UserIcon} className="w-3.5 h-3.5" />
                <span>Account</span>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-pg-muted hover:text-pg-text hover:bg-pg-group transition-colors text-left cursor-pointer bg-transparent border-0"
              >
                <HugeiconsIcon icon={Settings01Icon} className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
              {mounted ? (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-pg-muted hover:text-pg-text hover:bg-pg-group transition-colors text-left cursor-pointer bg-transparent border-0"
                  id="dashboard-theme-toggle"
                >
                  {theme === "dark" ? (
                    <Sun className="w-3.5 h-3.5 text-pg-muted" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-pg-muted" />
                  )}
                  <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                </button>
              ) : null}
              <CustomAlertDialog
                trigger={
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-colors text-left cursor-pointer bg-transparent border-0">
                    <HugeiconsIcon icon={Logout01Icon} className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign out</span>
                  </button>
                }
                title="Sign out"
                description="Are you sure you want to sign out of your account?"
                onConfirm={logout}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden md:flex sticky top-0 z-40 h-screen w-[220px] shrink-0 flex-col bg-pg-modal text-pg-text select-none">
        {sidebarInner}
      </aside>

      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-pg-modal px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="scale-[0.6] origin-left h-8 w-8 overflow-hidden">
            <Logo />
          </div>
          <span className="text-sm font-semibold text-pg-text">PulseGuard</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-pg-muted hover:text-pg-text shadow-none"
          onClick={() => setMobileMenuOpen(true)}
        >
          <HugeiconsIcon icon={Menu01Icon} className="h-4 w-4" />
        </Button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full w-[220px] flex-col bg-pg-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex justify-end px-3 pt-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-8 w-8 text-pg-muted hover:text-pg-text shadow-none"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                </Button>
              </div>
              {sidebarInner}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isCliModalOpen} onOpenChange={setIsCliModalOpen}>
        <DialogContent className="pg-modal max-w-2xl overflow-hidden p-0 shadow-none">
          <div className="space-y-5 p-6">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-base font-semibold text-pg-text">
                Workspace Integration Key
              </DialogTitle>
              <DialogDescription className="max-w-xl text-xs leading-relaxed text-pg-muted">
                Use this private API key to connect external projects, export
                traces, or configure custom SDKs to stream live telemetry into
                PulseGuard.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-pg-subtle">
                Active Integration Key
              </span>
              <div className="flex flex-col gap-2 md:flex-row">
                <div className="relative flex-1 overflow-hidden rounded-lg bg-pg-group px-3 py-2">
                  <input
                    type={showModalApiKey ? "text" : "password"}
                    value={apiKey}
                    readOnly
                    className="w-full bg-transparent pr-16 font-mono text-xs text-pg-text outline-none"
                  />
                  <div className="absolute right-2 top-1.5 flex items-center gap-1.5 bg-pg-group pl-2">
                    <button
                      type="button"
                      onClick={() => setShowModalApiKey(!showModalApiKey)}
                      className="rounded-md p-1 text-pg-muted transition-colors hover:text-pg-text"
                    >
                      {showModalApiKey ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey);
                        setIsApiKeyCopied(true);
                        setTimeout(() => setIsApiKeyCopied(false), 2000);
                      }}
                      className="rounded-md p-1 text-pg-muted transition-colors hover:text-pg-text"
                    >
                      {isApiKeyCopied ? (
                        <HugeiconsIcon
                          icon={CheckIcon}
                          className="h-3.5 w-3.5"
                        />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-10 bg-pg-group px-3 text-xs font-sans text-pg-muted shadow-none hover:bg-pg-overlay hover:text-pg-text"
                  loading={isRegeneratingKey}
                  loadingText="Regenerating..."
                  onClick={() => {
                    setIsRegeneratingKey(true);
                    setTimeout(() => {
                      const chars = "0123456789abcdef";
                      let randomSuffix = "";
                      for (let i = 0; i < 32; i++) {
                        randomSuffix += chars[Math.floor(Math.random() * 16)];
                      }
                      setApiKey(`pg_live_${randomSuffix}`);
                      setIsRegeneratingKey(false);
                    }, 1000);
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Regenerate</span>
                </Button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-pg-subtle">
                  How to integrate in your project
                </span>
                <div className="flex w-fit rounded-lg bg-pg-group p-0.5 text-[9px] font-medium text-pg-muted">
                  {[
                    { id: "curl", label: "cURL" },
                    { id: "node", label: "Node.js" },
                    { id: "python", label: "Python" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() =>
                        setModalCodeTab(tab.id as "curl" | "node" | "python")
                      }
                      className={`rounded-md px-2 py-1 transition-colors ${
                        modalCodeTab === tab.id
                          ? "bg-pg-modal text-pg-text"
                          : "bg-transparent hover:text-pg-text"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="max-h-44 overflow-x-auto rounded-lg bg-pg-group p-3 font-mono text-[10.5px] text-pg-text whitespace-pre">
                {getCodeSnippet()}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
      />
    </>
  );
}
