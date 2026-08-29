"use client";

import { HugeiconsIcon } from "@/components/phosphor-icons";
import {
  Loading02Icon,
  CheckmarkCircle01Icon,
} from "@/components/phosphor-icons";
import { ArrowLeft, Lock } from "@/components/phosphor-icons";
import { useState, useTransition, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { resetPassword } from "@/lib/api/user-api";
import { z } from "zod";
import { FormField, InputWithIcon } from "../signin/shared";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageFooter } from "@/components/page-footer";

// Zod schema for password reset validation
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPassword() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(searchParams.get("token"));

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

  useEffect(() => {
    if (token) return;
    const fragmentToken = new URLSearchParams(window.location.hash.slice(1)).get(
      "token",
    );
    if (fragmentToken) setToken(fragmentToken);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError("Invalid or missing reset token");
      return;
    }
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
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to reset password",
        );
      }
    });
  };

  const getPasswordStrength = (
    pw: string,
  ): { score: number; label: string; color: string } => {
    if (!pw)
      return { score: 0, label: "Enter password", color: "text-zinc-500" };
    let score = 0;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[@$!%*?&]/.test(pw)) score++;
    const map = {
      0: { label: "Very weak", color: "text-red-500" },
      1: { label: "Very weak", color: "text-red-500" },
      2: { label: "Weak", color: "text-orange-500" },
      3: { label: "Fair", color: "text-yellow-500" },
      4: { label: "Good", color: "text-blue-500" },
      5: { label: "Strong", color: "text-emerald-500" },
    };
    return { score, ...map[score as keyof typeof map] };
  };

  const passwordStrength = getPasswordStrength(password || "");

  return (
    <div className="bg-dot-pattern min-h-screen w-full flex items-center justify-center text-white relative overflow-x-hidden select-none py-12 px-4">
      <ThemeToggle />

      <div className="w-full z-10 flex flex-col justify-center max-w-lg relative">
        {/* Loading while validating token */}
        {tokenValid === null && (
          <div className="w-full max-w-[364px] mx-auto text-center py-8">
            <HugeiconsIcon
              icon={Loading02Icon}
              className="h-5 w-5 animate-spin mx-auto text-zinc-400"
            />
            <p className="text-xs text-pg-subtle mt-3">
              Validating reset link...
            </p>
          </div>
        )}

        {/* Invalid token state */}
        {tokenValid === false && (
          <div className="w-full max-w-[364px] mx-auto">
            <div className="mb-6 text-left">
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

            <motion.button
              type="button"
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                router.push("/signin");
                localStorage.setItem("auth_mode", "forgot-password");
              }}
              className="btn-primary w-full"
            >
              <motion.span
                className="flex items-center justify-center gap-2"
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                Request New Reset Link
              </motion.span>
            </motion.button>
          </div>
        )}

        {/* Valid token — main form */}
        {tokenValid === true && (
          <div className="w-full max-w-[364px] mx-auto">
            {/* Back link */}
            <div className="mb-6 flex justify-start">
              <motion.button
                type="button"
                onClick={() => {
                  router.push("/signin");
                  localStorage.setItem("auth_mode", "login");
                }}
                whileHover={{ x: -2 }}
                className="btn-back"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-500" />
                <span>Back to login</span>
              </motion.button>
            </div>

            {/* Heading */}
            <div className="mb-6 text-left">
              <h2 className="form-heading">
                Reset Your Password
              </h2>
              <p className="mt-2 form-subtitle">
                Enter your new password below.
              </p>
            </div>

            {/* Error / Success banners */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="banner-error"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="banner-success flex items-center gap-2"
                >
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    className="h-3.5 w-3.5 shrink-0"
                  />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password */}
              <FormField label="New Password" error={errors.password?.message}>
                <InputWithIcon
                  icon={Lock}
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
                        style={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </FormField>

              {/* Confirm Password */}
              <FormField
                label="Confirm Password"
                error={errors.confirmPassword?.message}
              >
                <InputWithIcon
                  icon={Lock}
                  type="password"
                  placeholder="Confirm new password"
                  showPasswordToggle
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
              </FormField>

              {/* Submit */}
              <motion.button
                id="btn-submit-form"
                type="submit"
                whileTap={{ scale: 0.99 }}
                disabled={isPending || success !== ""}
                className="btn-primary w-full"
              >
                <motion.span
                  className="flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {isPending ? (
                    <>
                      <HugeiconsIcon
                        icon={Loading02Icon}
                        className="w-4 h-4 animate-spin text-current"
                      />
                      <span>Resetting password...</span>
                    </>
                  ) : success ? (
                    <>
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        className="h-4 w-4"
                      />
                      <span>Password Reset!</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </motion.span>
              </motion.button>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <PageFooter />
    </div>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
