import { useState, useEffect } from "react";
import { EyeOff, Eye } from "lucide-react";
import type { FormFieldProps, InputWithIconProps } from "@/types/form";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

// Form field component
export const FormField = ({ label, error, children }: FormFieldProps) => (
  <div className="space-y-2 mb-4">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    {children}
    {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
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
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <input
        type={inputType}
        className={`pl-10 ${
          showPasswordToggle ? "pr-10" : "pr-4"
        } py-2 w-full rounded-md bg-black/30 border ${
          error ? "border-red-500" : "border-blue-900/40"
        } text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent`}
        placeholder={placeholder}
        {...props}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
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
