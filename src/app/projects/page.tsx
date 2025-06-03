"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
  Plus,
  Layers,
  LogOut,
  User,
  RefreshCw,
  List,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProjectCard from "./components/project-card";
import ProjectForm from "./components/project-form";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CustomAlertDialog } from "@/components/dashboard/custom-alert-dialog";
import { toast } from "sonner";

export type Project = {
  id: string;
  slug: string;
  name: string;
  description: string;
  platform: string;
  createdAt: string;
  errorCount: number;
  memberCount?: number;
};

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

// Mock API functions - replace with actual API calls
const api = {
  getCurrentUser: async (): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@example.com",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    };
  },
};

export default function ProjectSelectionPage() {
  const router = useRouter();

  const [showForm, setShowForm] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  // Fetch user data
  const getCurrentUser = useCallback(async () => {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  }, []);

  // Fetch all projects using useCallback for memoization
  const getAllProjects = async () => {
    try {
      setIsRefreshing(true);
      setError("");

      const response = await fetch("http://localhost:8081/api/projects", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })

      if (!response.ok) {
        setError("Failed to fetch projects.");
        setProjects([]);
        return;
      }

      const fetchedProjects: Project[] = await response.json();
      if (fetchedProjects == null) {
        setProjects([]);
      } else {
        setProjects(fetchedProjects);
      }
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
    getCurrentUser();
  }, [getCurrentUser]);

  // Filter projects based on search query
  const filteredProjects =
    projects.length > 0 &&
    projects.filter((project) => {
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

  // create new project
  const handleCreateProject = async (projectData: {
    name: string;
    description: string;
    platform: string;
  }) => {
    try {
      setIsLoading(true);
      setError("");

      const newProjectData = {
        name: projectData.name,
        description: projectData.description,
        // platform: projectData.platform,
      };

      const response = await fetch("http://localhost:8081/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newProjectData),
      });

      if (!response.ok) {
        toast("Failed to create project.");
      }

      const newProject = await response.json();

      if (newProject.error === "Slug already exists") {
        toast("Project name already exists, use a different name");
        return;
      }

      if (newProject && !newProject.error) {
        getAllProjects();
        setShowForm(false);

        setTimeout(() => {
          router.push(`/projects/${newProject.slug}`);
        }, 1000);
      }
    } catch (err) {
      setError("Failed to create project. Please try again.");
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

  // Logout functionality
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      const res = await fetch("http://localhost:8081/api/users/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        toast("Error logging out");
      }

      router.push("/signin");
    } catch (err) {
      console.error("Logout error:", err);
      // Force redirect even if API call fails
      window.location.href = "/signin";
    } finally {
      setIsLoggingOut(false);
    }
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Your Projects</h1>
            <p className="text-gray-400 text-sm">
              Select a project to go to the project dashboard
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto items-center">
            <div className="relative flex-1 md:w-64">
              <Input
                placeholder="Search projects..."
                className="pl-2 pt-0 w-full bg-black/30 border border-blue-900/40 focus:ring-blue-500 focus:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

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

            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleNewProjectClick}
                  className="hover:border-gray-500 shadow-none"
                >
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    Create New Project
                  </DialogTitle>
                </DialogHeader>
                <ProjectForm
                  onSubmit={handleCreateProject}
                  onCancel={() => setShowForm(false)}
                  isLoading={isLoading}
                />
              </DialogContent>
            </Dialog>

            {/* User dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  {user?.avatar ? (
                    <Image
                      className="h-8 w-8 rounded-full object-cover absolute"
                      src={user.avatar}
                      alt={user.name}
                      width={50}
                      height={50}
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-gray-900 border-gray-700"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">
                      {user?.name || "Loading..."}
                    </p>
                    <p className="text-xs leading-none text-gray-400">
                      {user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <CustomAlertDialog
                  trigger={
                    <Button
                      variant="ghost"
                      disabled={isLoggingOut}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer w-full rounded-none"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>
                        {isLoggingOut ? "Signing out..." : "Sign out"}
                      </span>
                    </Button>
                  }
                  title="Leaving Already?"
                  description="Are you sure you want to leave? This will log you out of your project dashboard."
                  onConfirm={handleLogout}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/20 border border-red-900/40 rounded-lg text-red-400"
          >
            {error}
          </motion.div>
        )}

        {filteredProjects && filteredProjects.length > 2 && (
          <div className="flex justify-end mb-4">
            <Button
              size="icon"
              onClick={toggleViewMode}
              className="dark:bg-sidebar-accent dark:text-white hidden lg:flex"
              title={
                viewMode ? "Switch to Grid Layout" : "Switch to Row Layout"
              }
            >
              {viewMode === "grid" ? <LayoutGrid /> : <List />}
            </Button>
          </div>
        )}

        {/* Projects grid or empty state */}
        {isRefreshing && projects.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
            <span className="ml-2 text-gray-400">Loading projects...</span>
          </div>
        ) : filteredProjects ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "grid grid-cols-1 md:grid-cols-2 gap-6"
            }
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard
                index={index}
                key={project.id}
                project={project}
                href={`/projects/${project.slug}`}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 rounded-full bg-blue-900/20 flex items-center justify-center mb-6">
              <Layers className="h-12 w-12 text-blue-400" />
            </div>

            <h3 className="text-lg font-medium">
              {searchQuery ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? "Try a different search term or clear your search"
                : "Create your first project to get started"}
            </p>
            <div className="flex gap-3">
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="bg-black/30 border-blue-900/40 hover:bg-blue-900/20"
                >
                  Clear Search
                </Button>
              )}
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button onClick={handleNewProjectClick}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      Create New Project
                    </DialogTitle>
                  </DialogHeader>
                  <ProjectForm
                    onSubmit={handleCreateProject}
                    onCancel={() => setShowForm(false)}
                    isLoading={isLoading}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
