import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import type { FormFieldProps, InputWithIconProps } from "@/types/form";

// Form field component
export const FormField = ({ label, error, children }: FormFieldProps) => (
  <div className="space-y-1.5 mb-3.5">
    <label className="block text-xs font-semibold text-[#1d1d1b]">{label}</label>
    {children}
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

// Input component with icon
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
    <div className="relative">
      <HugeiconsIcon icon={Icon} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#73736e]" size={15} />
      <input
        type={inputType}
        className={`pl-10 ${
          showPasswordToggle ? "pr-10" : "pr-4"
        } py-2 w-full rounded-lg bg-white border ${
          error ? "border-destructive" : "border-[#dfdfda]"
        } text-[#1d1d1b] text-xs placeholder:text-[#858580] focus:outline-none focus:ring-1 focus:ring-[#1d1d1b] focus:border-[#1d1d1b] transition-all`}
        placeholder={placeholder}
        {...props}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#73736e] hover:text-[#1d1d1b]"
        >
          {showPassword ? (
            <HugeiconsIcon icon={ViewOffIcon} className="h-4 w-4" />
          ) : (
            <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
};


