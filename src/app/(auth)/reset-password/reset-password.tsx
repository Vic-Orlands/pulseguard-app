"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, CheckmarkCircle01Icon, Loading02Icon, LockIcon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      return { score: 0, label: "Enter password", color: "text-muted-foreground" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    const strengthMap = {
      0: { label: "Very weak", color: "text-destructive" },
      1: { label: "Very weak", color: "text-destructive" },
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
        className="w-full text-foreground"
      >
        <div className="text-center mb-5">
          <h1 className="text-lg font-bold text-foreground">Invalid Reset Link</h1>
          <p className="text-xs text-muted-foreground mt-1">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <Alert
          variant="destructive"
          className="mb-4 border-destructive bg-destructive/10 text-destructive text-xs py-2 px-3 flex items-center gap-2"
        >
          <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4 shrink-0" />
          <div>
            <AlertDescription className="text-xs font-medium leading-none">{error}</AlertDescription>
          </div>
        </Alert>

        <motion.button
          type="button"
          onClick={() => {
            router.push("/signin");
            localStorage.setItem("auth_mode", "forgot-password");
          }}
          className="w-full bg-primary text-primary-foreground py-1.5 rounded-md hover:bg-primary/95 text-xs font-semibold transition"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          Request New Reset Link
        </motion.button>
      </motion.div>
    );
  }

  // Show loading while validating token
  if (tokenValid === null) {
    return (
      <div className="w-full text-center py-4">
        <HugeiconsIcon icon={Loading02Icon} className="h-5 w-5 animate-spin mx-auto text-primary" />
        <p className="text-xs text-muted-foreground mt-2">Validating reset link...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="w-full text-foreground"
    >
      <div className="text-center mb-5">
        <h1 className="text-lg font-bold text-foreground">Reset Your Password</h1>
        <p className="text-xs text-muted-foreground mt-1">Enter your new password below.</p>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="mb-4 border-destructive bg-destructive/10 text-destructive text-xs py-2 px-3 flex items-center gap-2"
        >
          <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4 shrink-0" />
          <div>
            <AlertDescription className="text-xs font-medium leading-none">{error}</AlertDescription>
          </div>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs py-2 px-3 flex items-center gap-2">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 text-emerald-500 shrink-0" />
          <div>
            <AlertDescription className="text-xs font-medium leading-none">{success}</AlertDescription>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <FormField label="New Password" error={errors.password?.message}>
          <div className="relative">
            <InputWithIcon
              icon={LockIcon}
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <HugeiconsIcon icon={ViewOffIcon} className="h-3.5 w-3.5" />
              ) : (
                <HugeiconsIcon icon={ViewIcon} className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className={passwordStrength.color}>
                  {passwordStrength.label}
                </span>
                <span className="text-muted-foreground">
                  {passwordStrength.score}/5
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    passwordStrength.score <= 1
                      ? "bg-destructive"
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
          <div className="relative">
            <InputWithIcon
              icon={LockIcon}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <HugeiconsIcon icon={ViewOffIcon} className="h-3.5 w-3.5" />
              ) : (
                <HugeiconsIcon icon={ViewIcon} className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </FormField>

        <motion.button
          type="submit"
          disabled={isPending || success !== ""}
          className="w-full bg-primary text-primary-foreground py-1.5 rounded-md hover:bg-primary/95 text-xs font-semibold transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isPending ? 1 : 1.01 }}
          whileTap={{ scale: isPending ? 1 : 0.99 }}
        >
          {isPending ? (
            <HugeiconsIcon icon={Loading02Icon} className="h-4 w-4 animate-spin" />
          ) : success ? (
            <>
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 mr-2" />
              Password Reset!
            </>
          ) : (
            "Reset Password"
          )}
        </motion.button>
      </form>

      <div className="mt-5 text-center">
        <button
          type="button"
          className="text-primary hover:underline cursor-pointer text-xs"
          onClick={() => {
            router.push("/signin");
            localStorage.setItem("auth_mode", "login");
          }}
          aria-label="Back to login"
        >
          &larr; Back to login
        </button>
      </div>
    </motion.div>
  );
}
