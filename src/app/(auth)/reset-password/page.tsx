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

// Main page component wrapped in Suspense to handle useSearchParams
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-background text-foreground relative">
        <AnimatedBackground />
        <Logo />

        <motion.div
          className="w-full max-w-md p-6 rounded-lg border border-border bg-card shadow-xs z-10 mt-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ResetPassword />
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
    </Suspense>
  );
}
