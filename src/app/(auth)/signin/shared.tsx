import { useState } from "react";
import { Eye, EyeOff } from "@/components/phosphor-icons";
import type { FormFieldProps, InputWithIconProps } from "@/types/form";

/** Form field wrapper: label + children + inline field error */
export const FormField = ({ label, error, children }: FormFieldProps) => (
  <div className="text-left w-full mb-4">
    <label className="form-label">{label}</label>
    {children}
    {error && (
      <p className="text-xs text-pg-err-txt mt-2 font-medium text-left">
        {error}
      </p>
    )}
  </div>
);

/** Input with a leading icon and optional password-toggle */
export const InputWithIcon = ({
  icon: Icon,
  type = "text",
  placeholder,
  error,
  showPasswordToggle = false,
  ...props
}: InputWithIconProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div className="relative w-full">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pg-subtle flex items-center justify-center pointer-events-none">
        <Icon className="h-4 w-4" />
      </span>
      <input
        type={inputType}
        className={`input-field ${
          error
            ? "border-pg-err-bd focus:border-pg-err-txt"
            : "focus:border-zinc-500"
        } ${showPasswordToggle ? "pr-10" : ""}`}
        placeholder={placeholder}
        {...props}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-pg-subtle hover:text-pg-text transition-colors p-1 cursor-pointer bg-transparent border-0"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
};
