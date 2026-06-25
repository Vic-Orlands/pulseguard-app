import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  GithubIcon,
  Loading02Icon,
  LockIcon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

  const handleOAuthLogin = async (provider: string) => {
    // If there is a redirect parameter, store it in localStorage and pass it to oauth callback
    const redirectUrl = searchParams.get("redirect");
    if (redirectUrl) {
      localStorage.setItem("pulseguard_post_auth_redirect", redirectUrl);
    }
    const callbackUrl = redirectUrl
      ? `/api/auth/${provider}?redirect=${encodeURIComponent(redirectUrl)}`
      : `/api/auth/${provider}`;
    window.location.href = callbackUrl;
  };

  // prefetch projects page
  useEffect(() => {
    const redirectUrl = searchParams.get("redirect") || "/projects";
    router.prefetch(redirectUrl);

    if (error !== "") {
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  }, [router, error]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="text-center mb-6">
        <h1 className="text-lg font-bold text-[#1d1d1b]">Welcome back</h1>
        <p className="text-xs text-[#73736e] mt-1">Sign in to your PulseGuard account</p>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" error={errors.email?.message}>
          <InputWithIcon
            icon={Mail01Icon}
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <InputWithIcon
            icon={LockIcon}
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            showPasswordToggle
            {...register("password")}
          />
        </FormField>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-[#dfdfda] bg-white text-[#1d1d1b] focus:ring-[#1d1d1b] cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-xs text-[#4b4b47] cursor-pointer"
            >
              Remember me
            </label>
          </div>
          <p
            onClick={() => onToggleMode("forgot-password")}
            className="text-xs text-[#1d1d1b] hover:text-[#ff5a1f] hover:underline cursor-pointer transition-colors"
          >
            Forgot password?
          </p>
        </div>

        <motion.button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#171716] text-white py-2 rounded-lg hover:bg-[#ff5a1f] text-xs font-semibold transition flex items-center justify-center h-10 cursor-pointer"
          whileHover={{ scale: isPending ? 1 : 1.01 }}
          whileTap={{ scale: isPending ? 1 : 0.99 }}
        >
          {isPending ? (
            <HugeiconsIcon
              icon={Loading02Icon}
              className="h-4 w-4 animate-spin"
            />
          ) : (
            <>Sign In</>
          )}
        </motion.button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#dfdfda]"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 text-[#73736e] bg-white">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            onClick={() => handleOAuthLogin("github")}
            className="w-full flex items-center justify-center gap-2 bg-[#f7f7f5] border border-[#dfdfda] py-2 px-4 rounded-lg hover:bg-white transition text-[#1d1d1b] h-10 cursor-pointer"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <HugeiconsIcon icon={GithubIcon} className="h-4 w-4" />
          </motion.button>
          <motion.button
            type="button"
            onClick={() => handleOAuthLogin("google")}
            className="w-full flex items-center justify-center gap-2 bg-[#f7f7f5] border border-[#dfdfda] py-2 px-4 rounded-lg hover:bg-white transition text-[#1d1d1b] h-10 cursor-pointer"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </motion.button>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-xs text-[#73736e]">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            aria-label="Sign up"
            onClick={() => onToggleMode("signup")}
            className="text-[#1d1d1b] font-semibold hover:text-[#ff5a1f] hover:underline cursor-pointer transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </motion.div>
  );
};

