import { notFound } from "next/navigation";
import DashboardComponent from "./project-component";

export type Project = {
  id: string;
  slug: string;
  name: string;
  platform: string;
  createdAt: string;
  description: string;
};

async function getProject(slug: string): Promise<Project | null> {
  const projects: Project[] = [
    {
      id: "proj-1",
      slug: "digitalizing",
      name: "DigitalOcean",
      description: "Main production environment",
      platform: "Next.js",
      createdAt: "2023-10-15",
    },
    {
      id: "proj-2",
      slug: "ecom-platform",
      name: "E-commerce Platform",
      description: "Customer facing storefront",
      platform: "React",
      createdAt: "2023-09-20",
    },
    {
      id: "proj-3",
      slug: "admin-portal",
      name: "Admin Portal",
      description: "Internal administration dashboard",
      platform: "Node.js",
      createdAt: "2023-11-05",
    },
  ];

  return projects.find((project) => project.slug === slug) || null;
}

export default async function ProjectDashboardPage({
  params,
}: {
  params: { projectSlug: string };
}) {
  const project = await getProject(params.projectSlug);

  if (!project) {
    notFound();
  }

  return <DashboardComponent project={project} />;
}
