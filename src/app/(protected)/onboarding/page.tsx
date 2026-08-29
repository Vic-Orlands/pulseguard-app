"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { createWorkspace } from "@/lib/api/workspace-api";
import { createProject } from "@/lib/api/projects-api";
import { Briefcase, ArrowRight } from "@/components/phosphor-icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageFooter } from "@/components/page-footer";
import { Logo } from "@/app/(auth)/signin/page";
import { toast } from "sonner";
import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Loading02Icon } from "@/components/phosphor-icons";

type Step = "workspace" | "project" | "dsn";

export default function OnboardingPage() {
  const router = useRouter();
  const { fetchWorkspaces, setActiveWorkspace } = useAuth();
  const [step, setStep] = useState<Step>("workspace");
  const [name, setName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [dsn, setDsn] = useState("");
  const [projectSlug, setProjectSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const workspace = await createWorkspace(name.trim());
      setWorkspaceId(workspace.id);
      await fetchWorkspaces();
      setActiveWorkspace(workspace);
      setStep("project");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workspace");
      toast.error("Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const project = await createProject({
        name: projectName.trim(),
        description: `${projectName.trim()} production app`,
        platform: "web",
        workspaceId,
      });
      setDsn(project.dsn || "");
      setProjectSlug(project.slug);
      setStep("dsn");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dot-pattern min-h-screen w-full flex items-center justify-center text-white relative overflow-x-hidden select-none py-12 px-4">
      <ThemeToggle />

      <div className="w-full z-10 flex flex-col justify-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[364px] mx-auto px-4"
        >
          <div className="w-fit pl-4">
            <Logo />
          </div>

          <div className="mb-8 text-left">
            <h2 className="form-heading">
              {step === "workspace"
                ? "Create your workspace"
                : step === "project"
                  ? "Create your first project"
                  : "Connect your app"}
            </h2>
            <p className="mt-2 form-subtitle">
              {step === "workspace"
                ? "Name your workspace to group projects and teammates"
                : step === "project"
                  ? "This is the app you’ll send errors, sessions, and logs from"
                  : "Install the SDK and paste this DSN. Skip if you want to do it later."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="banner-error mb-4"
              >
                {error}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {step === "workspace" ? (
            <form onSubmit={handleWorkspace} className="space-y-4">
              <label className="form-label" htmlFor="workspace-name">
                Workspace Name
              </label>
              <div className="relative w-full">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Briefcase className="h-4 w-4" />
                </span>
                <input
                  id="workspace-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="input-field"
                  disabled={loading}
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <HugeiconsIcon icon={Loading02Icon} className="w-4 h-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Continue <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </motion.button>
            </form>
          ) : null}

          {step === "project" ? (
            <form onSubmit={handleProject} className="space-y-4">
              <label className="form-label" htmlFor="project-name">
                Project Name
              </label>
              <input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Checkout web"
                className="input-field"
                disabled={loading}
              />
              <motion.button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? "Creating..." : "Create project"}
              </motion.button>
            </form>
          ) : null}

          {step === "dsn" ? (
            <div className="space-y-4">
              <pre className="pg-code overflow-x-auto rounded-lg p-3 text-[11px] whitespace-pre-wrap break-all">
                {`npm install pulseguard

import { TelemetryProvider } from "pulseguard";

<TelemetryProvider dsn="${dsn}">
  {children}
</TelemetryProvider>`}
              </pre>
              <button
                type="button"
                className="btn-back w-full"
                onClick={() => {
                  void navigator.clipboard.writeText(dsn);
                  toast.success("DSN copied");
                }}
              >
                Copy DSN
              </button>
              <motion.button
                type="button"
                className="btn-primary w-full"
                onClick={() => router.push(projectSlug ? `/projects/${projectSlug}` : "/projects")}
              >
                Open project
              </motion.button>
            </div>
          ) : null}
        </motion.div>
      </div>

      <PageFooter />
    </div>
  );
}
