import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { FormMode } from "@/types/form";

export function useHydrated() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [hydrated, setHydrated] = useState(false);

  // Set hydrated to true on client-side after mount
  useEffect(() => {
    setHydrated(true);
  }, []);

  const mode = (searchParams.get("mode") as FormMode) || "login";

  const toggleMode = (newMode: FormMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", newMode);
    router.push(`${pathname}?${params.toString()}`);
  };

  return { mode, toggleMode, hydrated };
}
