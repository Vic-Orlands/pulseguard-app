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
  Refresh01Icon,
  MoreHorizontalIcon,
} from "@/components/phosphor-icons";
import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomAlertDialog } from "@/components/dashboard/shared/custom-alert-dialog";
import { DeleteProjectDialog } from "../../shared/delete-project-dialog";
import { RenderDeleteAccountDialogComp } from "@/app/(protected)/settings/delete-user-card";
import { updateProject } from "@/lib/api/projects-api";
import { updateUser } from "@/lib/api/user-api";
import { availableAvatars } from "@/components/avatars";
import { normalizePostgresString, wrapAsPostgresString, HttpError } from "@/lib/utils";
import { UserFormSchema, type UserFormType } from "@/types/settings";
import type { Project } from "@/types/dashboard";

type SheetId =
  | "name"
  | "email"
  | "password"
  | "avatar"
  | "appearance"
  | "project"
  | "api-key"
  | "notifications"
  | "workspace"
  | null;

export default function SettingsTab({ project }: { project: Project }) {
  const router = useRouter();
  const { user, setUser, logout, activeWorkspace } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sheet, setSheet] = useState<SheetId>(null);
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
  const [projectDescription, setProjectDescription] = useState(
    project.description,
  );
  const [projectSlug, setProjectSlug] = useState(project.slug);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);

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
      setSheet(null);
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
      setSheet(null);
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

  return (
    <div className="mx-auto max-w-xl pb-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <button
          type="button"
          onClick={() => setSheet("avatar")}
          className="relative bg-transparent p-0"
        >
          <Avatar className="h-20 w-20">
            <AvatarImage src={userForm.avatar} />
            <AvatarFallback className="bg-pg-group text-lg font-semibold text-pg-text">
              {userForm.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-pg-surface">
            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-3.5 w-3.5" />
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
            label="Name"
            value={userForm.name}
            onClick={() => setSheet("name")}
          />
          <SettingsRow
            icon={Mail01Icon}
            label="Email"
            value={
              provider === "github"
                ? "Managed by GitHub"
                : user?.email
            }
            onClick={() => setSheet("email")}
          />
          <SettingsRow
            icon={LockIcon}
            label="Password"
            value={isOAuthUser ? "Managed by provider" : "••••••••"}
            onClick={() => setSheet("password")}
          />
          <SettingsRow
            icon={Camera01Icon}
            label="Avatar"
            onClick={() => setSheet("avatar")}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon={DatabaseIcon}
            label="Project"
            value={projectName}
            onClick={() => setSheet("project")}
          />
          <SettingsRow
            icon={Key01Icon}
            label="API key"
            value={showApiKey ? project.id.slice(0, 12) + "…" : "Hidden"}
            onClick={() => setSheet("api-key")}
          />
          <SettingsRow
            icon={UserGroupIcon}
            label="Workspace"
            value={activeWorkspace?.name}
            onClick={() => setSheet("workspace")}
          />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow
            icon={PaletteIcon}
            label="Appearance"
            value={mounted ? (theme === "dark" ? "Dark" : "Light") : ""}
            onClick={() => setSheet("appearance")}
          />
          <SettingsRow
            icon={Notification01Icon}
            label="Notifications"
            value="Coming soon"
            onClick={() => setSheet("notifications")}
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

      <Sheet open={sheet === "name"} onOpenChange={(open) => !open && setSheet(null)}>
        <SheetContent className="bg-pg-modal p-6">
          <SheetHeader className="p-0 mb-5">
            <SheetTitle>Name</SheetTitle>
            <SheetDescription>This is how you appear in PulseGuard.</SheetDescription>
          </SheetHeader>
          <Input
            value={userForm.name}
            onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
            className="h-9 text-sm"
          />
          <Button
            className="btn-primary mt-4 w-full"
            onClick={handleSaveUser}
            loading={isSavingUser}
            loadingText="Saving..."
          >
            <HugeiconsIcon icon={FloppyDiskIcon} className="h-3.5 w-3.5" />
            Save
          </Button>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "email"} onOpenChange={(open) => !open && setSheet(null)}>
        <SheetContent className="bg-pg-modal p-6">
          <SheetHeader className="p-0 mb-5">
            <SheetTitle>Email</SheetTitle>
            <SheetDescription>
              Email is managed by your sign-in method and cannot be changed here.
            </SheetDescription>
          </SheetHeader>
          <Input value={user?.email || ""} disabled className="h-9 text-sm" />
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "password"} onOpenChange={(open) => !open && setSheet(null)}>
        <SheetContent className="bg-pg-modal p-6">
          <SheetHeader className="p-0 mb-5">
            <SheetTitle>Password</SheetTitle>
            <SheetDescription>
              {isOAuthUser
                ? "Password is managed by your OAuth provider."
                : "Update the password used to sign in."}
            </SheetDescription>
          </SheetHeader>
          {(["currentPassword", "newPassword", "confirmPassword"] as const).map(
            (field) => (
              <div key={field} className="mb-3">
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
                    disabled={isOAuthUser}
                    onChange={(e) =>
                      setUserForm((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                    className="h-9 pr-9 text-sm"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent p-0"
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
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
          )}
          <Button
            className="btn-primary mt-2 w-full"
            disabled={isOAuthUser}
            onClick={handleSaveUser}
            loading={isSavingUser}
            loadingText="Saving..."
          >
            Update password
          </Button>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "avatar"} onOpenChange={(open) => !open && setSheet(null)}>
        <SheetContent className="bg-pg-modal p-6">
          <SheetHeader className="p-0 mb-5">
            <SheetTitle>Avatar</SheetTitle>
            <SheetDescription>Choose a new profile image.</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-3">
            {availableAvatars.map((avatar) => (
              <button
                key={avatar}
                onClick={() => setUserForm((prev) => ({ ...prev, avatar }))}
                className={`rounded-lg p-1.5 transition-colors ${
                  userForm.avatar === avatar ? "bg-pg-group" : "hover:bg-pg-group"
                }`}
              >
                <Avatar className="h-12 w-12 mx-auto">
                  <AvatarImage src={avatar} />
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
              </button>
            ))}
          </div>
          <Button
            className="btn-primary mt-4 w-full"
            onClick={handleSaveUser}
            loading={isSavingUser}
            loadingText="Saving..."
          >
            Save avatar
          </Button>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "appearance"} onOpenChange={(open) => !open && setSheet(null)}>
        <SheetContent className="bg-pg-modal p-6">
          <SheetHeader className="p-0 mb-5">
            <SheetTitle>Appearance</SheetTitle>
            <SheetDescription>Choose a light or dark dashboard.</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3">
            {(["light", "dark"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`rounded-lg bg-pg-group px-4 py-5 text-left transition-colors ${
                  mounted && theme === mode ? "ring-1 ring-pg-border" : ""
                }`}
              >
                <p className="text-sm font-medium text-pg-text capitalize">{mode}</p>
                <p className="mt-1 text-[11px] text-pg-muted">
                  {mode === "light" ? "Bright surfaces" : "Low-light zinc"}
                </p>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "project"} onOpenChange={(open) => !open && setSheet(null)}>
        <SheetContent className="bg-pg-modal p-6">
          <SheetHeader className="p-0 mb-5">
            <SheetTitle>Project</SheetTitle>
            <SheetDescription>Name and description for this telemetry project.</SheetDescription>
          </SheetHeader>
          <label className="mb-1.5 block text-xs text-pg-muted">Name</label>
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="h-9 mb-3 text-sm"
          />
          <label className="mb-1.5 block text-xs text-pg-muted">Project ID</label>
          <Input value={projectSlug} disabled className="h-9 mb-3 text-sm" />
          <label className="mb-1.5 block text-xs text-pg-muted">Description</label>
          <Textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows={3}
            className="text-sm resize-none"
          />
          <Button
            className="btn-primary mt-4 w-full"
            onClick={handleSaveProject}
            loading={isSavingProject}
            loadingText="Saving..."
          >
            Save project
          </Button>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "api-key"} onOpenChange={(open) => !open && setSheet(null)}>
        <SheetContent className="bg-pg-modal p-6">
          <SheetHeader className="p-0 mb-5">
            <SheetTitle>API key</SheetTitle>
            <SheetDescription>Use this key to stream telemetry into the project.</SheetDescription>
          </SheetHeader>
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
          <Button disabled variant="ghost" className="mt-3 w-full shadow-none text-pg-muted">
            <HugeiconsIcon icon={Refresh01Icon} className="h-3.5 w-3.5" />
            Regenerate key
          </Button>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "workspace"} onOpenChange={(open) => !open && setSheet(null)}>
        <SheetContent className="bg-pg-modal p-6">
          <SheetHeader className="p-0 mb-5">
            <SheetTitle>Workspace</SheetTitle>
            <SheetDescription>
              Members and teams for {activeWorkspace?.name || "this workspace"}.
            </SheetDescription>
          </SheetHeader>
          <p className="text-sm text-pg-text">{activeWorkspace?.name}</p>
          <p className="mt-1 text-xs text-pg-muted">
            Invite teammates and manage roles from account settings.
          </p>
          <Button
            className="btn-primary mt-4 w-full"
            onClick={() => router.push("/settings")}
          >
            Manage workspace
          </Button>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "notifications"} onOpenChange={(open) => !open && setSheet(null)}>
        <SheetContent className="bg-pg-modal p-6">
          <SheetHeader className="p-0 mb-5">
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>Alert routing will be available in a later release.</SheetDescription>
          </SheetHeader>
          <p className="text-sm text-pg-muted">Coming soon.</p>
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
