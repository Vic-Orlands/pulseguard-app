import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-sm font-semibold text-foreground mb-1">Project Not Found</h1>
      <p className="text-xs text-muted-foreground mb-4">
        The project you’re looking for doesn’t exist or has been removed.
      </p>

      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card rounded text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-xs"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="h-3.5 w-3.5" />
        Back to Projects
      </Link>
    </div>
  );
}
