import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, Loading02Icon, Mail01Icon } from "@hugeicons/core-free-icons";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
          onToggleMode("login");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to send reset email"
        );
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="text-center mb-5">
        <h1 className="text-lg font-bold text-foreground">Forgot Password?</h1>
        <p className="text-xs text-muted-foreground">
          Enter your email to receive a password reset link.
        </p>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="mb-3 border-destructive bg-destructive/10 text-destructive text-xs py-2 px-3 flex items-center gap-2"
        >
          <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4 shrink-0" />
          <div>
            <AlertDescription className="text-xs font-medium leading-none">{error}</AlertDescription>
          </div>
        </Alert>
      )}

      {success && (
        <Alert className="mb-3 border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs py-2 px-3 flex items-center gap-2">
          <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4 text-emerald-500 shrink-0" />
          <div>
            <AlertDescription className="text-xs font-medium leading-none">{success}</AlertDescription>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <FormField label="Email" error={errors.email?.message}>
          <InputWithIcon
            icon={Mail01Icon}
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </FormField>

        <motion.button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-primary-foreground py-1.5 rounded-md hover:bg-primary/95 text-xs font-semibold transition flex items-center justify-center"
          whileHover={{ scale: isPending ? 1 : 1.01 }}
          whileTap={{ scale: isPending ? 1 : 0.99 }}
        >
          {isPending ? (
            <HugeiconsIcon icon={Loading02Icon} className="h-4 w-4 animate-spin" />
          ) : (
            <>Send Reset Link</>
          )}
        </motion.button>
      </form>

      <div className="mt-5 text-center">
        <button
          type="button"
          className="text-primary hover:underline cursor-pointer text-xs"
          onClick={() => onToggleMode("login")}
          aria-label="Back to login"
        >
          &larr; Back to login
        </button>
      </div>
    </motion.div>
  );
}
