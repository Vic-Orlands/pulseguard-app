"use client";

import React, { useEffect, useState } from "react";
import { Briefcase } from "@/components/phosphor-icons";
import { useAuth } from "@/context/auth-context";
import { createWorkspace } from "@/lib/api/workspace-api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({
  isOpen,
  onClose,
}: CreateWorkspaceModalProps) {
  const { fetchWorkspaces, setActiveWorkspace } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newWs = await createWorkspace(name.trim());
      toast.success("Workspace created successfully!");
      await fetchWorkspaces();
      setActiveWorkspace(newWs);
      setName("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create workspace",
      );
      toast.error("Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="pg-modal max-w-sm p-6 shadow-none">
        <div className="space-y-5">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-xl font-normal tracking-[-0.058em] text-pg-text font-sans">
              Create new workspace
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-pg-muted">
              Name your workspace to group telemetry projects, environments,
              and ownership boundaries.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="banner-error">{error}</div>}

            <div className="text-left">
              <label className="form-label" htmlFor="modal-workspace-name">
                Workspace Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pg-subtle pointer-events-none">
                  <Briefcase className="h-4 w-4" />
                </span>
                <input
                  id="modal-workspace-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="e.g. Acme Corp, Personal"
                  className="input-field"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-9 border-pg-border bg-transparent text-pg-muted shadow-none hover:bg-pg-surface hover:text-pg-text"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary w-full sm:w-auto shadow-none"
                loading={loading}
                loadingText="Creating workspace..."
              >
                Create Workspace
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
