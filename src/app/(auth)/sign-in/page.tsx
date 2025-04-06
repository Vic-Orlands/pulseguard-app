"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Auth() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [isSignUp, setIsSignUp] = useState(false);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle authentication logic here
    }, 1500);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    // Simulate Google auth
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
      // Handle Google authentication logic here
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white via-[#D8C1FF] to-[#A0C4FF] overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_10%,transparent_50%)] opacity-30 pointer-events-none" />

      <div className="flex w-full max-w-sm flex-col space-y-8 px-4 sm:px-0">
        {/* Remember to add logo here */}
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl mb-0 font-semibold tracking-tight">
            Welcome to PauseGuard
          </h1>
          <p className="text-sm text-muted-foreground">
            Log In or Register with your email.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <Button
            variant="outline"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 border-emerald-700 cursor-pointer bg-emerald-700"
          >
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
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
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-emerald-700 text-white px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <form onSubmit={handleContinue} className="flex flex-col space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-transparent border-emerald-700"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="border border-emerald-700 bg-emerald-700 text-white cursor-pointer"
            >
              {isLoading ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Continue"
              )}
            </Button>
          </form>

          <p className="px-8 text-center text-xs text-muted-foreground">
            AppCross uses Google reCAPTCHA for secure authentication.
            <br />
            <span className="hover:text-foreground cursor-pointer">
              Privacy
            </span>
            {" · "}
            <span className="hover:text-foreground cursor-pointer">Terms</span>
          </p>
        </div>
      </div>
    </div>
  );
}
