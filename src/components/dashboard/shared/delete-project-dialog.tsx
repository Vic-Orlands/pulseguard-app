import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon, Cancel01Icon, CheckmarkCircle01Icon, Delete02Icon, Refresh01Icon } from "@hugeicons/core-free-icons";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/lib/api/projects-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import type { DeleteProjectDialogProps } from "@/types/project";

export const DeleteProjectDialog = ({
  isOpen,
  onClose,
  project,
}: DeleteProjectDialogProps) => {
  const [step, setStep] = useState<
    "confirm" | "deleting" | "complete" | "error"
  >("confirm");
  const [confirmText, setConfirmText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("confirm");
      setConfirmText("");
      setErrorMessage("");
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;

    setStep("deleting");

    try {
      await deleteProject(project.slug);

      // Auto-close and redirect after completion
      setTimeout(() => {
        setStep("complete");
      }, 3000);

      setTimeout(() => {
        onClose();
        toast.success("Project deleted successfully!");
        router.push("/projects");
      }, 5000);
    } catch (error) {
      console.error("Error deleting project:", error);
      setStep("error");
      setErrorMessage("Failed to delete project. Please try again.");
      toast.error("Failed to delete project");
    }
  };

  const handleRetry = () => {
    setStep("confirm");
    setConfirmText("");
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
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50"
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
              className="bg-card border border-border rounded-lg shadow-sm overflow-hidden text-foreground"
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
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center">
                          <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-destructive" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">
                            Delete Project
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            This action cannot be undone
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="cursor-pointer w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-accent hover:text-foreground text-muted-foreground transition-colors"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 mb-5 space-y-3.5">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-foreground">
                          &quot;{project.name}&quot;
                        </span>
                        ? All associated data will be permanently removed.
                      </p>
                      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3.5">
                        <p className="text-xs text-destructive mb-2">
                          Type <strong>DELETE</strong> to confirm:
                        </p>
                        <Input
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          className="bg-card text-foreground border-destructive/30 focus-visible:ring-1 focus-visible:ring-destructive/50 text-xs h-8 shadow-none"
                          placeholder="Type DELETE to confirm"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2.5">
                      <Button
                        variant="outline"
                        className="flex-1 border-border text-foreground hover:bg-muted text-xs h-8 shadow-none font-semibold cursor-pointer"
                        onClick={onClose}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8 shadow-none font-semibold cursor-pointer flex items-center justify-center space-x-2"
                        onClick={handleDelete}
                        disabled={confirmText !== "DELETE"}
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="w-3.5 h-3.5" />
                        <span>Delete</span>
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
                          {/* Animated SVG */}
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

                          <h3 className="text-sm font-bold text-foreground mb-1 animate-pulse">
                            Deleting Project...
                          </h3>

                          <p className="text-muted-foreground text-xs">
                            Removing &quot;{project.name}&quot;
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

                    <h3 className="text-sm font-bold text-foreground mb-1">
                      Project Deleted
                    </h3>

                    <p className="text-muted-foreground text-xs">
                      &quot;{project.name}&quot; has been removed
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
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center">
                          <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-destructive" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">
                            Deletion Failed
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Something went wrong
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-accent hover:text-foreground text-muted-foreground transition-colors cursor-pointer"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 mb-5 space-y-3.5">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {errorMessage}
                      </p>
                      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3.5">
                        <p className="text-xs text-destructive mb-2">
                          Type <strong>DELETE</strong> to try again:
                        </p>
                        <Input
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          className="bg-card text-foreground border-destructive/30 focus-visible:ring-1 focus-visible:ring-destructive/50 text-xs h-8 shadow-none"
                          placeholder="Type DELETE to confirm"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2.5">
                      <Button
                        variant="outline"
                        className="flex-1 border-border text-foreground hover:bg-muted text-xs h-8 shadow-none font-semibold cursor-pointer"
                        onClick={onClose}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8 shadow-none font-semibold cursor-pointer flex items-center justify-center space-x-2"
                        onClick={handleRetry}
                        disabled={confirmText !== "DELETE"}
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
