import { useState, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  Trash2,
  Shield,
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/app/projects/page";
import { toast } from "sonner";
import { DeleteProjectDialog } from "../delete-project-dialog";

export default function PulseGuardSettings({ project }: { project: Project }) {
  const { id, slug, name, description } = project;

  const [projectName, setProjectName] = useState(name);
  const [projectId, setProjectId] = useState(id);
  const [projectDescription, setProjectDescription] = useState(description);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@digitalocean.com",
      role: "Owner",
      avatar:
        "avatar: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face,",
      initials: "JD",
      isOwner: true,
      lastActive: "2 minutes ago",
    },
    {
      id: 2,
      name: "Alice Smith",
      email: "alice@digitalocean.com",
      role: "Developer",
      avatar:
        "avatar: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face,",
      initials: "AS",
      isOwner: false,
      lastActive: "1 hour ago",
    },
    {
      id: 3,
      name: "Bob Wilson",
      email: "bob@digitalocean.com",
      role: "Admin",
      avatar:
        "avatar: https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face,",
      initials: "BW",
      isOwner: false,
      lastActive: "3 hours ago",
    },
  ]);

  const [notifications, setNotifications] = useState({
    errorAlerts: true,
    performanceAlerts: true,
    weeklyReports: false,
    teamUpdates: true,
  });

  const [projectSettings, setProjectSettings] = useState({
    errorRetention: "30",
    alertThreshold: "5",
    autoResolve: true,
    publicDashboard: false,
  });

  const apiKey = "pg_live_sk_1a2b3c4d5e6f7g8h9i0j";

  // Auto-generate project ID from project name
  useEffect(() => {
    const generateId = (name: string) =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    const newId = generateId(projectName);
    if (newId !== projectId) {
      setProjectId(newId);
      setHasUnsavedChanges(true);
    }
  }, [projectName, projectId]);

  const handleProjectNameChange = (value: string) => {
    setProjectName(value);
    setHasUnsavedChanges(true);
  };

  const handleRoleChange = (memberId: number, newRole: string) => {
    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleRemoveMember = (memberId: number) => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setHasUnsavedChanges(false);
    setIsSaving(false);
    toast.success("Changes saved successfully!");
  };

  const copyApiKey = async () => {
    await navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
    toast.success("API key copied to clipboard!");
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Owner":
        return "default";
      case "Admin":
        return "secondary";
      case "Developer":
      case "Viewer":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 space-y-8 p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Project Settings
          </h1>
          <p className="text-slate-400 text-md mt-1">
            Manage your PulseGuard monitoring configuration
          </p>
        </div>
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
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="xl:col-span-2 space-y-6">
          {/* Project Information */}
          <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-xl">Project Information</CardTitle>
              </div>
              <CardDescription>
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
                    className="bg-slate-900/50 border-slate-600 focus:border-blue-400 transition-colors"
                    placeholder="Enter project name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Project ID
                  </label>
                  <div className="relative">
                    <Input
                      value={projectId}
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
                  className="bg-slate-900/50 border-slate-600 focus:border-blue-400 transition-colors resize-none"
                  rows={3}
                  placeholder="Describe your project..."
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Error Retention (days)
                  </label>
                  <Input
                    value={projectSettings.errorRetention}
                    onChange={(e) => {
                      setProjectSettings((prev) => ({
                        ...prev,
                        errorRetention: e.target.value,
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    className="bg-slate-900/50 border-slate-600 focus:border-blue-400 transition-colors"
                    type="number"
                    min="1"
                    max="365"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Alert Threshold (errors/min)
                  </label>
                  <Input
                    value={projectSettings.alertThreshold}
                    onChange={(e) => {
                      setProjectSettings((prev) => ({
                        ...prev,
                        alertThreshold: e.target.value,
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    className="bg-slate-900/50 border-slate-600 focus:border-blue-400 transition-colors"
                    type="number"
                    min="1"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      Auto-resolve Issues
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      Automatically resolve issues when error rate drops
                    </p>
                  </div>
                  <Switch
                    checked={projectSettings.autoResolve}
                    onCheckedChange={(checked) => {
                      setProjectSettings((prev) => ({
                        ...prev,
                        autoResolve: checked,
                      }));
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-300">
                      Public Dashboard
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      Allow public access to project status page
                    </p>
                  </div>
                  <Switch
                    checked={projectSettings.publicDashboard}
                    onCheckedChange={(checked) => {
                      setProjectSettings((prev) => ({
                        ...prev,
                        publicDashboard: checked,
                      }));
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Management */}
          <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
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
                  {teamMembers.length} member
                  {teamMembers.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <CardDescription>
                Manage team access and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamMembers.map((member) => (
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
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* API Configuration */}
          <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
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
                    value={showApiKey ? apiKey : "•".repeat(apiKey.length)}
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
                    className="border-slate-600"
                  >
                    {apiKeyCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="w-full border-slate-600">
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate Key
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-400" />
                <CardTitle className="text-lg">Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
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
              ))}
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
