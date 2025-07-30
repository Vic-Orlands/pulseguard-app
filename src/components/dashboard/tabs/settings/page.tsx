import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Users,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Check,
  Bell,
  Key,
  Save,
  RefreshCw,
  AlertTriangle,
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DeleteProjectDialog } from "../../shared/delete-project-dialog";
import { updateProject } from "@/lib/api/projects-api";

import { HttpError } from "@/lib/utils";
import type { Project } from "@/types/dashboard";

export default function SettingsTab({ project }: { project: Project }) {
  const { id, slug, name, description } = project;
  const router = useRouter();

  const [projectSlug, setProjectSlug] = useState<string>(slug || "");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>(name);
  const [apiKeyCopied, setApiKeyCopied] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [projectDescription, setProjectDescription] =
    useState<string>(description);

  // const [notifications, setNotifications] = useState({
  //   errorAlerts: true,
  //   performanceAlerts: true,
  //   weeklyReports: false,
  //   downtimeNotifications: true,
  // });

  // const [projectSettings, setProjectSettings] = useState({
  //   errorRetention: "30",
  //   alertThreshold: "5",
  //   autoResolve: true,
  //   publicDashboard: false,
  // });

  // Auto-generate project ID from project name
  useEffect(() => {
    const generateId = (name: string) =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    const newSlug = generateId(projectName);
    if (newSlug !== slug) {
      setProjectSlug(newSlug);
      setHasUnsavedChanges(true);
    }
  }, [projectName, slug]);

  const handleProjectNameChange = (value: string) => {
    setProjectName(value);
    setHasUnsavedChanges(true);
  };

  // const handleRoleChange = (memberId: number, newRole: string) => {
  //   setTeamMembers((prev) =>
  //     prev.map((member) =>
  //       member.id === memberId ? { ...member, role: newRole } : member
  //     )
  //   );
  //   setHasUnsavedChanges(true);
  // };

  // const handleRemoveMember = (memberId: number) => {
  //   setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));
  //   setHasUnsavedChanges(true);
  // };

  const handleSaveChanges = async () => {
    setIsSaving(true);

    try {
      const res = await updateProject(slug, {
        name: projectName,
        slug: projectSlug,
        description: projectDescription,
      });

      // If backend returned a new slug, navigate
      if (res.slug && res.slug !== slug) {
        router.replace(`/projects/${res.slug}?tab=settings`);
      }

      toast.success("Changes saved!");
    } catch (err: unknown) {
      if (err instanceof HttpError) {
        if (err.status === 409 || err.message.includes("Conflict")) {
          toast.error("Name already exists. Please choose another name.");
        } else if (err.status === 400) {
          toast.error(err.body || "Invalid input.");
        } else if (err.status === 404) {
          toast.error("Project not found.");
        } else {
          toast.error("Failed to save changes. Please try again.");
        }
        console.error("Update failed:", {
          status: err.status,
          message: err.message,
          body: err.body,
        });
      } else if (err instanceof Error) {
        toast.error(err.message || "Failed to save changes.");
        console.error("Update failed:", err);
      } else {
        toast.error("Failed to save changes.");
        console.error("Update failed (unknown):", err);
      }
    } finally {
      setIsSaving(false);
      setHasUnsavedChanges(false);
    }
  };

  const copyApiKey = async () => {
    await navigator.clipboard.writeText(id);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
    toast.success("API key copied to clipboard!");
  };

  // const getRoleBadgeVariant = (role: string) => {
  //   switch (role) {
  //     case "Owner":
  //       return "default";
  //     case "Admin":
  //       return "secondary";
  //     case "Developer":
  //     case "Viewer":
  //       return "outline";
  //     default:
  //       return "outline";
  //   }
  // };

  return (
    <Card
      className={
        deleteDialogOpen
          ? ""
          : "bg-slate-900/50 backdrop-blur-xl border-slate-700/50 space-y-8 p-6 min-h-screen"
      }
    >
      {/* Header */}
      {/* <div className="flex items-center justify-end">
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              Unsaved changes
            </div>
          )}
          <Button
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges || isSaving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
      </div> */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {/* Project Information */}
          <Card className="bg-slate-900/50 border border-slate-700/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-xl">Project Information</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Basic configuration for your monitoring project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Project Name
                  </label>
                  <Input
                    value={projectName}
                    onChange={(e) => handleProjectNameChange(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-slate-300 focus:border-blue-400 transition-colors"
                    placeholder="Enter project name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Project ID
                  </label>
                  <div className="relative">
                    <Input
                      value={projectSlug}
                      className="bg-slate-900/30 border-slate-600 text-slate-400 pr-12"
                      disabled
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Badge
                        variant="outline"
                        className="text-xs border-slate-600"
                      >
                        Auto-generated
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Description
                </label>
                <Textarea
                  value={projectDescription}
                  onChange={(e) => {
                    setProjectDescription(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="bg-slate-900/50 border-slate-600 text-slate-300 focus:border-blue-400 transition-colors resize-none"
                  rows={3}
                  placeholder="Describe your project..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Team Management */}
          <Card className="bg-slate-900/50 border border-slate-700/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  <CardTitle className="text-xl">Team Members</CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className="border-purple-400/30 text-purple-400"
                >
                  1 member
                  {/* {teamMembers.length !== 1 ? "s" : ""} */}
                </Badge>
              </div>
              <CardDescription>
                Manage team access and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-12">
                <span className="text-2xl font-semibold text-slate-400">
                  Teams
                </span>
                <span className="text-lg text-slate-500 mb-4">Coming soon</span>
                <span className="text-sm text-slate-600">
                  Team management features will be available in a future update.
                </span>
              </div>
              {/* {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-900/30 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 ring-2 ring-slate-700">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-semibold">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-200">
                          {member.name}
                        </p>
                        {member.isOwner && (
                          <Shield className="h-4 w-4 text-amber-400" />
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{member.email}</p>
                      <p className="text-xs text-slate-500">
                        Last active: {member.lastActive}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={getRoleBadgeVariant(member.role)}
                      className="min-w-[80px] justify-center"
                    >
                      {member.role}
                    </Badge>
                    {!member.isOwner && (
                      <>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 hover:border-slate-500"
                            >
                              Change Role
                              <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-800 border-slate-700">
                            {["Admin", "Developer", "Viewer"].map((role) => (
                              <DropdownMenuItem
                                key={role}
                                onClick={() =>
                                  handleRoleChange(member.id, role)
                                }
                                className="hover:bg-slate-700"
                              >
                                {role}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full border-dashed border-slate-600 hover:border-blue-400 hover:bg-blue-950/20 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Invite Team Member
              </Button> */}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                Unsaved changes
              </div>
            )}
            <Button
              onClick={handleSaveChanges}
              disabled={!hasUnsavedChanges || isSaving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* API Configuration */}
          <Card className="bg-slate-900/50 border border-slate-700/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-green-400" />
                <CardTitle className="text-lg">API Configuration</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  API Key
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    value={showApiKey ? id : "•".repeat(id.length)}
                    className="bg-slate-900/50 border-slate-600 font-mono text-sm"
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="border-slate-600"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyApiKey}
                    className={
                      apiKeyCopied
                        ? "border-green-900 bg-green-800"
                        : "border-slate-600"
                    }
                  >
                    {apiKeyCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                disabled
                variant="outline"
                className="w-full border-slate-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate Key
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-slate-900/50 border border-slate-700/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-lg">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-12">
                <span className="text-2xl font-semibold text-slate-400">
                  Notifications
                </span>
                <span className="text-lg text-slate-500 mb-4">Coming soon</span>
                <span className="text-sm text-slate-600">
                  Notification features will be available in a future update.
                </span>
              </div>
              {/* {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-sm text-slate-300 capitalize">
                    {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </label>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => {
                      setNotifications((prev) => ({ ...prev, [key]: checked }));
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>
              ))} */}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-red-950/20 border border-red-900/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <CardTitle className="text-lg text-red-400">
                  Danger Zone
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-red-300">Delete Project</h4>
                  <p className="text-sm text-red-400/80 mt-1">
                    Permanently delete this project and all associated data.
                    This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Project Dialog */}
      <DeleteProjectDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        project={{ slug, name }}
      />
    </Card>
  );
}
