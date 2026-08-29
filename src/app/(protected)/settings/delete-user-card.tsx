import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Alert01Icon, Cancel01Icon, CheckmarkCircle01Icon, Delete02Icon, Refresh01Icon } from "@/components/phosphor-icons";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deleteUser } from "@/lib/api/user-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

import type { DeleteAccountDialogProps } from "@/types/settings";

export const RenderDeleteAccountDialogComp = ({
  isOpen,
  onClose,
  signedInWithGithub,
}: DeleteAccountDialogProps) => {
  const [step, setStep] = useState<
    "confirm" | "email" | "deleting" | "complete" | "error"
  >("confirm");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { user, setUser } = useAuth();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("confirm");
      setConfirmEmail("");
      setErrorMessage("");
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (step === "email" && confirmEmail !== user?.email) {
      setErrorMessage("Email address does not match your account email.");
      return;
    }

    setStep("deleting");

    try {
      document.body.style.transition = "opacity 2s ease-out";
      document.body.style.opacity = "0.3";

      const res = await deleteUser();
      if (!res || !res.message) {
        throw new Error("Failed to delete account");
      }

      setTimeout(() => {
        setStep("complete");
      }, 3000);

      setTimeout(() => {
        onClose();
        toast.success("Account deleted successfully!");
        setUser(null);
        document.body.style.transition = "";
        document.body.style.opacity = "";
        router.push("/signin");
      }, 5000);
    } catch (error) {
      console.error("Error deleting account:", error);
      setStep("error");
      setErrorMessage("Failed to delete account. Please try again.");
      toast.error("Failed to delete account");
      document.body.style.opacity = "1";
    }
  };

  const handleRetry = () => {
    setStep("email");
    setConfirmEmail("");
    setErrorMessage("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pg-backdrop z-50"
            onClick={step !== "deleting" ? onClose : undefined}
          />

          {/* Dialog Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              layout
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                width: step === "deleting" ? 380 : 460,
                height: "fit-content",
              }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                layout: { duration: 0.4, ease: "easeInOut" },
              }}
              className="pg-modal shadow-none overflow-hidden text-pg-text"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                {step === "confirm" && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 h-full flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-[90%]">
                        <h3 className="text-sm font-semibold text-destructive">Delete Account</h3>
                        <p className="text-xs text-pg-muted mt-0.5">
                          This will permanently delete your account and all associated data.
                        </p>
                      </div>
                      <button
                        onClick={onClose}
                        className="cursor-pointer w-7 h-7 rounded bg-pg-surface flex items-center justify-center hover:bg-pg-overlay hover:text-pg-text text-pg-subtle transition-colors focus:outline-none border-0"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex-1 mb-5 space-y-3.5">
                      <div className="bg-destructive/5 p-3.5 rounded-lg border border-destructive/20">
                        <h4 className="text-xs font-semibold text-destructive mb-1.5">
                          This will delete:
                        </h4>
                        <ul className="text-xs text-destructive/80 space-y-1">
                          <li>• Your account and profile</li>
                          <li>• All projects and their data</li>
                          <li>• All monitoring history and logs</li>
                          <li>• All API keys and configurations</li>
                        </ul>
                      </div>
                      <p className="text-xs text-destructive/80 leading-relaxed">
                        This action is irreversible. Please make sure you have exported any data you want to keep.
                      </p>
                    </div>
                    <div className="flex space-x-2.5">
                      <Button
                        variant="outline"
                        className="flex-1 border border-pg-border text-pg-text hover:bg-pg-surface text-xs h-8 shadow-none font-semibold cursor-pointer"
                        onClick={onClose}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8 shadow-none font-semibold cursor-pointer"
                        onClick={() => setStep("email")}
                      >
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === "email" && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 h-full flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center">
                          <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-destructive" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-pg-text">
                            Confirm Deletion
                          </h3>
                          <p className="text-xs text-pg-muted mt-0.5">
                            {signedInWithGithub
                              ? "We understand all things come to an end..."
                              : "Please confirm by typing your email address."}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="cursor-pointer w-7 h-7 rounded bg-pg-surface flex items-center justify-center hover:bg-pg-overlay hover:text-pg-text text-pg-subtle transition-colors focus:outline-none border-0"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex-1 mb-5">
                      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3.5">
                        {signedInWithGithub ? (
                          <p className="text-xs text-destructive mb-2">
                            Still, we hate to see you go.
                          </p>
                        ) : (
                          <p className="text-xs text-destructive mb-2">
                            Type your email address (<strong>{user?.email}</strong>) to confirm:
                          </p>
                        )}
                        <Input
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                          className="bg-pg-surface text-pg-text border-pg-err-bd focus-visible:ring-1 focus-visible:ring-pg-err-txt text-xs h-8 shadow-none"
                          disabled={signedInWithGithub}
                          placeholder={user?.email}
                          autoFocus
                        />
                        {errorMessage && (
                          <p className="text-xs text-destructive mt-2">
                            {errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2.5">
                      <Button
                        variant="outline"
                        className="flex-1 border border-pg-border text-pg-text hover:bg-pg-surface text-xs h-8 shadow-none font-semibold cursor-pointer"
                        onClick={onClose}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8 shadow-none font-semibold cursor-pointer flex items-center justify-center gap-1.5"
                        onClick={handleDelete}
                        disabled={confirmEmail !== user?.email}
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="h-3.5 w-3.5" />
                        <span>Delete Account</span>
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === "deleting" && (
                  <motion.div
                    key="deleting"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.2 }}
                    className="p-8 h-full flex flex-col items-center justify-center"
                  >
                    <AnimatePresence>
                      {step === "deleting" && (
                        <motion.div
                          key="progress"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="text-center"
                        >
                          <div className="mb-4 relative">
                            <svg
                              width="60"
                              height="60"
                              viewBox="0 0 80 80"
                              className="mx-auto"
                            >
                              <motion.circle
                                cx="40"
                                cy="40"
                                r="35"
                                fill="none"
                                stroke="var(--destructive)"
                                strokeWidth="2.5"
                                strokeDasharray="220"
                                strokeDashoffset="220"
                                animate={{
                                  strokeDashoffset: [220, 0, 220],
                                  rotate: [0, 360],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              />
                            </svg>
                          </div>

                          <h3 className="text-sm font-semibold text-pg-text mb-1 animate-pulse">
                            Deleting Account...
                          </h3>

                          <p className="text-pg-muted text-xs">
                            Removing workspace telemetry and database logs.
                          </p>

                          <div className="flex justify-center space-x-1 mt-4">
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-destructive rounded-full"
                                animate={{
                                  opacity: [0.3, 1, 0.3],
                                  scale: [0.8, 1.2, 0.8],
                                }}
                                transition={{
                                  duration: 0.8,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                  ease: "easeInOut",
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {step === "complete" && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: "spring",
                      damping: 15,
                      stiffness: 300,
                    }}
                    className="p-8 h-full flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3.5 border border-emerald-500/20">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <h3 className="text-sm font-semibold text-pg-text mb-1">
                      Account Deleted
                    </h3>

                    <p className="text-pg-muted text-xs">
                      Your PulseGuard account was permanently removed. We hope
                      to see you again!
                    </p>
                  </motion.div>
                )}

                {step === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 h-full flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center">
                          <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-destructive" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-pg-text">
                            Deletion Failed
                          </h3>
                          <p className="text-xs text-pg-muted mt-0.5">
                            Something went wrong
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="w-7 h-7 rounded bg-pg-surface flex items-center justify-center hover:bg-pg-overlay hover:text-pg-text text-pg-subtle transition-colors cursor-pointer focus:outline-none border-0"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex-1 mb-5">
                      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3.5">
                        <p className="text-xs text-destructive mb-2">
                          Type email to try again:
                        </p>
                        <Input
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                          className="bg-pg-surface text-pg-text border-pg-err-bd focus-visible:ring-1 focus-visible:ring-pg-err-txt text-xs h-8 shadow-none"
                          placeholder={user?.email}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2.5">
                      <Button
                        variant="outline"
                        className="flex-1 border border-pg-border text-pg-text hover:bg-pg-surface text-xs h-8 shadow-none font-semibold cursor-pointer"
                        onClick={onClose}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8 shadow-none font-semibold cursor-pointer flex items-center justify-center space-x-2"
                        onClick={handleRetry}
                        disabled={confirmEmail !== user?.email}
                      >
                        <HugeiconsIcon icon={Refresh01Icon} className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
