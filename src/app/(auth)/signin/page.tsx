"use client";

import { PulseGuardLogo } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedBackground from "@/components/background-color";

import { useHydrated } from "./user-hydrated";
import { LoginForm } from "./loginform";
import { SignupForm } from "./signupform";
import ForgotPassword from "./forgot-password";

// Logo component
export const Logo = () => (
  <div className="flex items-center justify-center rounded-full backdrop-blur-sm">
    <PulseGuardLogo />
  </div>
);

export default function AuthPage() {
  const { mode, hydrated, toggleMode } = useHydrated();

  if (!hydrated) return null;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-background text-foreground relative">
      <AnimatedBackground />

      <Logo />

      <motion.div
        className="w-full max-w-md p-6 rounded-lg border border-border bg-card shadow-xs z-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <LoginForm key="login" onToggleMode={toggleMode} />
          ) : mode === "forgot-password" ? (
            <ForgotPassword key="forgot-password" onToggleMode={toggleMode} />
          ) : (
            <SignupForm key="signup" onToggleMode={toggleMode} />
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="mt-6 text-xs text-muted-foreground text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        &copy; {new Date().getFullYear()} PulseGuard. All rights reserved.
      </motion.div>
    </div>
  );
}

