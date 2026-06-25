import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { FormFieldProps, InputWithIconProps } from "@/types/form";

// Redesigned Form field matching Traces styles
export const FormField = ({ label, error, children }: FormFieldProps) => (
  <div className="text-left w-full mb-4">
    <label className="block text-zinc-400 text-xs font-medium mb-1.5 select-none">{label}</label>
    {children}
    {error && <p className="text-xs text-red-400 mt-2 font-medium text-left">{error}</p>}
  </div>
);

// Redesigned Input component with absolute positioning icon
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
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 flex items-center justify-center pointer-events-none">
        <Icon className="h-4 w-4" />
      </span>
      <input
        type={inputType}
        className={`w-full h-9.5 pl-10 ${
          showPasswordToggle ? "pr-10" : "pr-4"
        } rounded-lg bg-zinc-900/60 border ${
          error ? "border-red-900/50 focus:border-red-500" : "border-zinc-800 focus:border-zinc-500"
        } text-white placeholder-zinc-600 focus:outline-none text-[13.5px] transition-colors duration-200`}
        placeholder={placeholder}
        {...props}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1 cursor-pointer"
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
