"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "@/components/phosphor-icons";
import { GithubIcon } from "@/components/phosphor-icons";
import { HugeiconsIcon } from "@/components/phosphor-icons";
import { useAuthMode } from "./user-hydrated";
import { LoginForm } from "./loginform";
import { SignupForm } from "./signupform";
import ForgotPassword from "./forgot-password";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageFooter } from "@/components/page-footer";
import { safeInternalRedirect } from "@/lib/security/safe-redirect";
import { getPostAuthPath } from "@/lib/last-project";
import type { FormMode } from "@/types/form";

// Beautiful premium concentric brand logo matching Traces brand aesthetics
export const Logo = () => (
  <div className="flex justify-center mb-6">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-10 h-10 flex items-center justify-center cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg
        viewBox="6 10 28 36"
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10 text-white"
      >
        <path
          d="M8 16 L20 12 L32 16 L32 28 C32 36 20 44 20 44 C20 44 8 36 8 28 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M12 28 L15 28 L17 22 L19 34 L22 20 L24 32 L26 28 L28 28"
          fill="none"
          stroke="var(--background)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  </div>
);

const GoogleIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);


function AuthScreen({
  onToggleMode,
  handleOAuthLogin,
}: {
  onToggleMode: (mode: FormMode) => void;
  handleOAuthLogin: (provider: string) => void;
}) {
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "github" | null
  >(null);

  const handleOAuthClick = (provider: "google" | "github") => {
    setLoadingProvider(provider);
    handleOAuthLogin(provider);
  };

  return (
    <div
      className="w-full max-w-[364px] mx-auto flex flex-col items-center justify-center px-4 text-center"
      id="oauth-container"
    >
      <Logo />

      <h1 className="form-heading">
        Welcome to PulseGuard
      </h1>

      <p className="mt-2 form-subtitle mb-10 max-w-[280px] md:max-w-none">
        An intelligent error tracking and monitoring tool.
      </p>

      <div
        className="w-full flex flex-col gap-2.5 mb-6"
        id="oauth-buttons-wrapper"
      >
        <motion.button
          id="btn-google-login"
          whileTap={{ scale: 0.99 }}
          onClick={() => handleOAuthClick("google")}
          disabled={loadingProvider !== null}
          className="btn-primary w-full"
        >
          <motion.span
            className="flex items-center justify-center gap-2"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {loadingProvider === "google" ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-800" />
            ) : (
              <GoogleIcon />
            )}
            <span>
              {loadingProvider === "google"
                ? "Connecting to Google..."
                : "Continue with Google"}
            </span>
          </motion.span>
        </motion.button>

        <motion.button
          id="btn-github-login"
          whileTap={{ scale: 0.99 }}
          onClick={() => handleOAuthClick("github")}
          disabled={loadingProvider !== null}
          className="btn-primary w-full"
        >
          <motion.span
            className="flex items-center justify-center gap-2"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {loadingProvider === "github" ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-800" />
            ) : (
              <HugeiconsIcon
                icon={GithubIcon}
                className="w-4 h-4 text-zinc-950 fill-zinc-950"
              />
            )}
            <span>
              {loadingProvider === "github"
                ? "Connecting to GitHub..."
                : "Continue with GitHub"}
            </span>
          </motion.span>
        </motion.button>
      </div>

      <p className="text-[11px] leading-relaxed text-pg-subtle max-w-[290px] mb-8 select-none">
        By signing in, you agree to our{" "}
        <a
          href="#terms"
          className="hover:text-pg-muted underline underline-offset-2 transition-colors"
        >
          Terms of Service
        </a>{" "}
        &{" "}
        <a
          href="#privacy"
          className="hover:text-pg-muted underline underline-offset-2 transition-colors"
        >
          Privacy Policy
        </a>
      </p>

      <motion.button
        id="btn-transition-email"
        whileHover={{ y: -1 }}
        onClick={() => onToggleMode("login")}
        className="group btn-back"
      >
        <span>Get started with Email</span>
        <ArrowRight className="w-3.5 h-3.5 text-pg-subtle group-hover:text-pg-text transition-colors duration-200" />
      </motion.button>
    </div>
  );
}

function AuthContent() {
  const { mode, toggleMode } = useAuthMode();
  const searchParams = useSearchParams();

  const handleOAuthLogin = async (provider: string) => {
    const requestedRedirect = searchParams.get("redirect");
    const redirectUrl = safeInternalRedirect(
      requestedRedirect,
      getPostAuthPath(),
    );
    localStorage.setItem("pulseguard_post_auth_redirect", redirectUrl);
    const callbackUrl = `/api/auth/${provider}?redirect=${encodeURIComponent(redirectUrl)}`;
    window.location.href = callbackUrl;
  };

  return (
    <div className="bg-dot-pattern min-h-screen w-full flex items-center justify-center text-white relative overflow-x-hidden select-none py-12 px-4">
      {/* Floating Theme Toggle */}
      <ThemeToggle />

      <div className="w-full z-10 flex flex-col justify-center max-w-lg relative min-h-[480px]">
        {mode === "oauth" && (
          <div className="w-full flex justify-center">
            <AuthScreen
              onToggleMode={toggleMode}
              handleOAuthLogin={handleOAuthLogin}
            />
          </div>
        )}

        {mode === "login" && (
          <div className="w-full flex justify-center">
            <LoginForm onToggleMode={toggleMode} />
          </div>
        )}

        {mode === "signup" && (
          <div className="w-full flex justify-center">
            <SignupForm onToggleMode={toggleMode} />
          </div>
        )}

        {mode === "forgot-password" && (
          <div className="w-full flex justify-center">
            <ForgotPassword onToggleMode={toggleMode} />
          </div>
        )}
      </div>

      {/* Trademark footer */}
      <PageFooter />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  );
}
