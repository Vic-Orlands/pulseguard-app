"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading02Icon } from "@hugeicons/core-free-icons";
import { Suspense } from "react";
import ResetPassword from "./reset-password";
import AnimatedBackground from "@/components/background-color";
import { Logo } from "../signin/page";
import { motion } from "framer-motion";

// Loading component for Suspense boundary
function ResetPasswordLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="text-center">
        <HugeiconsIcon icon={Loading02Icon} className="h-5 w-5 animate-spin mx-auto text-primary mb-3" />
        <p className="text-xs text-muted-foreground">Loading reset password form...</p>
      </div>
    </div>
  );
}

// SoftSignal background glow component
function SoftSignal() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] opacity-40 [background-image:radial-gradient(circle_at_50%_100%,rgba(255,90,31,.14),transparent_44%),linear-gradient(90deg,transparent_0,rgba(223,223,218,.36)_1px,transparent_1px),linear-gradient(transparent_0,rgba(223,223,218,.36)_1px,transparent_1px)] [background-size:auto,78px_100%,100%_62px]"
    />
  );
}

// Main page component wrapped in Suspense to handle useSearchParams
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <div className="pg-page pg-grid min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden">
        <SoftSignal />
        <Logo />

        <motion.div
          className="pg-panel w-full max-w-md p-8 rounded-xl shadow-xs z-10 mt-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ResetPassword />
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
    </Suspense>
  );
}

