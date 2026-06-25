"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Mail, Lock } from "lucide-react";

import { FormField, InputWithIcon } from "./shared";
import { loginUser } from "@/lib/api/user-api";
import { useAuth } from "@/context/auth-context";
import { loginSchema, type FormProps, type LoginFormData } from "@/types/form";

export const LoginForm = ({ onToggleMode }: FormProps) => {
  const { fetchUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Handle OAuth callback
  useEffect(() => {
    const token = searchParams.get("token");
    const redirectUrl = searchParams.get("redirect") || "/projects";
    if (token) {
      startTransition(async () => {
        try {
          await fetchUser();
          router.push(redirectUrl);
          toast("Login successful!");
        } catch (error) {
          console.log("Error fetching user:", error);
          setError("Failed to authenticate");
        }
      });
    }
  }, [searchParams, fetchUser, router]);

  const onSubmit = (data: LoginFormData) => {
    startTransition(async () => {
      try {
        setError("");

        const { error, message } = await loginUser(data);
        if (error) {
          setError(error);
        }

        if (message) {
          await fetchUser();

          const redirectUrl = searchParams.get("redirect") || "/projects";
          setTimeout(() => {
            router.push(redirectUrl);
            toast("Login successful!");
          }, 1500);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Login failed");
      }
    });
  };

  // prefetch projects page
  useEffect(() => {
    const redirectUrl = searchParams.get("redirect") || "/projects";
    router.prefetch(redirectUrl);

    if (error !== "") {
      const timer = setTimeout(() => {
        setError("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [router, error, searchParams]);

  return (
    <div className="w-full max-w-[364px] mx-auto" id="email-form-container">
      {/* Back to Options link */}
      <div className="mb-6 flex justify-start">
        <motion.button
          id="btn-back-to-oauth"
          type="button"
          onClick={() => onToggleMode("oauth")}
          whileHover={{ x: -2 }}
          className="btn-back"
        >
          <ArrowLeft className="w-4 h-4 text-pg-subtle" />
          <span>Back to options</span>
        </motion.button>
      </div>

      {/* Form header */}
      <div className="mb-8 text-left">
        <h2 className="form-heading">
          Welcome back
        </h2>
        <p className="mt-2 form-subtitle">
          Sign in to access your saved agent sessions
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Error Feedback */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="banner-error"
              id="form-error-feedback"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <FormField label="Email Address" error={errors.email?.message}>
          <InputWithIcon
            icon={Mail}
            type="email"
            placeholder="name@domain.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <InputWithIcon
            icon={Lock}
            type="password"
            placeholder="••••••••••••"
            error={errors.password?.message}
            showPasswordToggle
            {...register("password")}
          />
        </FormField>

        <div className="flex items-center justify-between py-1 select-none">
          <div className="flex items-center space-x-2 text-left">
            <input
              id="checkbox-remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-white focus:ring-0 focus:ring-offset-0 accent-white cursor-pointer"
            />
            <label
              htmlFor="checkbox-remember"
              className="text-zinc-400 text-xs cursor-pointer select-none"
            >
              Remember me
            </label>
          </div>
          <button
            type="button"
            onClick={() => onToggleMode("forgot-password")}
            className="text-pg-subtle hover:text-pg-text text-xs transition-colors underline-offset-2 hover:underline bg-transparent border-0 p-0 cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

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
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </motion.span>
        </motion.button>
      </form>

      <div className="mt-8 text-center text-xs text-zinc-500 select-none">
        <p>
          Don't have an account?{" "}
          <button
            type="button"
            id="link-switch-to-signup"
            onClick={() => onToggleMode("signup")}
            className="text-pg-subtle hover:text-pg-text underline underline-offset-2 transition-colors cursor-pointer focus:outline-none font-medium ml-1 bg-transparent border-0 p-0"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};
