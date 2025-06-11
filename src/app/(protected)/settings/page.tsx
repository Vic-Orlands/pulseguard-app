"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  Trash2,
  Shield,
  Settings,
  Eye,
  EyeOff,
  Bell,
  Key,
  Save,
  RefreshCw,
  AlertTriangle,
  User,
  Lock,
  Camera,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  Activity,
  Zap,
  Database,
  Moon,
  Sun,
  Palette,
  Languages,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

// Mock API functions
const mockApi = {
  getCurrentUser: async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      id: "user_123",
      name: "John Doe",
      email: "john@example.com",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
      createdAt: "2023-01-15",
      lastLogin: "2024-06-10T14:30:00Z",
      subscription: "Pro",
      usage: {
        projects: 12,
        apiCalls: 145000,
        storage: 2.4,
      },
    };
  },

  updateUser: async (userData) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return { success: true, user: userData };
  },

  getUserProjects: async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return [
      {
        id: "proj_1",
        name: "E-commerce API",
        slug: "ecommerce-api",
        status: "active",
        createdAt: "2024-05-15",
        errorCount: 23,
        uptime: 99.8,
      },
      {
        id: "proj_2",
        name: "Mobile App Backend",
        slug: "mobile-app-backend",
        status: "active",
        createdAt: "2024-04-20",
        errorCount: 7,
        uptime: 99.9,
      },
      {
        id: "proj_3",
        name: "Analytics Dashboard",
        slug: "analytics-dashboard",
        status: "paused",
        createdAt: "2024-03-10",
        errorCount: 156,
        uptime: 98.2,
      },
      {
        id: "proj_4",
        name: "Payment Gateway",
        slug: "payment-gateway",
        status: "active",
        createdAt: "2024-02-28",
        errorCount: 2,
        uptime: 99.95,
      },
      {
        id: "proj_5",
        name: "User Management API",
        slug: "user-management-api",
        status: "archived",
        createdAt: "2024-01-12",
        errorCount: 89,
        uptime: 97.5,
      },
    ];
  },

  deleteProject: async (projectId) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true };
  },

  deleteAccount: async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { success: true };
  },
};

const availableAvatars = [
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=face",
];

