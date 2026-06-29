"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Briefcase,
  ChevronDown,
  Check,
  Sun,
  Moon,
  FolderPlus,
  ArrowRight,
  RefreshCw,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/app/(auth)/signin/page";
import { CustomAlertDialog } from "@/components/dashboard/shared/custom-alert-dialog";
import { CreateWorkspaceModal } from "@/components/dashboard/shared/create-workspace-modal";
import { Button } from "@/components/ui/button";

import type { Project } from "@/types/dashboard";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const url = process.env.NEXT_PUBLIC_API_URL;

// Local Theme Toggle Button
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2.5 rounded-full border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center hover:bg-zinc-900"
      title={`Switch theme`}
      id="projects-theme-toggle"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-orange-400" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-500" />
      )}
    </button>
  );
};

const CreateProjectDialog = ({
  isOpen,
  projectName,
  status,
  onClose,
}: {
  isOpen: boolean;
  projectName: string;
  status: "creating" | "complete";
  onClose: () => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pg-backdrop z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              layout
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                width: 360,
                height: status === "complete" ? 220 : 240,
              }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                layout: { duration: 0.35, ease: "easeInOut" },
              }}
              className="pg-modal rounded-xl overflow-hidden flex flex-col justify-center items-center p-6"
            >
              <AnimatePresence mode="wait">
                {status === "creating" && (
                  <motion.div
                    key="creating"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center text-center"
                  >
                    {/* Animated ring */}
                    <div className="mb-5 relative">
                      <svg
                        width="52"
                        height="52"
                        viewBox="0 0 80 80"
                        className="mx-auto"
                      >
                        <circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-pg-border"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          stroke="var(--color-orange-500)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray="220"
                          strokeDashoffset="220"
                          animate={{
                            strokeDashoffset: [220, 0, 220],
                            rotate: [0, 360],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      </svg>
                    </div>

                    <p className="text-[10px] font-mono tracking-[0.2em] text-pg-subtle uppercase mb-1.5">
                      Initializing
                    </p>
                    <motion.h3
                      className="text-sm font-medium text-pg-text mb-1"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Creating Project...
                    </motion.h3>
                    <p className="text-pg-muted text-xs">
                      Setting up &quot;{projectName}&quot;
                    </p>

                    {/* Dot loader */}
                    <div className="flex justify-center space-x-1 mt-5">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 bg-orange-500 rounded-full"
                          animate={{
                            opacity: [0.3, 1, 0.3],
                            scale: [0.8, 1.2, 0.8],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {status === "complete" && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 300 }}
                    className="flex flex-col items-center justify-center text-center w-full"
                  >
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                      <Check className="w-5 h-5 text-emerald-500" />
                    </div>

                    <p className="text-[10px] font-mono tracking-[0.2em] text-pg-subtle uppercase mb-1">
                      Success
                    </p>
                    <h3 className="text-sm font-medium text-pg-text mb-1">
                      Project Created
                    </h3>
                    <p className="text-pg-muted text-xs mb-4">
                      &quot;{projectName}&quot; is ready — redirecting...
                    </p>

                    <button
                      className="btn-ghost text-xs border border-pg-border px-3 py-1.5 rounded-[5px] hover:bg-pg-surface transition-colors"
                      onClick={onClose}
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function ProjectSelectionPage() {
  const router = useRouter();
  const {
    user,
    logout,
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    fetchWorkspaces,
  } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [projectActionTab, setProjectActionTab] = useState<"select" | "create">(
    "select",
  );
  const [error, setError] = useState<string>("");

  // Create project form states
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Loading indicator overlay states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creatingStatus, setCreatingStatus] = useState<"creating" | "complete">(
    "creating",
  );
  const [creatingProjectName, setCreatingProjectName] = useState("");
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] =
    useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isEnteringProject, setIsEnteringProject] = useState(false);

  const getAllProjects = async () => {
    try {
      setIsRefreshing(true);
      setError("");

      const fetchUrl = activeWorkspace
        ? `${url}/api/projects?workspaceId=${activeWorkspace.id}`
        : `${url}/api/projects`;

      const response = await fetch(fetchUrl, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        setError("Failed to fetch projects.");
        setProjects([]);
        return;
      }

      const fetchedProjects: Project[] = await response.json();
      const currentProjects = fetchedProjects ?? [];
      setProjects(currentProjects);

      // Select first project by default if available
      if (currentProjects.length > 0) {
        setSelectedProjectId(currentProjects[0].id);
      } else {
        setSelectedProjectId("");
      }
    } catch (err) {
      setError("Failed to fetch projects. Please try again.");
      console.error("Error fetching projects:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch workspaces on mount in case auth context hasn't resolved yet
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (activeWorkspace) {
      getAllProjects();
    }
  }, [activeWorkspace?.id]);

  const filteredProjects = projects.filter((project) => {
    const name = project.name?.toLowerCase() || "";
    const description = project.description?.toLowerCase() || "";
    const platform = project.platform?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return (
      name.includes(query) ||
      description.includes(query) ||
      platform.includes(query)
    );
  });
  const selectedProject =
    filteredProjects.find((project) => project.id === selectedProjectId) ??
    projects.find((project) => project.id === selectedProjectId) ??
    null;

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setError("Project name is required.");
      return;
    }

    if (!activeWorkspace?.id) {
      setError("Please select a workspace before creating a project.");
      return;
    }

    try {
      setError("");
      setIsCreatingProject(true);
      setCreatingProjectName(projectName);
      setCreatingStatus("creating");
      setShowCreateDialog(true);

      const newProjectData = {
        name: projectName.trim(),
        description: projectDescription.trim() || projectName.trim(),
        platform: "OpenTelemetry Project",
        workspaceId: activeWorkspace.id,
      };

      const response = await fetch(`${url}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newProjectData),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const msg = errBody?.error || `Server error (${response.status})`;
        setError(msg);
        setShowCreateDialog(false);
        setIsCreatingProject(false);
        return;
      }

      const newProject = await response.json();
      if (newProject.error) {
        setShowCreateDialog(false);
        setError(`${newProject.error}, use a different name`);
        setIsCreatingProject(false);
        return;
      }

      setCreatingStatus("complete");
      toast.success("Project created successfully!");

      // Auto redirect to new project dashboard after a small delay
      setTimeout(() => {
        setShowCreateDialog(false);
        router.push(`/projects/${newProject.slug}`);
      }, 1500);
    } catch (err) {
      setError("Failed to create project. Please try again.");
      setShowCreateDialog(false);
      toast.error("Failed to create project.");
      console.error("Error creating project:", err);
      setIsCreatingProject(false);
    }
  };

  const handleRefresh = () => {
    getAllProjects();
  };

  const handleEnterProject = () => {
    const selected = projects.find((p) => p.id === selectedProjectId);
    if (selected) {
      setIsEnteringProject(true);
      router.push(`/projects/${selected.slug}`);
    }
  };

  return (
    <div className="pg-page pg-grid min-h-screen py-10 relative overflow-hidden select-none text-pg-text">
      <div className="absolute right-4 top-4 z-50 flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-full border border-pg-border bg-pg-overlay px-3 py-2 text-xs font-semibold text-pg-muted transition-all hover:bg-pg-surface hover:text-pg-text focus:outline-none">
              <Briefcase className="h-3.5 w-3.5 text-pg-subtle" />
              <span className="max-w-[140px] truncate">
                {activeWorkspace?.name || "Select Workspace"}
              </span>
              <ChevronDown className="h-3 w-3 text-pg-subtle" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-lg border border-pg-border bg-pg-modal p-1.5 text-pg-text shadow-none"
            align="end"
          >
            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-mono uppercase tracking-[0.18em] text-pg-subtle">
              Switch Workspace
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-pg-border/60" />
            <div className="max-h-56 space-y-1 overflow-y-auto p-1">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => setActiveWorkspace(ws)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all ${
                    activeWorkspace?.id === ws.id
                      ? "bg-pg-surface text-pg-text"
                      : "text-pg-muted hover:bg-pg-surface hover:text-pg-text"
                  }`}
                >
                  <span className="truncate pr-2">{ws.name}</span>
                  {activeWorkspace?.id === ws.id && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
            <DropdownMenuSeparator className="bg-pg-border/60" />
            <div className="p-1">
              <button
                onClick={() => setIsCreateWorkspaceModalOpen(true)}
                className="flex w-full items-center gap-1.5 rounded-xl border border-pg-border bg-pg-surface px-3 py-2 text-left text-xs font-medium text-pg-text transition-all hover:bg-pg-overlay"
              >
                <HugeiconsIcon icon={PlusSignIcon} className="h-3.5 w-3.5" />
                Create Workspace
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        <CustomAlertDialog
          trigger={
            <button
              className="flex items-center justify-center rounded-full border border-pg-border bg-pg-overlay p-2.5 text-pg-muted transition-all hover:bg-pg-surface hover:text-pg-text"
              title="Sign out"
            >
              <LogOut className="h-4 w-4 text-red-500" />
            </button>
          }
          title="Sign out"
          description="Are you sure you want to sign out of your account?"
          onConfirm={logout}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="pg-shell relative px-6 pb-20 pt-10 md:pt-14"
        id="project-selection-container"
      >
        <div className="mb-6 flex items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="w-fit">
              <Logo />
            </div>
            <div className="max-w-2xl">
              <h1 className="text-lg font-bold text-pg-text mb-0.5">
                Projects
              </h1>
              <p className="text-xs text-pg-muted max-w-xl">
                Select an existing PulseGuard workspace project or initialize a
                new observability surface.
                {user?.name ? ` Signed in as ${user.name}.` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-xl border border-pg-border bg-pg-surface/30 p-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-pg-subtle">
              Active workspace
            </p>
            <p className="mt-3 text-lg text-pg-text">
              {activeWorkspace?.name || "No workspace selected"}
            </p>
          </div>
          <div className="rounded-xl border border-pg-border bg-pg-surface/30 p-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-pg-subtle">
              Visible projects
            </p>
            <p className="mt-3 text-lg text-pg-text">{filteredProjects.length}</p>
          </div>
          <div className="rounded-xl border border-pg-border bg-pg-surface/30 p-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-pg-subtle">
              Current mode
            </p>
            <p className="mt-3 text-lg text-pg-text">
              {projectActionTab === "select" ? "Browse projects" : "Create project"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_22rem]">
          <section className="rounded-xl border border-pg-border bg-pg-modal">
            <div className="border-b border-pg-border/70 px-5 py-5 md:px-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-pg-text">
                    Projects
                  </h2>
                  <p className="mt-1 text-xs text-pg-muted">
                    Browse or create projects in the active workspace.
                  </p>
                </div>

                <div className="flex rounded-lg border border-pg-border bg-pg-surface/40 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProjectActionTab("select");
                      setError("");
                    }}
                    className={`rounded-md px-4 py-2 text-xs font-medium transition-all ${
                      projectActionTab === "select"
                        ? "bg-pg-modal text-pg-text"
                        : "text-pg-muted hover:text-pg-text"
                    }`}
                  >
                    Select Active Project
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProjectActionTab("create");
                      setError("");
                    }}
                    className={`rounded-md px-4 py-2 text-xs font-medium transition-all ${
                      projectActionTab === "create"
                        ? "bg-pg-modal text-pg-text"
                        : "text-pg-muted hover:text-pg-text"
                    }`}
                  >
                    Create New Project
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 md:p-6">
              {error && <div className="banner-error">{error}</div>}

              <AnimatePresence mode="wait">
                {projectActionTab === "select" ? (
                  <motion.div
                    key="tab-select"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    <div className="flex gap-2">
                      <input
                        placeholder="Search projects, descriptions, platforms..."
                        className="h-10 w-full rounded-xl border border-pg-border bg-pg-surface px-3 text-sm text-pg-text outline-none transition-colors placeholder:text-pg-subtle focus:border-zinc-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-10 border-pg-border bg-pg-surface p-0 text-pg-muted shadow-none hover:bg-pg-overlay hover:text-pg-text"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        aria-label="Refresh projects"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                        />
                      </Button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {filteredProjects.length > 0 ? (
                        filteredProjects.map((proj) => {
                          const isSelected = selectedProjectId === proj.id;

                          return (
                            <button
                              key={proj.id}
                              type="button"
                              onClick={() => setSelectedProjectId(proj.id)}
                              className={`rounded-lg border p-4 text-left transition-all ${
                                isSelected
                                  ? "border-pg-border bg-pg-modal"
                                  : "border-pg-border bg-pg-surface/25 hover:bg-pg-surface/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h4 className="truncate text-sm font-semibold text-pg-text">
                                    {proj.name}
                                  </h4>
                                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-pg-muted">
                                    {proj.description || "Telemetry workspace ready for instrumentation."}
                                  </p>
                                </div>
                                {isSelected && (
                                  <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                                )}
                              </div>
                              <div className="mt-4 text-[10px] font-mono uppercase tracking-[0.18em] text-pg-subtle">
                                {proj.platform || "OpenTelemetry Project"}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="col-span-full rounded-lg border border-dashed border-pg-border bg-pg-surface/20 px-6 py-12 text-center">
                          <p className="text-sm text-pg-text">No projects found.</p>
                          <p className="mt-1 text-xs text-pg-muted">
                            Create a new project to start ingesting telemetry.
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      className="btn-primary mt-1 w-full"
                      onClick={handleEnterProject}
                      disabled={!selectedProjectId}
                      loading={isEnteringProject}
                      loadingText="Opening telemetry suite..."
                    >
                      <span>Enter telemetry suite</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="tab-create"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 text-left"
                  >
                    <div>
                      <label className="form-label" htmlFor="input-project-name">
                        Project Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pg-subtle">
                          <FolderPlus className="h-4 w-4" />
                        </span>
                        <input
                          id="input-project-name"
                          type="text"
                          placeholder="e.g. Auth Telemetry System"
                          value={projectName}
                          onChange={(e) => {
                            setProjectName(e.target.value);
                            setError("");
                          }}
                          className="input-field pl-9"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label" htmlFor="input-project-desc">
                        Project Description
                        <span className="ml-1 text-[10px] font-normal text-pg-subtle">
                          (defaults to project name if left empty)
                        </span>
                      </label>
                      <textarea
                        id="input-project-desc"
                        placeholder="Describe your observability project and microservices targets..."
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        rows={4}
                        className="w-full resize-none rounded-lg border border-pg-border bg-pg-surface px-3 py-3 text-[13px] text-pg-text transition-colors duration-200 focus:border-zinc-500 focus:outline-none"
                      />
                    </div>

                    <Button
                      type="button"
                      className="btn-primary mt-2 w-full"
                      onClick={handleCreateProject}
                      loading={isCreatingProject}
                      loadingText="Initializing project..."
                    >
                      <span>Initialize project</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-pg-border bg-pg-surface/25 p-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-pg-subtle">
                Active context
              </p>
              <p className="mt-3 text-lg text-pg-text">
                {selectedProject?.name || activeWorkspace?.name || "Choose a project"}
              </p>
              <p className="mt-2 text-sm leading-6 text-pg-muted">
                {selectedProject?.description ||
                  "Use the left panel to choose a project or create a new one inside the current workspace."}
              </p>
              <div className="mt-4 rounded-lg border border-pg-border bg-pg-modal p-4">
                <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-pg-subtle">
                  Workspace
                </p>
                <p className="mt-2 text-sm text-pg-text">
                  {activeWorkspace?.name || "No workspace selected"}
                </p>
                <p className="mt-1 text-xs text-pg-muted">
                  {projects.length} project{projects.length === 1 ? "" : "s"} available in this workspace.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-pg-border bg-pg-surface/25 p-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-pg-subtle">
                Recommended flow
              </p>
              <ol className="mt-3 space-y-3 text-sm text-pg-muted">
                <li>1. Select a workspace from the top-right switcher.</li>
                <li>2. Pick a project with matching telemetry scope.</li>
                <li>3. Enter the suite and continue setup from the project dashboard.</li>
              </ol>
            </div>
          </aside>
        </div>
      </motion.div>

      {/* Concentric Loader Overlay dialog */}
      <CreateProjectDialog
        isOpen={showCreateDialog}
        projectName={creatingProjectName}
        status={creatingStatus}
        onClose={() => {
          setShowCreateDialog(false);
          setIsCreatingProject(false);
        }}
      />

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
      />
    </div>
  );
}
