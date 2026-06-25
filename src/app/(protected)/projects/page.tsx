"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Briefcase,
  ChevronDown,
  Check,
  Plus,
  Sun,
  Moon,
  FolderPlus,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { Logo } from "@/app/(auth)/signin/page";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CustomAlertDialog } from "@/components/dashboard/shared/custom-alert-dialog";
import { CreateWorkspaceModal } from "@/components/dashboard/shared/create-workspace-modal";

import type { Project } from "@/types/dashboard";
import { normalizePostgresString } from "@/lib/utils";

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
      {theme === "dark" ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
    </button>
  );
};

// Concentric loader dialog matching premium Traces animations
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              layout
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                width: 380,
                height: status === "complete" ? 240 : 260,
              }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                layout: { duration: 0.4, ease: "easeInOut" },
              }}
              className="pg-panel border border-zinc-800 bg-[#0a0a0a] rounded-xl shadow-lg overflow-hidden text-white flex flex-col justify-center items-center p-6"
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
                    <div className="mb-4 relative">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 80 80"
                        className="mx-auto"
                      >
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          stroke="var(--color-orange-500)"
                          strokeWidth="2.5"
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

                    <motion.h3
                      className="text-sm font-semibold text-white mb-1 animate-pulse"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Creating Project...
                    </motion.h3>

                    <p className="text-zinc-500 text-xs">
                      Setting up &quot;{projectName}&quot;
                    </p>

                    <div className="flex justify-center space-x-1 mt-4">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-orange-500 rounded-full"
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 300 }}
                    className="flex flex-col items-center justify-center text-center w-full"
                  >
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3.5 border border-emerald-500/20">
                      <Check className="w-7 h-7 text-emerald-400" />
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1">
                      Project Created
                    </h3>

                    <p className="text-zinc-500 text-xs">
                      &quot;{projectName}&quot; is ready!
                    </p>

                    <Button
                      variant="ghost"
                      className="mt-4 border-zinc-800 text-zinc-300 hover:bg-zinc-900 text-xs h-8 shadow-none font-semibold cursor-pointer"
                      onClick={onClose}
                    >
                      Close
                    </Button>
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

// Project creation template removal placeholder

