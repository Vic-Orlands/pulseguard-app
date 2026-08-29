import { notFound, redirect } from "next/navigation";
import DashboardComponent from "./project-component";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_API_URL;

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
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      redirect(`/signin?redirect=/projects/${encodeURIComponent(slug)}`);
    }
    if (res.status === 404) {
      notFound();
    }
    throw new Error("Failed to fetch project");
  }

  const project = await res.json();
  return <DashboardComponent project={project} />;
}
