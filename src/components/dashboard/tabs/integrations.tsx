"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
  deleteIntegration,
  listIntegrations,
  setIntegrationEnabled,
  testIntegration,
  upsertIntegration,
  type ProjectIntegration,
} from "@/lib/api/integrations-api";
import type { Project } from "@/types/dashboard";

type ProviderId =
  | "slack"
  | "discord"
  | "github"
  | "linear"
  | "clickup"
  | "datadog"
  | "pagerduty"
  | "jira"
  | "microsoft_teams"
  | "telegram"
  | "notion"
  | "webhook";

const providers: {
  id: ProviderId;
  name: string;
  description: string;
  fields: { key: string; label: string; placeholder: string; secret?: boolean }[];
}[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Post alert messages to a channel webhook.",
    fields: [
      {
        key: "webhook_url",
        label: "Incoming webhook URL",
        placeholder: "https://hooks.slack.com/services/...",
        secret: true,
      },
    ],
  },
  {
    id: "discord",
    name: "Discord",
    description: "Send alerts to a Discord channel webhook.",
    fields: [
      {
        key: "webhook_url",
        label: "Webhook URL",
        placeholder: "https://discord.com/api/webhooks/...",
        secret: true,
      },
    ],
  },
  {
    id: "microsoft_teams",
    name: "Microsoft Teams",
    description: "Post alerts to a Teams incoming webhook.",
    fields: [
      {
        key: "webhook_url",
        label: "Incoming webhook URL",
        placeholder: "https://outlook.office.com/webhook/...",
        secret: true,
      },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    description: "Open an issue when an alert fires.",
    fields: [
      { key: "repo", label: "Repository", placeholder: "acme/api" },
      {
        key: "token",
        label: "Personal access token",
        placeholder: "ghp_...",
        secret: true,
      },
    ],
  },
  {
    id: "linear",
    name: "Linear",
    description: "Create a Linear issue for triggered alerts.",
    fields: [
      { key: "team_id", label: "Team ID", placeholder: "Linear team UUID" },
      {
        key: "api_key",
        label: "API key",
        placeholder: "lin_api_...",
        secret: true,
      },
    ],
  },
  {
    id: "jira",
    name: "Jira",
    description: "Create a Jira task when an alert fires.",
    fields: [
      { key: "site", label: "Site", placeholder: "acme.atlassian.net" },
      { key: "email", label: "Account email", placeholder: "you@acme.com" },
      { key: "project_key", label: "Project key", placeholder: "OPS" },
      {
        key: "api_token",
        label: "API token",
        placeholder: "Atlassian API token",
        secret: true,
      },
    ],
  },
  {
    id: "clickup",
    name: "ClickUp",
    description: "Create a task in a ClickUp list.",
    fields: [
      { key: "list_id", label: "List ID", placeholder: "123456789" },
      {
        key: "api_token",
        label: "API token",
        placeholder: "pk_...",
        secret: true,
      },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    description: "Create a page in a Notion database.",
    fields: [
      { key: "database_id", label: "Database ID", placeholder: "Notion database UUID" },
      {
        key: "token",
        label: "Integration token",
        placeholder: "ntn_...",
        secret: true,
      },
    ],
  },
  {
    id: "pagerduty",
    name: "PagerDuty",
    description: "Trigger an incident via Events API v2.",
    fields: [
      {
        key: "routing_key",
        label: "Integration key",
        placeholder: "PagerDuty routing key",
        secret: true,
      },
    ],
  },
  {
    id: "datadog",
    name: "Datadog",
    description: "Emit a Datadog event for each alert.",
    fields: [
      { key: "api_key", label: "API key", placeholder: "Datadog API key", secret: true },
      { key: "app_key", label: "Application key", placeholder: "Optional", secret: true },
    ],
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Send alerts to a Telegram chat.",
    fields: [
      { key: "chat_id", label: "Chat ID", placeholder: "-100..." },
      {
        key: "bot_token",
        label: "Bot token",
        placeholder: "123456:ABC...",
        secret: true,
      },
    ],
  },
  {
    id: "webhook",
    name: "Generic webhook",
    description: "POST JSON to any HTTPS endpoint.",
    fields: [
      {
        key: "webhook_url",
        label: "HTTPS URL",
        placeholder: "https://example.com/hooks/pulseguard",
        secret: true,
      },
    ],
  },
];

export default function IntegrationsTab({ project }: { project: Project }) {
  const [items, setItems] = useState<ProjectIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ProviderId | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const byProvider = useMemo(
    () => Object.fromEntries(items.map((item) => [item.provider, item])),
    [items],
  );

  const load = async () => {
    setLoading(true);
    try {
      setItems(await listIntegrations(project.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load integrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [project.id]);

  const openConnect = (provider: ProviderId) => {
    const existing = byProvider[provider];
    const next: Record<string, string> = {};
    if (existing?.config) {
      for (const [key, value] of Object.entries(existing.config)) {
        if (typeof value === "string") next[key] = value;
      }
    }
    setValues(next);
    setActive(provider);
  };

  const handleSave = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await upsertIntegration(project.id, active, values, true);
      toast.success("Integration saved");
      setActive(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (item: ProjectIntegration) => {
    try {
      await testIntegration(project.id, item.id);
      toast.success("Test sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Test failed");
    }
  };

  const handleDisconnect = async (item: ProjectIntegration) => {
    try {
      await deleteIntegration(project.id, item.id);
      toast.success("Disconnected");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disconnect");
    }
  };

  const providerMeta = providers.find((item) => item.id === active);

  return (
    <div className="space-y-4">
      <p className="text-xs text-pg-muted">
        Connect tools with a webhook or API key. These destinations are more reliable than OAuth for alert delivery and do not require registering a PulseGuard app with each vendor.
      </p>
      {loading ? (
        <div className="rounded-lg bg-pg-group px-4 py-16 text-center text-xs text-pg-muted">
          Loading integrations...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {providers.map((provider) => {
            const connected = byProvider[provider.id];
            return (
              <div key={provider.id} className="rounded-lg bg-pg-group p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-pg-text">{provider.name}</p>
                    <p className="mt-1 text-xs text-pg-muted">{provider.description}</p>
                  </div>
                  <span className="text-[11px] text-pg-muted">
                    {connected ? (connected.enabled ? "On" : "Paused") : "Off"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    className="h-8 rounded-lg px-3 text-xs shadow-none"
                    variant={connected ? "ghost" : "default"}
                    onClick={() => openConnect(provider.id)}
                  >
                    {connected ? "Configure" : "Connect"}
                  </Button>
                  {connected ? (
                    <>
                      <Button
                        variant="ghost"
                        className="h-8 px-3 text-xs shadow-none"
                        onClick={() => handleTest(connected)}
                      >
                        Test
                      </Button>
                      <Switch
                        checked={connected.enabled}
                        onCheckedChange={async (enabled) => {
                          try {
                            await setIntegrationEnabled(project.id, connected.id, enabled);
                            await load();
                          } catch (error) {
                            toast.error(
                              error instanceof Error ? error.message : "Failed to update",
                            );
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        className="h-8 px-3 text-xs text-red-500 shadow-none"
                        onClick={() => handleDisconnect(connected)}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              {providerMeta?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {providerMeta?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {providerMeta?.fields.map((field) => (
              <div key={field.key}>
                <label className="mb-1.5 block text-xs text-pg-muted">{field.label}</label>
                <Input
                  type={field.secret ? "password" : "text"}
                  value={values[field.key] || ""}
                  placeholder={
                    byProvider[providerMeta.id]?.config?.[`${field.key}_set`]
                      ? "Leave blank to keep current"
                      : field.placeholder
                  }
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                  className="h-9 text-sm"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              className="btn-primary h-8 text-xs"
              onClick={handleSave}
              loading={saving}
              loadingText="Saving..."
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
