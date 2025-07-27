import { z } from "zod";
import { LucideProps } from "lucide-react";
import { RefAttributes, ForwardRefExoticComponent } from "react";

export type FormMode = "login" | "signup" | "forgot-password";

export type FormProps = {
  onToggleMode: (mode: FormMode) => void;
};

export type FormFieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

export type InputWithIconProps = {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  type?: string;
  placeholder: string;
  error?: string;
  showPasswordToggle?: boolean;
  [key: string]: unknown;
};

// Validation schema for login
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Validation schemas for signup
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
  avatar: z.string().optional(),
  avatarType: z.enum(["predefined", "upload"]),
});

const signupStep4Schema = z.object({
  company: z.string().optional(),
  role: z.string().optional(),
});

export const fullSignupSchema = signupStep1Schema
  .merge(signupStep2Schema)
  .merge(signupStep3Schema)
  .merge(signupStep4Schema)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof fullSignupSchema>;

// Validation schemas for forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
