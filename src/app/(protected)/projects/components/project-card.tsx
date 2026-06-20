import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon, Calendar01Icon, LinkSquare01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

import type { ProjectCardProps } from "@/types/project";

export default function ProjectCard({
  index,
  project,
  href,
  viewMode = "grid",
}: ProjectCardProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      "Next.js": "bg-foreground/5 text-foreground border border-foreground/10",
      React: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      "Node.js": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      "Vue.js": "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20",
      Angular: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
      Others: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20",
    };
    return colors[platform] || "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20";
  };

  const getErrorSeverity = (count: number) => {
    if (count === 0)
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
    if (count <= 5)
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    if (count <= 15)
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    return "bg-destructive/10 text-destructive border border-destructive/20";
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{
          y: -2,
          transition: { duration: 0.2, ease: "easeOut" },
        }}
        transition={{
          duration: 0.4,
          delay: index * 0.05,
          ease: "easeOut",
        }}
        className="bg-card border border-border rounded-lg hover:border-muted-foreground/30 transition-all duration-200 group"
      >
        <div className="p-4 pb-3 border-b border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-1.5">
                <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <Badge className={`${getPlatformColor(project.platform)} text-[10px] px-1.5 py-0 rounded font-medium shadow-none`}>
                  {project.platform}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {project.description}
              </p>
            </div>

            <Button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background text-muted-foreground border border-border hover:bg-muted hover:text-foreground text-xs py-1 h-7 px-3 rounded shadow-none">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center"
              >
                <HugeiconsIcon icon={LinkSquare01Icon} className="h-3.5 w-3.5 mr-1.5" />
                Open
              </motion.div>
            </Button>
          </div>
        </div>

        <div className="p-4 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Calendar01Icon} className="h-3.5 w-3.5" />
                <span>{formatDate(project.createdAt)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={UserGroupIcon} className="h-3.5 w-3.5" />
                <span>
                  {project.memberCount || 1} member
                  {project.memberCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs ${getErrorSeverity(
                project.errorCount
              )}`}
            >
              <HugeiconsIcon icon={Alert01Icon} className="h-3.5 w-3.5" />
              <span className="font-semibold">
                {project.errorCount} error{project.errorCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="h-full bg-card border border-border rounded-lg p-5 hover:border-muted-foreground/30 transition-all duration-200 group cursor-pointer shadow-xs"
      onClick={() => router.push(href)}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-3.5">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-1 truncate group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <p className="text-muted-foreground text-xs line-clamp-2">
              {project.description}
            </p>
          </div>
          <Badge
            className={`${getPlatformColor(
              project.platform
            )} text-[10px] px-1.5 py-0 ml-2 flex-shrink-0 font-medium rounded shadow-none`}
          >
            {project.platform || "Nextjs"}
          </Badge>
        </div>

        <div className="space-y-2.5 mt-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Calendar01Icon} className="h-3.5 w-3.5" />
              <span>{formatDate(project.createdAt)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={UserGroupIcon} className="h-3.5 w-3.5" />
              <span>{project.memberCount}</span>
            </div>
          </div>
          <div
            className={`flex items-center justify-between px-2.5 py-1.5 rounded border text-xs ${getErrorSeverity(
              project.errorCount
            )}`}
          >
            <div className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Alert01Icon} className="h-3.5 w-3.5" />
              <span className="font-semibold">
                {project.errorCount === 0
                  ? "No errors"
                  : `${project.errorCount} error${
                      project.errorCount !== 1 ? "s" : ""
                    }`}
              </span>
            </div>

            <HugeiconsIcon icon={LinkSquare01Icon} className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
