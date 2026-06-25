"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Loader2, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { createWorkspace } from "@/lib/api/workspace-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const { fetchWorkspaces, setActiveWorkspace } = useAuth();
  const router = useRouter();
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
      const newWs = await createWorkspace(name.trim());
      toast.success("Workspace created successfully!");
      await fetchWorkspaces();
      setActiveWorkspace(newWs);
      setName("");
      onClose();
      router.push("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create workspace");
      toast.error("Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-[#0a0a0a] border border-zinc-800 rounded-xl max-w-sm w-full relative overflow-hidden z-10 text-left shadow-2xl p-6"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer z-20 bg-transparent border-0 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="mb-6 text-left">
              <h2 className="text-xl font-normal tracking-[-0.058em] text-white font-sans">
                Create new workspace
              </h2>
              <p className="mt-1.5 text-xs text-zinc-400 font-sans leading-relaxed">
                Name your workspace to group your telemetry databases and projects
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs text-left">
                  {error}
                </div>
              )}

              <div className="text-left w-full">
                <label
                  className="block text-zinc-400 text-xs font-medium mb-1.5 select-none"
                  htmlFor="modal-workspace-name"
                >
                  Workspace Name
                </label>
                <div className="relative w-full">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 flex items-center justify-center pointer-events-none">
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
                    className="w-full h-9.5 pl-10 pr-4 rounded-lg bg-zinc-900/60 border border-zinc-800 focus:border-zinc-500 focus:outline-none text-white text-[13px] transition-colors duration-200"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.99 }}
                disabled={loading}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-[5px] font-medium relative transition-all duration-150 ease-in-out active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 bg-[#e2e2e2] text-black hover:opacity-90 h-9 px-4 text-sm gap-2 w-full cursor-pointer group"
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
                    <span>Create Workspace</span>
                  )}
                </motion.span>
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
