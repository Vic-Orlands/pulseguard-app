"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/auth-context";
import {
  SettingsGroup,
  SettingsRow,
} from "@/components/dashboard/shared/settings-list";
import {
  UserIcon,
  Mail01Icon,
  LockIcon,
  Camera01Icon,
  PaletteIcon,
  DatabaseIcon,
  Key01Icon,
  Notification01Icon,
  UserGroupIcon,
  HelpCircleIcon,
  FileTextIcon,
  CookieIcon,
  Shield01Icon,
  Logout01Icon,
  Delete02Icon,
  FloppyDiskIcon,
  ViewIcon,
  ViewOffIcon,
  Copy01Icon,
  Tick01Icon,
  MoreVerticalIcon,
  Alert01Icon,
} from "@/components/phosphor-icons";
import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomAlertDialog } from "@/components/dashboard/shared/custom-alert-dialog";
import { DeleteProjectDialog } from "../../shared/delete-project-dialog";
import { RenderDeleteAccountDialogComp } from "@/app/(protected)/settings/delete-user-card";
import { updateProject } from "@/lib/api/projects-api";
import { updateUser } from "@/lib/api/user-api";
import {
  getNotificationPrefs,
  saveNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/api/notifications-api";
import { availableAvatars } from "@/components/avatars";
import { normalizePostgresString, wrapAsPostgresString, HttpError } from "@/lib/utils";
import { UserFormSchema, type UserFormType } from "@/types/settings";
import type { NavItem, Project } from "@/types/dashboard";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import TeamsTab from "@/components/dashboard/tabs/teams";

type DialogId = "account" | "project" | "notifications" | null;

export default function SettingsTab({
  project,
  setActiveTab,
}: {
  project: Project;
  setActiveTab: (tab: NavItem) => void;
}) {
  const router = useRouter();
  const { user, setUser, logout, activeWorkspace } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dialog, setDialog] = useState<DialogId>(null);
  const currentAvatar = user && normalizePostgresString(user.avatar);
  const provider = user && normalizePostgresString(user.provider);
  const isOAuthUser = provider === "google" || provider === "github";

  const [userForm, setUserForm] = useState<UserFormType>({
    name: user?.name ?? "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    avatar: currentAvatar || "",
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isSavingUser, setIsSavingUser] = useState(false);

  const [projectName, setProjectName] = useState(project.name);
  const [projectDescription, setProjectDescription] = useState(project.description);
  const [projectSlug, setProjectSlug] = useState(project.slug);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    in_app: true,
    email_alerts: true,
    email_invites: true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [teamsOpen, setTeamsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setUserForm((prev) => ({
        ...prev,
        name: user.name,
        avatar: currentAvatar || "",
      }));
    }
  }, [user, currentAvatar]);

  useEffect(() => {
    const slug = projectName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setProjectSlug(slug);
  }, [projectName]);

  useEffect(() => {
    getNotificationPrefs()
      .then(setPrefs)
      .catch(() => undefined);
  }, []);

  const handleSaveUser = async () => {
    setIsSavingUser(true);
    try {
      const validation = UserFormSchema.safeParse(userForm);
      if (!validation.success) {
        toast.error(
          validation.error.issues.map((issue) => issue.message).join(", "),
        );
        return;
      }
      const { name, newPassword, avatar } = validation.data;
      const res = await updateUser({ name, password: newPassword, avatar });
      if (!res) {
        toast.error("Failed to update account");
        return;
      }
      setUser({
        ...user!,
        name,
        avatar: wrapAsPostgresString(userForm.avatar),
      });
      toast.success("Account updated");
      setDialog(null);
    } catch {
      toast.error("Failed to save account changes");
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleSaveProject = async () => {
    setIsSavingProject(true);
    try {
      const res = await updateProject(project.slug, {
        name: projectName,
        slug: projectSlug,
        description: projectDescription,
      });
      if (res.slug && res.slug !== project.slug) {
        router.replace(`/projects/${res.slug}?tab=settings`);
      }
      toast.success("Project updated");
      setDialog(null);
    } catch (err: unknown) {
      if (err instanceof HttpError) {
        toast.error(err.body || err.message || "Failed to save project");
      } else {
        toast.error("Failed to save project");
      }
    } finally {
      setIsSavingProject(false);
    }
  };

  const copyApiKey = async () => {
    await navigator.clipboard.writeText(project.id);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
    toast.success("API key copied");
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      setPrefs(await saveNotificationPrefs(prefs));
      toast.success("Notification preferences saved");
      setDialog(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl pb-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <button
          type="button"
          onClick={() => setDialog("account")}
          className="relative bg-transparent p-0"
        >
          <Avatar className="h-20 w-20">
            <AvatarImage src={userForm.avatar} />
            <AvatarFallback className="bg-pg-group text-lg font-semibold text-pg-text">
              {userForm.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-pg-surface">
            <HugeiconsIcon icon={MoreVerticalIcon} className="h-3.5 w-3.5" />
          </span>
        </button>
        <h2 className="mt-3 text-base font-semibold text-pg-text">
          {user?.name || "Account"}
        </h2>
        <p className="text-xs text-pg-muted">{user?.email}</p>
      </div>

      <div className="space-y-4">
        <SettingsGroup>
          <SettingsRow
            icon={UserIcon}
            label="Account"
            value={userForm.name}
            onClick={() => setDialog("account")}
          />
          <SettingsRow
            icon={Mail01Icon}
            label="Email"
            value={provider === "github" ? "Managed by GitHub" : user?.email}
            trailing="none"
          />
          <SettingsRow
            icon={LockIcon}
            label="Password"
            value={isOAuthUser ? "Managed by provider" : "Update in account"}
            onClick={() => setDialog("account")}
          />
          <SettingsRow
            icon={Camera01Icon}
            label="Avatar"
            onClick={() => setDialog("account")}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon={DatabaseIcon}
            label="Project"
            value={projectName}
            onClick={() => setDialog("project")}
          />
          <SettingsRow
            icon={Key01Icon}
            label="API key"
            value={showApiKey ? `${project.id.slice(0, 8)}…` : "Hidden"}
            onClick={() => setDialog("project")}
          />
          <SettingsRow
            icon={Alert01Icon}
            label="Alert rules"
            value="Manage thresholds"
            onClick={() => setActiveTab("alerts")}
          />
          <SettingsRow
            icon={UserGroupIcon}
            label="Workspace members"
            value={activeWorkspace?.name}
            onClick={() => setTeamsOpen(true)}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon={PaletteIcon}
            label="Appearance"
            value={mounted ? (theme === "dark" ? "Dark" : "Light") : ""}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
          <SettingsRow
            icon={Notification01Icon}
            label="Notifications"
            value={prefs.in_app ? "In-app on" : "In-app off"}
            onClick={() => setDialog("notifications")}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon={HelpCircleIcon}
            label="Get support"
            href="/documentation"
            trailing="external"
          />
          <SettingsRow
            icon={FileTextIcon}
            label="Terms"
            href="/documentation"
            trailing="external"
          />
          <SettingsRow
            icon={Shield01Icon}
            label="Privacy"
            href="/documentation"
            trailing="external"
          />
          <SettingsRow
            icon={CookieIcon}
            label="Cookies"
            href="/documentation"
            trailing="external"
          />
        </SettingsGroup>

        <SettingsGroup>
          <CustomAlertDialog
            trigger={
              <SettingsRow
                icon={Logout01Icon}
                label="Log out"
                destructive
                trailing="none"
              />
            }
            title="Sign out"
            description="Are you sure you want to sign out of your account?"
            onConfirm={logout}
          />
          <SettingsRow
            icon={Delete02Icon}
            label="Delete project"
            destructive
            onClick={() => setDeleteDialogOpen(true)}
          />
          <SettingsRow
            icon={Delete02Icon}
            label="Delete account"
            destructive
            onClick={() => setDeleteAccountDialog(true)}
          />
        </SettingsGroup>
      </div>

      <Dialog open={dialog === "account"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Account</DialogTitle>
            <DialogDescription className="text-xs">
              Name, avatar, and password in one place.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs text-pg-muted">Name</label>
              <Input
                value={userForm.name}
                onChange={(event) =>
                  setUserForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-pg-muted">Avatar</label>
              <div className="grid grid-cols-5 gap-2">
                {availableAvatars.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setUserForm((prev) => ({ ...prev, avatar }))}
                    className={`rounded-lg p-1 ${
                      userForm.avatar === avatar ? "bg-pg-group" : "hover:bg-pg-group"
                    }`}
                  >
                    <Avatar className="mx-auto h-10 w-10">
                      <AvatarImage src={avatar} />
                      <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>
            </div>
            {isOAuthUser ? (
              <p className="text-xs text-pg-muted">
                Password is managed by {provider}.
              </p>
            ) : (
              (["currentPassword", "newPassword", "confirmPassword"] as const).map(
                (field) => (
                  <div key={field}>
                    <label className="mb-1.5 block text-xs text-pg-muted">
                      {field === "currentPassword"
                        ? "Current password"
                        : field === "newPassword"
                          ? "New password"
                          : "Confirm password"}
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword[field] ? "text" : "password"}
                        value={userForm[field]}
                        onChange={(event) =>
                          setUserForm((prev) => ({
                            ...prev,
                            [field]: event.target.value,
                          }))
                        }
                        className="h-9 pr-9 text-sm"
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent p-0"
                        onClick={() =>
                          setShowPassword((prev) => ({
                            ...prev,
                            [field]: !prev[field],
                          }))
                        }
                      >
                        <HugeiconsIcon
                          icon={showPassword[field] ? ViewOffIcon : ViewIcon}
                          className="h-3.5 w-3.5"
                        />
                      </button>
                    </div>
                  </div>
                ),
              )
            )}
          </div>
          <DialogFooter>
            <Button
              className="btn-primary h-8 text-xs"
              onClick={handleSaveUser}
              loading={isSavingUser}
              loadingText="Saving..."
            >
              <HugeiconsIcon icon={FloppyDiskIcon} className="h-3.5 w-3.5" />
              Save account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "project"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Project</DialogTitle>
            <DialogDescription className="text-xs">
              Name, description, and the key used to send telemetry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs text-pg-muted">Name</label>
              <Input
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-pg-muted">Project ID</label>
              <Input value={projectSlug} disabled className="h-9 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-pg-muted">Description</label>
              <Textarea
                value={projectDescription}
                onChange={(event) => setProjectDescription(event.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-pg-muted">API key</label>
              <div className="flex items-center gap-2">
                <Input
                  value={showApiKey ? project.id : "•".repeat(Math.min(project.id.length, 24))}
                  readOnly
                  className="h-9 font-mono text-xs"
                />
                <Button
                  variant="ghost"
                  className="h-9 px-2 shadow-none"
                  onClick={() => setShowApiKey((value) => !value)}
                >
                  <HugeiconsIcon icon={showApiKey ? ViewOffIcon : ViewIcon} className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="h-9 px-2 shadow-none" onClick={copyApiKey}>
                  <HugeiconsIcon icon={apiKeyCopied ? Tick01Icon : Copy01Icon} className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="btn-primary h-8 text-xs"
              onClick={handleSaveProject}
              loading={isSavingProject}
              loadingText="Saving..."
            >
              Save project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialog === "notifications"}
        onOpenChange={(open) => !open && setDialog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Notifications</DialogTitle>
            <DialogDescription className="text-xs">
              Choose how PulseGuard reaches you when alerts fire or people join.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {(
              [
                ["in_app", "In-app alerts", "Show notifications in the dashboard"],
                ["email_alerts", "Email for alerts", "Send an email when a rule fires"],
                ["email_invites", "Email for invites", "Notify me about workspace invites"],
              ] as const
            ).map(([key, label, hint]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg bg-pg-group px-3 py-3"
              >
                <div>
                  <p className="text-xs font-medium text-pg-text">{label}</p>
                  <p className="text-[11px] text-pg-muted">{hint}</p>
                </div>
                <Switch
                  checked={prefs[key]}
                  onCheckedChange={(checked) =>
                    setPrefs((prev) => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              className="btn-primary h-8 text-xs"
              onClick={handleSavePrefs}
              loading={savingPrefs}
              loadingText="Saving..."
            >
              Save preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={teamsOpen} onOpenChange={setTeamsOpen}>
        <SheetContent className="overflow-y-auto p-6">
          <SheetHeader className="mb-4 p-0">
            <SheetTitle className="text-base">Workspace members</SheetTitle>
            <SheetDescription className="text-xs">
              Invite people, assign admin or member, and choose which projects they can open.
            </SheetDescription>
          </SheetHeader>
          <TeamsTab />
        </SheetContent>
      </Sheet>

      <DeleteProjectDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        project={{ slug: project.slug, name: projectName }}
      />

      <RenderDeleteAccountDialogComp
        isOpen={deleteAccountDialog}
        signedInWithGithub={provider === "github"}
        onClose={() => setDeleteAccountDialog(false)}
      />
    </div>
  );
}
