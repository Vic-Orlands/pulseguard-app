import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert01Icon,
  Copy01Icon,
  Delete02Icon,
  FloppyDiskIcon,
  Key01Icon,
  Notification01Icon,
  Refresh01Icon,
  Settings01Icon,
  Tick01Icon,
  UserGroupIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

  return (
    <Card
      className={
        deleteDialogOpen
          ? ""
          : "bg-card border border-border space-y-5 p-4 rounded-lg shadow-none text-foreground"
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {/* Project Information */}
          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardHeader className="py-3 px-4 border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs font-semibold text-foreground">Project Information</CardTitle>
              </div>
              <CardDescription className="text-[10px] text-muted-foreground mt-0.5">
                Basic configuration for your monitoring project
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80">
                    Project Name
                  </label>
                  <Input
                    value={projectName}
                    onChange={(e) => handleProjectNameChange(e.target.value)}
                    className="bg-card border-border text-foreground text-xs h-8 shadow-none focus-visible:ring-1 transition-colors"
                    placeholder="Enter project name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/80">
                    Project ID
                  </label>
                  <div className="relative">
                    <Input
                      value={projectSlug}
                      className="bg-muted border-border text-muted-foreground text-xs h-8 pr-12 shadow-none"
                      disabled
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1.5 py-0.5 border-border shadow-none"
                      >
                        Auto-generated
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">
                  Description
                </label>
                <Textarea
                  value={projectDescription}
                  onChange={(e) => {
                    setProjectDescription(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="bg-card border-border text-foreground text-xs shadow-none resize-none focus-visible:ring-1 transition-colors"
                  rows={3}
                  placeholder="Describe your project..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Team Management */}
          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardHeader className="py-3 px-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={UserGroupIcon} className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-xs font-semibold text-foreground">Team Members</CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground text-[10px] px-1.5 py-0.5 shadow-none"
                >
                  1 member
                </Badge>
              </div>
              <CardDescription className="text-[10px] text-muted-foreground mt-0.5">
                Manage team access and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col items-center justify-center py-8">
                <span className="text-sm font-semibold text-muted-foreground">
                  Teams
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 mb-2">Coming soon</span>
                <span className="text-[10px] text-muted-foreground/60">
                  Team management features will be available in a future update.
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                Unsaved changes
              </div>
            )}
            <Button
              onClick={handleSaveChanges}
              disabled={!hasUnsavedChanges || isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs h-8 px-3 font-semibold shadow-none"
            >
              {isSaving ? (
                <>
                  <HugeiconsIcon icon={Refresh01Icon} className="h-3.5 w-3.5 mr-1.5 animate-spin" />
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

        {/* Sidebar */}
        <div className="space-y-4">
          {/* API Configuration */}
          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardHeader className="py-3 px-4 border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Key01Icon} className="h-4 w-4 text-emerald-500" />
                <CardTitle className="text-xs font-semibold text-foreground">API Configuration</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">
                  API Key
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    value={showApiKey ? id : "•".repeat(id.length)}
                    className="bg-card border-border font-mono text-xs h-8 shadow-none"
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="border-border text-xs h-8 px-2.5 shadow-none"
                  >
                    {showApiKey ? (
                      <HugeiconsIcon icon={ViewOffIcon} className="h-3.5 w-3.5" />
                    ) : (
                      <HugeiconsIcon icon={ViewIcon} className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyApiKey}
                    className={
                      apiKeyCopied
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs h-8 px-2.5 shadow-none"
                        : "border-border text-xs h-8 px-2.5 shadow-none"
                    }
                  >
                    {apiKeyCopied ? (
                      <HugeiconsIcon icon={Tick01Icon} className="h-3.5 w-3.5" />
                    ) : (
                      <HugeiconsIcon icon={Copy01Icon} className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                disabled
                variant="outline"
                className="w-full border-border text-xs h-8 shadow-none"
              >
                <HugeiconsIcon icon={Refresh01Icon} className="h-3.5 w-3.5 mr-1.5" />
                Regenerate Key
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardHeader className="py-3 px-4 border-b border-border/50">
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Notification01Icon} className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-xs font-semibold text-foreground">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col items-center justify-center py-8">
                <span className="text-sm font-semibold text-muted-foreground">
                  Notifications
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 mb-2">Coming soon</span>
                <span className="text-[10px] text-muted-foreground/60">
                  Notification features will be available in a future update.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-destructive/5 border border-destructive/20 shadow-none rounded-lg">
            <CardHeader className="py-3 px-4 border-b border-destructive/25">
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4 text-destructive" />
                <CardTitle className="text-xs font-semibold text-destructive">
                  Danger Zone
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <h4 className="text-xs font-semibold text-destructive">Delete Project</h4>
                <p className="text-[10px] text-destructive/80 mt-0.5">
                  Permanently delete this project and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8 px-3 shadow-none font-semibold"
              >
                <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5 mr-1.5" />
                Delete Project
              </Button>
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
