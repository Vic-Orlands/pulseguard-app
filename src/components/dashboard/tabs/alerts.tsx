"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { HugeiconsIcon } from "@/components/phosphor-icons";
import {
  Add01Icon,
  Alert01Icon,
  Delete02Icon,
  Notification01Icon,
} from "@/components/phosphor-icons";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/dashboard/shared/page-skeleton";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomAlertDialog } from "@/components/dashboard/shared/custom-alert-dialog";
import {
  createAlert,
  deleteAlert,
  listAlerts,
  updateAlert,
} from "@/lib/api/alerts-api";
import type { Alert, Project } from "@/types/dashboard";

const alertTypes = [
  { value: "error_count", label: "Error count" },
  { value: "new_error", label: "New error groups" },
];

const severities = ["info", "warning", "error", "critical"];

function conditionLabel(alert: Alert) {
  const type =
    alertTypes.find((item) => item.value === alert.type)?.label || alert.type;
  return `${type} ≥ ${alert.threshold} in ${alert.window_minutes}m`;
}

export default function AlertsTab({ project }: { project: Project }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Alert | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "error_count",
    threshold: 5,
    window_minutes: 15,
    severity: "error",
    notify_in_app: true,
    notify_email: false,
  });

  const load = async () => {
    setLoading(true);
    try {
      setAlerts(await listAlerts(project.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [project.id]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      type: "error_count",
      threshold: 5,
      window_minutes: 15,
      severity: "error",
      notify_in_app: true,
      notify_email: false,
    });
    setDialogOpen(true);
  };

  const openEdit = (alert: Alert) => {
    setEditing(alert);
    setForm({
      name: alert.name,
      type: alert.type || "error_count",
      threshold: alert.threshold,
      window_minutes: alert.window_minutes,
      severity: alert.severity || "error",
      notify_in_app: alert.notify_in_app,
      notify_email: alert.notify_email,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Give this alert a name");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateAlert(project.id, editing.id, {
          name: form.name.trim(),
          type: form.type,
          threshold: Number(form.threshold),
          window_minutes: Number(form.window_minutes),
          severity: form.severity,
          notify_in_app: form.notify_in_app,
          notify_email: form.notify_email,
        });
        toast.success("Alert updated");
      } else {
        await createAlert({
          project_id: project.id,
          name: form.name.trim(),
          message: form.name.trim(),
          type: form.type,
          threshold: Number(form.threshold),
          window_minutes: Number(form.window_minutes),
          severity: form.severity,
          notify_in_app: form.notify_in_app,
          notify_email: form.notify_email,
        });
        toast.success("Alert created");
      }
      setDialogOpen(false);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save alert");
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (alert: Alert, enabled: boolean) => {
    try {
      await updateAlert(project.id, alert.id, { enabled });
      setAlerts((current) =>
        current.map((item) => (item.id === alert.id ? { ...item, enabled } : item)),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update alert");
    }
  };

  const handleDelete = async (alert: Alert) => {
    try {
      await deleteAlert(project.id, alert.id);
      toast.success("Alert deleted");
      setAlerts((current) => current.filter((item) => item.id !== alert.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete alert");
    }
  };

  const enabledCount = useMemo(
    () => alerts.filter((alert) => alert.enabled).length,
    [alerts],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-pg-text">
            {enabledCount} active rule{enabledCount === 1 ? "" : "s"} for {project.name}
          </p>
          <p className="text-xs text-pg-muted">
            Alerts fire on incoming errors and notify the workspace plus connected tools.
          </p>
        </div>
        <Button className="btn-primary h-8 rounded-lg px-3 text-xs font-semibold" onClick={openCreate}>
          <HugeiconsIcon icon={Add01Icon} className="mr-1.5 h-3.5 w-3.5" />
          New alert
        </Button>
      </div>

      {loading ? (
        <PageSkeleton variant="table" />
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg bg-pg-group px-4 py-20 text-center">
          <HugeiconsIcon icon={Notification01Icon} className="mb-3 h-8 w-8 text-pg-muted" />
          <p className="text-sm font-medium text-pg-text">No alert rules yet</p>
          <p className="mt-1 max-w-sm text-xs text-pg-muted">
            Create a rule to get notified when error volume or new error groups cross a threshold.
          </p>
          <Button className="btn-primary mt-4 h-8 text-xs" onClick={openCreate}>
            Create first alert
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Last triggered</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow
                key={alert.id}
                className="cursor-pointer"
                onClick={() => openEdit(alert)}
              >
                <TableCell className="text-xs font-medium text-pg-text">
                  {alert.name}
                </TableCell>
                <TableCell className="text-xs text-pg-muted">
                  {conditionLabel(alert)}
                </TableCell>
                <TableCell className="text-xs capitalize text-pg-muted">
                  {alert.severity}
                </TableCell>
                <TableCell className="text-xs text-pg-muted">
                  {alert.last_triggered_at
                    ? format(new Date(alert.last_triggered_at), "MMM d, yyyy, h:mma")
                    : "Never"}
                </TableCell>
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <Switch
                    checked={alert.enabled}
                    onCheckedChange={(enabled) => toggleEnabled(alert, enabled)}
                  />
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <CustomAlertDialog
                    trigger={
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shadow-none">
                        <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    }
                    title="Delete alert"
                    description={`Delete “${alert.name}”? This cannot be undone.`}
                    onConfirm={() => handleDelete(alert)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              {editing ? "Edit alert" : "New alert"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Rules are evaluated when this project records a new error.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs text-pg-muted">Name</label>
              <Input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="High error volume"
                className="h-9 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs text-pg-muted">Type</label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="h-9 text-xs shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {alertTypes.map((item) => (
                      <SelectItem key={item.value} value={item.value} className="text-xs">
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-pg-muted">Severity</label>
                <Select
                  value={form.severity}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger className="h-9 text-xs shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {severities.map((item) => (
                      <SelectItem key={item} value={item} className="text-xs capitalize">
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs text-pg-muted">Threshold</label>
                <Input
                  type="number"
                  min={1}
                  value={form.threshold}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, threshold: Number(event.target.value) }))
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-pg-muted">Window (minutes)</label>
                <Input
                  type="number"
                  min={1}
                  value={form.window_minutes}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      window_minutes: Number(event.target.value),
                    }))
                  }
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-pg-group px-3 py-2.5">
              <span className="text-xs text-pg-text">In-app notifications</span>
              <Switch
                checked={form.notify_in_app}
                onCheckedChange={(notify_in_app) =>
                  setForm((prev) => ({ ...prev, notify_in_app }))
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-pg-group px-3 py-2.5">
              <span className="text-xs text-pg-text">Email (uses account prefs)</span>
              <Switch
                checked={form.notify_email}
                onCheckedChange={(notify_email) =>
                  setForm((prev) => ({ ...prev, notify_email }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="btn-primary h-8 text-xs"
              onClick={handleSave}
              loading={saving}
              loadingText="Saving..."
            >
              <HugeiconsIcon icon={Alert01Icon} className="mr-1.5 h-3.5 w-3.5" />
              Save alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
