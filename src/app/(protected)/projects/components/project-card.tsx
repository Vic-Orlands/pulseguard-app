import { motion } from "motion/react";
import { Calendar, Users, AlertTriangle, ExternalLink } from "lucide-react";
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
      "Next.js": "bg-black text-white",
      React: "bg-blue-600 text-white",
      "Node.js": "bg-green-600 text-white",
      "Vue.js": "bg-emerald-600 text-white",
      Angular: "bg-red-600 text-white",
      Others: "bg-cyan-500/20 text-cyan-400",
    };
    return colors[platform] || "bg-gray-600 text-white";
  };

  const getErrorSeverity = (count: number) => {
    if (count === 0)
      return "bg-green-900/20 text-green-400 border-green-900/40";
    if (count <= 5)
      return "bg-yellow-900/20 text-yellow-400 border-yellow-900/40";
    if (count <= 15)
      return "bg-orange-900/20 text-orange-400 border-orange-900/40";
    return "bg-red-900/20 text-red-400 border-red-900/40";
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{
          scale: 1.02,
          y: -5,
          transition: { duration: 0.2, ease: "easeOut" },
        }}
        transition={{
          duration: 0.5,
          delay: index * 0.1,
          ease: "easeOut",
        }}
        className="bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-800/70 hover:border-gray-600/60 transition-all duration-200 group"
      >
        <div className="p-4 pb-3 border-b border-gray-700/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                  {project.name}
                </h3>
                <Badge className={getPlatformColor(project.platform)}>
                  {project.platform}
                </Badge>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {project.description}
              </p>
            </div>

            <Button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-transparent hover:bg-blue-900/20 text-gray-400 hover:text-blue-400 border border-gray-600/50 hover:border-blue-500/50">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </motion.div>
            </Button>
          </div>
        </div>

        <div className="p-4 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(project.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {project.memberCount || 1} member
                  {project.memberCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-md border ${getErrorSeverity(
                project.errorCount
              )}`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="h-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 hover:bg-gray-800/70 hover:border-blue-500/30 transition-all duration-200 group cursor-pointer"
      onClick={() => router.push(href)}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1 truncate group-hover:text-blue-400 transition-colors">
              {project.name}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">
              {project.description}
            </p>
          </div>
          <Badge
            className={`${getPlatformColor(
              project.platform
            )} text-xs px-2 py-1 ml-2 flex-shrink-0`}
          >
            {project.platform || "Nextjs"}
          </Badge>
        </div>

        <div className="space-y-3 mt-auto">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(project.createdAt)}</span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{project.memberCount}</span>
            </div>
          </div>
          <div
            className={`flex items-center justify-between px-3 py-2 rounded border ${getErrorSeverity(
              project.errorCount
            )}`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {project.errorCount === 0
                  ? "No errors"
                  : `${project.errorCount} error${
                      project.errorCount !== 1 ? "s" : ""
                    }`}
              </span>
            </div>

            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
