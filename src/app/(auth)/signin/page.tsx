"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Sun, Moon } from "lucide-react";
import { GithubIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useHydrated } from "./user-hydrated";
import { LoginForm } from "./loginform";
import { SignupForm } from "./signupform";
import ForgotPassword from "./forgot-password";

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

// Floating Theme Toggle Button
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="absolute top-4 right-4 z-50 p-2.5 rounded-full border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center hover:bg-zinc-900"
      title={`Switch theme`}
      id="global-theme-toggle"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-orange-400" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-500" />
      )}
    </button>
  );
};

function AuthScreen({
  onToggleMode,
  handleOAuthLogin,
}: {
  onToggleMode: (mode: any) => void;
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

      <h1 className="text-2xl font-normal tracking-[-0.058em] text-white font-sans">
        Welcome to PulseGuard
      </h1>

      <p className="mt-2 text-sm text-zinc-400 font-sans mb-10 max-w-[280px] md:max-w-none">
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
          className="inline-flex items-center justify-center whitespace-nowrap rounded-[5px] font-medium relative transition-all duration-150 ease-in-out active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 bg-[#18181b] text-white border border-zinc-800 hover:opacity-90 dark:bg-[#e2e2e2] dark:text-black dark:border-transparent h-9 px-4 text-sm gap-2 w-full cursor-pointer group"
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
          className="inline-flex items-center justify-center whitespace-nowrap rounded-[5px] font-medium relative transition-all duration-150 ease-in-out active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 bg-[#18181b] text-white border border-zinc-800 hover:opacity-90 dark:bg-[#e2e2e2] dark:text-black dark:border-transparent h-9 px-4 text-sm gap-2 w-full cursor-pointer group"
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

      <p className="text-[11px] leading-relaxed text-zinc-500 max-w-[290px] mb-8 select-none">
        By signing in, you agree to our{" "}
        <a
          href="#terms"
          className="hover:text-zinc-300 underline underline-offset-2 transition-colors"
        >
          Terms of Service
        </a>{" "}
        &{" "}
        <a
          href="#privacy"
          className="hover:text-zinc-300 underline underline-offset-2 transition-colors"
        >
          Privacy Policy
        </a>
      </p>

      <motion.button
        id="btn-transition-email"
        whileHover={{ y: -1 }}
        onClick={() => onToggleMode("login")}
        className="group inline-flex items-center gap-1.5 text-zinc-400 hover:text-white font-medium text-[13px] transition-colors duration-200 cursor-pointer focus:outline-none bg-transparent"
      >
        <span>Get started with Email</span>
        <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors duration-200" />
      </motion.button>
    </div>
  );
}

function AuthContent() {
  const { mode, hydrated, toggleMode } = useHydrated();
  const searchParams = useSearchParams();

  if (!hydrated) return null;

  const handleOAuthLogin = async (provider: string) => {
    const redirectUrl = searchParams.get("redirect");
    if (redirectUrl) {
      localStorage.setItem("pulseguard_post_auth_redirect", redirectUrl);
    }
    const callbackUrl = redirectUrl
      ? `/api/auth/${provider}?redirect=${encodeURIComponent(redirectUrl)}`
      : `/api/auth/${provider}`;
    window.location.href = callbackUrl;
  };

  return (
    <div className="bg-dot-pattern min-h-screen w-full flex items-center justify-center text-white relative overflow-x-hidden select-none py-12 px-4">
      {/* Floating Theme Toggle */}
      <ThemeToggle />

      <div className="w-full z-10 flex flex-col justify-center max-w-lg relative min-h-[480px]">
        <AnimatePresence mode="popLayout" initial={false}>
          {mode === "oauth" && (
            <motion.div
              key="oauth"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <AuthScreen
                onToggleMode={toggleMode}
                handleOAuthLogin={handleOAuthLogin}
              />
            </motion.div>
          )}

          {mode === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <LoginForm onToggleMode={toggleMode} />
            </motion.div>
          )}

          {mode === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <SignupForm onToggleMode={toggleMode} />
            </motion.div>
          )}

          {mode === "forgot-password" && (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <ForgotPassword onToggleMode={toggleMode} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trademark bottom line */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-mono text-zinc-600 select-none tracking-wider font-light">
        PULSEGUARD &copy; {new Date().getFullYear()}
      </div>
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
