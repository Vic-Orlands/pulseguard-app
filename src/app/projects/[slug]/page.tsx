import { notFound } from "next/navigation";
import DashboardComponent from "./project-component";
import { cookies } from "next/headers";
import { ProjectTelemetrySync } from "./project-telemetry-sync";

const url = process.env.NEXT_PUBLIC_API_URL;

export async function generateStaticParams() {
  const res = await fetch(`${url}/api/projects`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    return [];
  }

  const projects = await res.json();
  return projects.map((p: { slug: string }) => ({
    slug: p.slug,
  }));
}

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) notFound();

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const res = await fetch(`${url}/api/projects/${slug}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      notFound();
    }
    throw new Error("Failed to fetch project");
  }

  const project = await res.json();
  return (
    <>
      <ProjectTelemetrySync projectId={project.id} />
      <DashboardComponent project={project} />
    </>
  );
}
