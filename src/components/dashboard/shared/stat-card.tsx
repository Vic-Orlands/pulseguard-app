import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-pg-group px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-pg-subtle">{label}</p>
        <p className="mt-0.5 truncate text-base font-semibold tracking-tight text-pg-text">
          {value}
        </p>
      </div>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pg-surface text-pg-muted">
        {icon}
      </div>
    </div>
  );
}
