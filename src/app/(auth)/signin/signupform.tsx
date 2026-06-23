import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, ArrowRight01Icon, Camera01Icon, CheckmarkCircle01Icon, Loading02Icon, LockIcon, Mail01Icon, Upload01Icon, UserIcon } from "@hugeicons/core-free-icons";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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
const isDiceBearAvatar = (avatar: string) =>
  avatar.startsWith("https://api.dicebear.com/");

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
                icon={UserIcon}
                placeholder="John Doe"
                error={errors.name?.message}
                {...register("name")}
              />
            </FormField>

            <FormField label="Email Address" error={errors.email?.message}>
              <InputWithIcon
                icon={Mail01Icon}
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
                icon={LockIcon}
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
                icon={LockIcon}
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
              <div className="space-y-3.5">
                {/* Avatar Type Toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarType("predefined");
                      setValue("avatarType", "predefined");
                      setValue("avatar", selectedAvatar);
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      avatarType === "predefined"
                        ? "bg-[#171716] text-white"
                        : "bg-[#f7f7f5] text-[#73736e] border border-[#dfdfda] hover:bg-white hover:text-[#1d1d1b]"
                    }`}
                  >
                    <HugeiconsIcon icon={Camera01Icon} className="h-3.5 w-3.5 inline mr-1.5" />
                    Choose Avatar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarType("upload");
                      setValue("avatarType", "upload");
                      if (uploadedAvatar) setValue("avatar", uploadedAvatar);
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      avatarType === "upload"
                        ? "bg-[#171716] text-white"
                        : "bg-[#f7f7f5] text-[#73736e] border border-[#dfdfda] hover:bg-white hover:text-[#1d1d1b]"
                    }`}
                  >
                    <HugeiconsIcon icon={Upload01Icon} className="h-3.5 w-3.5 inline mr-1.5" />
                    Upload Image
                  </button>
                </div>
                    <HugeiconsIcon icon={Upload01Icon} className="h-3.5 w-3.5 inline mr-1.5" />
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
                        className={`relative group overflow-hidden rounded-lg border-2 transition cursor-pointer ${
                          selectedAvatar === avatar
                            ? "border-[#1d1d1b] ring-2 ring-[#ff5a1f]/20"
                            : "border-[#dfdfda] hover:border-[#73736e]"
                        }`}
                      >
                        <Image
                          src={avatar}
                          alt={`Avatar ${index + 1}`}
                          className="w-full h-16 object-cover bg-white"
                          width={64}
                          height={64}
                          unoptimized={isDiceBearAvatar(avatar)}
                        />
                        {selectedAvatar === avatar && (
                          <div className="absolute inset-0 bg-[#ff5a1f]/10 flex items-center justify-center">
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-[#ff5a1f]" />
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
                      className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition"
                    >
                    {uploadedAvatar ? (
                        <Image
                          src={uploadedAvatar}
                          alt="Uploaded avatar"
                          className="w-12 h-12 rounded-full object-cover"
                          width={48}
                          height={48}
                        />
                      ) : (
                        <>
                          <HugeiconsIcon icon={Upload01Icon} className="h-6 w-6 text-[#73736e] mb-1.5" />
                          <span className="text-xs text-[#73736e]">
                            Click to upload image
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                )}

                {/* Current Avatar Preview */}
                <div className="flex items-center gap-3 p-2.5 bg-[#f7f7f5] border border-[#dfdfda] rounded-lg">
                  <Image
                    src={
                      avatarType === "upload"
                        ? uploadedAvatar ||
                          availableAvatars[2]
                        : selectedAvatar
                    }
                    alt="Current avatar"
                    className="rounded-full object-contain bg-muted"
                    width={40}
                    height={40}
                    quality={80}
                    unoptimized={isDiceBearAvatar(
                      avatarType === "upload"
                        ? uploadedAvatar || availableAvatars[2]
                        : selectedAvatar
                    )}
                  />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Current Selection</p>
                    <p className="text-[10px] text-muted-foreground">
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
                className="px-4 py-2 w-full rounded-lg bg-white border border-[#dfdfda] text-[#1d1d1b] text-xs placeholder:text-[#858580] focus:outline-none focus:ring-1 focus:ring-[#1d1d1b] focus:border-[#1d1d1b] transition-all"
                {...register("company")}
              />
            </FormField>

            <FormField label="Role (Optional)" error={errors.role?.message}>
              <Select onValueChange={(value) => setValue("role", value)}>
                <SelectTrigger className="w-full rounded-lg bg-white border border-[#dfdfda] text-[#1d1d1b] text-xs h-9 focus:outline-none focus:ring-1 focus:ring-[#1d1d1b] focus:border-transparent">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border text-foreground">
                  <SelectGroup>
                    <SelectLabel className="text-muted-foreground text-xs">Role</SelectLabel>
                    <SelectItem
                      value="developer"
                      className="hover:bg-muted focus:bg-muted text-sm"
                    >
                      Developer
                    </SelectItem>
                    <SelectItem
                      value="devops"
                      className="hover:bg-muted focus:bg-muted text-sm"
                    >
                      DevOps Engineer
                    </SelectItem>
                    <SelectItem
                      value="sre"
                      className="hover:bg-muted focus:bg-muted text-sm"
                    >
                      SRE
                    </SelectItem>
                    <SelectItem
                      value="manager"
                      className="hover:bg-muted focus:bg-muted text-sm"
                    >
                      Engineering Manager
                    </SelectItem>
                    <SelectItem
                      value="other"
                      className="hover:bg-muted focus:bg-muted text-sm"
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

    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="text-center mb-6">
        <h1 className="text-lg font-bold text-[#1d1d1b]">Create an account</h1>
        <p className="text-xs text-[#73736e] mt-1">Sign up for PulseGuard</p>
      </div>

      <div className="flex mb-6 items-center justify-center">
        <div className="flex items-center w-full max-w-md">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 relative">
              <motion.div
                className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto ${
                  step > i
                    ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                    : step === i
                    ? "bg-[#171716] text-white"
                    : "bg-white text-[#73736e] border border-[#dfdfda]"
                }`}
                animate={{
                  scale: step === i ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: step === i ? Infinity : 0,
                  repeatType: "reverse",
                }}
              >
                {step > i ? (
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4.5 w-4.5 text-white z-10" />
                ) : (
                  <span className="text-xs font-semibold">{i}</span>
                )}
              </motion.div>
              <div className="text-[10px] font-medium text-[#73736e] text-center mt-1">
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
                  className={`absolute top-3.5 left-full w-full h-[1px] -translate-x-5/12 -z-10 ${
                    step > i ? "bg-emerald-600 dark:bg-emerald-500" : "bg-[#dfdfda]"
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
          className="mb-4 border-destructive bg-destructive/10 text-destructive text-xs py-2 px-3 flex items-center gap-2"
        >
          <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4 shrink-0" />
          <div>
            <AlertDescription className="text-xs font-medium leading-none">{error}</AlertDescription>
          </div>
        </Alert>
      )}

      <form className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <motion.button
              type="button"
              onClick={prevStep}
              className="flex-1 bg-[#f7f7f5] border border-[#dfdfda] text-[#1d1d1b] py-2 rounded-lg hover:bg-white text-xs font-semibold transition cursor-pointer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
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
            } bg-[#171716] text-white py-2 rounded-lg hover:bg-[#ff5a1f] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer h-10`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isPending ? (
              <HugeiconsIcon icon={Loading02Icon} className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {step === 4 ? "Register" : "Continue"}
                {!isPending && <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />}
              </>
            )}
          </motion.button>
        </div>
      </form>

      <div className="text-center mt-6">
        <p className="text-xs text-[#73736e]">
          Already have an account?{" "}
          <button
            type="button"
            aria-label="Sign in"
            onClick={() => onToggleMode("login")}
            className="text-[#1d1d1b] font-semibold hover:text-[#ff5a1f] hover:underline cursor-pointer transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </motion.div>
  );
};
