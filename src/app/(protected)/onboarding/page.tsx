"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { createWorkspace } from "@/lib/api/workspace-api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Briefcase, Loader2, ArrowRight, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Logo } from "@/app/(auth)/signin/page";

// Onboarding page theme toggle
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="absolute top-4 right-4 z-50 p-2.5 rounded-full border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center hover:bg-zinc-900"
      title={`Switch theme`}
      id="onboarding-theme-toggle"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-orange-400" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-500" />
      )}
    </button>
  );
};

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
          <div>
            
          </div>
          <Logo />

          <div className="mb-8 text-left">
            <h2 className="text-2xl font-normal tracking-[-0.058em] text-white font-sans">
              Create your workspace
            </h2>
            <p className="mt-2 text-sm text-zinc-400 font-sans">
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
                  className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs text-left"
                  id="onboarding-error-feedback"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-left w-full">
              <label
                className="block text-zinc-400 text-xs font-medium mb-1.5 select-none"
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
                  className="w-full h-9.5 pl-10 pr-4 rounded-lg bg-zinc-900/60 border border-zinc-800 focus:border-zinc-500 focus:outline-none text-white text-[13.5px] transition-colors duration-200"
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
              className="inline-flex items-center justify-center whitespace-nowrap rounded-[5px] font-medium relative transition-all duration-150 ease-in-out active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 bg-btn-primary h-9.5 px-4 text-sm gap-2 w-full cursor-pointer group"
            >
              <motion.span
                className="flex items-center justify-center gap-2"
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-800" />
                    <span>Creating workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-800" />
                  </>
                )}
              </motion.span>
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Trademark bottom line */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-mono text-zinc-600 select-none tracking-wider font-light">
        PULSEGUARD &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}
