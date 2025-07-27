import Image from "next/image";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Mail,
  User,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Camera,
  Upload,
} from "lucide-react";
import { availableAvatars, getRandomAvatars } from "@/components/avatars";
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

import {
  fullSignupSchema,
  type FormProps,
  type SignupFormData,
} from "@/types/form";

// Get random avatars for the signup form
const randomAvatars = getRandomAvatars(availableAvatars);

export const SignupForm = ({ onToggleMode }: FormProps) => {
  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [uploadedAvatar, setUploadedAvatar] = useState<string>("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    randomAvatars[0]
  );
  const [avatarType, setAvatarType] = useState<"predefined" | "upload">(
    "predefined"
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(fullSignupSchema),
    mode: "onChange",
    defaultValues: {
      avatar: randomAvatars[0],
      avatarType: "predefined",
    },
  });

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedAvatar(result);
        setValue("avatar", result);
        setAvatarType("upload");
        setValue("avatarType", "upload");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setValue("avatar", avatar);
    setAvatarType("predefined");
    setValue("avatarType", "predefined");
  };

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
        isValid = await trigger(["avatar", "avatarType"]);
        break;
      case 4:
        isValid = await trigger(["company", "role"]);
        break;
    }

    return isValid;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();

    if (!isValid) return;

    if (step === 4) {
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
        onToggleMode("login");
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
            <FormField label="Profile Picture" error={errors.avatar?.message}>
              <div className="space-y-4">
                {/* Avatar Type Toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarType("predefined");
                      setValue("avatarType", "predefined");
                      setValue("avatar", selectedAvatar);
                    }}
                    className={`flex-1 py-2 px-4 rounded-md text-sm transition ${
                      avatarType === "predefined"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    <Camera className="h-4 w-4 inline mr-2" />
                    Choose Avatar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarType("upload");
                      setValue("avatarType", "upload");
                      if (uploadedAvatar) setValue("avatar", uploadedAvatar);
                    }}
                    className={`flex-1 py-2 px-4 rounded-md text-sm transition ${
                      avatarType === "upload"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    <Upload className="h-4 w-4 inline mr-2" />
                    Upload Image
                  </button>
                </div>

                {/* Avatar Selection */}
                {avatarType === "predefined" && (
                  <div className="grid grid-cols-3 gap-3">
                    {randomAvatars.map((avatar, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAvatarSelect(avatar)}
                        className={`relative group overflow-hidden rounded-lg border-2 transition ${
                          selectedAvatar === avatar
                            ? "border-blue-500 ring-2 ring-blue-500/50"
                            : "border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        <Image
                          src={avatar.replace("svg", "png")}
                          alt={`Avatar ${index + 1}`}
                          className="w-full h-16 object-cover bg-gray-800"
                          width={64}
                          height={64}
                        />
                        {selectedAvatar === avatar && (
                          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-blue-500" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Upload Option */}
                {avatarType === "upload" && (
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition"
                    >
                      {uploadedAvatar ? (
                        <Image
                          src={uploadedAvatar}
                          alt="Uploaded avatar"
                          className="w-16 h-16 rounded-full object-cover"
                          width={64}
                          height={64}
                        />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-400">
                            Click to upload image
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                )}

                {/* Current Avatar Preview */}
                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                  <Image
                    src={
                      avatarType === "upload"
                        ? uploadedAvatar ||
                          availableAvatars[2].replace("svg", "png")
                        : selectedAvatar.replace("svg", "png")
                    }
                    alt="Current avatar"
                    className="rounded-full object-contain bg-gray-800"
                    width={48}
                    height={48}
                    quality={80}
                  />
                  <div>
                    <p className="text-sm text-white">Current Selection</p>
                    <p className="text-xs text-gray-400">
                      {avatarType === "upload"
                        ? "Uploaded Image"
                        : "Predefined Avatar"}
                    </p>
                  </div>
                </div>
              </div>
            </FormField>
          </>
        );
      case 4:
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
        <div className="flex items-center w-full max-w-md">
          {[1, 2, 3, 4].map((i) => (
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
                {i === 1
                  ? "Account"
                  : i === 2
                  ? "Security"
                  : i === 3
                  ? "Avatar"
                  : "Details"}
              </div>

              {i < 4 && (
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
                {step === 4 ? "Register" : "Continue"}
                {!isPending && <ArrowRight className="h-4 w-4" />}
              </>
            )}
          </motion.button>
        </div>
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            aria-label="Sign in"
            onClick={() => onToggleMode("login")}
            className="text-blue-400 cursor-pointer hover:text-blue-300 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </motion.div>
  );
};
