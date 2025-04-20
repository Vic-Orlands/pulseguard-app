"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Mail,
  User,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Animated background with circular lines
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950"></div>
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-full h-full border border-blue-500/10 rounded-full"
          initial={{
            scale: 0.1 + i * 0.15,
            opacity: 0.3 - i * 0.05,
          }}
          animate={{
            scale: [0.1 + i * 0.15, 0.2 + i * 0.2, 0.1 + i * 0.15],
            opacity: [0.3 - i * 0.05, 0.15 - i * 0.02, 0.3 - i * 0.05],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          initial={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.3 + Math.random() * 0.4,
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Logo component
const Logo = () => (
  <div className="flex items-center justify-center mb-6">
    <motion.div
      className="relative"
      animate={{
        rotate: [0, 360],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-80"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full"></div>
    </motion.div>
    <Link href="/" className="hidden md:block">
      <span className="text-2xl font-bold text-white ml-2">PulseGuard</span>
    </Link>
  </div>
);

// Login form

interface LoginFormEvent extends React.FormEvent<HTMLFormElement> {
  preventDefault: () => void;
}

const LoginForm = ({ onToggleMode }: { onToggleMode: () => void }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: LoginFormEvent): void => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // This would typically be where you handle the login result
      console.log("Login attempted with:", email, password);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-gray-400">Sign in to your PulseGuard account</p>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="mb-4 bg-red-950/50 border-red-800"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-md bg-black/30 border border-blue-900/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-md bg-black/30 border border-blue-900/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-600"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-300"
            >
              Remember me
            </label>
          </div>
          <a href="#" className="text-sm text-blue-400 hover:text-blue-300">
            Forgot password?
          </a>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>Sign In</>
          )}
        </motion.button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-400 bg-gray-900">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-black/30 border border-blue-900/40 py-2 px-4 rounded-md hover:bg-black/50 transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </motion.button>
          <motion.button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-black/30 border border-blue-900/40 py-2 px-4 rounded-md hover:bg-black/50 transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
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
            <span>Google</span>
          </motion.button>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-gray-400">
          Don&apos;t have an account?{" "}
          <button
            onClick={onToggleMode}
            className="text-blue-400 hover:text-blue-300 hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </motion.div>
  );
};

// Signup form with steps

interface FormDataType {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  company: string;
  role: string;
}

const SignupForm = ({ onToggleMode }: { onToggleMode: () => void }) => {
  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    role: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev: FormDataType) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email) {
      setError("Please fill in all fields");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    setError("");
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;

    if (step === 3) {
      // Submit form
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        console.log("Registration data:", formData);
        // Would typically redirect or show success message here
      }, 2000);
      return;
    }

    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="space-y-1 mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-2 w-full rounded-md bg-black/30 border border-blue-900/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-2 w-full rounded-md bg-black/30 border border-blue-900/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="space-y-1 mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-2 w-full rounded-md bg-black/30 border border-blue-900/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-2 w-full rounded-md bg-black/30 border border-blue-900/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="space-y-1 mb-4">
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-300"
              >
                Company (Optional)
              </label>
              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                className="px-4 py-2 w-full rounded-md bg-black/30 border border-blue-900/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Your Company"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-300"
              >
                Role (Optional)
              </label>
              <Select
                onValueChange={(value) =>
                  handleChange({ target: { name: "role", value } } as any)
                }
              >
                <SelectTrigger className="w-full rounded-md bg-black/30 border border-blue-900/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border border-blue-900/40">
                  <SelectGroup>
                    <SelectLabel className="text-gray-400">Role</SelectLabel>
                    <SelectItem
                      value="developer"
                      className="text-white hover:bg-blue-900/30 focus:bg-blue-900/30"
                    >
                      Developer
                    </SelectItem>
                    <SelectItem
                      value="devops"
                      className="text-white hover:bg-blue-900/30 focus:bg-blue-900/30"
                    >
                      DevOps Engineer
                    </SelectItem>
                    <SelectItem
                      value="sre"
                      className="text-white hover:bg-blue-900/30 focus:bg-blue-900/30"
                    >
                      SRE
                    </SelectItem>
                    <SelectItem
                      value="manager"
                      className="text-white hover:bg-blue-900/30 focus:bg-blue-900/30"
                    >
                      Engineering Manager
                    </SelectItem>
                    <SelectItem
                      value="other"
                      className="text-white hover:bg-blue-900/30 focus:bg-blue-900/30"
                    >
                      Other
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">Create an account</h1>
        <p className="text-gray-400">Sign up for PulseGuard</p>
      </div>

      <div className="flex mb-6 items-center justify-center">
        <div className="flex items-center w-full max-w-xs">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 relative">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                  step > i
                    ? "bg-green-500"
                    : step === i
                    ? "bg-blue-600"
                    : "bg-gray-700"
                }`}
                animate={{
                  scale: step === i ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: step === i ? Infinity : 0,
                  repeatType: "reverse",
                }}
              >
                {step > i ? (
                  <CheckCircle className="h-5 w-5 text-white z-10" />
                ) : (
                  <span className="text-white text-sm">{i}</span>
                )}
              </motion.div>
              <div className="text-xs text-gray-400 text-center mt-1">
                {i === 1 ? "Account" : i === 2 ? "Security" : "Details"}
              </div>

              {i < 3 && (
                <div
                  className={`absolute top-4 left-full w-full h-0.5 -translate-x-5/12 ${
                    step > i ? "bg-green-500" : "bg-gray-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="mb-4 bg-red-950/50 border-red-800"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <motion.button
              type="button"
              onClick={prevStep}
              className="flex-1 bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700 transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back
            </motion.button>
          )}
          <motion.button
            type="button"
            onClick={nextStep}
            disabled={loading}
            className={`${
              step > 1 ? "flex-1" : "w-full"
            } bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {step === 3 ? "Complete" : "Continue"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </>
            )}
          </motion.button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-400 bg-gray-900">
              Or sign up with
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-black/30 border border-blue-900/40 py-2 px-4 rounded-md hover:bg-black/50 transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </motion.button>
          <motion.button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-black/30 border border-blue-900/40 py-2 px-4 rounded-md hover:bg-black/50 transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
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
            <span>Google</span>
          </motion.button>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-gray-400">
          Already have an account?{" "}
          <button
            onClick={onToggleMode}
            className="text-blue-400 hover:text-blue-300 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </motion.div>
  );
};

// Main login/signup page
export default function AuthPage() {
  const [mode, setMode] = useState("login");

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-black text-white relative">
      <AnimatedBackground />

      <motion.div
        className="w-full max-w-md p-6 rounded-xl backdrop-blur-sm bg-black/30 border border-blue-900/40 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo />

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
