"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Add01Icon, Delete02Icon, Mail01Icon, UserGroupIcon } from "@/components/phosphor-icons";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  addTeamMember,
  createTeam,
  inviteMember,
  listTeamMembers,
  listTeams,
  listWorkspaceMembers,
  removeTeamMember,
  type Team,
  type WorkspaceMember,
} from "@/lib/api/workspace-api";
import { CustomAlertDialog } from "@/components/dashboard/shared/custom-alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TeamsTab() {
  const { user, activeWorkspace } = useAuth();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [teamName, setTeamName] = useState("");
  const [saving, setSaving] = useState(false);

  const workspaceId = activeWorkspace?.id;

  const load = async () => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [memberRows, teamRows] = await Promise.all([
        listWorkspaceMembers(workspaceId),
        listTeams(workspaceId),
      ]);
      setMembers(memberRows);
      setTeams(teamRows);
      const memberships = await Promise.all(
        teamRows.map(async (team) => {
          const ids = await listTeamMembers(workspaceId, team.id);
          return [team.id, ids] as const;
        }),
      );
      setTeamMembers(Object.fromEntries(memberships));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [workspaceId]);

  const currentMember = members.find((member) => member.userId === user?.id);
  const canManage =
    currentMember?.role === "owner" || currentMember?.role === "admin";

  const memberById = useMemo(
    () => Object.fromEntries(members.map((member) => [member.userId, member])),
    [members],
  );

  const handleInvite = async () => {
    if (!workspaceId || !inviteEmail.trim()) {
      toast.error("Enter an email address");
      return;
    }
    setSaving(true);
    try {
      await inviteMember(workspaceId, inviteEmail.trim(), inviteRole);
      toast.success("Invitation sent");
      setInviteOpen(false);
      setInviteEmail("");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to invite");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!workspaceId || !teamName.trim()) {
      toast.error("Enter a team name");
      return;
    }
    setSaving(true);
    try {
      await createTeam(workspaceId, teamName.trim());
      toast.success("Team created");
      setTeamOpen(false);
      setTeamName("");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create team");
    } finally {
      setSaving(false);
    }
  };

  const handleAddToTeam = async (teamId: string, userId: string) => {
    if (!workspaceId) return;
    try {
      await addTeamMember(workspaceId, teamId, userId);
      toast.success("Member added");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add member");
    }
  };

  const handleRemoveFromTeam = async (teamId: string, userId: string) => {
    if (!workspaceId) return;
    try {
      await removeTeamMember(workspaceId, teamId, userId);
      toast.success("Member removed");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  if (!workspaceId) {
    return (
      <div className="rounded-lg bg-pg-group px-4 py-16 text-center text-sm text-pg-muted">
        Select a workspace to manage teams.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-pg-text">{activeWorkspace?.name}</p>
          <p className="text-xs text-pg-muted">
            Invite people and group them into teams for this workspace.
          </p>
        </div>
        {canManage ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="h-8 rounded-lg px-3 text-xs shadow-none"
              onClick={() => setInviteOpen(true)}
            >
              <HugeiconsIcon icon={Mail01Icon} className="mr-1.5 h-3.5 w-3.5" />
              Invite
            </Button>
            <Button
              className="btn-primary h-8 rounded-lg px-3 text-xs font-semibold"
              onClick={() => setTeamOpen(true)}
            >
              <HugeiconsIcon icon={Add01Icon} className="mr-1.5 h-3.5 w-3.5" />
              New team
            </Button>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="rounded-lg bg-pg-group px-4 py-16 text-center text-xs text-pg-muted">
          Loading workspace members...
        </div>
      ) : (
        <>
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-pg-muted">
              Members
            </h2>
            <div className="overflow-hidden rounded-lg bg-pg-group divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {members.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-pg-muted">
                  No members yet.
                </p>
              ) : (
                members.map((member) => {
                  return (
                    <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                      <Avatar className="h-8 w-8">
                        {member.userAvatar ? <AvatarImage src={member.userAvatar} /> : null}
                        <AvatarFallback className="bg-pg-surface text-xs">
                          {(member.userName || member.userEmail || "U")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-pg-text">
                          {member.userName || member.userEmail}
                        </p>
                        <p className="truncate text-[11px] text-pg-muted">
                          {member.userEmail}
                        </p>
                      </div>
                      <span className="text-[11px] capitalize text-pg-muted">
                        {member.role} · {member.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-pg-muted">
              Teams
            </h2>
            {teams.length === 0 ? (
              <div className="flex flex-col items-center rounded-lg bg-pg-group px-4 py-16 text-center">
                <HugeiconsIcon icon={UserGroupIcon} className="mb-3 h-8 w-8 text-pg-muted" />
                <p className="text-sm font-medium text-pg-text">No teams yet</p>
                <p className="mt-1 text-xs text-pg-muted">
                  Create a team to group members around a product or on-call rotation.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map((team) => {
                  const ids = teamMembers[team.id] || [];
                  const available = members.filter(
                    (member) =>
                      member.status === "active" && !ids.includes(member.userId),
                  );
                  return (
                    <div key={team.id} className="rounded-lg bg-pg-group p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-pg-text">{team.name}</p>
                          <p className="text-[11px] text-pg-muted">
                            {ids.length} member{ids.length === 1 ? "" : "s"}
                          </p>
                        </div>
                        {canManage && available.length > 0 ? (
                          <Select
                            onValueChange={(userId) => handleAddToTeam(team.id, userId)}
                          >
                            <SelectTrigger className="h-8 w-44 text-xs shadow-none">
                              <SelectValue placeholder="Add member" />
                            </SelectTrigger>
                            <SelectContent>
                              {available.map((member) => (
                                <SelectItem
                                  key={member.userId}
                                  value={member.userId}
                                  className="text-xs"
                                >
                                  {member.userName || member.userEmail}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : null}
                      </div>
                      <div className="space-y-1">
                        {ids.length === 0 ? (
                          <p className="text-xs text-pg-muted">No members in this team.</p>
                        ) : (
                          ids.map((userId) => {
                            const member = memberById[userId];
                            return (
                              <div
                                key={userId}
                                className="flex items-center justify-between rounded-lg bg-pg-surface px-3 py-2"
                              >
                                <span className="text-xs text-pg-text">
                                  {member?.userName || member?.userEmail || userId}
                                </span>
                                {canManage ? (
                                  <CustomAlertDialog
                                    trigger={
                                      <button
                                        type="button"
                                        className="bg-transparent p-0 text-pg-muted hover:text-red-500"
                                      >
                                        <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
                                      </button>
                                    }
                                    title="Remove from team"
                                    description="Remove this person from the team?"
                                    onConfirm={() => handleRemoveFromTeam(team.id, userId)}
                                  />
                                ) : null}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Invite teammate</DialogTitle>
            <DialogDescription className="text-xs">
              They’ll receive an email to join {activeWorkspace?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs text-pg-muted">Email</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                className="h-9 text-sm"
                placeholder="alex@company.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-pg-muted">Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="h-9 text-xs shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member" className="text-xs">
                    Member
                  </SelectItem>
                  <SelectItem value="admin" className="text-xs">
                    Admin
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="btn-primary h-8 text-xs"
              onClick={handleInvite}
              loading={saving}
              loadingText="Sending..."
            >
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={teamOpen} onOpenChange={setTeamOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Create team</DialogTitle>
            <DialogDescription className="text-xs">
              Teams group workspace members for alerts and ownership.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            placeholder="On-call"
            className="h-9 text-sm"
          />
          <DialogFooter>
            <Button
              className="btn-primary h-8 text-xs"
              onClick={handleCreateTeam}
              loading={saving}
              loadingText="Creating..."
            >
              Create team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