export default function UserSettingsPage() {
  // User data state
  const [user, setUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    avatar: "",
  });

  // Projects state
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [projectFilter, setProjectFilter] = useState("all");
  const [projectSearch, setProjectSearch] = useState("");

  // UI state
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Dialog states
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [deleteProjectDialog, setDeleteProjectDialog] = useState({
    open: false,
    project: null,
  });
  const [batchDeleteDialog, setBatchDeleteDialog] = useState(false);
  const [deleteAccountDialog, setDeleteAccountDialog] = useState({
    open: false,
    step: 1,
  });
  const [deleteAllProjectsDialog, setDeleteAllProjectsDialog] = useState(false);

  // Settings state
  const [preferences, setPreferences] = useState({
    theme: "dark",
    language: "en",
    timezone: "UTC",
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    securityAlerts: true,
    twoFactorEnabled: false,
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, projectsData] = await Promise.all([
          mockApi.getCurrentUser(),
          mockApi.getUserProjects(),
        ]);

        setUser(userData);
        setUserForm({
          name: userData.name,
          email: userData.email,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          avatar: userData.avatar,
        });
        setProjects(projectsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle form changes
  const handleFormChange = (field, value) => {
    setUserForm((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  // Save user changes
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        name: userForm.name,
        email: userForm.email,
        avatar: userForm.avatar,
      };

      if (userForm.newPassword) {
        updateData.password = userForm.newPassword;
      }

      await mockApi.updateUser(updateData);
      setUser((prev) => ({ ...prev, ...updateData }));
      setHasUnsavedChanges(false);

      // Reset password fields
      setUserForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      // Success animation
      const successEl = document.createElement("div");
      successEl.className =
        "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse";
      successEl.textContent = "Changes saved successfully!";
      document.body.appendChild(successEl);
      setTimeout(() => successEl.remove(), 3000);
    } catch (error) {
      console.error("Failed to save changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete single project
  const handleDeleteProject = async (project) => {
    setDeleteProjectDialog({ open: false, project: null });

    // Animate project removal
    const projectEl = document.querySelector(
      `[data-project-id="${project.id}"]`
    );
    if (projectEl) {
      projectEl.style.transform = "translateX(-100%)";
      projectEl.style.opacity = "0";
      projectEl.style.transition = "all 0.5s ease-out";
    }

    setTimeout(async () => {
      try {
        await mockApi.deleteProject(project.id);
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
        setSelectedProjects((prev) => {
          const newSet = new Set(prev);
          newSet.delete(project.id);
          return newSet;
        });
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }, 500);
  };

  // Batch delete projects
  const handleBatchDelete = async () => {
    setBatchDeleteDialog(false);

    const projectsToDelete = Array.from(selectedProjects);

    // Animate selected projects
    projectsToDelete.forEach((projectId) => {
      const projectEl = document.querySelector(
        `[data-project-id="${projectId}"]`
      );
      if (projectEl) {
        projectEl.style.transform = "scale(0.8)";
        projectEl.style.opacity = "0";
        projectEl.style.transition = "all 0.4s ease-out";
      }
    });

    setTimeout(async () => {
      try {
        await Promise.all(
          projectsToDelete.map((id) => mockApi.deleteProject(id))
        );
        setProjects((prev) => prev.filter((p) => !selectedProjects.has(p.id)));
        setSelectedProjects(new Set());
      } catch (error) {
        console.error("Failed to delete projects:", error);
      }
    }, 400);
  };

  // Delete all projects
  const handleDeleteAllProjects = async () => {
    setDeleteAllProjectsDialog(false);

    // Animate all projects
    projects.forEach((project) => {
      const projectEl = document.querySelector(
        `[data-project-id="${project.id}"]`
      );
      if (projectEl) {
        projectEl.style.transform = "rotateY(90deg)";
        projectEl.style.opacity = "0";
        projectEl.style.transition = "all 0.6s ease-out";
      }
    });

    setTimeout(async () => {
      try {
        await Promise.all(projects.map((p) => mockApi.deleteProject(p.id)));
        setProjects([]);
        setSelectedProjects(new Set());
      } catch (error) {
        console.error("Failed to delete all projects:", error);
      }
    }, 600);
  };

  // Delete account
  const handleDeleteAccount = async () => {
    setDeleteAccountDialog({ open: false, step: 1 });

    // Dramatic fade out animation
    document.body.style.transition = "opacity 2s ease-out";
    document.body.style.opacity = "0.3";

    try {
      await mockApi.deleteAccount();
      // In real app, redirect to goodbye page
      alert("Account deleted successfully. Goodbye!");
    } catch (error) {
      console.error("Failed to delete account:", error);
      document.body.style.opacity = "1";
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(projectSearch.toLowerCase());
    const matchesFilter =
      projectFilter === "all" || project.status === projectFilter;
    return matchesSearch && matchesFilter;
  });

  // Get status badge variant
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return {
          variant: "default",
          color: "text-green-400",
          icon: CheckCircle,
        };
      case "paused":
        return { variant: "secondary", color: "text-yellow-400", icon: Clock };
      case "archived":
        return { variant: "outline", color: "text-gray-400", icon: XCircle };
      default:
        return { variant: "outline", color: "text-gray-400", icon: XCircle };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-slate-400">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Account Settings
            </h1>
            <p className="text-slate-400 text-lg mt-2">
              Manage your account, projects, and preferences
            </p>
          </div>
          <div className="flex items-center gap-4">
            <AnimatePresence>
              {hasUnsavedChanges && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 text-amber-400 text-sm"
                >
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  Unsaved changes
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              onClick={handleSaveChanges}
              disabled={!hasUnsavedChanges || isSaving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg backdrop-blur-sm border border-slate-700/50">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "projects", label: "Projects", icon: Database },
            { id: "preferences", label: "Preferences", icon: Settings },
            { id: "security", label: "Security", icon: Shield },
            { id: "danger", label: "Danger Zone", icon: AlertTriangle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            {activeTab === "profile" && (
              <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-16 w-16 ring-4 ring-blue-400/20">
                      <AvatarImage src={userForm.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-bold text-xl">
                        {userForm.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Profile Information
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Update your personal details and avatar
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Full Name
                      </label>
                      <Input
                        value={userForm.name}
                        onChange={(e) =>
                          handleFormChange("name", e.target.value)
                        }
                        className="bg-slate-900/50 border-slate-600 focus:border-blue-400 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">
                        Email Address
                      </label>
                      <Input
                        value={userForm.email}
                        onChange={(e) =>
                          handleFormChange("email", e.target.value)
                        }
                        className="bg-slate-900/50 border-slate-600 focus:border-blue-400 transition-colors"
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Profile Avatar
                    </label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 ring-2 ring-slate-600">
                        <AvatarImage src={userForm.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-bold">
                          {userForm.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        onClick={() => setAvatarDialogOpen(true)}
                        variant="outline"
                        className="border-slate-600 hover:border-blue-400"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Change Avatar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-700/50">
                    <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                      <Lock className="h-5 w-5 text-amber-400" />
                      Change Password
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                          Current Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword.current ? "text" : "password"}
                            value={userForm.currentPassword}
                            onChange={(e) =>
                              handleFormChange(
                                "currentPassword",
                                e.target.value
                              )
                            }
                            className="bg-slate-900/50 border-slate-600 focus:border-blue-400 transition-colors pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() =>
                              setShowPassword((prev) => ({
                                ...prev,
                                current: !prev.current,
                              }))
                            }
                          >
                            {showPassword.current ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                          New Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword.new ? "text" : "password"}
                            value={userForm.newPassword}
                            onChange={(e) =>
                              handleFormChange("newPassword", e.target.value)
                            }
                            className="bg-slate-900/50 border-slate-600 focus:border-blue-400 transition-colors pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() =>
                              setShowPassword((prev) => ({
                                ...prev,
                                new: !prev.new,
                              }))
                            }
                          >
                            {showPassword.new ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword.confirm ? "text" : "password"}
                            value={userForm.confirmPassword}
                            onChange={(e) =>
                              handleFormChange(
                                "confirmPassword",
                                e.target.value
                              )
                            }
                            className="bg-slate-900/50 border-slate-600 focus:border-blue-400 transition-colors pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() =>
                              setShowPassword((prev) => ({
                                ...prev,
                                confirm: !prev.confirm,
                              }))
                            }
                          >
                            {showPassword.confirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "projects" && (
              <div className="space-y-6">
                {/* Projects Header */}
                <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          Your Projects
                        </CardTitle>
                        <CardDescription className="text-lg">
                          Manage all your monitoring projects
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-blue-400/30 text-blue-400 text-lg px-3 py-1"
                      >
                        {projects.length} total
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Controls */}
                    <div className="flex flex-wrap gap-4 items-center mb-6">
                      <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Search projects..."
                            value={projectSearch}
                            onChange={(e) => setProjectSearch(e.target.value)}
                            className="bg-slate-900/50 border-slate-600 focus:border-blue-400 pl-10"
                          />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="border-slate-600"
                            >
                              <Filter className="h-4 w-4 mr-2" />
                              {projectFilter === "all"
                                ? "All Status"
                                : projectFilter}
                              <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-800 border-slate-700">
                            {["all", "active", "paused", "archived"].map(
                              (status) => (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() => setProjectFilter(status)}
                                  className="hover:bg-slate-700"
                                >
                                  {status === "all" ? "All Status" : status}
                                </DropdownMenuItem>
                              )
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Batch Actions */}
                      {selectedProjects.size > 0 && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <Badge
                            variant="secondary"
                            className="bg-blue-600/20 text-blue-400"
                          >
                            {selectedProjects.size} selected
                          </Badge>
                          <Button
                            onClick={() => setBatchDeleteDialog(true)}
                            variant="destructive"
                            size="sm"
                            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-600/30"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Selected
                          </Button>
                        </div>
                      )}

                      <Button
                        onClick={() => setDeleteAllProjectsDialog(true)}
                        variant="outline"
                        className="border-red-600/30 text-red-400 hover:bg-red-600/10"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All
                      </Button>
                    </div>

                    {/* Projects List */}
                    <div className="space-y-4">
                      {filteredProjects.map((project) => {
                        const statusBadge = getStatusBadge(project.status);
                        const StatusIcon = statusBadge.icon;

                        return (
                          <div
                            key={project.id}
                            data-project-id={project.id}
                            className="group p-4 bg-slate-900/30 border border-slate-700/30 rounded-lg hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Checkbox
                                  checked={selectedProjects.has(project.id)}
                                  onCheckedChange={(checked) => {
                                    setSelectedProjects((prev) => {
                                      const newSet = new Set(prev);
                                      if (checked) {
                                        newSet.add(project.id);
                                      } else {
                                        newSet.delete(project.id);
                                      }
                                      return newSet;
                                    });
                                  }}
                                  className="border-slate-600"
                                />
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                                      {project.name}
                                    </h3>
                                    <Badge
                                      variant={statusBadge.variant}
                                      className="flex items-center gap-1"
                                    >
                                      <StatusIcon
                                        className={`h-3 w-3 ${statusBadge.color}`}
                                      />
                                      {project.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Created{" "}
                                      {new Date(
                                        project.createdAt
                                      ).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <AlertTriangle className="h-3 w-3" />
                                      {project.errorCount} errors
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Activity className="h-3 w-3" />
                                      {project.uptime}% uptime
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-200"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() =>
                                    setDeleteProjectDialog({
                                      open: true,
                                      project,
                                    })
                                  }
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-950/30"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {filteredProjects.length === 0 && (
                        <div className="text-center py-12">
                          <Database className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400">
                            {projectSearch || projectFilter !== "all"
                              ? "No projects match your filters"
                              : "No projects found"}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Preferences
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Customize your experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Appearance */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <Palette className="h-5 w-5 text-purple-400" />
                        Appearance
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">
                            Theme
                          </label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full border-slate-600 justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  {preferences.theme === "dark" ? (
                                    <Moon className="h-4 w-4" />
                                  ) : (
                                    <Sun className="h-4 w-4" />
                                  )}
                                  {preferences.theme === "dark"
                                    ? "Dark"
                                    : "Light"}
                                </div>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem
                                onClick={() =>
                                  setPreferences((prev) => ({
                                    ...prev,
                                    theme: "dark",
                                  }))
                                }
                                className="hover:bg-slate-700"
                              >
                                <Moon className="h-4 w-4 mr-2" />
                                Dark
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setPreferences((prev) => ({
                                    ...prev,
                                    theme: "light",
                                  }))
                                }
                                className="hover:bg-slate-700"
                              >
                                <Sun className="h-4 w-4 mr-2" />
                                Light
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">
                            Language
                          </label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full border-slate-600 justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <Languages className="h-4 w-4" />
                                  English
                                </div>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem className="hover:bg-slate-700">
                                English
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-slate-700">
                                Spanish
                              </DropdownMenuItem>
                              <DropdownMenuItem className="hover:bg-slate-700">
                                French
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <Bell className="h-5 w-5 text-yellow-400" />
                        Notifications
                      </h3>
                      <div className="space-y-4">
                        {Object.entries({
                          emailNotifications: "Email Notifications",
                          pushNotifications: "Push Notifications",
                          weeklyReports: "Weekly Reports",
                          securityAlerts: "Security Alerts",
                        }).map(([key, label]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg"
                          >
                            <div>
                              <label className="text-sm font-medium text-slate-300">
                                {label}
                              </label>
                              <p className="text-xs text-slate-500 mt-1">
                                {key === "emailNotifications" &&
                                  "Receive notifications via email"}
                                {key === "pushNotifications" &&
                                  "Get push notifications on your devices"}
                                {key === "weeklyReports" &&
                                  "Weekly summary of your projects"}
                                {key === "securityAlerts" &&
                                  "Important security updates"}
                              </p>
                            </div>
                            <Switch
                              checked={preferences[key]}
                              onCheckedChange={(checked) => {
                                setPreferences((prev) => ({
                                  ...prev,
                                  [key]: checked,
                                }));
                                setHasUnsavedChanges(true);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "security" && (
              <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Security Settings
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Manage your account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-slate-700/30">
                      <div>
                        <h4 className="font-medium text-slate-200">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-slate-400 mt-1">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        checked={preferences.twoFactorEnabled}
                        onCheckedChange={(checked) => {
                          setPreferences((prev) => ({
                            ...prev,
                            twoFactorEnabled: checked,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-700/30">
                      <h4 className="font-medium text-slate-200">
                        Recent Activity
                      </h4>
                      <p className="text-sm text-slate-400 mt-1">
                        Last login: {new Date(user?.lastLogin).toLocaleString()}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-3 border-slate-600"
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        View Login History
                      </Button>
                    </div>

                    <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-700/30">
                      <h4 className="font-medium text-slate-200">API Keys</h4>
                      <p className="text-sm text-slate-400 mt-1">
                        Manage your API access keys
                      </p>
                      <Button
                        variant="outline"
                        className="mt-3 border-slate-600"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Manage API Keys
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "danger" && (
              <Card className="bg-red-950/20 border border-red-900/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-red-400/80 text-lg">
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-red-950/30 rounded-lg border border-red-900/30">
                      <h4 className="font-medium text-red-300">
                        Delete All Projects
                      </h4>
                      <p className="text-sm text-red-400/80 mt-1">
                        Permanently delete all your projects and their data.
                        This cannot be undone.
                      </p>
                      <Button
                        onClick={() => setDeleteAllProjectsDialog(true)}
                        variant="destructive"
                        className="mt-3 bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Projects
                      </Button>
                    </div>

                    <div className="p-4 bg-red-950/30 rounded-lg border border-red-900/30">
                      <h4 className="font-medium text-red-300">
                        Delete Account
                      </h4>
                      <p className="text-sm text-red-400/80 mt-1">
                        Permanently delete your account and all associated data.
                        This action is irreversible.
                      </p>
                      <Button
                        onClick={() =>
                          setDeleteAccountDialog({ open: true, step: 1 })
                        }
                        variant="destructive"
                        className="mt-3 bg-red-700 hover:bg-red-800"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Overview */}
            <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Avatar className="h-20 w-20 mx-auto ring-4 ring-blue-400/20">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-bold text-2xl">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-200 text-xl">
                      {user?.name}
                    </h3>
                    <p className="text-slate-400">{user?.email}</p>
                    <Badge
                      variant="outline"
                      className="border-purple-400/30 text-purple-400 mt-2"
                    >
                      {user?.subscription} Plan
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Projects</span>
                    <span className="font-medium">
                      {user?.usage?.projects || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">API Calls</span>
                    <span className="font-medium">
                      {user?.usage?.apiCalls?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Storage</span>
                    <span className="font-medium">
                      {user?.usage?.storage || 0} GB
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-slate-600 justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 justify-start"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 justify-start"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialogs */}

        {/* Avatar Selection Dialog */}
        <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Choose Avatar
              </DialogTitle>
              <DialogDescription>
                Select a new avatar for your profile
              </DialogDescription>
            </DialogHeader>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-3 gap-4 py-4"
            >
              {availableAvatars.map((avatar, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    handleFormChange("avatar", avatar);
                    onOpenChange(false);
                  }}
                  className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                    userForm.avatar === avatar
                      ? "border-blue-400 bg-blue-400/10"
                      : "border-slate-600 hover:border-blue-500"
                  }`}
                >
                  <Avatar className="h-16 w-16 mx-auto">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                </motion.button>
              ))}
            </motion.div>
          </DialogContent>
        </Dialog>

        {/* Delete Project Dialog */}
        <Dialog
          open={deleteProjectDialog.open}
          onOpenChange={(open) =>
            setDeleteProjectDialog({ open, project: null })
          }
        >
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-xl text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Delete Project
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "
                {deleteProjectDialog.project?.name}"? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteProjectDialog({ open: false, project: null })
                }
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteProject(deleteProjectDialog.project)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Batch Delete Dialog */}
        <Dialog open={batchDeleteDialog} onOpenChange={setBatchDeleteDialog}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-xl text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Delete Selected Projects
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedProjects.size} selected
                projects? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setBatchDeleteDialog(false)}
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBatchDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {selectedProjects.size} Projects
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete All Projects Dialog */}
        <Dialog
          open={deleteAllProjectsDialog}
          onOpenChange={setDeleteAllProjectsDialog}
        >
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-xl text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Delete All Projects
              </DialogTitle>
              <DialogDescription>
                This will permanently delete ALL {projects.length} of your
                projects and their data. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-red-400/80 bg-red-950/30 p-3 rounded-lg border border-red-900/30">
                ⚠️ This is a destructive action that will remove all monitoring
                data, configurations, and history for all projects.
              </p>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteAllProjectsDialog(false)}
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAllProjects}
                className="bg-red-700 hover:bg-red-800"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Projects
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog
          open={deleteAccountDialog.open}
          onOpenChange={(open) => setDeleteAccountDialog({ open, step: 1 })}
        >
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-xl text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Delete Account
              </DialogTitle>
              <DialogDescription>
                {deleteAccountDialog.step === 1
                  ? "This will permanently delete your account and all associated data."
                  : "Please confirm by typing your email address to proceed."}
              </DialogDescription>
            </DialogHeader>

            {deleteAccountDialog.step === 1 ? (
              <div className="py-4 space-y-4">
                <div className="bg-red-950/30 p-4 rounded-lg border border-red-900/30">
                  <h4 className="font-medium text-red-300 mb-2">
                    This will delete:
                  </h4>
                  <ul className="text-sm text-red-400/80 space-y-1">
                    <li>• Your account and profile</li>
                    <li>• All {projects.length} projects and their data</li>
                    <li>• All monitoring history and logs</li>
                    <li>• All API keys and configurations</li>
                  </ul>
                </div>
                <p className="text-sm text-red-400/80">
                  This action is irreversible. Please make sure you have
                  exported any data you want to keep.
                </p>
              </div>
            ) : (
              <div className="py-4">
                <label className="text-sm font-medium text-slate-300">
                  Type your email address to confirm:
                </label>
                <Input
                  placeholder={user?.email}
                  className="mt-2 bg-slate-900/50 border-slate-600 focus:border-red-400"
                />
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteAccountDialog({ open: false, step: 1 })}
                className="border-slate-600"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteAccountDialog.step === 1) {
                    setDeleteAccountDialog({ open: true, step: 2 });
                  } else {
                    handleDeleteAccount();
                  }
                }}
                className="bg-red-700 hover:bg-red-800"
              >
                {deleteAccountDialog.step === 1 ? "Continue" : "Delete Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
