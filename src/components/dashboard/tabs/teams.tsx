"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Add01Icon, Delete02Icon, Mail01Icon, PencilEdit01Icon, UserGroupIcon } from "@/components/phosphor-icons";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteWorkspace,
  getWorkspaceUsage,
  inviteMember,
  listInvitations,
  listWorkspaceMembers,
  removeWorkspaceMember,
  updateMemberAccess,
  updateMemberRole,
  updateWorkspace,
  type WorkspaceInvitation,
  type WorkspaceMember,
  type WorkspaceUsage,
} from "@/lib/api/workspace-api";
import { CustomAlertDialog } from "@/components/dashboard/shared/custom-alert-dialog";
import { PageSkeleton } from "@/components/dashboard/shared/page-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Project } from "@/types/dashboard";
import { useRouter } from "next/navigation";
import { jsonAuthConfig } from "@/lib/security/csrf";
import { clearLastProjectSlug, getPostAuthPath } from "@/lib/last-project";

const url = process.env.NEXT_PUBLIC_API_URL;

export default function WorkspaceMembersTab() {
  const router = useRouter();
  const { user, activeWorkspace, fetchWorkspaces, setActiveWorkspace, workspaces } =
    useAuth();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvitation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [accessMember, setAccessMember] = useState<WorkspaceMember | null>(null);
  const [accessAllProjects, setAccessAllProjects] = useState(true);
  const [accessProjectIds, setAccessProjectIds] = useState<string[]>([]);
  const [usage, setUsage] = useState<WorkspaceUsage | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [allProjects, setAllProjects] = useState(true);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [workspaceName, setWorkspaceName] = useState(activeWorkspace?.name ?? "");
  const [renaming, setRenaming] = useState(false);

  const workspaceId = activeWorkspace?.id;
  const currentMember = members.find((member) => member.userId === user?.id);
  const canAdmin =
    currentMember?.role === "owner" || currentMember?.role === "admin";

  const load = async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [memberRows, inviteRows, projectRes, usageRow] = await Promise.all([
        listWorkspaceMembers(workspaceId),
        listInvitations(workspaceId).catch(() => [] as WorkspaceInvitation[]),
        fetch(`${url}/api/projects?workspaceId=${workspaceId}`, {
          ...jsonAuthConfig(),
        }),
        getWorkspaceUsage(workspaceId).catch(() => null),
      ]);
      setMembers(memberRows);
      setInvites(inviteRows.filter((item) => item.status === "pending"));
      setUsage(usageRow);
      if (projectRes.ok) {
        setProjects(await projectRes.json());
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load workspace members",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setWorkspaceName(activeWorkspace?.name ?? "");
    void load();
  }, [workspaceId]);

  const projectNameById = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project.name])),
    [projects],
  );

  const toggleProject = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleInvite = async () => {
    if (!workspaceId || !inviteEmail.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!allProjects && selectedProjectIds.length === 0) {
      toast.error("Select at least one project, or give access to all projects");
      return;
    }
    setSaving(true);
    try {
      await inviteMember(
        workspaceId,
        inviteEmail.trim(),
        inviteRole,
        allProjects,
        selectedProjectIds,
      );
      toast.success("Invitation sent");
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      setAllProjects(true);
      setSelectedProjectIds([]);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to invite");
    } finally {
      setSaving(false);
    }
  };

  const openAccess = (member: WorkspaceMember) => {
    setAccessMember(member);
    setAccessAllProjects(member.allProjects !== false);
    setAccessProjectIds(member.projectIds ?? []);
  };

  const handleAccessSave = async () => {
    if (!workspaceId || !accessMember) return;
    if (!accessAllProjects && accessProjectIds.length === 0) {
      toast.error("Select at least one project, or give access to all projects");
      return;
    }
    setSaving(true);
    try {
      await updateMemberAccess(
        workspaceId,
        accessMember.userId,
        accessAllProjects,
        accessProjectIds,
      );
      toast.success("Project access updated");
      setAccessMember(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update access");
    } finally {
      setSaving(false);
    }
  };

  const handleRename = async () => {
    if (!workspaceId || !workspaceName.trim()) return;
    setRenaming(true);
    try {
      const updated = await updateWorkspace(workspaceId, workspaceName.trim());
      setActiveWorkspace(updated);
      await fetchWorkspaces();
      toast.success("Workspace renamed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename");
    } finally {
      setRenaming(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspaceId) return;
    try {
      await deleteWorkspace(workspaceId);
      toast.success("Workspace deleted");
      await fetchWorkspaces();
      const next = workspaces.find((item) => item.id !== workspaceId);
      if (next) {
        setActiveWorkspace(next);
      }
      clearLastProjectSlug();
      router.push(getPostAuthPath());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete workspace");
    }
  };

  const accessLabel = (member: WorkspaceMember) => {
    if (member.allProjects !== false) return "All projects";
    const names = (member.projectIds ?? [])
      .map((id) => projectNameById[id] ?? "Project")
      .slice(0, 3);
    if (!names.length) return "No projects";
    const extra = (member.projectIds?.length ?? 0) - names.length;
    return extra > 0 ? `${names.join(", ")} +${extra}` : names.join(", ");
  };

  if (!workspaceId) {
    return (
      <p className="text-xs text-pg-muted">Select a workspace to manage members.</p>
    );
  }

  return (
    <div className="space-y-6">
      {canAdmin ? (
        <div className="rounded-lg bg-pg-group p-4">
          <p className="mb-2 text-xs font-medium text-pg-text">Workspace</p>
          <div className="flex gap-2">
            <Input
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              className="h-9 text-sm"
              disabled={!canAdmin}
            />
            <Button
              className="btn-primary h-9 text-xs"
              onClick={() => void handleRename()}
              loading={renaming}
              loadingText="Saving..."
              disabled={workspaceName.trim() === activeWorkspace?.name}
            >
              Rename
            </Button>
          </div>
        </div>
      ) : null}

      {usage ? (
        <div className="rounded-lg bg-pg-group p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-pg-text">Plan & usage</p>
              <p className="text-[11px] text-pg-muted">
                {usage.plan === "pro" ? "Pro" : "Free"} · resets{" "}
                {new Date(usage.resetsAt).toLocaleDateString()}
              </p>
            </div>
            {usage.plan !== "pro" ? (
              <a
                href="mailto:hello@pulseguard.dev?subject=PulseGuard%20Pro"
                className="text-[11px] font-medium text-pg-text underline underline-offset-2"
              >
                Upgrade
              </a>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div>
              <p className="text-pg-muted">Events</p>
              <p className="mt-0.5 text-pg-text">
                {usage.eventsUsed.toLocaleString()} / {usage.monthlyEvents.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-pg-muted">Projects</p>
              <p className="mt-0.5 text-pg-text">
                {usage.projectCount} / {usage.maxProjects}
              </p>
            </div>
            <div>
              <p className="text-pg-muted">Retention</p>
              <p className="mt-0.5 text-pg-text">{usage.retentionDays} days</p>
            </div>
            <div>
              <p className="text-pg-muted">Source maps</p>
              <p className="mt-0.5 text-pg-text">{usage.maxSourceMaps} / project</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-pg-text">Members</h2>
          <p className="text-xs text-pg-muted">
            People in {activeWorkspace?.name}. Admins can invite, remove, and
            assign project access.
          </p>
        </div>
        {canAdmin ? (
          <Button
            className="btn-primary h-8 text-xs"
            onClick={() => setInviteOpen(true)}
          >
            <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5" />
            Invite
          </Button>
        ) : null}
      </div>

      {loading ? (
        <PageSkeleton variant="cards" />
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-lg px-2 py-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.userAvatar} />
                <AvatarFallback className="bg-pg-group text-[11px]">
                  {(member.userName || member.userEmail || "U")[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-pg-text">
                  {member.userName || member.userEmail}
                </p>
                <p className="truncate text-[11px] text-pg-muted">
                  {member.role} · {accessLabel(member)}
                </p>
              </div>
              {canAdmin && member.role !== "owner" && member.userId !== user?.id ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-transparent p-1.5 text-pg-muted hover:bg-pg-group hover:text-pg-text"
                    onClick={() => openAccess(member)}
                    aria-label="Edit project access"
                  >
                    <HugeiconsIcon icon={PencilEdit01Icon} className="h-3.5 w-3.5" />
                  </button>
                  <Select
                    value={member.role}
                    onValueChange={async (role) => {
                      try {
                        await updateMemberRole(workspaceId, member.userId, role);
                        await load();
                      } catch (error) {
                        toast.error(
                          error instanceof Error ? error.message : "Failed to update role",
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <CustomAlertDialog
                    trigger={
                      <button
                        type="button"
                        className="rounded-lg bg-transparent p-1.5 text-red-400 hover:bg-red-500/10"
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
                      </button>
                    }
                    title="Remove member"
                    description="They will lose access to this workspace and its projects."
                    confirmLabel="Remove"
                    variant="danger"
                    onConfirm={async () => {
                      await removeWorkspaceMember(workspaceId, member.userId);
                      await load();
                    }}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {invites.length > 0 ? (
        <div>
          <h2 className="mb-2 text-sm font-medium text-pg-text">Pending invites</h2>
          <div className="space-y-2">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-pg-muted"
              >
                <HugeiconsIcon icon={Mail01Icon} className="h-3.5 w-3.5" />
                <span className="min-w-0 flex-1 truncate">{invite.email}</span>
                <span>{invite.role}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {canAdmin ? (
        <div className="pt-4">
          <CustomAlertDialog
            trigger={
              <Button className="btn-danger h-8 rounded-lg px-3 text-xs font-semibold">
                Delete workspace
              </Button>
            }
            title="Delete workspace"
            description="This permanently deletes the workspace, its members, and all projects inside it."
            confirmLabel="Delete workspace"
            variant="danger"
            onConfirm={handleDeleteWorkspace}
          />
        </div>
      ) : null}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Invite to workspace
            </DialogTitle>
            <DialogDescription className="text-xs">
              Choose a role and which projects they can open.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs text-pg-muted">Email</label>
              <Input
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="name@company.com"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-pg-muted">Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-[11px] text-pg-muted">
                Admins can invite or remove members, rename the workspace, and
                delete it.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-pg-group px-3 py-2.5">
              <div>
                <p className="text-xs font-medium text-pg-text">All projects</p>
                <p className="text-[11px] text-pg-muted">
                  Access every project in this workspace
                </p>
              </div>
              <Switch checked={allProjects} onCheckedChange={setAllProjects} />
            </div>
            {!allProjects ? (
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {projects.length === 0 ? (
                  <p className="text-xs text-pg-muted">No projects yet.</p>
                ) : (
                  projects.map((project) => (
                    <label
                      key={project.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-pg-group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProjectIds.includes(project.id)}
                        onChange={() => toggleProject(project.id)}
                      />
                      <span>{project.name}</span>
                    </label>
                  ))
                )}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              className="btn-primary h-8 text-xs"
              onClick={() => void handleInvite()}
              loading={saving}
              loadingText="Sending..."
            >
              <HugeiconsIcon icon={UserGroupIcon} className="h-3.5 w-3.5" />
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(accessMember)} onOpenChange={(open) => !open && setAccessMember(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Project access
            </DialogTitle>
            <DialogDescription className="text-xs">
              {accessMember?.userName || accessMember?.userEmail || "Member"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-pg-group px-3 py-2.5">
              <div>
                <p className="text-xs font-medium text-pg-text">All projects</p>
                <p className="text-[11px] text-pg-muted">
                  Access every project in this workspace
                </p>
              </div>
              <Switch checked={accessAllProjects} onCheckedChange={setAccessAllProjects} />
            </div>
            {!accessAllProjects ? (
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {projects.length === 0 ? (
                  <p className="text-xs text-pg-muted">No projects yet.</p>
                ) : (
                  projects.map((project) => (
                    <label
                      key={project.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-pg-group"
                    >
                      <input
                        type="checkbox"
                        checked={accessProjectIds.includes(project.id)}
                        onChange={() =>
                          setAccessProjectIds((prev) =>
                            prev.includes(project.id)
                              ? prev.filter((id) => id !== project.id)
                              : [...prev, project.id],
                          )
                        }
                      />
                      <span>{project.name}</span>
                    </label>
                  ))
                )}
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              className="btn-primary h-8 text-xs"
              onClick={() => void handleAccessSave()}
              loading={saving}
              loadingText="Saving..."
            >
              Save access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
