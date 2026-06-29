"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
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
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { CustomAlertDialog } from "@/components/dashboard/shared/custom-alert-dialog";
import {
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Alert as DashboardAlert,
  NavItem,
  Project,
} from "@/types/dashboard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getGreeting, normalizePostgresString } from "@/lib/utils";
import { useTheme } from "next-themes";
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

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "sessions", label: "Sessions" },
  { id: "metrics", label: "Metrics" },
  { id: "errors", label: "Errors" },
  { id: "logs", label: "Logs" },
  { id: "traces", label: "Traces" },
  { id: "alerts", label: "Alerts" },
  { id: "integrations", label: "Integrations" },
  { id: "settings", label: "Settings" },
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
  const activeAlerts = alerts.filter((a) => a.status === "active").length;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Switcher & Integration Key Modal States
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeWorkspace?.id) {
      setPreviewWorkspaceId(activeWorkspace.id);
    }
  }, [activeWorkspace?.id]);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleBackToProjects = () => {
    router.push("/projects");
  };

  const currentUser = user && normalizePostgresString(user.avatar);
  const previewWorkspace =
    workspaces.find((workspace) => workspace.id === previewWorkspaceId) ??
    activeWorkspace;
  const previewProjects = previewWorkspaceId
    ? workspaceProjects[previewWorkspaceId] ?? []
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
      const response = await fetch(`${url}/api/projects?workspaceId=${workspaceId}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

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
    if (!workspaceProjects[workspaceId] && !workspaceProjectLoading[workspaceId]) {
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

  const handleOpenWorkspace = () => {
    if (!previewWorkspace) {
      return;
    }

    setActiveWorkspace(previewWorkspace);
    setIsOrgSwitcherOpen(false);
    router.push("/projects");
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-pg-border/60 bg-pg-modal/70 backdrop-blur-md text-pg-text select-none">
      {/* 1. Main Navbar Header */}
      <div className="pg-shell flex items-center justify-between px-6 py-2.5">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleBackToProjects}
          >
            {/* Logo */}
            <div className="scale-[0.8] origin-left pt-6">
              <Logo />
            </div>
            <span className="font-semibold text-sm tracking-tight text-pg-text font-sans">
              PulseGuard
            </span>
          </div>

          <div className="h-4 w-px bg-pg-border hidden sm:block" />

          {/* Org & Team Switcher */}
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
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-pg-surface transition-colors text-[11px] font-mono text-pg-muted hover:text-pg-text cursor-pointer focus:outline-none"
                id="org-switcher-button"
              >
                <Building className="w-3 h-3 text-pg-subtle" />
                <span>{activeWorkspace?.name || "Workspace"}</span>
                <span className="text-pg-faint">/</span>
                <span className="text-pg-text font-medium">
                  {project.name}
                </span>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  className="w-3.5 h-3.5 text-pg-faint"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[min(92vw,42rem)] bg-pg-modal border border-pg-border text-pg-text rounded-lg shadow-none p-0 z-50 text-left overflow-hidden"
              align="start"
              sideOffset={10}
            >
              <div className="grid md:grid-cols-[16rem_minmax(0,1fr)]">
                <div className="border-b border-pg-border/70 bg-pg-surface/25 md:border-r md:border-b-0">
                  <div className="border-b border-pg-border/50 px-4 py-3">
                    <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-pg-subtle">
                      Workspaces
                    </p>
                    <p className="mt-1 text-xs text-pg-muted">
                      Pick a workspace to browse its projects.
                    </p>
                  </div>
                  <div className="max-h-80 space-y-1 overflow-y-auto p-2">
                    {workspaces.map((ws) => {
                      const isActiveWorkspace = activeWorkspace?.id === ws.id;
                      const isPreviewWorkspace = previewWorkspaceId === ws.id;

                      return (
                        <button
                          key={ws.id}
                          onClick={() => handleWorkspacePreview(ws.id)}
                          className={`w-full rounded-lg border px-3 py-2.5 text-left transition-all ${
                            isPreviewWorkspace
                              ? "border-pg-border bg-pg-modal text-pg-text"
                              : "border-transparent text-pg-muted hover:border-pg-border hover:bg-pg-surface hover:text-pg-text"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {ws.name}
                              </p>
                              <p className="mt-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-pg-subtle">
                                {isActiveWorkspace ? "Current workspace" : "Workspace"}
                              </p>
                            </div>
                            {isActiveWorkspace && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-pg-border/60 p-2">
                    <button
                      onClick={() => {
                        setIsOrgSwitcherOpen(false);
                        setIsCreateWorkspaceModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg border border-pg-border bg-pg-modal px-3 py-2.5 text-left text-xs font-medium text-pg-text transition-colors hover:bg-pg-surface"
                    >
                      <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5" />
                      <span>Create Workspace</span>
                    </button>
                  </div>
                </div>

                <div className="flex min-h-[22rem] flex-col">
                  <div className="border-b border-pg-border/50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-pg-subtle">
                          Projects
                        </p>
                        <p className="mt-1 text-sm text-pg-text">
                          {previewWorkspace?.name || "Select a workspace"}
                        </p>
                      </div>
                      {previewWorkspace && (
                        <button
                          onClick={handleOpenWorkspace}
                          className="rounded-md border border-pg-border px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-pg-muted transition-colors hover:bg-pg-surface hover:text-pg-text"
                        >
                          Open workspace
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 p-2">
                    {previewProjectsLoading ? (
                      <div className="flex h-full min-h-56 items-center justify-center gap-2 text-xs text-pg-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading projects...</span>
                      </div>
                    ) : previewProjectsError ? (
                      <div className="flex h-full min-h-56 items-center justify-center p-3">
                        <div className="banner-error w-full">{previewProjectsError}</div>
                      </div>
                    ) : previewProjects.length > 0 ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        {previewProjects.map((workspaceProject) => {
                          const isCurrentProject = workspaceProject.id === project.id;

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
                              className={`rounded-lg border p-3 text-left transition-all ${
                                isCurrentProject
                                  ? "border-pg-border bg-pg-modal"
                                  : "border-pg-border bg-pg-surface/25 hover:bg-pg-surface"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-pg-text">
                                    {workspaceProject.name}
                                  </p>
                                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-pg-muted">
                                    {workspaceProject.description || "Open this project dashboard."}
                                  </p>
                                </div>
                                {isCurrentProject ? (
                                  <span className="rounded-full border border-pg-border bg-pg-surface px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em] text-pg-text">
                                    Live
                                  </span>
                                ) : (
                                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-pg-subtle" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex h-full min-h-56 flex-col items-center justify-center px-6 text-center">
                        <p className="text-sm text-pg-text">No projects in this workspace yet.</p>
                        <p className="mt-1 max-w-xs text-xs leading-relaxed text-pg-muted">
                          Open the workspace to create a project or move into another telemetry environment.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Side header items */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-pg-muted hover:text-pg-text cursor-pointer hidden lg:inline-block font-sans transition-colors">
            Discover
          </span>

          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center justify-center w-7.5 h-7.5 rounded border border-pg-border hover:bg-pg-surface text-pg-muted hover:text-pg-text transition-all cursor-pointer bg-transparent"
              title={`Switch theme`}
              id="dashboard-theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-orange-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>
          )}

          <button
            onClick={() => setIsCliModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 h-7.5 px-2.5 rounded border border-pg-border hover:bg-pg-surface text-pg-muted hover:text-pg-text transition-all text-xs font-mono cursor-pointer bg-transparent"
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span>Get integration key</span>
          </button>

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-7.5 h-7.5 rounded-full overflow-hidden border border-pg-border hover:border-pg-subtle cursor-pointer focus:outline-none transition-colors"
                id="user-menu-avatar"
              >
                {currentUser ? (
                  <img
                    src={currentUser}
                    alt="User"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-emerald-500 text-black font-mono">
                    {user?.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-52 bg-pg-modal border border-pg-border rounded-lg shadow-none p-1 z-50 text-left text-pg-text"
              align="end"
              forceMount
            >
              <div className="p-2 border-b border-pg-border/60">
                <p className="text-xs font-semibold text-pg-text truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] font-mono text-pg-subtle truncate mt-0.5">
                  {user?.email || ""}
                </p>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => {
                    setActiveTab("settings");
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-pg-muted hover:text-pg-text hover:bg-pg-surface transition-colors text-left cursor-pointer font-sans bg-transparent border-0"
                >
                  <HugeiconsIcon
                    icon={UserIcon}
                    className="w-3.5 h-3.5 text-pg-subtle"
                  />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("settings");
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-pg-muted hover:text-pg-text hover:bg-pg-surface transition-colors text-left cursor-pointer font-sans bg-transparent border-0"
                >
                  <HugeiconsIcon
                    icon={Settings01Icon}
                    className="w-3.5 h-3.5 text-pg-subtle"
                  />
                  <span>System Settings</span>
                </button>

                <div className="h-px bg-pg-border/85 my-1" />

                <CustomAlertDialog
                  trigger={
                    <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors text-left cursor-pointer font-mono bg-transparent border-0">
                      <HugeiconsIcon
                        icon={Logout01Icon}
                        className="w-3.5 h-3.5 text-red-500"
                      />
                      <span>Disarm Session</span>
                    </button>
                  }
                  title="Leaving Already?"
                  description="Are you sure you want to leave? This will log you out of your project dashboard."
                  onConfirm={logout}
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-pg-muted hover:text-pg-text shadow-none"
            onClick={toggleMobileMenu}
          >
            <HugeiconsIcon icon={Menu01Icon} className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 2. High-fidelity horizontal sub-navigation bar */}
      <div className="w-full border-t border-pg-border/60 bg-pg-modal/70 backdrop-blur-md sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-12 flex items-center justify-between overflow-x-auto scrollbar-none">
          <div className="flex items-center h-full text-xs font-mono">
            {/* Back to Projects button */}
            <BackToProjectButton onClick={handleBackToProjects} />

            {/* Navigation Tabs */}
            <div className="flex items-center h-full gap-1 sm:gap-2 text-xs font-sans font-medium">
              {navItems.map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`h-7 px-2.5 flex items-center justify-center transition-all cursor-pointer rounded text-[11px] shrink-0 border bg-transparent ${
                      isSelected
                        ? "border-pg-border text-pg-text bg-pg-surface font-semibold"
                        : "border-transparent text-pg-muted hover:text-pg-text hover:bg-pg-surface/40"
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status badge */}
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-pg-subtle shrink-0 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Telemetry Project Active</span>
          </div>
        </div>
      </div>

      {/* 3. Get Integration Key Modal */}
      <Dialog open={isCliModalOpen} onOpenChange={setIsCliModalOpen}>
        <DialogContent className="pg-modal max-w-2xl overflow-hidden p-0 shadow-none">
          <div className="space-y-5 p-6">
              <DialogHeader className="space-y-1 text-left">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.24em] text-emerald-400">
                  Access Authorization
                </span>
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
                <span className="block text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-pg-subtle">
                  Active Integration Key
                </span>
                <div className="flex flex-col gap-2 md:flex-row">
                  <div className="relative flex-1 overflow-hidden rounded-lg border border-pg-border bg-pg-surface px-3 py-2">
                    <input
                      type={showModalApiKey ? "text" : "password"}
                      value={apiKey}
                      readOnly
                      className="w-full bg-transparent pr-16 font-mono text-xs text-pg-text outline-none"
                    />
                    <div className="absolute right-2 top-1.5 flex items-center gap-1.5 bg-pg-surface pl-2">
                      <button
                        type="button"
                        onClick={() => setShowModalApiKey(!showModalApiKey)}
                        className="rounded-md p-1 text-pg-subtle transition-colors hover:text-pg-text"
                        title={showModalApiKey ? "Hide API key" : "Show API key"}
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
                        className="rounded-md p-1 text-pg-subtle transition-colors hover:text-pg-text"
                        title="Copy to clipboard"
                      >
                        {isApiKeyCopied ? (
                          <HugeiconsIcon
                            icon={CheckIcon}
                            className="h-3.5 w-3.5 text-emerald-400"
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
                    className="h-10 border-pg-border bg-pg-surface px-3 text-xs font-mono text-pg-muted shadow-none hover:bg-pg-overlay hover:text-pg-text"
                    loading={isRegeneratingKey}
                    loadingText="Regenerating..."
                    onClick={() => {
                      setIsRegeneratingKey(true);
                      setTimeout(() => {
                        const chars = "0123456789abcdef";
                        let randomSuffix = "";
                        for (let i = 0; i < 32; i++) {
                          randomSuffix +=
                            chars[Math.floor(Math.random() * 16)];
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

              <div className="space-y-3 border-t border-pg-border/60 pt-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="block text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-pg-subtle">
                    How to integrate in your project
                  </span>
                  <div className="flex w-fit rounded-lg border border-pg-border bg-pg-surface p-0.5 text-[9px] font-mono font-medium text-pg-muted">
                    {[
                      { id: "curl", label: "cURL" },
                      { id: "node", label: "Node.js" },
                      { id: "python", label: "Python" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setModalCodeTab(tab.id as any)}
                        className={`rounded-md px-2 py-1 transition-colors ${
                          modalCodeTab === tab.id
                            ? "bg-pg-border text-pg-text"
                            : "bg-transparent hover:text-pg-text"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-44 overflow-x-auto rounded-lg border border-pg-border bg-pg-surface p-3 font-mono text-[10.5px] text-pg-text whitespace-pre">
                  {getCodeSnippet()}
                </div>
              </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileMenu
            isOpen={mobileMenuOpen}
            onClose={toggleMobileMenu}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              toggleMobileMenu();
            }}
            onBackToProjects={handleBackToProjects}
          />
        )}
      </AnimatePresence>

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
      />
    </header>
  );
}

// BackToProjectButton
function BackToProjectButton({
  isMobile = false,
  onClick,
}: {
  isMobile?: boolean;
  onClick: () => void;
}) {
  const trigger = isMobile ? (
    <Button
      variant="ghost"
      className="w-full justify-start text-xs py-2 mb-2 text-pg-muted hover:bg-pg-surface hover:text-pg-text shadow-none cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
        <span>Back to Projects</span>
      </div>
    </Button>
  ) : (
    <button className="flex items-center gap-1.5 text-pg-muted hover:text-pg-text border-pg-border/80 mr-4 h-full pr-4 border-r transition-colors cursor-pointer shrink-0 bg-transparent">
      <ChevronRight className="w-3.5 h-3.5 rotate-180 text-pg-faint" />
      <span className="font-sans text-[11px]">Back to Projects</span>
    </button>
  );

  return (
    <CustomAlertDialog
      trigger={trigger}
      title="Done monitoring this project?"
      description="Are you sure? This will take you back to your project list."
      onConfirm={onClick}
    />
  );
}

// MobileMenu
function MobileMenu({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onBackToProjects,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: NavItem) => void;
  onBackToProjects: () => void;
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="md:hidden fixed inset-0 z-50 flex flex-col bg-pg-modal text-pg-text"
    >
      <div className="flex justify-between items-center p-4 border-b border-pg-border bg-pg-modal">
        <div className="flex items-center gap-2">
          <div className="scale-[0.6] origin-left pt-6">
            <Logo />
          </div>
          <span className="text-xs font-bold text-pg-text">PulseGuard</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="border border-pg-border text-pg-muted hover:text-pg-text hover:bg-pg-surface h-8 w-8 shadow-none"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col p-4 bg-pg-modal flex-grow overflow-y-auto">
        <div className="mb-2">
          <BackToProjectButton isMobile onClick={onBackToProjects} />
        </div>

        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`w-full justify-start text-xs py-2 mb-1.5 h-10 shadow-none ${
              activeTab === item.id
                ? "bg-pg-surface text-pg-text font-semibold"
                : "text-pg-muted hover:bg-pg-surface hover:text-pg-text"
            }`}
            onClick={() => onTabChange(item.id as NavItem)}
          >
            <div className="flex items-center gap-3">
              <span>{item.label}</span>
            </div>
          </Button>
        ))}
      </div>

      <div className="text-center text-[10px] bg-pg-modal border-t border-pg-border py-3 text-pg-subtle">
        © {new Date().getFullYear()} PulseGuard
      </div>
    </motion.div>
  );
}
