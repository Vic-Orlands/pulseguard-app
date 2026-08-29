import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { FormMode } from "@/types/form";

const formModes: FormMode[] = [
  "oauth",
  "login",
  "signup",
  "forgot-password",
];

function getFormMode(value: string | null): FormMode {
  return formModes.includes(value as FormMode) ? (value as FormMode) : "oauth";
}

export function useAuthMode() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchMode = getFormMode(searchParams.get("mode"));
  const [mode, setMode] = useState<FormMode>(searchMode);

  useEffect(() => {
    setMode(searchMode);
  }, [searchMode]);

  const toggleMode = (newMode: FormMode) => {
    setMode(newMode);
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", newMode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return { mode, toggleMode };
}
