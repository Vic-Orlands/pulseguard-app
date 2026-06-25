"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Loading02Icon,
  Locker01Icon,
} from "@hugeicons/core-free-icons";
import { ArrowLeft } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { resetPassword } from "@/lib/api/user-api";
import { z } from "zod";
import { FormField, InputWithIcon } from "../signin/shared";

// Zod schema for password reset validation
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        }
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password");

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError("Invalid or missing reset token");
      return;
    }

    // Validate token format (UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      setTokenValid(false);
      setError("Invalid reset token format");
      return;
    }

    setTokenValid(true);
  }, [token]);

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) {
      setError("No reset token provided");
      return;
    }

    startTransition(async () => {
      setError("");
      setSuccess("");

      try {
        const { error, message } = await resetPassword(token, data.password);

        if (error) {
          setError(error);
        } else {
          setSuccess(message || "Password has been reset successfully!");
          reset();
          toast("Password reset successful!");

          // Redirect to login after success
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to reset password"
        );
      }
    });
  };

  const getPasswordStrength = (
    password: string
  ): { score: number; label: string; color: string } => {
    if (!password)
      return { score: 0, label: "Enter password", color: "text-zinc-500" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    const strengthMap = {
      0: { label: "Very weak", color: "text-red-500" },
      1: { label: "Very weak", color: "text-red-500" },
      2: { label: "Weak", color: "text-orange-500" },
      3: { label: "Fair", color: "text-yellow-500" },
      4: { label: "Good", color: "text-blue-500" },
      5: { label: "Strong", color: "text-emerald-500" },
    };

    return { score, ...strengthMap[score as keyof typeof strengthMap] };
  };

  const passwordStrength = getPasswordStrength(password || "");

  // Show error if token is invalid
  if (tokenValid === false) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="mb-8 text-left">
          <h2 className="text-2xl font-normal tracking-[-0.058em] text-white font-sans">
            Invalid Reset Link
          </h2>
          <p className="mt-2 text-sm text-zinc-400 font-sans">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div className="p-3 mb-6 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs text-left">
          {error}
        </div>

        <button
          type="button"
          onClick={() => {
            router.push("/signin");
            localStorage.setItem("auth_mode", "forgot-password");
          }}
          className="w-full bg-[#18181b] text-white border border-zinc-800 hover:opacity-90 dark:bg-[#e2e2e2] dark:text-black dark:border-transparent h-10 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center"
        >
          Request New Reset Link
        </button>
      </motion.div>
    );
  }

  // Show loading while validating token
  if (tokenValid === null) {
    return (
      <div className="w-full text-center py-8">
        <HugeiconsIcon
          icon={Loading02Icon}
          className="h-5 w-5 animate-spin mx-auto text-zinc-400"
        />
        <p className="text-xs text-zinc-500 mt-3">Validating reset link...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Header */}
      <div className="mb-8 text-left">
        <h2 className="text-2xl font-normal tracking-[-0.058em] text-white font-sans">
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm text-zinc-400 font-sans">
          Enter your new password below.
        </p>
      </div>

      {/* Error banner */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 mb-4 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs text-left"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success banner */}
      <AnimatePresence mode="wait">
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 mb-4 rounded-lg bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-xs text-left flex items-center gap-2"
          >
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              className="h-3.5 w-3.5 shrink-0"
            />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <FormField label="New Password" error={errors.password?.message}>
          <InputWithIcon
            icon={Locker01Icon}
            type="password"
            placeholder="Enter new password"
            showPasswordToggle
            error={errors.password?.message}
            {...register("password")}
          />

          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className={passwordStrength.color}>
                  {passwordStrength.label}
                </span>
                <span className="text-zinc-500">
                  {passwordStrength.score}/5
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    passwordStrength.score <= 1
                      ? "bg-red-500"
                      : passwordStrength.score <= 2
                      ? "bg-orange-500"
                      : passwordStrength.score <= 3
                      ? "bg-yellow-500"
                      : passwordStrength.score <= 4
                      ? "bg-blue-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </FormField>

        <FormField
          label="Confirm Password"
          error={errors.confirmPassword?.message}
        >
          <InputWithIcon
            icon={Locker01Icon}
            type="password"
            placeholder="Confirm new password"
            showPasswordToggle
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </FormField>

        <div className="pt-1">
          <button
            type="submit"
            disabled={isPending || success !== ""}
            className="w-full bg-[#18181b] text-white border border-zinc-800 hover:opacity-90 dark:bg-[#e2e2e2] dark:text-black dark:border-transparent h-10 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? (
              <HugeiconsIcon
                icon={Loading02Icon}
                className="h-4 w-4 animate-spin"
              />
            ) : success ? (
              <>
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  className="h-4 w-4"
                />
                Password Reset!
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 flex justify-start">
        <motion.button
          type="button"
          onClick={() => {
            router.push("/signin");
            localStorage.setItem("auth_mode", "login");
          }}
          whileHover={{ x: -2 }}
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-[13px] font-medium transition-colors cursor-pointer focus:outline-none bg-transparent border-0 p-0"
          aria-label="Back to login"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-500" />
          <span>Back to login</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
