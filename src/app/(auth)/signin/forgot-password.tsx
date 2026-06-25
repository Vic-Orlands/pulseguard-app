"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

import { FormField, InputWithIcon } from "./shared";
import { sendResetPasswordEmail } from "@/lib/api/user-api";
import {
  type FormProps,
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/types/form";

export default function ForgotPassword({ onToggleMode }: FormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    startTransition(async () => {
      setError("");
      setSuccess("");
      try {
        const { error, message } = await sendResetPasswordEmail(data.email);
        if (error) {
          setError(error);
        } else {
          setSuccess(
            message ||
              "If an account with that email exists, a reset link has been sent."
          );
          reset();
          toast("Password reset email sent!");
          setTimeout(() => {
            onToggleMode("login");
          }, 2000);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to send reset email"
        );
      }
    });
  };

  return (
    <div
      className="w-full max-w-[364px] mx-auto"
      id="email-form-container"
    >
      <div className="mb-6 flex justify-start">
        <motion.button
          id="btn-back-to-login"
          type="button"
          onClick={() => onToggleMode("login")}
          whileHover={{ x: -2 }}
          className="btn-back"
        >
          <ArrowLeft className="w-4 h-4 text-pg-subtle" />
          <span>Back to Sign In</span>
        </motion.button>
      </div>

      <div className="mb-6 text-left">
        <h2 className="form-heading">
          Reset password
        </h2>
        <p className="mt-2 form-subtitle">
          Enter your email address to receive a secure recovery link
        </p>
      </div>

      {error && (
        <div className="banner-error mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="banner-success mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email Address" error={errors.email?.message}>
          <InputWithIcon
            icon={Mail}
            type="email"
            placeholder="name@domain.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </FormField>

        {/* Primary Action Button */}
        <motion.button
          id="btn-submit-form"
          type="submit"
          whileTap={{ scale: 0.99 }}
          disabled={isPending}
          className="btn-primary w-full"
        >
          <motion.span 
            className="flex items-center justify-center gap-2"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-current" />
                <span>Sending link...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </motion.span>
        </motion.button>
      </form>
    </div>
  );
}
