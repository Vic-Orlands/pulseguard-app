import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
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
import { FormField, InputWithIcon } from "./shared";
import { registerUser } from "@/lib/api/user-api";
import { toast } from "sonner";

// Validation schemas
const signupStep1Schema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

const signupStep2Schema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string().min(1, "Please confirm your password"),
});

const signupStep3Schema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
});

const fullSignupSchema = signupStep1Schema
  .merge(signupStep2Schema)
  .merge(signupStep3Schema)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof fullSignupSchema>;

export const SignupForm = ({ onToggleMode }: { onToggleMode: () => void }) => {
  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(fullSignupSchema),
    mode: "onChange",
  });

  const validateCurrentStep = async () => {
    let isValid = false;

    switch (step) {
      case 1:
        isValid = await trigger(["name", "email"]);
        break;
      case 2:
        isValid = await trigger(["password", "confirmPassword"]);
        break;
      case 3:
        isValid = await trigger(["company", "role"]);
        break;
    }

    return isValid;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();

    if (!isValid) return;

    if (step === 3) {
      handleSubmit(onSubmit)();
      return;
    }

    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const onSubmit = (data: SignupFormData) => {
    startTransition(async () => {
      try {
        setError("");

        const response = await registerUser(data);
        if (response.error) {
          setError(response.error || "Registration failed");
          return;
        }

        toast("Registration successful");
        onToggleMode();
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Registration failed"
        );
      }
    });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <FormField label="Full Name" error={errors.name?.message}>
              <InputWithIcon
                icon={User}
                placeholder="John Doe"
                error={errors.name?.message}
                {...register("name")}
              />
            </FormField>

            <FormField label="Email Address" error={errors.email?.message}>
              <InputWithIcon
                icon={Mail}
                type="email"
                placeholder="your@email.com"
                error={errors.email?.message}
                {...register("email")}
              />
            </FormField>
          </>
        );
      case 2:
        return (
          <>
            <FormField label="Password" error={errors.password?.message}>
              <InputWithIcon
                icon={Lock}
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                showPasswordToggle
                {...register("password")}
              />
              <div className="mt-2 text-xs text-gray-400">
                Must contain at least 8 characters with uppercase, lowercase,
                and number
              </div>
            </FormField>

            <FormField
              label="Confirm Password"
              error={errors.confirmPassword?.message}
            >
              <InputWithIcon
                icon={Lock}
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                showPasswordToggle
                {...register("confirmPassword")}
              />
            </FormField>
          </>
        );
      case 3:
        return (
          <>
            <FormField
              label="Company (Optional)"
              error={errors.company?.message}
            >
              <input
                type="text"
                placeholder="Your Company"
                className="px-4 py-2 w-full rounded-md bg-black/30 border border-blue-900/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                {...register("company")}
              />
            </FormField>

            <FormField label="Role (Optional)" error={errors.role?.message}>
              <Select onValueChange={(value) => setValue("role", value)}>
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
            </FormField>
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
                  className={`absolute top-4 left-full w-full h-0.5 -translate-x-5/12 -z-10 ${
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
            disabled={isPending}
            className={`${
              step > 1 ? "flex-1" : "w-full"
            } bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {step === 3 ? "Register" : "Continue"}
                {!isPending && <ArrowRight className="h-4 w-4" />}
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
