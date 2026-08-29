"use client";

import { forwardRef, type ComponentType, type ReactNode } from "react";
import { ChevronRight, ExternalLink } from "@/components/phosphor-icons";
import { HugeiconsIcon } from "@/components/phosphor-icons";
import type { PulseIconProps } from "@/components/phosphor-icons";
import { cn } from "@/lib/utils";

export function SettingsGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg bg-pg-group divide-y divide-black/[0.06] dark:divide-white/[0.06]",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SettingsRowProps {
  icon: ComponentType<PulseIconProps>;
  label: string;
  value?: ReactNode;
  onClick?: () => void;
  href?: string;
  destructive?: boolean;
  trailing?: "chevron" | "external" | "none";
}

export const SettingsRow = forwardRef<HTMLButtonElement, SettingsRowProps>(
  function SettingsRow(
    {
      icon,
      label,
      value,
      onClick,
      href,
      destructive = false,
      trailing = "chevron",
    },
    ref,
  ) {
    const content = (
      <>
        <HugeiconsIcon
          icon={icon}
          className={cn("h-4 w-4 shrink-0", destructive && "text-red-500")}
        />
        <span
          className={cn(
            "min-w-0 flex-1 text-left text-[13px] font-medium",
            destructive ? "text-red-500" : "text-pg-text",
          )}
        >
          {label}
        </span>
        {value ? (
          <span className="max-w-[46%] truncate text-right text-xs text-pg-muted">
            {value}
          </span>
        ) : null}
        {trailing === "chevron" ? (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-pg-muted" />
        ) : trailing === "external" ? (
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-pg-muted" />
        ) : null}
      </>
    );

    const className =
      "flex w-full items-center gap-3 px-4 py-3.5 transition-colors duration-200 cursor-pointer hover:bg-pg-surface/80";

    if (href) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {content}
        </a>
      );
    }

    return (
      <button type="button" ref={ref} onClick={onClick} className={className}>
        {content}
      </button>
    );
  },
);
