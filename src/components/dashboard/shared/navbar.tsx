"use client";

import { useState, useEffect, useCallback, type ComponentType } from "react";
import { HugeiconsIcon } from "@/components/phosphor-icons";
import {
  ArrowDown01Icon,
  Cancel01Icon,
  PlusSignIcon,
  HelpCircleIcon,
  Logout01Icon,
  Menu01Icon,
  Settings01Icon,
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
  Copy,
  Loader2,
  UserIcon,
} from "@/components/phosphor-icons";
import type { PulseIconProps } from "@/components/phosphor-icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
import { createProject } from "@/lib/api/projects-api";
import { setLastProjectSlug } from "@/lib/last-project";
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
  { id: "integrations", label: "Integrations", icon: PlugsIcon },
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
  const [isApiKeyCopied, setIsApiKeyCopied] = useState(false);
  const [modalCodeTab, setModalCodeTab] = useState<"curl" | "node" | "python">(
    "curl",
  );
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] =
    useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
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
    const workspaceId = project.workspaceId || activeWorkspace?.id;
    if (!workspaceId) return;
    setPreviewWorkspaceId(workspaceId);
    const workspace = workspaces.find((item) => item.id === workspaceId);
    if (workspace && activeWorkspace?.id !== workspace.id) {
      setActiveWorkspace(workspace);
    }
  }, [project.workspaceId, project.id, workspaces, activeWorkspace?.id, setActiveWorkspace]);

  const handleBackToProjects = () => {
    setActiveTab("overview");
  };

  const currentUser = user && normalizePostgresString(user.avatar);

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
    setLastProjectSlug(slug);
    setIsOrgSwitcherOpen(false);
    setIsProjectNavigationPending(true);
    router.push(`/projects/${slug}`);
  };

  const handleCreateProject = async () => {
    const name = newProjectName.trim();
    if (!name) {
      toast.error("Project name is required");
      return;
    }
    const workspaceId = previewWorkspaceId || activeWorkspace?.id;
    if (!workspaceId) {
      toast.error("Select a workspace first");
      return;
    }
    setCreatingProject(true);
    try {
      const created = await createProject({
        name,
        description: name,
        platform: "OpenTelemetry Project",
        workspaceId,
      });
      if (created?.error) {
        toast.error(created.error);
        return;
      }
      toast.success("Project created");
      setIsCreateProjectOpen(false);
      setIsOrgSwitcherOpen(false);
      setNewProjectName("");
      setLastProjectSlug(created.slug);
      setIsProjectNavigationPending(true);
      router.push(`/projects/${created.slug}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create project");
    } finally {
      setCreatingProject(false);
    }
  };

  const getCodeSnippet = () => {
    switch (modalCodeTab) {
      case "node":
        return `const res = await fetch("/api/telemetry/log", {\n  method: "POST",\n  credentials: "include",\n  headers: {\n    "Content-Type": "application/json",\n    "x-project-id": "${project.id}",\n    "X-CSRF-Token": "pulseguard-web"\n  },\n  body: JSON.stringify({\n    message: "Server started",\n    level: "info"\n  })\n});`;
      case "python":
        return `import requests\n\nrequests.post(\n    "https://your-app/api/telemetry/log",\n    headers={"x-project-id": "${project.id}"},\n    json={"message": "Server started", "level": "info"},\n)`;
      default:
        return `curl -X POST /api/telemetry/log \\\n  -H "x-project-id: ${project.id}" \\\n  -H "Content-Type: application/json" \\\n  -H "X-CSRF-Token: pulseguard-web" \\\n  -d '{"message": "Ping check", "level": "info"}'`;
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
            className="w-max min-w-[12rem] bg-pg-modal text-pg-text rounded-lg p-1 z-50 text-left overflow-visible"
            align="start"
            side="right"
            sideOffset={10}
          >
            <p className="px-2.5 py-2 text-[11px] font-medium text-pg-subtle">
              Workspaces
            </p>
            {workspaces.map((workspace) => {
              const projects = workspaceProjects[workspace.id] ?? [];
              const loading = workspaceProjectLoading[workspace.id];
              const errorMsg = workspaceProjectErrors[workspace.id];
              const list =
                workspace.id === project.workspaceId &&
                !projects.some((item) => item.id === project.id)
                  ? [project, ...projects]
                  : projects;

              return (
                <DropdownMenuSub key={workspace.id}>
                  <DropdownMenuSubTrigger
                    className={`w-full gap-2 rounded-lg px-2.5 py-2 text-xs ${
                      previewWorkspaceId === workspace.id
                        ? "bg-pg-group text-pg-text"
                        : "text-pg-muted"
                    }`}
                    onPointerEnter={() => handleWorkspacePreview(workspace.id)}
                    onFocus={() => handleWorkspacePreview(workspace.id)}
                  >
                    <Building className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {workspace.name}
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent
                    className="w-56 p-1"
                    sideOffset={8}
                  >
                    <p className="px-2.5 py-2 text-[11px] font-medium text-pg-subtle">
                      Projects
                    </p>
                    {loading ? (
                      <div className="flex items-center gap-2 px-2.5 py-3 text-[11px] text-pg-muted">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Loading projects...
                      </div>
                    ) : errorMsg ? (
                      <p className="px-2.5 py-2 text-[11px] text-red-400">
                        {errorMsg}
                      </p>
                    ) : list.length > 0 ? (
                      list.map((workspaceProject) => {
                        const isCurrentProject =
                          workspaceProject.id === project.id;
                        return (
                          <button
                            key={workspaceProject.id}
                            type="button"
                            onClick={() =>
                              handleProjectSelect(
                                workspace.id,
                                workspaceProject.slug,
                              )
                            }
                            disabled={isProjectNavigationPending}
                            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs ${
                              isCurrentProject
                                ? "bg-pg-surface text-pg-text"
                                : "bg-transparent text-pg-muted hover:bg-pg-group hover:text-pg-text"
                            }`}
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {workspaceProject.name}
                            </span>
                            {isCurrentProject ? (
                              <HugeiconsIcon
                                icon={CheckIcon}
                                className="h-3.5 w-3.5"
                              />
                            ) : null}
                          </button>
                        );
                      })
                    ) : (
                      <p className="px-2.5 py-2 text-[11px] text-pg-muted">
                        No projects in this workspace yet.
                      </p>
                    )}
                    <DropdownMenuSeparator className="bg-pg-border" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewWorkspaceId(workspace.id);
                        setIsOrgSwitcherOpen(false);
                        setIsCreateProjectOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg bg-transparent px-2.5 py-2 text-left text-xs font-medium text-pg-text transition-colors hover:bg-pg-group"
                    >
                      <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5" />
                      Create project
                    </button>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            })}
            <DropdownMenuSeparator className="bg-pg-border" />
            <button
              type="button"
              onClick={() => {
                setIsOrgSwitcherOpen(false);
                setIsCreateWorkspaceModalOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg bg-transparent px-2.5 py-2 text-left text-xs text-pg-muted transition-colors hover:bg-pg-group hover:text-pg-text"
            >
              <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5" />
              Create workspace
            </button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex-1 overflow-hidden px-2 pb-3">
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

      <div className="mt-auto px-3 pb-4 space-y-1">
        <a
          href="/documentation"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-pg-muted no-underline transition-colors hover:bg-pg-group hover:text-pg-text"
        >
          <HugeiconsIcon icon={HelpCircleIcon} className="h-4 w-4" />
          Documentation
        </a>

        <button
          onClick={() => setIsCliModalOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-pg-muted transition-colors hover:bg-pg-group hover:text-pg-text bg-transparent"
        >
          <Key className="h-4 w-4 text-pg-muted" />
          Project ID
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
            <div className="flex items-center gap-2 p-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pg-group text-pg-muted">
                <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-pg-text">
                  {user?.name || "User"}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-pg-subtle">
                  {user?.email || ""}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-pg-border" />
            <div className="p-1 space-y-0.5">
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
      <aside className="hidden md:flex z-40 h-full w-[220px] shrink-0 flex-col overflow-hidden bg-pg-modal text-pg-text select-none">
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

      <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Create project
            </DialogTitle>
            <DialogDescription className="text-xs">
              Adds a project to{" "}
              {workspaces.find((item) => item.id === previewWorkspaceId)?.name ||
                activeWorkspace?.name ||
                "this workspace"}
              .
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newProjectName}
            onChange={(event) => setNewProjectName(event.target.value)}
            placeholder="Project name"
            className="h-9 text-sm"
            onKeyDown={(event) => {
              if (event.key === "Enter") void handleCreateProject();
            }}
          />
          <div className="flex justify-end">
            <Button
              className="btn-primary h-8 text-xs"
              onClick={() => void handleCreateProject()}
              loading={creatingProject}
              loadingText="Creating..."
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCliModalOpen}
        onOpenChange={setIsCliModalOpen}
      >
        <DialogContent
          className="max-h-[85vh] overflow-hidden p-0 shadow-none sm:max-w-lg"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div className="max-h-[85vh] space-y-5 overflow-y-auto p-6">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-base font-semibold text-pg-text">
                Project ID
              </DialogTitle>
              <DialogDescription className="max-w-xl text-xs leading-relaxed text-pg-muted">
                Pass this ID to the SDK so errors, sessions, logs, and traces
                land in this project. This dashboard is already connected when
                the app&apos;s projectId matches this value. It is not a Slack
                or Google OAuth key — those are outbound alert destinations.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <span className="block text-[11px] font-medium text-pg-subtle">
                Project ID
              </span>
              <div className="flex items-center gap-1 rounded-lg bg-pg-group px-3 py-2">
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-pg-text">
                  {project.id}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(project.id);
                    setIsApiKeyCopied(true);
                    setTimeout(() => setIsApiKeyCopied(false), 2000);
                  }}
                  className="rounded-md bg-transparent p-1 text-pg-muted transition-colors hover:text-pg-text"
                  aria-label="Copy project ID"
                >
                  {isApiKeyCopied ? (
                    <HugeiconsIcon icon={CheckIcon} className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="block text-[11px] font-medium text-pg-subtle">
                  Send a log from your app
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
              <pre className="pg-code max-h-48 overflow-auto rounded-lg p-3 font-mono text-[11px] leading-relaxed text-zinc-200 whitespace-pre-wrap break-all">
                {getCodeSnippet()}
              </pre>
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
