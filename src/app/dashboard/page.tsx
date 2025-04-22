"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProjectCard from "./components/project-card";
import ProjectForm from "./components/project-form";

type Project = {
  id: string;
  slug: string;
  name: string;
  description: string;
  platform: string;
  createdAt: string;
  errorCount: number;
  memberCount: number;
};

export default function ProjectSelectionPage() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sample projects data
  const projects: Project[] = [
    {
      id: "proj-1",
      slug: "digitalizing",
      name: "DigitalOcean",
      description: "Main production environment",
      platform: "Next.js",
      createdAt: "2023-10-15",
      errorCount: 12,
      memberCount: 5,
    },
    {
      id: "proj-2",
      slug: "ecom-platform",
      name: "E-commerce Platform",
      description: "Customer facing storefront",
      platform: "React",
      createdAt: "2023-09-20",
      errorCount: 8,
      memberCount: 3,
    },
    {
      id: "proj-3",
      slug: "admin-portal",
      name: "Admin Portal",
      description: "Internal administration dashboard",
      platform: "Node.js",
      createdAt: "2023-11-05",
      errorCount: 23,
      memberCount: 2,
    },
  ];

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = async (projectData: {
    name: string;
    description: string;
    platform: string;
  }) => {
    setIsLoading(true);
    console.log("Creating project:", projectData);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setShowForm(false);
    // In a real app, you would redirect to the new project
  };

  const handleNewProjectClick = () => {
    setShowForm(true);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 text-white py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Projects</h1>
            <p className="text-gray-400 text-sm">
              Select a project to view its dashboard
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Input
                placeholder="Search projects..."
                className="pl-10 w-full bg-black/30 border border-blue-900/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleNewProjectClick}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {showForm ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <ProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => setShowForm(false)}
              isLoading={isLoading}
            />
          </motion.div>
        ) : null}

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                href={`/dashboard/${project.slug}`}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 rounded-full bg-blue-900/20 flex items-center justify-center mb-6">
              <Plus className="h-12 w-12 text-blue-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">No projects found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Create your first project to get started"}
            </p>
            <Button onClick={handleNewProjectClick}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
