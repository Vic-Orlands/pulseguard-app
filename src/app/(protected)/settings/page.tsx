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
import { Zap, Sun, Moon, Briefcase, Users, Shield, Plus, Trash2, UserPlus, UserMinus, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import {
  listWorkspaceMembers,
  inviteMember,
  listInvitations,
  updateMemberRole,
  updateMemberStatus,
  removeWorkspaceMember,
  listTeams,
  createTeam,
  addTeamMember,
  removeTeamMember,
  listTeamMembers,
  type WorkspaceMember,
  type WorkspaceInvitation,
  type Team
} from "@/lib/api/workspace-api";
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
  const { user, setUser, activeWorkspace, fetchWorkspaces } = useAuth();
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

  // Workspace settings state
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [workspaceInvitations, setWorkspaceInvitations] = useState<WorkspaceInvitation[]>([]);
  const [workspaceTeams, setWorkspaceTeams] = useState<Team[]>([]);
  const [workspaceLoading, setWorkspaceLoading] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteRole, setInviteRole] = useState<string>("member");
  const [newTeamName, setNewTeamName] = useState<string>("");
  const [showInviteDialog, setShowInviteDialog] = useState<boolean>(false);
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState<boolean>(false);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [teamMembersMap, setTeamMembersMap] = useState<Record<string, string[]>>({}); // teamId -> list of userIds

  const fetchWorkspaceData = async () => {
    if (!activeWorkspace) return;
    setWorkspaceLoading(true);
    try {
      const [membersList, invitesList, teamsList] = await Promise.all([
        listWorkspaceMembers(activeWorkspace.id),
        listInvitations(activeWorkspace.id).catch(() => []),
        listTeams(activeWorkspace.id),
      ]);
      setWorkspaceMembers(membersList);
      setWorkspaceInvitations(invitesList);
      setWorkspaceTeams(teamsList);
    } catch (err) {
      console.error("Error fetching workspace data:", err);
      toast.error("Failed to load workspace data");
    } finally {
      setWorkspaceLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "workspace" && activeWorkspace) {
      fetchWorkspaceData();
    }
  }, [activeTab, activeWorkspace?.id]);

  const handleToggleTeamExpand = async (teamId: string) => {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null);
    } else {
      setExpandedTeamId(teamId);
      if (!teamMembersMap[teamId]) {
        try {
          const members = await listTeamMembers(activeWorkspace!.id, teamId);
          setTeamMembersMap((prev) => ({ ...prev, [teamId]: members }));
        } catch (err) {
          console.error("Error fetching team members:", err);
          toast.error("Failed to load team members");
        }
      }
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeWorkspace) return;
    try {
      await inviteMember(activeWorkspace.id, inviteEmail.trim(), inviteRole);
      toast.success("Invitation sent successfully!");
      setInviteEmail("");
      setShowInviteDialog(false);
      fetchWorkspaceData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to invite member");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!activeWorkspace) return;
    try {
      await updateMemberRole(activeWorkspace.id, userId, newRole);
      toast.success("Member role updated");
      fetchWorkspaceData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleUpdateStatus = async (userId: string, currentStatus: string) => {
    if (!activeWorkspace) return;
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    try {
      await updateMemberStatus(activeWorkspace.id, userId, newStatus);
      toast.success(`Member ${newStatus === "blocked" ? "blocked" : "unblocked"} successfully`);
      fetchWorkspaceData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!activeWorkspace) return;
    if (!confirm("Are you sure you want to remove this member from the workspace?")) return;
    try {
      await removeWorkspaceMember(activeWorkspace.id, userId);
      toast.success("Member removed from workspace");
      fetchWorkspaceData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !activeWorkspace) return;
    try {
      await createTeam(activeWorkspace.id, newTeamName.trim());
      toast.success("Team created successfully!");
      setNewTeamName("");
      setShowCreateTeamDialog(false);
      fetchWorkspaceData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create team");
    }
  };

  const handleAddMemberToTeam = async (teamId: string, memberId: string) => {
    if (!activeWorkspace) return;
    try {
      await addTeamMember(activeWorkspace.id, teamId, memberId);
      toast.success("Member added to team");
      const members = await listTeamMembers(activeWorkspace.id, teamId);
      setTeamMembersMap((prev) => ({ ...prev, [teamId]: members }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add member to team");
    }
  };

  const handleRemoveMemberFromTeam = async (teamId: string, memberId: string) => {
    if (!activeWorkspace) return;
    try {
      await removeTeamMember(activeWorkspace.id, teamId, memberId);
      toast.success("Member removed from team");
      const members = await listTeamMembers(activeWorkspace.id, teamId);
      setTeamMembersMap((prev) => ({ ...prev, [teamId]: members }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member from team");
    }
  };

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
    <Card className="pg-panel shadow-none rounded-xl border border-[#dfdfda]">
      <CardHeader className="py-3 px-4 border-b border-[#dfdfda]/50">
        <CardTitle className="text-xs font-semibold text-[#1d1d1b]">
          Profile Information
        </CardTitle>
        <CardDescription className="text-[10px] text-[#73736e] mt-0.5">
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
      <Card className="pg-panel shadow-none rounded-xl border border-[#dfdfda]">
        <CardHeader className="py-3 px-4 border-b border-[#dfdfda]/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs font-semibold text-[#1d1d1b]">
                Your Projects
              </CardTitle>
              <CardDescription className="text-[10px] text-[#73736e] mt-0.5">
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
    <Card className="pg-panel shadow-none rounded-xl border border-[#dfdfda]">
      <CardHeader className="py-3 px-4 border-b border-[#dfdfda]/50">
        <CardTitle className="text-xs font-semibold text-[#1d1d1b]">
          Appearance Settings
        </CardTitle>
        <CardDescription className="text-[10px] text-[#73736e] mt-0.5">
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
    <Card className="bg-red-500/5 border border-destructive/20 shadow-none rounded-xl">
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

  );

  const renderWorkspaceTab = () => {
    const currentUserRole = workspaceMembers.find((m) => m.userId === user?.id)?.role || "member";
    const isAuthorized = currentUserRole === "owner" || currentUserRole === "admin";

    // Filter workspace members that are not in the expanded team to allow adding them
    const getNonTeamMembers = (teamId: string) => {
      const teamUserIds = teamMembersMap[teamId] || [];
      return workspaceMembers.filter(
        (m) => m.status === "active" && !teamUserIds.includes(m.userId)
      );
    };

    return (
      <div className="space-y-6">
        {/* Members Management */}
        <Card className="bg-white border border-[#dfdfda] shadow-none rounded-xl">
          <CardHeader className="py-3 px-4 border-b border-[#dfdfda] flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-semibold text-foreground">Workspace Members</CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground mt-0.5">
                Manage members, roles, and status for your workspace.
              </CardDescription>
            </div>
            {isAuthorized && (
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#171716] text-white hover:bg-[#ff5a1f] text-xs h-7 font-semibold px-3 rounded-lg shadow-none flex items-center gap-1.5 cursor-pointer">
                    <UserPlus className="h-3.5 w-3.5" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border border-border text-foreground max-w-sm rounded-lg p-0 overflow-hidden">
                  <DialogHeader className="p-4 border-b border-border/50">
                    <DialogTitle className="text-xs font-bold flex items-center gap-1.5">
                      Invite new member
                    </DialogTitle>
                    <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
                      Send an invitation link to add a user to this workspace.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteMember} className="p-4 space-y-4">
                    <div>
                      <label htmlFor="invite-email" className="block text-[10px] font-semibold text-muted-foreground mb-1.5">
                        Email Address
                      </label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="user@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="bg-white border border-[#dfdfda] text-[#1d1d1b] text-xs h-8 rounded-lg focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="invite-role" className="block text-[10px] font-semibold text-muted-foreground mb-1.5">
                        Role
                      </label>
                      <select
                        id="invite-role"
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="block w-full py-1.5 px-3 bg-white border border-[#dfdfda] rounded-lg text-xs text-[#1d1d1b] focus:outline-none focus:border-[#ff5a1f]"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <DialogFooter className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowInviteDialog(false)}
                        className="border-border text-xs h-8 px-3 shadow-none font-semibold cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#ff5a1f] text-white hover:bg-[#e04e18] text-xs h-8 px-3 shadow-none font-semibold cursor-pointer"
                      >
                        Send Invite
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {workspaceLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin text-[#ff5a1f]" />
                Loading members...
              </div>
            ) : (
              <div className="divide-y divide-[#dfdfda]">
                {workspaceMembers.map((member) => (
                  <div key={member.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src={normalizePostgresString(member.userAvatar)} />
                        <AvatarFallback className="bg-[#f7f7f5] text-[#73736e] font-semibold text-xs">
                          {member.userName?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-foreground">{member.userName}</p>
                          <Badge className={`text-[8px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded-full ${
                            member.role === "owner"
                              ? "bg-red-500/10 text-red-600 border border-red-500/20"
                              : member.role === "admin"
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                          }`}>
                            {member.role}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{member.userEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAuthorized && member.role !== "owner" && member.userId !== user?.id ? (
                        <>
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.userId, e.target.value)}
                            className="bg-white border border-[#dfdfda] rounded-lg text-[10px] font-semibold py-1 px-2 focus:outline-none cursor-pointer"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(member.userId, member.status)}
                            className={`text-[10px] font-semibold h-7 px-2 cursor-pointer rounded-lg shadow-none ${
                              member.status === "blocked"
                                ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            }`}
                          >
                            {member.status === "blocked" ? "Unblock" : "Block"}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.userId)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7 rounded-lg shadow-none cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-[10px] text-muted-foreground capitalize">{member.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations list */}
        {workspaceInvitations.length > 0 && (
          <Card className="bg-white border border-[#dfdfda] shadow-none rounded-xl">
            <CardHeader className="py-3 px-4 border-b border-[#dfdfda]">
              <CardTitle className="text-xs font-semibold text-foreground">Pending Invitations</CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground mt-0.5">
                These users have been invited but haven&apos;t joined the workspace yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-[#dfdfda]">
              {workspaceInvitations.map((invite) => {
                const inviteUrl = typeof window !== "undefined"
                  ? `${window.location.origin}/accept-invite?token=${invite.token}`
                  : `/accept-invite?token=${invite.token}`;

                return (
                  <div key={invite.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-foreground">{invite.email}</p>
                        <Badge className="text-[8px] uppercase tracking-wide font-bold bg-muted text-muted-foreground border border-border px-1.5 py-0.5 rounded-full">
                          {invite.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={inviteUrl}
                          className="bg-[#f7f7f5] text-[#73736e] text-[9px] px-2 py-0.5 border border-[#dfdfda] rounded-md w-64 select-all outline-none"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(inviteUrl);
                            toast.success("Invite link copied!");
                          }}
                          className="h-6 w-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground shadow-none cursor-pointer"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      Expires: {format(new Date(invite.expiresAt), "MMM d, yyyy")}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Teams Management */}
        <Card className="bg-white border border-[#dfdfda] shadow-none rounded-xl">
          <CardHeader className="py-3 px-4 border-b border-[#dfdfda] flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-semibold text-foreground">Workspace Teams</CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground mt-0.5">
                Group members into sub-tenant teams to manage alerts or logs access.
              </CardDescription>
            </div>
            {isAuthorized && (
              <Dialog open={showCreateTeamDialog} onOpenChange={setShowCreateTeamDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#171716] text-white hover:bg-[#ff5a1f] text-xs h-7 font-semibold px-3 rounded-lg shadow-none flex items-center gap-1.5 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border border-border text-foreground max-w-sm rounded-lg p-0 overflow-hidden">
                  <DialogHeader className="p-4 border-b border-border/50">
                    <DialogTitle className="text-xs font-bold">Create new team</DialogTitle>
                    <DialogDescription className="text-[10px] text-muted-foreground mt-0.5">
                      Define a sub-tenant team within your workspace.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateTeam} className="p-4 space-y-4">
                    <div>
                      <label htmlFor="team-name" className="block text-[10px] font-semibold text-muted-foreground mb-1.5">
                        Team Name
                      </label>
                      <Input
                        id="team-name"
                        type="text"
                        placeholder="e.g. Frontend, Backend"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        className="bg-white border border-[#dfdfda] text-[#1d1d1b] text-xs h-8 rounded-lg focus:outline-none"
                        required
                      />
                    </div>
                    <DialogFooter className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateTeamDialog(false)}
                        className="border-border text-xs h-8 px-3 shadow-none font-semibold cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#ff5a1f] text-white hover:bg-[#e04e18] text-xs h-8 px-3 shadow-none font-semibold cursor-pointer"
                      >
                        Create
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="p-0 divide-y divide-[#dfdfda]">
            {workspaceTeams.map((team) => {
              const isExpanded = expandedTeamId === team.id;
              const teamUserIds = teamMembersMap[team.id] || [];
              const nonTeamMembers = getNonTeamMembers(team.id);

              return (
                <div key={team.id} className="p-4 space-y-3">
                  <div
                    onClick={() => handleToggleTeamExpand(team.id)}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#ff5a1f]" />
                      <p className="text-xs font-semibold text-foreground group-hover:text-[#ff5a1f] transition-all">
                        #{team.name}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="pl-6 space-y-3 border-l border-[#dfdfda] mt-2"
                    >
                      {/* List Team Members */}
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">
                          Team Members
                        </p>
                        {teamUserIds.length === 0 ? (
                          <p className="text-[10px] text-muted-foreground italic">No members in this team yet.</p>
                        ) : (
                          <div className="space-y-1">
                            {teamUserIds.map((userId) => {
                              const memberDetails = workspaceMembers.find((m) => m.userId === userId);
                              if (!memberDetails) return null;

                              return (
                                <div key={userId} className="flex items-center justify-between bg-[#f7f7f5]/40 p-2 rounded-lg border border-[#e4e4df] max-w-md">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5 border border-border">
                                      <AvatarImage src={normalizePostgresString(memberDetails.userAvatar)} />
                                      <AvatarFallback className="text-[8px] font-bold">
                                        {memberDetails.userName?.substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-[10px] font-medium text-foreground">{memberDetails.userName}</span>
                                  </div>
                                  {isAuthorized && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveMemberFromTeam(team.id, userId)}
                                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-5 w-5 rounded-md shadow-none cursor-pointer"
                                    >
                                      <UserMinus className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Add Member Dropdown */}
                      {isAuthorized && nonTeamMembers.length > 0 && (
                        <div className="flex items-center gap-2 pt-2">
                          <span className="text-[10px] font-semibold text-muted-foreground">Add Member:</span>
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAddMemberToTeam(team.id, e.target.value);
                                e.target.value = "";
                              }
                            }}
                            className="bg-white border border-[#dfdfda] rounded-lg text-[10px] font-semibold py-1 px-2.5 focus:outline-none cursor-pointer"
                          >
                            <option value="" disabled>Select member...</option>
                            {nonTeamMembers.map((m) => (
                              <option key={m.userId} value={m.userId}>
                                {m.userName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  };

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
    <div className="pg-page pg-grid min-h-screen py-10 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] opacity-40 [background-image:radial-gradient(circle_at_50%_100%,rgba(255,90,31,.14),transparent_44%)]"
      />
      <div className="pg-shell px-6 z-10 relative">
        {error && <CustomErrorMessage error={error} />}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pg-shell px-6 z-10 relative"
      >
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
        >
          <div>
            <h1 className="text-lg font-bold text-[#1d1d1b] mb-0.5">
              Account Settings
            </h1>
            <p className="text-[#73736e] text-xs">
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
              className="bg-[#171716] text-white hover:bg-[#ff5a1f] text-xs h-8 font-semibold shadow-none px-4 rounded-lg cursor-pointer"
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

        <div className="flex items-center justify-between border-b border-[#dfdfda] mb-6">
          <div className="flex space-x-4">
            {[
              { id: "profile", label: "Profile", icon: UserIcon, isHuge: true },
              { id: "projects", label: "Projects", icon: DatabaseIcon, isHuge: true },
              { id: "workspace", label: "Workspace Settings", icon: Briefcase, isHuge: false },
              { id: "appearance", label: "Appearance", icon: Settings01Icon, isHuge: true },
              { id: "danger", label: "Danger Zone", icon: Alert01Icon, isHuge: true },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 border-b-2 cursor-pointer py-2 px-1 text-xs font-semibold transition-all duration-200 h-9 ${
                  activeTab === tab.id
                    ? "border-[#ff5a1f] text-[#1d1d1b]"
                    : "border-transparent text-[#73736e] hover:text-[#1d1d1b]"
                }`}
              >
                {tab.isHuge ? (
                  <HugeiconsIcon icon={tab.icon as any} className="h-3.5 w-3.5" />
                ) : (
                  <tab.icon className="h-3.5 w-3.5" />
                )}
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="border-none text-[#73736e] hover:text-[#1d1d1b] text-xs hover:bg-[#f7f7f5] rounded-lg cursor-pointer"
          >
            Back Home
            <HugeiconsIcon icon={ArrowDown01Icon} className="h-3.5 w-3.5 rotate-[-90deg] ml-1.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            {activeTab === "profile" && renderProfileTab()}
            {activeTab === "projects" && renderProjectsTab()}
            {activeTab === "workspace" && renderWorkspaceTab()}
            {activeTab === "appearance" && renderAppearanceTab()}
            {activeTab === "danger" && renderDangerZoneTab()}
          </div>

          <div className="space-y-6">
            <Card className="pg-panel shadow-none rounded-xl border border-[#dfdfda]">
              <CardContent className="p-5">
                <div className="text-center space-y-3">
                  <Avatar className="h-14 w-14 mx-auto border border-[#dfdfda]">
                    <AvatarImage src={userForm.avatar} />
                    <AvatarFallback className="bg-white text-[#73736e] font-bold text-lg">
                      {userForm.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-[#1d1d1b] text-sm">
                      {user?.name}
                    </h3>
                    <p className="text-[#73736e] text-[10px] mb-2 mt-0.5">
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

            <Card className="pg-panel shadow-none rounded-xl border border-[#dfdfda]">
              <CardHeader className="py-3 px-4 border-b border-[#dfdfda]/50">
                <CardTitle className="text-xs font-semibold text-[#1d1d1b] flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-[#ff5a1f]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <Button
                  variant="outline"
                  className="w-full bg-white border-[#dfdfda] text-[#1d1d1b] hover:bg-[#f7f7f5] text-xs justify-start h-8 shadow-none rounded-lg cursor-pointer"
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
