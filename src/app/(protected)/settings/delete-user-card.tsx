import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Trash2, X, CheckCircle, RefreshCw } from "lucide-react";
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={step !== "deleting" ? onClose : undefined}
          />

          {/* Dialog Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              layout
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                width: step === "deleting" ? 400 : 500,
                height:
                  step === "deleting"
                    ? 300
                    : step === "error"
                    ? 360
                    : "fit-content",
              }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                layout: { duration: 0.6, ease: "easeInOut" },
              }}
              className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                {step === "confirm" && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 h-full flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xl text-red-400 w-[90%]">
                        <h3>Delete Account</h3>
                        <p className="text-sm text-slate-400">
                          This will permanently delete your account and all
                          associated data.
                        </p>
                      </div>
                      <button
                        onClick={onClose}
                        className="cursor-pointer w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex-1 mb-6 space-y-4">
                      <div className="bg-red-950/30 p-4 rounded-lg border border-red-900/30">
                        <h4 className="font-medium text-red-300 mb-2">
                          This will delete:
                        </h4>
                        <ul className="text-sm text-red-400/80 space-y-1">
                          <li>• Your account and profile</li>
                          <li>• All projects and their data</li>
                          <li>• All monitoring history and logs</li>
                          <li>• All API keys and configurations</li>
                        </ul>
                      </div>
                      <p className="text-sm text-red-400/80">
                        This action is irreversible. Please make sure you have
                        exported any data you want to keep.
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                        onClick={onClose}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 bg-red-700 hover:bg-red-800"
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
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 h-full flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-900/30 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Confirm Account Deletion
                          </h3>
                          <p className="text-sm text-slate-400">
                            Please confirm by typing your email address.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex-1 mb-6 space-y-4">
                      <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4">
                        <p className="text-sm text-red-300 mb-2">
                          Type your email address (
                          <strong>{user?.email}</strong>) to confirm:
                        </p>
                        <Input
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                          className="bg-slate-950 text-slate-300 border-red-700 focus:border-red-500 focus-visible:ring-0"
                          placeholder={user?.email}
                          autoFocus
                        />
                        {errorMessage && (
                          <p className="text-sm text-red-400 mt-2">
                            {errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                        onClick={onClose}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 bg-red-700 hover:bg-red-800 flex items-center justify-center space-x-2"
                        onClick={handleDelete}
                        disabled={confirmEmail !== user?.email}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Account</span>
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === "deleting" && (
                  <motion.div
                    key="deleting"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="p-8 h-full flex flex-col items-center justify-center"
                  >
                    <motion.div
                      key="progress"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-center"
                    >
                      <div className="mb-6 relative">
                        <svg
                          width="80"
                          height="80"
                          viewBox="0 0 80 80"
                          className="mx-auto"
                        >
                          <motion.circle
                            cx="40"
                            cy="40"
                            r="35"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2"
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
                          <motion.circle
                            cx="40"
                            cy="40"
                            r="20"
                            fill="#2d3748"
                            stroke="#ef4444"
                            strokeWidth="1"
                            initial={{ scale: 1 }}
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                          <motion.g
                            initial={{ opacity: 1 }}
                            animate={{
                              opacity: [1, 0.3, 1],
                              scale: [1, 0.8, 1],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            <rect
                              x="32"
                              y="30"
                              width="16"
                              height="20"
                              rx="2"
                              fill="#ef4444"
                            />
                            <rect
                              x="34"
                              y="32"
                              width="12"
                              height="2"
                              rx="1"
                              fill="white"
                            />
                            <rect
                              x="34"
                              y="36"
                              width="12"
                              height="2"
                              rx="1"
                              fill="white"
                            />
                            <rect
                              x="34"
                              y="40"
                              width="8"
                              height="2"
                              rx="1"
                              fill="white"
                            />
                          </motion.g>
                          {[...Array(8)].map((_, i) => (
                            <motion.circle
                              key={i}
                              cx="40"
                              cy="40"
                              r="1"
                              fill="#ef4444"
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0],
                                x: [0, Math.cos((i * 45 * Math.PI) / 180) * 30],
                                y: [0, Math.sin((i * 45 * Math.PI) / 180) * 30],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.1,
                                ease: "easeOut",
                              }}
                            />
                          ))}
                        </svg>
                      </div>
                      <motion.h3
                        className="text-xl font-semibold text-white mb-2"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Deleting Account...
                      </motion.h3>
                      <p className="text-slate-400 text-sm">
                        Removing your account and all associated data
                      </p>
                      <div className="flex justify-center space-x-1 mt-4">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-red-500 rounded-full"
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
                  </motion.div>
                )}

                {step === "complete" && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: "spring",
                      damping: 15,
                      stiffness: 300,
                    }}
                    className="p-8 h-full flex flex-col items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        damping: 10,
                        stiffness: 200,
                        delay: 0.1,
                      }}
                      className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl font-semibold text-white mb-2"
                    >
                      Account Deleted
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-slate-400 text-sm"
                    >
                      Your account has been permanently removed
                    </motion.p>
                  </motion.div>
                )}

                {step === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 h-full flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-900/30 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Deletion Failed
                          </h3>
                          <p className="text-sm text-slate-400">
                            Something went wrong
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex-1 mb-6 space-y-4">
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {errorMessage}
                      </p>
                      <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4">
                        <p className="text-sm text-red-300 mb-2">
                          Type your email address (
                          <strong>{user?.email}</strong>) to try again:
                        </p>
                        <Input
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                          className="bg-slate-950 text-slate-300 border-red-700 focus:border-red-500 focus-visible:ring-0"
                          placeholder={user?.email}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                        onClick={onClose}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center space-x-2"
                        onClick={handleRetry}
                        disabled={confirmEmail !== user?.email}
                      >
                        <RefreshCw className="w-4 h-4" />
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
