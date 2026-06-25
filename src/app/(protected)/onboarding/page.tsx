"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { createWorkspace } from "@/lib/api/workspace-api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Briefcase, Loader2, ArrowRight } from "lucide-react";
import { PulseGuardLogo } from "@/components/Icons";

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
      // Reload workspaces in the context
      await fetchWorkspaces();
      router.push("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workspace");
      toast.error("Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Tiny Congested Dotted Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "#000000",
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.06) 1px, transparent 1px)`,
          backgroundSize: "8px 8px",
        }}
      />

      {/* Decorative Brand Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] opacity-40 [background-image:radial-gradient(circle_at_50%_100%,rgba(255,90,31,0.14),transparent_44%)]"
      />

      <div className="flex items-center justify-center rounded-full backdrop-blur-sm relative z-10 mb-6">
        <PulseGuardLogo />
      </div>

      <motion.div
        className="w-full max-w-md p-8 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] shadow-2xl z-10 relative overflow-hidden"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Create your workspace
          </h1>
          <p className="text-xs text-[#73736e] mt-2 leading-relaxed">
            Name your workspace to group your projects, team members, and telemetry databases.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="workspace-name" className="block text-xs font-medium text-gray-400 mb-2">
              Workspace Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Briefcase className="h-4 w-4" />
              </div>
              <input
                id="workspace-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. Acme Corp, Personal"
                className="block w-full pl-10 pr-4 py-2 bg-[#121212] border border-[#222] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#ff5a1f] focus:ring-1 focus:ring-[#ff5a1f] transition-all"
                disabled={loading}
              />
            </div>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-[#ff5a1f] hover:bg-[#e04e18] text-white font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Workspace...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      <div className="mt-8 text-xs text-[#525252] text-center z-10">
        &copy; {new Date().getFullYear()} PulseGuard. All rights reserved.
      </div>
    </div>
  );
}
