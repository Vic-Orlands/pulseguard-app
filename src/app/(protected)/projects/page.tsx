"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Layers,
  LogOut,
  User,
  Settings,
  RefreshCw,
  List,
  LayoutGrid,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CustomAlertDialog } from "@/components/dashboard/shared/custom-alert-dialog";
import { toast } from "sonner";
import { Project } from "@/types/dashboard";
import CustomErrorMessage from "@/components/dashboard/shared/error-message";

const url = process.env.NEXT_PUBLIC_API_URL;

// Create Project Dialog Component
interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  status: "creating" | "complete";
}

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
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                width: 400,
                height: step === "complete" ? 280 : 300,
              }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                layout: { duration: 0.6, ease: "easeInOut" },
              }}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {step === "creating" && (
                  <motion.div
                    key="creating"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="p-8 h-full flex flex-col items-center justify-center"
                  >
                    {/* Animated SVG */}
                    <div className="mb-6 relative">
                      <svg
                        width="80"
                        height="80"
                        viewBox="0 0 80 80"
                        className="mx-auto"
                      >
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
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
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="20"
                          fill="#1e293b"
                          stroke="#3b82f6"
                          strokeWidth="1"
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        <motion.g
                          initial={{ opacity: 1 }}
                          animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <rect
                            x="32"
                            y="30"
                            width="16"
                            height="20"
                            rx="2"
                            fill="#3b82f6"
                          />
                          <path d="M36 34H44V36H36V34Z" fill="white" />
                          <path d="M36 38H44V40H36V38Z" fill="white" />
                          <path d="M36 42H42V44H36V42Z" fill="white" />
                        </motion.g>
                        {[...Array(8)].map((_, i) => (
                          <motion.circle
                            key={i}
                            cx="40"
                            cy="40"
                            r="1"
                            fill="#3b82f6"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0, 1, 0],
                              x: [0, Math.cos((i * 45 * Math.PI) / 180) * 30],
                              y: [0, Math.sin((i * 45 * Math.PI) / 180) * 30],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.1,
                              ease: "easeOut",
                            }}
                          />
                        ))}
                      </svg>
                    </div>

                    <motion.h3
                      className="text-xl font-semibold text-white mb-2"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Creating Project...
                    </motion.h3>

                    <p className="text-slate-400 text-sm">
                      Setting up &quot;{projectName}&quot;
                    </p>

                    <div className="flex justify-center space-x-1 mt-4">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-blue-500 rounded-full"
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
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 300 }}
                    className="p-8 h-full flex flex-col items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        damping: 10,
                        stiffness: 200,
                        delay: 0.1,
                      }}
                      className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl font-semibold text-white mb-2"
                    >
                      Project Created
                    </motion.h3>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-slate-400 text-sm"
                    >
                      &quot;{projectName}&quot; is ready!
                    </motion.p>

                    <Button
                      variant="ghost"
                      className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-800"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 text-white py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-full lg:max-w-10/12 mx-auto px-5 lg:p-0"
      >
        {/* Header with user menu */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
              Your Projects
            </h1>
            <p className="text-gray-400 text-sm">
              Select a project to go to the project dashboard
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex gap-3 w-full md:w-auto items-center"
          >
            <div className="relative flex-1 md:w-64">
              <Input
                placeholder="Search projects..."
                className="pl-2 pt-0 w-full bg-black/30 border border-blue-900/40 focus:ring-blue-500 focus:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="bg-black/30 border-blue-900/40 hover:bg-blue-900/20"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </motion.div>

            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleNewProjectClick}
                  className="hover:border-gray-500 shadow-none h-8"
                >
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-transparent border-none text-white">
                <AnimatePresence>
                  {showForm && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={() => setShowForm(false)}
                      />
                      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                          layout
                          initial={{ scale: 0.9, opacity: 0, y: 20 }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            width: 480,
                            height: "fit-content",
                          }}
                          exit={{ scale: 0.9, opacity: 0, y: 20 }}
                          transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                            layout: { duration: 0.6, ease: "easeInOut" },
                          }}
                          className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full ring-2 ring-transparent hover:ring-blue-500/20 transition-all duration-200 bg-gradient-to-br from-blue-500 to-purple-600"
                  >
                    {user?.avatar ? (
                      <Image
                        className="h-10 w-10 rounded-full object-cover border-2 border-gray-700 hover:border-blue-400 transition-colors duration-200"
                        src={user.avatar}
                        alt={user.name}
                        width={50}
                        height={50}
                      />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 shadow-2xl shadow-black/50 rounded-xl"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex items-center space-x-3">
                      {user?.avatar ? (
                        <Image
                          className="h-12 w-12 rounded-full object-cover border-2 border-gray-600"
                          src={user.avatar}
                          alt={user.name}
                          width={48}
                          height={48}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-600">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div className="flex flex-col space-y-1 w-35">
                        <p className="text-sm font-semibold leading-none text-white">
                          {user?.name || "Loading..."}
                        </p>
                        <p className="text-xs leading-none text-gray-400 truncate">
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-gray-600 to-transparent mx-2" />

                  <div className="py-2 px-2">
                    <Button
                      onClick={() => router.push("/settings")}
                      variant="ghost"
                      className="w-full justify-start rounded-lg h-10 text-gray-300 hover:text-white hover:bg-gray-800/80 transition-all duration-200 group"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">Account Settings</span>
                    </Button>
                  </div>

                  <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-gray-600 to-transparent mx-2" />

                  <div className="py-2 px-2">
                    <CustomAlertDialog
                      trigger={
                        <Button
                          variant="ghost"
                          className="w-full justify-start rounded-lg h-10 text-gray-300 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200 group"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="font-medium">Sign out</span>
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
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex justify-end mb-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="icon"
                  onClick={toggleViewMode}
                  className="dark:bg-sidebar-accent dark:text-white hidden lg:flex"
                  title={
                    viewMode === "grid"
                      ? "Switch to List Layout"
                      : "Switch to Grid Layout"
                  }
                >
                  {viewMode === "grid" ? <LayoutGrid /> : <List />}
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
              className="flex items-center justify-center pt-48"
            >
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <span className="ml-2 text-gray-400">Loading projects...</span>
            </motion.div>
          ) : filteredProjects.length > 0 ? (
            <motion.div
              key="projects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "grid grid-cols-1 md:grid-cols-2 gap-6"
              }
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col items-center justify-center pt-48 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                className="w-24 h-24 rounded-full bg-blue-900/20 flex items-center justify-center mb-6"
              >
                <Layers className="h-12 w-12 text-blue-400" />
              </motion.div>

              <h3 className="text-lg font-medium">
                {searchQuery ? "No projects found" : "No projects yet"}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery
                  ? "Try a different search term or clear your search"
                  : "Create your first project to get started"}
              </p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex gap-3"
              >
                {searchQuery && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                      className="bg-black/30 border-blue-900/40 hover:bg-blue-900/20"
                    >
                      Clear Search
                    </Button>
                  </motion.div>
                )}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={handleNewProjectClick}
                        className="hover:border-gray-500 shadow-none h-8"
                      >
                        <Plus className="h-4 w-4" />
                        New Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-transparent border-none text-white">
                      <AnimatePresence>
                        {showForm && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.2 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                              onClick={() => setShowForm(false)}
                            />
                            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                              <motion.div
                                layout
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{
                                  scale: 1,
                                  opacity: 1,
                                  y: 0,
                                  width: 480,
                                  height: "fit-content",
                                }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{
                                  type: "spring",
                                  damping: 25,
                                  stiffness: 300,
                                  layout: { duration: 0.6, ease: "easeInOut" },
                                }}
                                className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
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
