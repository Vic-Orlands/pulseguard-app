import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Shell } from "@/components/ai/shell";
import { serverApiUrl } from "@/lib/server-api-url";

const url = serverApiUrl();

export default async function AILayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
  const response = await fetch(`${url}/api/projects/${slug}`, {
    cache: "no-store",
    headers: { Cookie: cookieHeader },
  });
  if (response.status === 401) {
    redirect(`/signin?redirect=/projects/${encodeURIComponent(slug)}/ai`);
  }
  if (!response.ok) {
    notFound();
  }
  const project = (await response.json()) as { id: string; name: string; slug: string };
  return (
    <Shell projectId={project.id} slug={project.slug} name={project.name}>
      {children}
    </Shell>
  );
}
