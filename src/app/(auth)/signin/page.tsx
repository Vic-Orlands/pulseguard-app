"use client";

import { PulseGuardLogo } from "@/components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedBackground from "@/components/background-color";

import { useHydrated } from "./user-hydrated";
import { LoginForm } from "./loginform";
import { SignupForm } from "./signupform";
import ForgotPassword from "./forgot-password";

// SoftSignal background glow component
function SoftSignal() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] opacity-40 [background-image:radial-gradient(circle_at_50%_100%,rgba(255,90,31,.14),transparent_44%),linear-gradient(90deg,transparent_0,rgba(223,223,218,.36)_1px,transparent_1px),linear-gradient(transparent_0,rgba(223,223,218,.36)_1px,transparent_1px)] [background-size:auto,78px_100%,100%_62px]"
    />
  );
}

// Logo component
export const Logo = () => (
  <div className="flex items-center justify-center rounded-full backdrop-blur-sm relative z-10">
    <PulseGuardLogo />
  </div>
);

export default function AuthPage() {
  const { mode, hydrated, toggleMode } = useHydrated();

  if (!hydrated) return null;

  return (
    <div className="pg-page pg-grid min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <SoftSignal />

      <Logo />

      <motion.div
        className="pg-panel w-full max-w-md p-8 rounded-xl shadow-xs z-10 relative overflow-hidden mt-6"
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
        className="mt-6 text-xs text-[#73736e] text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        &copy; {new Date().getFullYear()} PulseGuard. All rights reserved.
      </motion.div>
    </div>
  );
}


