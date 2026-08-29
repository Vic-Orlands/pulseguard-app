"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  getInvitation,
  acceptInvitation,
  type WorkspaceInvitation,
} from "@/lib/api/workspace-api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getPostAuthPath } from "@/lib/last-project";
import { ArrowRight, LogOut, Loader2 } from "@/components/phosphor-icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageFooter } from "@/components/page-footer";
import { HugeiconsIcon } from "@/components/phosphor-icons";
import {
  Cancel01Icon,
  Loading02Icon,
  CheckmarkCircle01Icon,
} from "@/components/phosphor-icons";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(searchParams.get("token"));
  const { user, fetchWorkspaces, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<
    (WorkspaceInvitation & { workspaceName: string }) | null
  >(null);
  const [error, setError] = useState("");
  const [isAccepting, startAcceptTransition] = useTransition();

  useEffect(() => {
    if (token) return;
    const fragmentToken = new URLSearchParams(window.location.hash.slice(1)).get(
      "token",
    );
    if (fragmentToken) setToken(fragmentToken);
  }, [token]);

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

        if (user && data.email.toLowerCase() !== user.email.toLowerCase()) {
          setError(
            `This invitation was sent to ${data.email}, but you are logged in as ${user.email}.`,
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load invitation details",
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
        router.push(getPostAuthPath());
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to accept invitation",
        );
      }
    });
  };

  return (
    <div className="bg-dot-pattern min-h-screen w-full flex items-center justify-center text-white relative overflow-x-hidden select-none py-12 px-4">
      <ThemeToggle />

      <div className="w-full z-10 flex flex-col justify-center max-w-lg relative">
        <div className="w-full max-w-[364px] mx-auto flex flex-col items-center">
          {loading && (
            <div className="w-full flex flex-col items-center py-8 space-y-4">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
              <p className="text-xs text-zinc-500">
                Verifying invitation details...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="w-full">
              <div className="mb-8 text-center">
                <div className="mx-auto h-12 w-12 rounded-full dark:bg-red-950/30 flex items-center justify-center border-2 dark:border border-red-400 dark:border-red-900/40 mb-4">
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    className="h-5 w-5 text-red-400"
                  />
                </div>
                <h2 className="form-heading">Invitation Error</h2>
                <p className="mt-1 form-subtitle leading-relaxed">{error}</p>
              </div>

              {user && error.includes("logged in as") && (
                <div className="w-full flex flex-col gap-2.5">
                  <motion.button
                    whileTap={{ scale: 0.99 }}
                    onClick={logout}
                    className="btn-primary w-full"
                  >
                    <motion.span
                      className="flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.04 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out of {user.email}
                    </motion.span>
                  </motion.button>
                  <button
                    onClick={() => router.push(getPostAuthPath())}
                    className="text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer bg-transparent border-0 text-center py-1"
                  >
                    Go to Projects
                  </button>
                </div>
              )}

              {!user && (
                <motion.button
                  whileTap={{ scale: 0.99 }}
                  onClick={() =>
                    router.push(
                      `/signin?redirect=${encodeURIComponent(
                        window.location.pathname + window.location.search,
                      )}`,
                    )
                  }
                  className="btn-primary w-full"
                >
                  <motion.span
                    className="flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    Sign In to Accept
                  </motion.span>
                </motion.button>
              )}
            </div>
          )}

          {/* Invite ready */}
          {!loading && !error && invite && (
            <div className="w-full">
              <div className="mb-8 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-zinc-900/60 flex items-center justify-center border border-zinc-800 mb-4">
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    className="h-5 w-5 text-white"
                  />
                </div>
                <h1 className="form-heading">Join Workspace</h1>
                <p className="mt-2 form-subtitle leading-relaxed">
                  You&apos;ve been invited to join{" "}
                  <span className="font-semibold text-white">
                    {invite.workspaceName}
                  </span>{" "}
                  as a{" "}
                  <span className="font-semibold text-white">
                    {invite.role}
                  </span>
                  .
                </p>
              </div>

              <div className="p-3.5 mb-6 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                <span className="text-[10px] font-semibold text-zinc-500 block mb-1">
                  Logged In As
                </span>
                <span className="text-xs text-white font-medium block truncate">
                  {user?.name} ({user?.email})
                </span>
              </div>

              <div className="w-full flex flex-col gap-2.5">
                <motion.button
                  whileTap={{ scale: 0.99 }}
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="btn-primary w-full"
                >
                  <motion.span
                    className="flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {isAccepting ? (
                      <>
                        <HugeiconsIcon
                          icon={Loading02Icon}
                          className="w-4 h-4 animate-spin text-current"
                        />
                        Accepting Invite...
                      </>
                    ) : (
                      <>
                        Accept and Continue
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </motion.span>
                </motion.button>

                <button
                  onClick={() => router.push(getPostAuthPath())}
                  disabled={isAccepting}
                  className="group inline-flex items-center justify-center gap-1.5 text-zinc-400 hover:text-white font-medium text-[13px] transition-colors duration-200 cursor-pointer focus:outline-none bg-transparent py-2"
                >
                  Decline
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <PageFooter />
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-dot-pattern flex min-h-screen items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
