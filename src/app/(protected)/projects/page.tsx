"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, CheckmarkCircle01Icon, Layers01Icon, LayoutGridIcon, ListViewIcon, Loading02Icon, Logout01Icon, Refresh01Icon, Settings01Icon, UserIcon } from "@hugeicons/core-free-icons";
import Image from "next/image";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProjectCard from "./components/project-card";
import ProjectForm from "./components/project-form";
import CustomErrorMessage from "@/components/dashboard/shared/error-message";
import { CustomAlertDialog } from "@/components/dashboard/shared/custom-alert-dialog";

import type { Project } from "@/types/dashboard";
import type { CreateProjectDialogProps } from "@/types/project";
import { normalizePostgresString } from "@/lib/utils";

const url = process.env.NEXT_PUBLIC_API_URL;

const CreateProjectDialog = ({
  isOpen,
  onClose,
  projectName,
  status,
}: CreateProjectDialogProps) => {
  const [step, setStep] = useState<"creating" | "complete">(status);

  useEffect(() => {
    if (!isOpen) {
      setStep("creating");
    } else if (status === "complete") {
      setStep("complete");
    }
  }, [isOpen, status]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Dialog Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              layout
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                width: 380,
                height: step === "complete" ? 240 : 260,
              }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                layout: { duration: 0.4, ease: "easeInOut" },
              }}
              className="pg-panel border border-[#dfdfda] rounded-xl shadow-lg overflow-hidden text-foreground"
            >
              <AnimatePresence mode="wait">
                {step === "creating" && (
                  <motion.div
                    key="creating"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 h-full flex flex-col items-center justify-center"
                  >
                    {/* Animated SVG */}
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
                          stroke="var(--primary)"
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
                      className="text-sm font-semibold text-foreground mb-1 animate-pulse"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Creating Project...
                    </motion.h3>

                    <p className="text-muted-foreground text-xs">
                      Setting up &quot;{projectName}&quot;
                    </p>

                    <div className="flex justify-center space-x-1 mt-4">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-primary rounded-full"
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

                {step === "complete" && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 300 }}
                    className="p-6 h-full flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3.5 border border-emerald-500/20">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm font-bold text-foreground mb-1"
                    >
                      Project Created
                    </motion.h3>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-muted-foreground text-xs"
                    >
                      &quot;{projectName}&quot; is ready!
                    </motion.p>

                    <Button
                      variant="ghost"
                      className="mt-4 border-border text-foreground hover:bg-muted text-xs h-8 shadow-none font-semibold cursor-pointer"
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

export default function ProjectSelectionPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const curentUser = user && normalizePostgresString(user.avatar);

  const [error, setError] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [projectCreated, setProjectCreated] = useState<boolean>(false);
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [creatingProjectName, setCreatingProjectName] = useState<string>("");

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  // Fetch all projects
  const getAllProjects = async () => {
    try {
      setIsRefreshing(true);
      setError("");

      const response = await fetch(`${url}/api/projects`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        setError("Failed to fetch projects.");
        setProjects([]);
        return;
      }

      const fetchedProjects: Project[] = await response.json();
      setProjects(fetchedProjects ?? []);
    } catch (err) {
      setError("Failed to fetch projects. Please try again.");
      console.error("Error fetching projects:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    getAllProjects();
  }, []);

  // Filter projects based on search query
  const filteredProjects =
    projects.length > 0
      ? projects.filter((project) => {
          const name = project.name?.toLowerCase() || "";
          const description = project.description?.toLowerCase() || "";
          const platform = project.platform?.toLowerCase() || "";
          const query = searchQuery.toLowerCase();

          return (
            name.includes(query) ||
            description.includes(query) ||
            platform.includes(query)
          );
        })
      : [];

  // Create new project
  const handleCreateProject = async (projectData: {
    name: string;
    description: string;
    platform: string;
  }) => {
    try {
      setIsLoading(true);
      setError("");
      setCreatingProjectName(projectData.name);
      setShowForm(false);
      setShowCreateDialog(true);

      const newProjectData = {
        name: projectData.name,
        description: projectData.description,
      };

      const response = await fetch(`${url}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newProjectData),
      });

      if (!response.ok) {
        setError("Failed to create project.");
        setIsLoading(false);
        setShowCreateDialog(false);
      }

      const newProject = await response.json();
      if (newProject.error) {
        setShowCreateDialog(false);
        setError(`${newProject.error}, use a different name`);
        return;
      }

      if (newProject && !newProject.error) {
        setTimeout(() => {
          setProjectCreated(true);
        }, 3000);

        setTimeout(() => {
          setShowCreateDialog(false);
          toast.success("Project created successfully!");

          getAllProjects();
          setProjectCreated(false);
          router.push(`/projects/${newProject.slug}`);
        }, 4000);
      }
    } catch (err) {
      setError("Failed to create project. Please try again.");
      setShowCreateDialog(false);
      toast.error("Failed to create project.");
      console.error("Error creating project:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewProjectClick = () => {
    setShowForm(true);
    setSearchQuery("");
  };

  const handleRefresh = () => {
    getAllProjects();
  };

  return (
    <div className="pg-page pg-grid min-h-screen py-10 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] opacity-40 [background-image:radial-gradient(circle_at_50%_100%,rgba(255,90,31,.14),transparent_44%),linear-gradient(90deg,transparent_0,rgba(223,223,218,.36)_1px,transparent_1px),linear-gradient(transparent_0,rgba(223,223,218,.36)_1px,transparent_1px)] [background-size:auto,78px_100%,100%_62px]"
      />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pg-shell px-6 z-10 relative"
      >
        {/* Header with user menu */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
        >
          <div>
            <h1 className="text-lg font-bold text-[#1d1d1b] mb-1">
              Your Projects
            </h1>
            <p className="text-[#73736e] text-xs">
              Select a project to go to the project dashboard
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex gap-2.5 w-full md:w-auto items-center"
          >
            <div className="relative flex-1 md:w-56">
              <Input
                placeholder="Search projects..."
                className="pl-3 w-full bg-white border border-[#dfdfda] text-[#1d1d1b] text-xs h-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1d1d1b] placeholder:text-[#858580] transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="bg-white border border-[#dfdfda] text-[#1d1d1b] hover:bg-[#f7f7f5] h-8 rounded-lg shadow-none cursor-pointer"
              >
                <HugeiconsIcon
                  icon={Refresh01Icon}
                  className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </motion.div>

            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  onClick={handleNewProjectClick}
                  className="bg-[#171716] text-white hover:bg-[#ff5a1f] text-xs h-8 font-semibold rounded-lg shadow-none cursor-pointer"
                >
                  <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5 mr-1" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-transparent border-none text-foreground p-0">
                <AnimatePresence>
                  {showForm && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50"
                        onClick={() => setShowForm(false)}
                      />
                      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                          layout
                          initial={{ scale: 0.95, opacity: 0, y: 15 }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            width: 480,
                            height: "fit-content",
                          }}
                          exit={{ scale: 0.95, opacity: 0, y: 15 }}
                          transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                            layout: { duration: 0.4, ease: "easeInOut" },
                          }}
                          className="pg-panel border border-[#dfdfda] rounded-xl shadow-lg overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ProjectForm
                            onSubmit={handleCreateProject}
                            onCancel={() => setShowForm(false)}
                            isLoading={isLoading}
                          />
                        </motion.div>
                      </div>
                    </>
                  )}
                </AnimatePresence>
              </DialogContent>
            </Dialog>

            {/* User dropdown menu */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 overflow-hidden rounded-full border border-border hover:border-muted-foreground/30 transition-all bg-muted cursor-pointer"
                  >
                    {curentUser ? (
                      <Image
                        className="h-full w-full absolute object-cover"
                        src={curentUser}
                        alt={user?.name || ""}
                        width={50}
                        height={50}
                      />
                    ) : (
                      <HugeiconsIcon icon={UserIcon} className="h-4 w-4 text-foreground" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-60 bg-white border border-[#dfdfda] text-[#1d1d1b] rounded-lg shadow-sm"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex items-center space-x-2.5">
                      {curentUser ? (
                        <Image
                          className="h-10 w-10 rounded-full object-cover border border-border"
                          src={curentUser}
                          alt={user?.name || ""}
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-border">
                          <HugeiconsIcon icon={UserIcon} className="h-5 w-5 text-foreground" />
                        </div>
                      )}
                      <div className="flex flex-col space-y-0.5 w-32">
                        <p className="text-xs font-semibold leading-none text-foreground">
                          {user?.name || "Loading..."}
                        </p>
                        <p className="text-[10px] leading-none text-muted-foreground truncate">
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-border" />

                  <div className="p-1">
                    <Button
                      onClick={() => router.push("/settings")}
                      variant="ghost"
                      className="w-full justify-start rounded-md h-8 text-xs text-[#73736e] hover:text-[#1d1d1b] hover:bg-[#f7f7f5] transition"
                    >
                      <HugeiconsIcon icon={Settings01Icon} className="h-3.5 w-3.5 mr-1.5" />
                      <span>Account Settings</span>
                    </Button>
                  </div>

                  <DropdownMenuSeparator className="bg-[#dfdfda]" />

                  <div className="p-1">
                    <CustomAlertDialog
                      trigger={
                        <Button
                          variant="ghost"
                          className="w-full justify-start rounded-md h-8 text-xs text-[#73736e] hover:bg-destructive/10 hover:text-destructive transition"
                        >
                          <HugeiconsIcon icon={Logout01Icon} className="h-3.5 w-3.5 mr-1.5" />
                          <span>Sign out</span>
                        </Button>
                      }
                      title="Leaving Already?"
                      description="Are you sure you want to leave? This will log you out of your project dashboard."
                      onConfirm={logout}
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Error message */}
        <CustomErrorMessage error={error} />

        {/* View Toggle Button */}
        <AnimatePresence>
          {filteredProjects.length > 2 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex justify-end mb-3"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="icon"
                  onClick={toggleViewMode}
                  className="bg-white border border-[#dfdfda] text-[#1d1d1b] hover:bg-[#f7f7f5] h-8 w-8 rounded-lg shadow-none hidden lg:flex cursor-pointer"
                  title={
                    viewMode === "grid"
                      ? "Switch to List Layout"
                      : "Switch to Grid Layout"
                  }
                >
                  {viewMode === "grid" ? (
                    <HugeiconsIcon icon={LayoutGridIcon} className="h-4 w-4" />
                  ) : (
                    <HugeiconsIcon icon={ListViewIcon} className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Projects grid or empty state */}
        <AnimatePresence mode="wait">
          {isRefreshing && projects.length === 0 ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center pt-40"
            >
              <HugeiconsIcon icon={Loading02Icon} className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-xs text-muted-foreground">Loading projects...</span>
            </motion.div>
          ) : filteredProjects.length > 0 ? (
            <motion.div
              key="projects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                  : "grid grid-cols-1 md:grid-cols-2 gap-5"
              }
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <ProjectCard
                    index={index}
                    project={project}
                    href={`/projects/${project.slug}`}
                    viewMode={viewMode}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="flex flex-col items-center justify-center pt-40 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4 border border-border"
              >
                <HugeiconsIcon icon={Layers01Icon} className="h-10 w-10 text-muted-foreground" />
              </motion.div>

              <h3 className="text-sm font-semibold text-foreground mb-1">
                {searchQuery ? "No projects found" : "No projects yet"}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {searchQuery
                  ? "Try a different search term or clear your search"
                  : "Create your first project to get started"}
              </p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex gap-2.5"
              >
                {searchQuery && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                      className="bg-card border border-border text-foreground hover:bg-muted text-xs h-8 shadow-none"
                    >
                      Clear Search
                    </Button>
                  </motion.div>
                )}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={handleNewProjectClick}
                        className="bg-[#171716] text-white hover:bg-[#ff5a1f] text-xs h-8 font-semibold rounded-lg shadow-none cursor-pointer"
                      >
                        <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5 mr-1" />
                        New Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-transparent border-none text-[#1d1d1b] p-0">
                      <AnimatePresence>
                        {showForm && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.2 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50"
                              onClick={() => setShowForm(false)}
                            />
                            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                              <motion.div
                                layout
                                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                                animate={{
                                  scale: 1,
                                  opacity: 1,
                                  y: 0,
                                  width: 480,
                                  height: "fit-content",
                                }}
                                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                                transition={{
                                  type: "spring",
                                  damping: 25,
                                  stiffness: 300,
                                  layout: { duration: 0.4, ease: "easeInOut" },
                                }}
                                className="pg-panel border border-[#dfdfda] rounded-xl shadow-lg overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ProjectForm
                                  onSubmit={handleCreateProject}
                                  onCancel={() => setShowForm(false)}
                                  isLoading={isLoading}
                                />
                              </motion.div>
                            </div>
                          </>
                        )}
                      </AnimatePresence>
                    </DialogContent>
                  </Dialog>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Project Dialog */}
        <CreateProjectDialog
          isOpen={showCreateDialog}
          onClose={() => {
            setShowCreateDialog(false);
            setProjectCreated(false);
          }}
          projectName={creatingProjectName}
          status={projectCreated ? "complete" : "creating"}
        />
      </motion.div>
    </div>
  );
}
