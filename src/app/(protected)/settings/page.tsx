"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert01Icon,
  ArrowDown01Icon,
  Calendar01Icon,
  Camera01Icon,
  CheckmarkBadge01Icon,
  DatabaseIcon,
  Delete02Icon,
  Download01Icon,
  FloppyDiskIcon,
  Loading02Icon,
  LockIcon,
  Refresh01Icon,
  Search01Icon,
  Settings01Icon,
  UserIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import clsx from "clsx";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sun, Moon } from "lucide-react";
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
import { useTheme } from "next-themes";

import { UserFormSchema, type UserFormType } from "@/types/settings";

const url = process.env.NEXT_PUBLIC_API_URL;

export default function UserSettingsNew() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);
  }, []);

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
    // Left unimplemented in the original codebase
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
    <Card className="bg-card border border-border shadow-none rounded-lg">
      <CardHeader className="py-3 px-4 border-b border-border/50">
        <CardTitle className="text-xs font-semibold text-foreground">
          Profile Information
        </CardTitle>
        <CardDescription className="text-[10px] text-muted-foreground mt-0.5">
          Update your personal details and avatar
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3.5">
          <Avatar className="h-12 w-12 border border-border">
            <AvatarImage src={userForm.avatar} />
            <AvatarFallback className="bg-muted text-muted-foreground font-bold text-sm">
              {userForm.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground">
              Profile Avatar
            </label>
            <Button
              onClick={() => setAvatarDialogOpen(true)}
              variant="outline"
              className="border-border text-foreground hover:bg-muted text-xs h-7 px-2.5 shadow-none"
            >
              <HugeiconsIcon icon={Camera01Icon} className="h-3.5 w-3.5 mr-1.5" />
              Change Avatar
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">
              Full Name
            </label>
            <Input
              value={userForm.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              className="bg-card border-border text-foreground text-xs h-8 shadow-none focus-visible:ring-1"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80">
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
              className="bg-muted border-border text-muted-foreground text-xs h-8 shadow-none"
            />
          </div>
        </div>
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <HugeiconsIcon icon={LockIcon} className="h-4 w-4 text-amber-500" />
            Change Password
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(
              ["currentPassword", "newPassword", "confirmPassword"] as const
            ).map((field) => (
              <div key={field} className="space-y-1.5">
                <label
                  className={clsx(
                    "text-xs font-semibold text-foreground/80",
                    isOAuthUser && "text-muted-foreground/60"
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
                    className="bg-card border-border text-foreground text-xs h-8 shadow-none pr-9 focus-visible:ring-1"
                  />
                  <span
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        [field]: !prev[field],
                      }))
                    }
                  >
                    {showPassword[field] ? (
                      <HugeiconsIcon icon={ViewOffIcon} className="h-3.5 w-3.5" />
                    ) : (
                      <HugeiconsIcon icon={ViewIcon} className="h-3.5 w-3.5" />
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
    <div className="space-y-4">
      <Card className="bg-card border border-border shadow-none rounded-lg">
        <CardHeader className="py-3 px-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs font-semibold text-foreground">
                Your Projects
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground mt-0.5">
                Manage all your monitoring projects
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-border text-foreground text-xs px-2 py-0.5 shadow-none"
            >
              {projects.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <div className="flex items-center gap-2 flex-grow min-w-[200px]">
              <div className="relative flex-1">
                <HugeiconsIcon icon={Search01Icon} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="bg-card border-border text-foreground text-xs h-8 shadow-none pl-8 focus-visible:ring-1"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-border text-xs h-8 px-2.5 shadow-none gap-1.5">
                    {projectFilter}
                    <HugeiconsIcon icon={ArrowDown01Icon} className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border border-border text-foreground rounded-lg shadow-sm">
                  {["Ascending", "Descending"].map((order) => (
                    <DropdownMenuItem
                      key={order}
                      onClick={() => setProjectFilter(order)}
                      className="hover:bg-muted text-xs cursor-pointer"
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
                  className="bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400 text-[10px] px-1.5 py-0.5 rounded font-semibold shadow-none"
                >
                  {selectedProjects.size} selected
                </Badge>
                <Button
                  onClick={() => setBatchDeleteDialog(true)}
                  variant="destructive"
                  className="bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 text-xs h-8 px-2.5 rounded shadow-none font-semibold"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5 mr-1.5" />
                  Delete Selected
                </Button>
              </div>
            )}
            <Button
              onClick={() => setDeleteAllProjectsDialog(true)}
              variant="destructive"
              disabled={projects.length === 0}
              className={clsx(
                "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 text-xs h-8 px-2.5 rounded shadow-none font-semibold",
                projects.length === 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5 mr-1.5" />
              Delete All
            </Button>
          </div>
          <div className="space-y-2">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                data-project-id={project.id}
                className="group p-3 bg-muted/20 border border-border rounded-lg hover:border-muted-foreground/30 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
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
                      className="border-border rounded shadow-none"
                    />
                    <div className="space-y-0.5">
                      <h3 className="font-semibold text-foreground text-xs group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <div className="flex items-center text-[10px] text-muted-foreground gap-3">
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={Calendar01Icon} className="h-3 w-3" />
                          Created:{" "}
                          {format(new Date(project.createdAt), "MMM dd, yyyy")}
                        </span>
                        <span
                          className={clsx(
                            project.errorCount > 0
                              ? "text-red-500"
                              : "text-emerald-500",
                            "flex items-center gap-1 font-semibold"
                          )}
                        >
                          <HugeiconsIcon icon={Alert01Icon} className="h-3 w-3" />
                          {project.errorCount} error{project.errorCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() =>
                        router.push(`/projects/${project.slug}?tab=settings`)
                      }
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground h-7 w-7 hover:bg-muted"
                    >
                      <HugeiconsIcon icon={Settings01Icon} className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      onClick={() =>
                        setDeleteProjectDialog({ open: true, project })
                      }
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 h-7 w-7 hover:bg-red-500/10"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredProjects.length === 0 && (
              <div className="text-center py-8">
                <HugeiconsIcon icon={DatabaseIcon} className="h-8 w-8 text-muted-foreground/45 mx-auto mb-2" />
                <p className="text-muted-foreground text-xs">
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

  const renderAppearanceTab = () => (
    <Card className="bg-card border border-border shadow-none rounded-lg">
      <CardHeader className="py-3 px-4 border-b border-border/50">
        <CardTitle className="text-xs font-semibold text-foreground">
          Appearance Settings
        </CardTitle>
        <CardDescription className="text-[10px] text-muted-foreground mt-0.5">
          Customize the visual theme of your dashboard preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setTheme("light")}
            className={clsx(
              "p-4 rounded-lg border text-left transition-all duration-200 cursor-pointer",
              mounted && theme === "light"
                ? "border-primary bg-muted/40"
                : "border-border hover:border-muted-foreground/30"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground">Light Mode</span>
              <Sun className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Default light slate design for clear visibility in bright settings.
            </p>
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={clsx(
              "p-4 rounded-lg border text-left transition-all duration-200 cursor-pointer",
              mounted && theme === "dark"
                ? "border-primary bg-muted/40"
                : "border-border hover:border-muted-foreground/30"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground">Dark Mode</span>
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Low-light zinc theme to reduce eye strain in darker environments.
            </p>
          </button>
        </div>
      </CardContent>
    </Card>
  );

  const renderDangerZoneTab = () => (
    <Card className="bg-destructive/5 border border-destructive/20 shadow-none rounded-lg">
      <CardHeader className="py-3 px-4 border-b border-destructive/25">
        <CardTitle className="text-xs font-semibold text-destructive">Danger Zone</CardTitle>
        <CardDescription className="text-[10px] text-destructive/80 mt-0.5">
          Irreversible and destructive actions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-3">
          <div className="p-3 flex items-center justify-between bg-destructive/5 rounded-lg border border-destructive/20 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-destructive">Delete All Projects</h4>
              <p className="text-[10px] text-destructive/80 mt-0.5">
                Permanently delete all your projects and their data. This cannot be undone.
              </p>
            </div>
            <Button
              onClick={() => setDeleteAllProjectsDialog(true)}
              variant="destructive"
              disabled={projects.length === 0}
              className={clsx(
                "bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8 px-2.5 shadow-none font-semibold",
                projects.length === 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5 mr-1.5" />
              Delete All
            </Button>
          </div>
          <div className="p-3 flex items-center justify-between bg-destructive/5 rounded-lg border border-destructive/20 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-destructive">Delete Account</h4>
              <p className="text-[10px] text-destructive/80 mt-0.5">
                Permanently delete your account and all associated data. This action is irreversible.
              </p>
            </div>
            <Button
              onClick={() => setDeleteAccountDialog({ open: true, step: 1 })}
              variant="destructive"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8 px-2.5 shadow-none font-semibold"
            >
              <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5 mr-1.5" />
              Delete Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAvatarDialog = () => (
    <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
      <DialogContent className="bg-card border border-border text-foreground max-w-sm rounded-lg p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border/50">
          <DialogTitle className="text-xs font-bold text-foreground">
            Choose Avatar
          </DialogTitle>
          <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
            Select a new avatar for your profile
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 p-4">
          {availableAvatars.map((avatar, index) => (
            <button
              key={index}
              onClick={() => {
                handleFormChange("avatar", avatar);
                setAvatarDialogOpen(false);
              }}
              className={clsx(
                "p-1.5 rounded-lg border transition-all duration-200 cursor-pointer flex items-center justify-center",
                userForm.avatar === avatar
                  ? "border-primary bg-muted"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatar} />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderDeleteProjectDialog = () => (
    <Dialog
      open={deleteProjectDialog.open}
      onOpenChange={(open) => setDeleteProjectDialog({ open, project: null })}
    >
      <DialogContent className="bg-card border border-border text-foreground max-w-sm rounded-lg p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border/50">
          <DialogTitle className="text-xs font-bold text-destructive flex items-center gap-1.5">
            <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
            Delete Project
          </DialogTitle>
          <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
            Are you sure you want to delete &quot;{deleteProjectDialog.project?.name}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="p-3 bg-muted/10 border-t border-border/50 flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() =>
              setDeleteProjectDialog({ open: false, project: null })
            }
            className="border-border text-xs h-8 px-3 shadow-none font-semibold"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDeleteProject(deleteProjectDialog.project)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8 px-3 shadow-none font-semibold"
          >
            <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5 mr-1.5" />
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderBatchDeleteDialog = () => (
    <Dialog open={batchDeleteDialog} onOpenChange={setBatchDeleteDialog}>
      <DialogContent className="bg-card border border-border text-foreground max-w-sm rounded-lg p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border/50">
          <DialogTitle className="text-xs font-bold text-destructive flex items-center gap-1.5">
            <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
            Delete Selected Projects
          </DialogTitle>
          <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
            Are you sure you want to delete {selectedProjects.size} selected projects? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="p-3 bg-muted/10 border-t border-border/50 flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setBatchDeleteDialog(false)}
            className="border-border text-xs h-8 px-3 shadow-none font-semibold"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleBatchDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8 px-3 shadow-none font-semibold"
          >
            <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5 mr-1.5" />
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
      <DialogContent className="bg-card border border-border text-foreground max-w-sm rounded-lg p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border/50">
          <DialogTitle className="text-xs font-bold text-destructive flex items-center gap-1.5">
            <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
            Delete All Projects
          </DialogTitle>
          <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
            This will permanently delete all {projects.length} of your projects and their data. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/25 leading-relaxed">
            This is a destructive action that will remove all monitoring data, configurations, and history for all projects.
          </p>
        </div>
        <DialogFooter className="p-3 bg-muted/10 border-t border-border/50 flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => setDeleteAllProjectsDialog(false)}
            className="border-border text-xs h-8 px-3 shadow-none font-semibold"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAllProjects}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8 px-3 shadow-none font-semibold"
          >
            <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5 mr-1.5" />
            Delete All Projects
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <HugeiconsIcon icon={Loading02Icon} className="h-6 w-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-10">
      <div className="max-w-full lg:max-w-10/12 mx-auto">
        {error && <CustomErrorMessage error={error} />}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-full lg:max-w-10/12 mx-auto px-5 lg:p-0"
      >
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
        >
          <div>
            <h1 className="text-lg font-bold text-foreground mb-0.5">
              Account Settings
            </h1>
            <p className="text-muted-foreground text-xs">
              Manage your account, projects, and preferences
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AnimatePresence>
              {hasUnsavedChanges && (
                <motion.div
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-semibold"
                >
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  Unsaved changes
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              onClick={handleSaveChanges}
              disabled={!hasUnsavedChanges || isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs h-8 font-semibold shadow-none px-4 rounded-md"
            >
              {isSaving ? (
                <>
                  <HugeiconsIcon icon={Refresh01Icon} className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={FloppyDiskIcon} className="h-3.5 w-3.5 mr-1.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-border mb-6">
          <div className="flex space-x-4">
            {[
              { id: "profile", label: "Profile", icon: UserIcon },
              { id: "projects", label: "Projects", icon: DatabaseIcon },
              { id: "appearance", label: "Appearance", icon: Settings01Icon },
              { id: "danger", label: "Danger Zone", icon: Alert01Icon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 border-b-2 cursor-pointer py-2 px-1 text-xs font-semibold transition-all duration-200 h-9 ${
                  activeTab === tab.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <HugeiconsIcon icon={tab.icon} className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="border-none text-muted-foreground hover:text-foreground text-xs hover:bg-muted"
          >
            Back Home
            <HugeiconsIcon icon={ArrowDown01Icon} className="h-3.5 w-3.5 rotate-[-90deg] ml-1.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            {activeTab === "profile" && renderProfileTab()}
            {activeTab === "projects" && renderProjectsTab()}
            {activeTab === "appearance" && renderAppearanceTab()}
            {activeTab === "danger" && renderDangerZoneTab()}
          </div>

          <div className="space-y-6">
            <Card className="bg-card border border-border shadow-none rounded-lg">
              <CardContent className="p-5">
                <div className="text-center space-y-3">
                  <Avatar className="h-14 w-14 mx-auto border border-border">
                    <AvatarImage src={userForm.avatar} />
                    <AvatarFallback className="bg-muted text-muted-foreground font-bold text-lg">
                      {userForm.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">
                      {user?.name}
                    </h3>
                    <p className="text-muted-foreground text-[10px] mb-2 mt-0.5">
                      Signed in with {curentUserDetails || "password"}
                    </p>
                    <Badge
                      variant="outline"
                      className={clsx(
                        "text-[9px] px-1.5 py-0.5 font-semibold rounded shadow-none border",
                        user?.avatar.Valid
                          ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30"
                          : "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/30"
                      )}
                    >
                      <HugeiconsIcon icon={CheckmarkBadge01Icon} className="h-3 w-3 mr-1" />
                      {user?.avatar.Valid ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border border-border shadow-none rounded-lg">
              <CardHeader className="py-3 px-4 border-b border-border/50">
                <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted text-xs justify-start h-8 shadow-none"
                >
                  <HugeiconsIcon icon={Download01Icon} className="h-3.5 w-3.5 mr-2" />
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
