import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type ProjectCardProps = {
  project: {
    id: string;
    name: string;
    description: string;
    platform: string;
    createdAt: string;
    errorCount: number;
    memberCount: number;
  };
  href: string;
};

export default function ProjectCard({ project, href }: ProjectCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-black/30 border border-blue-900/40 rounded-lg overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">{project.name}</h3>
          <Badge variant="outline">{project.platform}</Badge>
        </div>
        <p className="text-gray-400 mb-6">{project.description}</p>

        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-400">Created</p>
            <p>{new Date(project.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Members</p>
            <p>{project.memberCount}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Badge variant={project.errorCount > 0 ? "destructive" : "default"}>
            {project.errorCount} {project.errorCount === 1 ? "Error" : "Errors"}
          </Badge>
          <Button asChild variant="outline" className="gap-2">
            <Link href={href}>
              Open <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