export default function ProjectSelectionPage() {
  const router = useRouter();
  const { user, logout, workspaces, activeWorkspace, setActiveWorkspace } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [projectActionTab, setProjectActionTab] = useState<"select" | "create">("select");
  const [error, setError] = useState<string>("");

  // Create project form states
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Loading indicator overlay states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creatingStatus, setCreatingStatus] = useState<"creating" | "complete">("creating");
  const [creatingProjectName, setCreatingProjectName] = useState("");
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);

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

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      setError("");
      setCreatingProjectName(projectName);
      setCreatingStatus("creating");
      setShowCreateDialog(true);

      const newProjectData = {
        name: projectName.trim(),
        description: projectDescription.trim(),
        platform: "OpenTelemetry Project",
        workspaceId: activeWorkspace?.id,
      };

      const response = await fetch(`${url}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newProjectData),
      });

      if (!response.ok) {
        setError("Failed to create project.");
        setShowCreateDialog(false);
        return;
      }

      const newProject = await response.json();
      if (newProject.error) {
        setShowCreateDialog(false);
        setError(`${newProject.error}, use a different name`);
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
    }
  };

  const handleRefresh = () => {
    getAllProjects();
  };

  const handleEnterProject = () => {
    const selected = projects.find((p) => p.id === selectedProjectId);
    if (selected) {
      router.push(`/projects/${selected.slug}`);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center text-white relative py-12 px-4 select-none">
      
      {/* Floating Toolbar top right */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-zinc-950/40 border border-zinc-800 text-zinc-400 hover:text-white transition-all rounded-full text-xs font-semibold cursor-pointer focus:outline-none">
              <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
              <span className="max-w-[120px] truncate">{activeWorkspace?.name || "Select Workspace"}</span>
              <ChevronDown className="h-3 w-3 text-zinc-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-[#121212] border border-zinc-800 text-white rounded-lg shadow-sm"
            align="end"
          >
            <DropdownMenuLabel className="text-[10px] font-mono uppercase text-zinc-500 px-3 py-1.5">
              Switch Workspace
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800/60" />
            <div className="p-1 max-h-48 overflow-y-auto">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => setActiveWorkspace(ws)}
                  className={`w-full text-left rounded px-2.5 py-1.5 text-xs transition-all flex items-center justify-between cursor-pointer ${
                    activeWorkspace?.id === ws.id
                      ? "bg-orange-500/10 text-orange-400 font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                  }`}
                >
                  <span className="truncate pr-2">{ws.name}</span>
                  {activeWorkspace?.id === ws.id && (
                    <Check className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <DropdownMenuSeparator className="bg-zinc-800/60" />
            <div className="p-1">
              <button
                onClick={() => setIsCreateWorkspaceModalOpen(true)}
                className="w-full text-left rounded px-2.5 py-1.5 text-xs text-orange-400 hover:bg-orange-500/10 transition-all flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Workspace
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        <CustomAlertDialog
          trigger={
            <button
              className="p-2.5 rounded-full border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center hover:bg-zinc-900"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 text-red-500" />
            </button>
          }
          title="Sign out"
          description="Are you sure you want to sign out of your account?"
          onConfirm={logout}
        />
      </div>

      {/* Centered selector card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[374px] mx-auto px-1"
        id="project-selection-container"
      >
        <Logo />

        {/* Card Heading */}
        <div className="text-left mb-6">
          <h2 className="text-2xl font-normal tracking-[-0.058em] text-white font-sans">
            Projects
          </h2>
          <p className="mt-2 text-sm text-zinc-400 font-sans">
            Select an existing PulseGuard telemetry workspace or instantiate a new project.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs text-left">
            {error}
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex rounded-md bg-zinc-950 p-1 border border-zinc-900 mb-6">
          <button
            type="button"
            onClick={() => {
              setProjectActionTab("select");
              setError("");
            }}
            className={`flex-1 text-center py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
              projectActionTab === "select" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
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
            className={`flex-1 text-center py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
              projectActionTab === "create" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Create New Project
          </button>
        </div>

        <AnimatePresence mode="wait">
          {projectActionTab === "select" ? (
            <motion.div
              key="tab-select"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Search & Refresh Inline Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    placeholder="Search projects..."
                    className="pl-3 pr-8 w-full bg-zinc-900/60 border border-zinc-800 text-white text-xs h-8.5 rounded-lg focus:outline-none focus:border-zinc-500 placeholder:text-zinc-600 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center justify-center bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white h-8.5 w-8.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="Refresh Projects"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Scrollable Project Cards list */}
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 text-left">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((proj) => {
                    const isSelected = selectedProjectId === proj.id;
                    return (
                      <div
                        key={proj.id}
                        onClick={() => setSelectedProjectId(proj.id)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-all select-none ${
                          isSelected
                            ? "border-white bg-zinc-900/50 shadow-md scale-[1.01]"
                            : "border-zinc-800 bg-zinc-950/20 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white truncate max-w-[210px]">
                            {proj.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {proj.platform || "OTEL"}
                          </span>
                        </div>
                        {proj.description && (
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed font-light">
                            {proj.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                            Active project
                          </span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-zinc-500 text-center py-6">
                    No projects found. Create a new project to get started.
                  </p>
                )}
              </div>

              {/* Proceed Action Button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={handleEnterProject}
                disabled={!selectedProjectId}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-[5px] font-medium relative transition-all duration-150 ease-in-out active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 bg-btn-primary h-9 px-4 text-sm gap-2 w-full cursor-pointer group mt-2"
              >
                <motion.span
                  className="flex items-center justify-center gap-1.5"
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <span>Enter telemetry suite</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="tab-create"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 text-left"
            >
              {/* Project Name Input */}
              <div>
                <label
                  className="block text-zinc-400 text-xs font-medium mb-1.5 select-none"
                  htmlFor="input-project-name"
                >
                  Project Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                    <FolderPlus className="w-4 h-4" />
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
                    className="w-full h-8.5 pl-9 pr-3 rounded-lg bg-zinc-900/60 border border-zinc-800 focus:border-zinc-500 focus:outline-none text-white text-[13px] transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Project Description */}
              <div>
                <label
                  className="block text-zinc-400 text-xs font-medium mb-1.5 select-none"
                  htmlFor="input-project-desc"
                >
                  Project Description{" "}
                  <span className="text-zinc-600 text-[10px] font-normal">
                    (Optional)
                  </span>
                </label>
                <textarea
                  id="input-project-desc"
                  placeholder="Describe your observability project and microservices targets..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={2}
                  className="w-full py-1.5 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800 focus:border-zinc-500 focus:outline-none text-white text-[13px] transition-colors duration-200 resize-none"
                />
              </div>

              {/* Initialize Button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={handleCreateProject}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-[5px] font-medium relative transition-all duration-150 ease-in-out active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 bg-btn-primary h-9 px-4 text-sm gap-2 w-full cursor-pointer group mt-2"
              >
                <motion.span
                  className="flex items-center justify-center gap-1.5"
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <span>Initialize project</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Concentric Loader Overlay dialog */}
      <CreateProjectDialog
        isOpen={showCreateDialog}
        projectName={creatingProjectName}
        status={creatingStatus}
        onClose={() => setShowCreateDialog(false)}
      />

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
      />
    </div>
  );
}
