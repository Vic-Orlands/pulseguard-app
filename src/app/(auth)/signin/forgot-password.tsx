import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Mail, Loader2, AlertCircle } from "lucide-react";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
        <p className="text-gray-400">
          Enter your email to receive a password reset link.
        </p>
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
          <AlertCircle className="h-4 w-4 text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" error={errors.email?.message}>
          <InputWithIcon
            icon={Mail}
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </FormField>

        <motion.button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
          whileHover={{ scale: isPending ? 1 : 1.02 }}
          whileTap={{ scale: isPending ? 1 : 0.98 }}
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>Send Reset Link</>
          )}
        </motion.button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          className="text-blue-400 hover:underline cursor-pointer text-sm"
          onClick={() => onToggleMode("login")}
          aria-label="Back to login"
        >
          &larr; Back to login
        </button>
      </div>
    </motion.div>
  );
}
