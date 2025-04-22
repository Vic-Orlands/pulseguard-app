// app/login/page.tsx
"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FuturisticBg from "@/components/background-color";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function LoginPage() {
  const [signupStep, setSignupStep] = useState(0);
  const [isSignup, setIsSignup] = useState(false);

  // Signup steps for animated progress
  const signupSteps = [
    {
      label: "Email",
      field: <Input type="email" placeholder="Email" className="w-full" />,
    },
    {
      label: "Password",
      field: (
        <Input type="password" placeholder="Password" className="w-full" />
      ),
    },
    {
      label: "Name",
      field: <Input type="text" placeholder="Full Name" className="w-full" />,
    },
  ];

  return (
    <FuturisticBg>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-black/60 backdrop-blur rounded-2xl shadow-xl p-8 w-full max-w-sm mx-auto"
      >
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          {isSignup ? "Create Your Account" : "Sign In"}
        </h2>
        <AnimatePresence mode="wait">
          {!isSignup ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
            >
              <form className="space-y-4">
                <Input type="email" placeholder="Email" className="w-full" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="w-full"
                />
                <Button className="w-full bg-[#00f2fe] text-black">
                  Login
                </Button>
              </form>
              <div className="my-4 flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-700" />
                <span className="text-gray-400 text-xs">OR</span>
                <div className="flex-1 h-px bg-gray-700" />
              </div>
              <Button
                variant="outline"
                className="w-full mb-2 flex items-center justify-center gap-2"
                onClick={() => {
                  /* handle Google login */
                }}
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <g>
                    <path
                      fill="#4285F4"
                      d="M44.5 20H24v8.5h11.7C34.3 32.6 29.7 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.5-4z"
                    />
                    <path
                      fill="#34A853"
                      d="M6.3 14.7l7 5.1C15.3 16.1 19.3 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 6.5 29.6 4 24 4c-7.7 0-14.2 4.3-17.7 10.7z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M24 44c5.4 0 10.4-1.8 14.3-4.9l-6.6-5.4c-2 1.4-4.5 2.3-7.7 2.3-5.7 0-10.3-3.7-12-8.7l-7 5.4C9.8 39.6 16.3 44 24 44z"
                    />
                    <path
                      fill="#EA4335"
                      d="M44.5 20H24v8.5h11.7c-1.2 3.2-4.3 6.5-11.7 6.5-7.7 0-14.2-6.3-14.2-14s6.5-14 14.2-14c3.7 0 7.1 1.3 9.7 3.4l7.4-7.4C39.2 3.1 31.9 0 24 0 10.7 0 0 10.7 0 24s10.7 24 24 24c13.3 0 24-10.7 24-24 0-1.3-.1-2.7-.5-4z"
                    />
                  </g>
                </svg>
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => {
                  /* handle GitHub login */
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#fff"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.867 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.461-1.11-1.461-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.528 2.341 1.087 2.91.832.092-.646.35-1.087.636-1.338-2.221-.253-4.555-1.112-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.748-1.025 2.748-1.025.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.337 4.695-4.566 4.944.36.309.681.919.681 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.578.688.48C19.135 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                  />
                </svg>
                Continue with GitHub
              </Button>
              <div className="mt-6 text-center">
                <button
                  className="text-[#00f2fe] hover:underline text-sm"
                  onClick={() => setIsSignup(true)}
                >
                  Don&apos;t have an account? Sign up
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
            >
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (signupStep < signupSteps.length - 1)
                    setSignupStep(signupStep + 1);
                  else {
                    /* submit signup */
                  }
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={signupStep}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.5 }}
                  >
                    {signupSteps[signupStep].field}
                  </motion.div>
                </AnimatePresence>
                <Button className="w-full bg-[#00f2fe] text-black">
                  {signupStep < signupSteps.length - 1
                    ? "Next"
                    : "Create Account"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <button
                  className="text-[#00f2fe] hover:underline text-sm"
                  onClick={() => {
                    setIsSignup(false);
                    setSignupStep(0);
                  }}
                >
                  Already have an account? Login
                </button>
              </div>
              {/* Progress indicator */}
              <div className="flex justify-center mt-4 gap-2">
                {signupSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      i <= signupStep ? "bg-[#00f2fe]" : "bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </FuturisticBg>
  );
}
