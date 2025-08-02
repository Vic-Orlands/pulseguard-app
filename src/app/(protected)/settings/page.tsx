"use client";

import clsx from "clsx";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  Trash2,
  Settings,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  User,
  Lock,
  Camera,
  Download,
  Search,
  Calendar,
  Zap,
  Database,
  Loader2,
  BadgeCheckIcon,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/auth-context";
import type { Project } from "@/types/dashboard";
import { deleteAllProjects, deleteProject } from "@/lib/api/projects-api";
import CustomErrorMessage from "@/components/dashboard/shared/error-message";
import { RenderDeleteAccountDialogComp } from "./delete-user-card";
import { updateUser } from "@/lib/api/user-api";
import { availableAvatars } from "@/components/avatars";
import { normalizePostgresString, wrapAsPostgresString } from "@/lib/utils";

import { UserFormSchema, type UserFormType } from "@/types/settings";

const url = process.env.NEXT_PUBLIC_API_URL;

export default function UserSettingsNew() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const curentUser = user && normalizePostgresString(user.avatar);
  const curentUserDetails = user && normalizePostgresString(user.provider);
  const isOAuthUser =
    curentUserDetails === "google" || curentUserDetails === "github";

  // Form State
  const [userForm, setUserForm] = useState<UserFormType>({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    avatar: "",
  });
  // Projects state
  const [error, setError] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectSearch, setProjectSearch] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<string>("Ascending");
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    new Set()
  );
  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<
    Record<"currentPassword" | "newPassword" | "confirmPassword", boolean>
  >({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [avatarDialogOpen, setAvatarDialogOpen] = useState<boolean>(false);
  const [deleteProjectDialog, setDeleteProjectDialog] = useState<{
    open: boolean;
    project: Project | null;
  }>({ open: false, project: null });
  const [batchDeleteDialog, setBatchDeleteDialog] = useState<boolean>(false);
  const [deleteAccountDialog, setDeleteAccountDialog] = useState<{
    open: boolean;
    step: number;
  }>({ open: false, step: 1 });
  const [deleteAllProjectsDialog, setDeleteAllProjectsDialog] =
    useState<boolean>(false);

  // Effects
  useEffect(() => {
    if (error) {
      setTimeout(() => setError(""), 5000);
    }
  }, [error]);

  useEffect(() => {
    if (user) {
      setUserForm({
        name: user.name,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        avatar: curentUser || "",
      });
    }
  }, [user, curentUser]);

  useEffect(() => {
    const nameChanged = userForm.name === user?.name;
    const passwordChanged =
      userForm.currentPassword === "" &&
      userForm.newPassword === "" &&
      userForm.confirmPassword === "";
    const avatarChanged = userForm.avatar === curentUser;
    setHasUnsavedChanges(!nameChanged || !passwordChanged || !avatarChanged);
  }, [userForm, user, curentUser]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${url}/api/projects`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          setError("Failed to fetch projects.");
          setProjects([]);
          return;
        }

        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load data:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handlers
  const handleFormChange = (field: keyof UserFormType, value: string) => {
    setUserForm((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const validation = UserFormSchema.safeParse(userForm);
      if (!validation.success) {
        setError(validation.error.errors.map((e) => e.message).join(", "));
        setIsSaving(false);
        return;
      }

      const { name, newPassword, avatar } = validation.data;
      const updateData = { name, password: newPassword, avatar };

      console.log("data:", updateData);

      const res = await updateUser(updateData);
      if (!res) {
        setError("Failed to update user data");
        setIsSaving(false);
        return;
      }

      setUser({
        ...user!,
        name,
        avatar: wrapAsPostgresString(userForm.avatar),
      });
      setHasUnsavedChanges(false);
      toast.success("Changes saved successfully!");
    } catch (error) {
      setError("Failed to save changes");
      console.error("Failed to save changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (project: Project | null) => {
    if (!project) return;
    setDeleteProjectDialog({ open: false, project: null });

    const projectEl = document.querySelector(
      `[data-project-id="${project.id}"]`
    ) as HTMLElement | null;
    if (projectEl) {
      projectEl.style.transform = "translateX(-100%)";
      projectEl.style.opacity = "0";
      projectEl.style.transition = "all 0.5s ease-out";
    }

    try {
      const res = await deleteProject(project.slug);
      if (!res) throw new Error("Failed to delete project");

      toast.success("Project deleted successfully!");
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      setSelectedProjects((prev) => {
        const newSet = new Set(prev);
        newSet.delete(project.id);
        return newSet;
      });
    } catch (error) {
      console.error("Failed to delete project:", error);
      setError("Failed to delete project");
    }
  };

  const handleBatchDelete = async () => {
    setLoading(true);
    // const projectsToDelete = Array.from(selectedProjects);

    // Animate selected projects
    // projectsToDelete.forEach((projectId) => {
    //   const projectEl = document.querySelector(
    //     `[data-project-id="${projectId}"]`
    //   ) as HTMLElement | null;
    //   if (projectEl) {
    //     projectEl.style.transform = "scale(0.8)";
    //     projectEl.style.opacity = "0";
    //     projectEl.style.transition = "all 0.4s ease-out";
    //   }
    // });

    // try {
    //   const res = await batchDeleteProjects(projectsToDelete);
    //   if (!res || res.some((r) => !r.success)) {
    //     setError("Failed to delete projects");
    //   }

    //   setProjects((prev) => prev.filter((p) => !selectedProjects.has(p.id)));
    //   setSelectedProjects(new Set());
    //   setBatchDeleteDialog(false);
    //   toast.success("Selected projects deleted successfully!");
    // } catch (error) {
    //   console.error("Failed to delete projects:", error);
    // } finally {
    //   setLoading(false);
    // }
  };

  const handleDeleteAllProjects = async () => {
    setDeleteAllProjectsDialog(false);

    projects.forEach((project) => {
      const projectEl = document.querySelector(
        `[data-project-id="${project.id}"]`
      ) as HTMLElement | null;
      if (projectEl) {
        projectEl.style.transform = "rotateY(90deg)";
        projectEl.style.opacity = "0";
        projectEl.style.transition = "all 0.6s ease-out";
      }
    });

    try {
      const res = await deleteAllProjects();
      if (res === null) {
        toast.success("All projects deleted successfully!");
        setProjects([]);
        setSelectedProjects(new Set());
      } else {
        throw new Error("Failed to delete all projects");
      }
    } catch (error) {
      setError("Failed to delete all projects");
      console.error("Failed to delete all projects:", error);
      setProjects([]);
    }
  };

  // Filter projects
  const filteredProjects =
    Array.isArray(projects) && projects.length > 0
      ? projects
          .filter(
            (project) =>
              typeof project.name === "string" &&
              project.name.toLowerCase().includes(projectSearch.toLowerCase())
          )
          .sort((a, b) =>
            projectFilter === "Ascending"
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name)
          )
      : [];

  // Render components
  const renderProfileTab = () => (
    <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
      <CardHeader className="gap-0">
        <CardTitle className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal details and avatar
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
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
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-slate-300">
              Profile Avatar
            </label>
            <Button
              onClick={() => setAvatarDialogOpen(true)}
              variant="ghost"
              className="border-slate-600 hover:border-blue-400"
            >
              <Camera className="h-4 w-4" />
              Change Avatar
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Full Name
            </label>
            <Input
              value={userForm.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              className="bg-slate-900/50 border-slate-600 text-gray-400 focus:border-blue-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Email Address
            </label>
            <Input
              value={
                curentUserDetails === "github"
                  ? "GitHub has no email address"
                  : user?.email
              }
              disabled
              type="email"
              className="bg-slate-900/50 border-slate-600 focus:border-blue-400"
            />
          </div>
        </div>
        <div className="space-y-4 pt-4 border-t border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-400" />
            Change Password
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              ["currentPassword", "newPassword", "confirmPassword"] as const
            ).map((field) => (
              <div key={field} className="space-y-2">
                <label
                  className={clsx(
                    "text-sm font-medium text-slate-300",
                    isOAuthUser && "text-slate-500"
                  )}
                >
                  {field === "currentPassword"
                    ? "Current Password"
                    : field === "newPassword"
                    ? "New Password"
                    : "Confirm Password"}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword[field] ? "text" : "password"}
                    value={userForm[field]}
                    placeholder="********"
                    disabled={isOAuthUser}
                    onChange={(e) => handleFormChange(field, e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-gray-400 focus:border-blue-400 pr-10"
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-200"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        [field]: !prev[field],
                      }))
                    }
                  >
                    {showPassword[field] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderProjectsTab = () => (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Your Projects
              </CardTitle>
              <CardDescription>
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
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <div className="flex items-center gap-2 flex-1 min-w-[300px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search projects by name..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 focus:border-blue-400 pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="border-slate-600">
                    {projectFilter}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-700">
                  {["Ascending", "Descending"].map((order) => (
                    <DropdownMenuItem
                      key={order}
                      onClick={() => setProjectFilter(order)}
                      className="hover:bg-slate-700"
                    >
                      {order}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </Button>
              </div>
            )}
            <Button
              onClick={() => setDeleteAllProjectsDialog(true)}
              variant="destructive"
              disabled={projects.length === 0}
              className={clsx(
                "bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-600/30",
                projects.length === 0 && "cursor-not-allowed"
              )}
            >
              <Trash2 className="h-4 w-4" />
              Delete All
            </Button>
          </div>
          <div className="space-y-4">
            {filteredProjects.map((project) => (
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
                          if (checked) newSet.add(project.id);
                          else newSet.delete(project.id);
                          return newSet;
                        });
                      }}
                      className="border-slate-600"
                    />
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h3>
                      <div className="flex items-center text-sm text-slate-400 w-full flex-wrap gap-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created:{" "}
                          {format(new Date(project.createdAt), "MMM, dd, yyyy")}
                        </span>
                        <span
                          className={clsx(
                            project.errorCount > 0
                              ? "text-red-400"
                              : "text-green-400",
                            "flex items-center gap-1"
                          )}
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {project.errorCount} errors
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() =>
                        router.push(`/projects/${project.slug}?tab=settings`)
                      }
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-200"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() =>
                        setDeleteProjectDialog({ open: true, project })
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
            ))}
            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">
                  {projectSearch || projectFilter !== "Ascending"
                    ? "No projects match your filters"
                    : "No projects found"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDangerZoneTab = () => (
    <Card className="bg-red-950/20 border border-red-900/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-red-400">Danger Zone</CardTitle>
        <CardDescription className="text-red-400/80">
          Irreversible and destructive actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 flex items-center justify-between bg-red-950/30 rounded-lg border border-red-900/30">
            <div>
              <h4 className="font-medium text-red-300">Delete All Projects</h4>
              <p className="text-sm text-red-400/80 mt-1">
                Permanently delete all your projects and their data. This cannot
                be undone.
              </p>
            </div>
            <Button
              onClick={() => setDeleteAllProjectsDialog(true)}
              variant="destructive"
              disabled={projects.length === 0}
              className={clsx(
                "bg-red-600 hover:bg-red-700",
                projects.length === 0 && "cursor-not-allowed"
              )}
            >
              <Trash2 className="h-4 w-4" />
              Delete All Projects
            </Button>
          </div>
          <div className="p-4 flex items-center justify-between bg-red-950/30 rounded-lg border border-red-900/30">
            <div>
              <h4 className="font-medium text-red-300">Delete Account</h4>
              <p className="text-sm text-red-400/80 mt-1">
                Permanently delete your account and all associated data. This
                action is irreversible.
              </p>
            </div>
            <Button
              onClick={() => setDeleteAccountDialog({ open: true, step: 1 })}
              variant="destructive"
              className="bg-red-700 hover:bg-red-800"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAvatarDialog = () => (
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
                setAvatarDialogOpen(false);
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
  );

  const renderDeleteProjectDialog = () => (
    <Dialog
      open={deleteProjectDialog.open}
      onOpenChange={(open) => setDeleteProjectDialog({ open, project: null })}
    >
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delete Project
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;
            {deleteProjectDialog.project?.name}
            &quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button
            variant="secondary"
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
            <Trash2 className="h-4 w-4" />
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderBatchDeleteDialog = () => (
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
            <Trash2 className="h-4 w-4" />
            Delete {selectedProjects.size} Projects
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderDeleteAllProjectsDialog = () => (
    <Dialog
      open={deleteAllProjectsDialog}
      onOpenChange={setDeleteAllProjectsDialog}
    >
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-red-400 flex items-center gap-2">
            Delete All Projects
          </DialogTitle>
          <DialogDescription>
            This will permanently delete{" "}
            <b className="text-white/75">ALL {projects.length}</b> of your
            projects and their data. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-red-400/80 bg-red-950/30 p-3 rounded-lg border border-red-900/30">
            This is a destructive action that will remove all monitoring data,
            configurations, and history for all projects.
          </p>
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="secondary"
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
            <Trash2 className="h-4 w-4" />
            Delete All Projects
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-slate-400">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 text-white py-12">
      <div className="max-w-full lg:max-w-10/12 mx-auto">
        {error && <CustomErrorMessage error={error} />}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-full lg:max-w-10/12 mx-auto px-5 lg:p-0"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
              Account Settings
            </h1>
            <p className="text-gray-400 text-sm">
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
              type="submit"
              onClick={handleSaveChanges}
              disabled={!hasUnsavedChanges || isSaving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </motion.div>

        <div className="flex items-center justify-between border-b-2 border-slate-700/50 mb-4">
          <div className="flex space-x-6">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "projects", label: "Projects", icon: Database },
              { id: "danger", label: "Danger Zone", icon: AlertTriangle },
            ].map((tab) => (
              <h2
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-transparent border-b-2 cursor-pointer py-2 px-1 text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-b-2 border-b-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </h2>
            ))}
          </div>

          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="border-none text-slate-400 hover:text-slate-200"
          >
            Back Home
            <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
          </Button>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3">
            {activeTab === "profile" && renderProfileTab()}
            {activeTab === "projects" && renderProjectsTab()}
            {activeTab === "danger" && renderDangerZoneTab()}
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Avatar className="h-20 w-20 mx-auto ring-4 ring-blue-400/20">
                    <AvatarImage src={user?.avatar.String} />
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
                    <p className="text-slate-400 text-xs mb-2 mt-1">
                      Signed in with {curentUserDetails || "password"}
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        user?.avatar.Valid
                          ? "text-green-400 border-green-900/30"
                          : "border-purple-400/30 text-purple-400"
                      }
                    >
                      <BadgeCheckIcon />
                      {user?.avatar.Valid ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full border-slate-600 justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        {renderAvatarDialog()}
        {renderDeleteProjectDialog()}
        {renderBatchDeleteDialog()}
        {renderDeleteAllProjectsDialog()}

        <RenderDeleteAccountDialogComp
          isOpen={deleteAccountDialog.open}
          signedInWithGithub={curentUserDetails === "github"}
          onClose={() => setDeleteAccountDialog({ open: false, step: 1 })}
        />
      </motion.div>
    </div>
  );
}
