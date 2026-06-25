"use client";

import { useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Check,
  ArrowRight,
  User,
  Mail,
  Lock,
  Upload,
  Link2,
  Image as ImageIcon,
  Building,
} from "lucide-react";

import { FormField, InputWithIcon } from "./shared";
import { registerUser } from "@/lib/api/user-api";
import {
  fullSignupSchema,
  type FormProps,
  type SignupFormData,
} from "@/types/form";
import Image from "next/image";

// Preset Unsplash avatars matching Traces design system
const PRESET_AVATARS = [
  {
    id: "av-1",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
    label: "Cyan Aurora",
  },
  {
    id: "av-2",
    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=150&q=80",
    label: "Glass Tech",
  },
  {
    id: "av-3",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    label: "Lady Avatar",
  },
  {
    id: "av-4",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=150&q=80",
    label: "Silver Core",
  },
];

export const SignupForm = ({ onToggleMode }: FormProps) => {
  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [uploadedAvatar, setUploadedAvatar] = useState<string>("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    PRESET_AVATARS[0].url,
  );
  const [avatarType, setAvatarType] = useState<"predefined" | "upload">(
    "predefined",
  );

  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      avatar: PRESET_AVATARS[0].url,
      avatarType: "predefined",
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleImageFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedAvatar(result);
      setSelectedAvatar(result);
      setValue("avatar", result);
      setAvatarType("upload");
      setValue("avatarType", "upload");
    };
    reader.readAsDataURL(file);
  };

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAvatarUrl.trim()) {
      setSelectedAvatar(customAvatarUrl.trim());
      setValue("avatar", customAvatarUrl.trim());
      setAvatarType("upload");
      setValue("avatarType", "upload");
      setShowUrlInput(false);
    }
  };

  const validateCurrentStep = async () => {
    let isValid = false;

    switch (step) {
      case 1:
        isValid = await trigger([
          "name",
          "email",
          "company",
          "password",
          "confirmPassword",
        ]);
        break;
      case 2:
        isValid = await trigger(["avatar", "avatarType"]);
        break;
    }

    return isValid;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();

    if (!isValid) return;

    if (step === 2) {
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Registration failed");
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
                placeholder="Chimezie Innocent"
                error={errors.name?.message}
                {...register("name")}
              />
            </FormField>

            <FormField label="Email Address" error={errors.email?.message}>
              <InputWithIcon
                icon={Mail}
                type="email"
                placeholder="name@domain.com"
                error={errors.email?.message}
                {...register("email")}
              />
            </FormField>

            <FormField
              label="Company (Optional)"
              error={errors.company?.message}
            >
              <InputWithIcon
                icon={Building}
                placeholder="PulseGuard Inc."
                error={errors.company?.message}
                {...register("company")}
              />
            </FormField>

            <FormField label="Password" error={errors.password?.message}>
              <InputWithIcon
                icon={Lock}
                type="password"
                placeholder="••••••••••••"
                error={errors.password?.message}
                showPasswordToggle
                {...register("password")}
              />
            </FormField>

            <FormField
              label="Confirm Password"
              error={errors.confirmPassword?.message}
            >
              <InputWithIcon
                icon={Lock}
                type="password"
                placeholder="••••••••••••"
                error={errors.confirmPassword?.message}
                showPasswordToggle
                {...register("confirmPassword")}
              />
            </FormField>
          </>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-left">
              <h2 className="text-2xl font-normal tracking-[-0.058em] text-white font-sans">
                Choose your avatar
              </h2>
              <p className="mt-2 text-sm text-zinc-400 font-sans">
                Set up your workspace identity with a high-contrast visual
                profile or upload yours.
              </p>
            </div>

            {/* Selected Avatar Preview */}
            <div className="flex justify-center py-2">
              <div className="relative w-20 h-20 rounded-full bg-zinc-900 border-2 border-zinc-700/80 p-0.5 flex items-center justify-center">
                <Image
                  src={selectedAvatar}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover rounded-full bg-zinc-950"
                  referrerPolicy="no-referrer"
                  onError={() => setSelectedAvatar(PRESET_AVATARS[0].url)}
                  fill
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-zinc-950 border-2 border-zinc-950">
                  <Check className="w-3.5 h-3.5 text-white stroke-[3.5px]" />
                </div>
              </div>
            </div>

            {/* Preset Avatar Selection Grid */}
            <div className="space-y-3">
              <label className="block text-zinc-400 text-xs font-medium text-left select-none">
                Pre-defined Avatars
              </label>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_AVATARS.map((avatar) => {
                  const isSelected =
                    avatarType === "predefined" &&
                    selectedAvatar === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(avatar.url);
                        setValue("avatar", avatar.url);
                        setAvatarType("predefined");
                        setValue("avatarType", "predefined");
                        setCustomAvatarUrl("");
                      }}
                      className={`relative aspect-square rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${
                        isSelected
                          ? "border-white scale-105 shadow-[0_0_12px_rgba(255,255,255,0.1)]"
                          : "border-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <Image
                        src={avatar.url}
                        alt={avatar.label}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        fill
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upload or Link Area */}
            <div className="space-y-3 text-left">
              <label className="block text-zinc-400 text-xs font-medium select-none">
                Upload or custom image
              </label>

              {/* Drag & Drop uploader zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-5 px-4 rounded-lg border border-dashed text-center transition-all cursor-pointer select-none ${
                  dragActive
                    ? "border-white bg-zinc-900/80 text-white"
                    : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60 text-zinc-400"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-5 h-5 mx-auto mb-2 text-zinc-500" />
                <p className="text-xs font-medium text-zinc-300">
                  {dragActive
                    ? "Drop your image here"
                    : "Drag & drop avatar here, or click to browse"}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Supports PNG, JPG, GIF (Max 2MB)
                </p>
              </div>

              {/* Provide URL Option */}
              <div className="pt-1">
                {showUrlInput ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                        <Link2 className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="url"
                        placeholder="https://example.com/avatar.png"
                        value={customAvatarUrl}
                        onChange={(e) => setCustomAvatarUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleCustomUrlSubmit(e);
                          }
                        }}
                        className="w-full h-8 pl-8 pr-2 rounded bg-zinc-900/80 border border-zinc-800 focus:border-zinc-500 focus:outline-none text-white text-xs transition-colors"
                        autoFocus
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCustomUrlSubmit}
                      className="h-8 px-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(false)}
                      className="h-8 px-2 text-zinc-500 hover:text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(true)}
                    className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors cursor-pointer focus:outline-none bg-transparent border-0 p-0"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Or use a custom image URL</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="w-full max-w-[374px] mx-auto px-1"
      id="email-form-container"
    >
      <div className="mb-6 flex justify-start">
        <motion.button
          id="btn-back-to-oauth"
          type="button"
          onClick={() => onToggleMode("oauth")}
          whileHover={{ x: -2 }}
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-[13px] font-medium transition-colors cursor-pointer focus:outline-none bg-transparent border-0 p-0"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-500" />
          <span>Back to options</span>
        </motion.button>
      </div>

      {step !== 2 && (
        <div className="mb-6 text-left">
          <h2 className="text-2xl font-normal tracking-[-0.058em] text-white font-sans">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-zinc-400 font-sans">
            Get started with PulseGuard by setting up your profile
          </p>
        </div>
      )}

      {/* Progress Indicators matching Traces layout */}
      <div className="flex items-center justify-between mb-8 select-none">
        <div className="flex items-center space-x-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
              step === 1
                ? "bg-white text-zinc-950"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {step > 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
          </div>
          <span
            className={`text-xs font-medium ${
              step === 1 ? "text-white" : "text-zinc-500"
            }`}
          >
            Profile
          </span>
        </div>
        <div className="flex-1 h-px bg-zinc-800 mx-4" />
        <div className="flex items-center space-x-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
              step === 2
                ? "bg-white text-zinc-950"
                : "bg-zinc-900 border border-zinc-800 text-zinc-500"
            }`}
          >
            2
          </div>
          <span
            className={`text-xs font-medium ${
              step === 2 ? "text-white" : "text-zinc-500"
            }`}
          >
            Avatar
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs text-left">
          {error}
        </div>
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
              className="flex items-center justify-center p-3 border border-zinc-800 hover:bg-zinc-900/50 text-zinc-400 hover:text-white font-semibold text-xs rounded-lg transition-all cursor-pointer focus:outline-none"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </motion.button>
          )}
          <motion.button
            type="button"
            onClick={nextStep}
            disabled={isPending}
            className={`${
              step > 1 ? "flex-1" : "w-full"
            } bg-[#18181b] text-white border border-zinc-800 hover:opacity-90 dark:bg-[#e2e2e2] dark:text-black dark:border-transparent py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer h-9.5`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-current" />
            ) : (
              <>
                <span>{step === 2 ? "Register" : "Continue"}</span>
                {step < 2 && <ArrowRight className="h-3.5 w-3.5" />}
              </>
            )}
          </motion.button>
        </div>
      </form>

      <div className="mt-8 text-center text-xs text-zinc-500 select-none">
        <p>
          Already have an account?{" "}
          <button
            type="button"
            id="link-switch-to-signin"
            onClick={() => onToggleMode("login")}
            className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer focus:outline-none font-medium ml-1 bg-transparent border-0 p-0"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
