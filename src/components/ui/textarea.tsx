import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-pg-subtle aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-20 w-full rounded-lg border border-pg-border bg-pg-surface px-3 py-2 text-[13px] text-pg-text shadow-none outline-none transition-[border-color,background-color,box-shadow] focus-visible:border-zinc-500 focus-visible:ring-2 focus-visible:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
