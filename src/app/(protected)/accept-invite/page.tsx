"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getInvitation, acceptInvitation, type WorkspaceInvitation } from "@/lib/api/workspace-api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ArrowRight, XCircle, LogOut } from "lucide-react";
import { PulseGuardLogo } from "@/components/Icons";

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { user, fetchWorkspaces, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<(WorkspaceInvitation & { workspaceName: string }) | null>(null);
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

        // Verification: Check if invited email matches current user email
        if (user && data.email.toLowerCase() !== user.email.toLowerCase()) {
          setError(
            `This invitation was sent to ${data.email}, but you are logged in as ${user.email}.`
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invitation details");
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
        // Refresh local workspace context state
        await fetchWorkspaces();
        router.push("/projects");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to accept invitation");
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Dots */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "#000000",
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.06) 1px, transparent 1px)`,
          backgroundSize: "8px 8px",
        }}
      />

      {/* Decorative Glow */}
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
        {loading ? (
          <div className="flex flex-col items-center py-8 space-y-4">
            <Loader2 className="h-6 w-6 animate-spin text-[#ff5a1f]" />
            <p className="text-xs text-[#73736e]">Verifying invitation details...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 space-y-5">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Invitation Error</h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{error}</p>
            </div>
            {user && error.includes("logged in as") && (
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={logout}
                  className="w-full py-2 px-4 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-[#333] transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out of {user.email}
                </button>
                <button
                  onClick={() => router.push("/projects")}
                  className="text-xs text-muted-foreground hover:text-white transition-colors"
                >
                  Go to Projects
                </button>
              </div>
            )}
            {!user && (
              <button
                onClick={() => router.push(`/signin?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                className="w-full py-2 px-4 rounded-lg bg-[#ff5a1f] hover:bg-[#e04e18] text-white font-medium text-xs cursor-pointer transition-colors"
              >
                Sign In to Accept
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-[#ff5a1f]/10 flex items-center justify-center border border-[#ff5a1f]/20 mb-4">
                <CheckCircle2 className="h-6 w-6 text-[#ff5a1f]" />
              </div>
              <h1 className="text-lg font-semibold text-white tracking-tight">
                Join Workspace
              </h1>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                You have been invited to join <span className="font-semibold text-white">{invite?.workspaceName}</span> as a <span className="font-semibold text-white">{invite?.role}</span>.
              </p>
            </div>

            <div className="p-3.5 bg-[#121212] border border-[#222] rounded-lg">
              <span className="text-[10px] font-semibold text-muted-foreground block uppercase tracking-wide mb-1">Logged In As</span>
              <span className="text-xs text-white font-medium block truncate">{user?.name} ({user?.email})</span>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleAccept}
                disabled={isAccepting}
                className="w-full py-2 px-4 rounded-lg bg-[#ff5a1f] hover:bg-[#e04e18] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
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
                className="w-full py-2 px-4 rounded-lg bg-transparent hover:bg-white/5 text-muted-foreground hover:text-white font-medium text-xs cursor-pointer transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
