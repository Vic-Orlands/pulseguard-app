"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import AnimatedBackground from "@/components/background-color";
import { PulseGuardLogo } from "@/components/Icons";
import { LoginForm } from "./loginform";
import { SignupForm } from "./signupform";
import { useHydrated } from "./shared";

// Logo component
const Logo = () => (
  <div className="flex items-center justify-center mb-6 rounded-full backdrop-blur-sm">
    <PulseGuardLogo />
    <Link href="/" className="hidden md:block">
      <span className="text-2xl font-bold text-white">PulseGuard</span>
    </Link>
  </div>
);

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const hydrated = useHydrated();

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-black text-white relative">
      <AnimatedBackground />

      <Logo />

      <motion.div
        className="w-full max-w-md p-6 rounded-xl backdrop-blur-sm bg-black/30 border border-blue-900/40 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <LoginForm key="login" onToggleMode={toggleMode} />
          ) : (
            <SignupForm key="signup" onToggleMode={toggleMode} />
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="mt-8 text-sm text-gray-400 text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        &copy; {new Date().getFullYear()} PulseGuard. All rights reserved.
      </motion.div>
    </div>
  );
}
