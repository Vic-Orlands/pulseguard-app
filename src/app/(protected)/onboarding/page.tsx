"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { createWorkspace } from "@/lib/api/workspace-api";
import { Briefcase, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageFooter } from "@/components/page-footer";
import { Logo } from "@/app/(auth)/signin/page";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading02Icon } from "@hugeicons/core-free-icons";

export default function OnboardingPage() {
  const router = useRouter();
  const { fetchWorkspaces } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Workspace name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createWorkspace(name.trim());
      toast.success("Workspace created successfully!");
      await fetchWorkspaces();
      router.push("/projects");
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
    <div className="bg-dot-pattern min-h-screen w-full flex items-center justify-center text-white relative overflow-x-hidden select-none py-12 px-4">
      <ThemeToggle />

      <div className="w-full z-10 flex flex-col justify-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[364px] mx-auto px-4"
          id="onboarding-container"
        >
          <div className="w-fit pl-4">
            <Logo />
          </div>

          <div className="mb-8 text-left">
            <h2 className="form-heading">
              Create your workspace
            </h2>
            <p className="mt-2 form-subtitle">
              Name your workspace to group your telemetry databases and projects
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="banner-error"
                  id="onboarding-error-feedback"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-left w-full">
              <label
                className="form-label"
                htmlFor="workspace-name"
              >
                Workspace Name
              </label>
              <div className="relative w-full">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 flex items-center justify-center pointer-events-none">
                  <Briefcase className="h-4 w-4" />
                </span>
                <input
                  id="workspace-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="e.g. Acme Corp, Personal"
                  className="input-field"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Primary Action Button */}
            <motion.button
              id="btn-submit-onboarding"
              type="submit"
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              className="btn-primary w-full"
            >
              <motion.span
                className="flex items-center justify-center gap-2"
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {loading ? (
                  <>
                    <HugeiconsIcon
                      icon={Loading02Icon}
                      className="w-4 h-4 animate-spin text-current"
                    />
                    <span>Creating workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="h-3.5 w-3.5 text-current" />
                  </>
                )}
              </motion.span>
            </motion.button>
          </form>
        </motion.div>
      </div>

      <PageFooter />
    </div>
  );
}
