import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "selection:bg-orange-500/30 selection:text-pg-text flex h-9 w-full min-w-0 rounded-lg border border-pg-border bg-pg-surface px-3 py-1 text-[13px] text-pg-text shadow-none outline-none transition-[border-color,background-color,box-shadow] placeholder:text-pg-subtle file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-zinc-500 focus-visible:ring-2 focus-visible:ring-orange-500/10",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
