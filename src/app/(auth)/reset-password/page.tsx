"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ResetPassword from "./reset-password";
import AnimatedBackground from "@/components/background-color";
import { Logo } from "../signin/page";

// Loading component for Suspense boundary
function ResetPasswordLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-4" />
        <p className="text-gray-400">Loading reset password form...</p>
      </div>
    </div>
  );
}

// Main page component wrapped in Suspense to handle useSearchParams
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-black text-white relative">
        <AnimatedBackground />
        <Logo />

        <div className="w-full max-w-md">
          <ResetPassword />
        </div>
      </div>
    </Suspense>
  );
}
