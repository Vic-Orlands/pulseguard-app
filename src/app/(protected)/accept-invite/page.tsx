"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  getInvitation,
  acceptInvitation,
  type WorkspaceInvitation,
} from "@/lib/api/workspace-api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, LogOut } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Loading02Icon,
} from "@hugeicons/core-free-icons";
import AnimatedBackground from "@/components/background-color";
import { Logo } from "@/app/(auth)/signin/page";

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { user, fetchWorkspaces, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<
    (WorkspaceInvitation & { workspaceName: string }) | null
  >(null);
  const [error, setError] = useState("");
  const [isAccepting, startAcceptTransition] = useTransition();

  useEffect(() => {
    if (!token) {
      setError("Invitation token is missing");
      setLoading(false);
      return;
    }

    const loadInvite = async () => {
      try {
        setLoading(true);
        const data = await getInvitation(token);
        setInvite(data);

        // Verification: check if invited email matches current user email
        if (user && data.email.toLowerCase() !== user.email.toLowerCase()) {
          setError(
            `This invitation was sent to ${data.email}, but you are logged in as ${user.email}.`
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load invitation details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadInvite();
    }
  }, [token, user]);

  const handleAccept = () => {
    if (!token) return;

    startAcceptTransition(async () => {
      try {
        await acceptInvitation(token);
        toast.success("Joined workspace successfully!");
        await fetchWorkspaces();
        router.push("/projects");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to accept invitation"
        );
      }
    });
  };

  return (
    <div className="pg-page pg-grid min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <AnimatedBackground />

      {/* Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] opacity-40 [background-image:radial-gradient(circle_at_50%_100%,rgba(255,90,31,0.14),transparent_44%)]"
      />

      <Logo />

      <motion.div
        className="pg-panel w-full max-w-md p-8 rounded-xl shadow-xs z-10 relative overflow-hidden"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {loading ? (
          /* ── Loading state ── */
          <div className="flex flex-col items-center py-8 space-y-4">
            <HugeiconsIcon
              icon={Loading02Icon}
              className="h-6 w-6 animate-spin text-zinc-400"
            />
            <p className="text-xs text-zinc-500">
              Verifying invitation details...
            </p>
          </div>
        ) : error ? (
          /* ── Error state ── */
          <div className="text-center py-4 space-y-5">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-950/30 flex items-center justify-center border border-red-900/40">
              <HugeiconsIcon
                icon={Cancel01Icon}
                className="h-5 w-5 text-red-400"
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Invitation Error
              </h2>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                {error}
              </p>
            </div>

            {user && error.includes("logged in as") && (
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={logout}
                  className="w-full bg-[#18181b] text-white border border-zinc-800 hover:opacity-90 dark:bg-[#e2e2e2] dark:text-black dark:border-transparent py-2 px-4 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-opacity"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out of {user.email}
                </button>
                <button
                  onClick={() => router.push("/projects")}
                  className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer bg-transparent border-0"
                >
                  Go to Projects
                </button>
              </div>
            )}

            {!user && (
              <button
                onClick={() =>
                  router.push(
                    `/signin?redirect=${encodeURIComponent(
                      window.location.pathname + window.location.search
                    )}`
                  )
                }
                className="w-full bg-[#18181b] text-white border border-zinc-800 hover:opacity-90 dark:bg-[#e2e2e2] dark:text-black dark:border-transparent py-2 px-4 rounded-lg font-medium text-xs cursor-pointer transition-opacity"
              >
                Sign In to Accept
              </button>
            )}
          </div>
        ) : (
          /* ── Invite ready state ── */
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 mb-4">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  className="h-5 w-5 text-white"
                />
              </div>
              <h1 className="text-2xl font-normal tracking-[-0.058em] text-white font-sans">
                Join Workspace
              </h1>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed font-sans">
                You&apos;ve been invited to join{" "}
                <span className="font-semibold text-white">
                  {invite?.workspaceName}
                </span>{" "}
                as a{" "}
                <span className="font-semibold text-white">
                  {invite?.role}
                </span>
                .
              </p>
            </div>

            {/* User info */}
            <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
              <span className="text-[10px] font-semibold text-zinc-500 block uppercase tracking-wide mb-1">
                Logged In As
              </span>
              <span className="text-xs text-white font-medium block truncate">
                {user?.name} ({user?.email})
              </span>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="w-full bg-[#18181b] text-white border border-zinc-800 hover:opacity-90 dark:bg-[#e2e2e2] dark:text-black dark:border-transparent py-2 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAccepting ? (
                  <>
                    <HugeiconsIcon
                      icon={Loading02Icon}
                      className="h-3.5 w-3.5 animate-spin"
                    />
                    Accepting Invite...
                  </>
                ) : (
                  <>
                    Accept and Continue
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              <button
                onClick={() => router.push("/projects")}
                disabled={isAccepting}
                className="w-full py-2 px-4 rounded-lg bg-transparent hover:bg-zinc-900/50 text-zinc-500 hover:text-white font-medium text-xs cursor-pointer transition-colors border-0"
              >
                Decline
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        className="mt-6 text-xs text-zinc-500 text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        &copy; {new Date().getFullYear()} PulseGuard. All rights reserved.
      </motion.div>
    </div>
  );
}
