"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Lock,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
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
      return { score: 0, label: "Enter password", color: "text-gray-400" };

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
      5: { label: "Strong", color: "text-green-500" },
    };

    return { score, ...strengthMap[score as keyof typeof strengthMap] };
  };

  const passwordStrength = getPasswordStrength(password || "");

  // Show error if token is invalid
  if (tokenValid === false) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-6 rounded-xl backdrop-blur-sm bg-black/30 border border-blue-900/40 z-10"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Invalid Reset Link</h1>
          <p className="text-gray-400">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <Alert
          variant="destructive"
          className="mb-4 bg-red-950/50 border-red-800"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <motion.button
          type="button"
          onClick={() => {
            router.push("/signin");
            localStorage.setItem("auth_mode", "forgot-password");
          }}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Request New Reset Link
        </motion.button>
      </motion.div>
    );
  }

  // Show loading while validating token
  if (tokenValid === null) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
        <p className="text-gray-400 mt-2">Validating reset link...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md p-6 rounded-xl backdrop-blur-sm bg-black/30 border border-blue-900/40 z-10"
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">Reset Your Password</h1>
        <p className="text-gray-400">Enter your new password below.</p>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="mb-4 bg-red-950/50 border-red-800"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-950/50 border-green-800">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="New Password" error={errors.password?.message}>
          <div className="relative">
            <InputWithIcon
              icon={Lock}
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={passwordStrength.color}>
                  {passwordStrength.label}
                </span>
                <span className="text-gray-400">
                  {passwordStrength.score}/5
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
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
                      : "bg-green-500"
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
              icon={Lock}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </FormField>

        <motion.button
          type="submit"
          disabled={isPending || success !== ""}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isPending ? 1 : 1.02 }}
          whileTap={{ scale: isPending ? 1 : 0.98 }}
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : success ? (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Password Reset!
            </>
          ) : (
            "Reset Password"
          )}
        </motion.button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          className="text-blue-400 hover:underline cursor-pointer text-sm"
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
