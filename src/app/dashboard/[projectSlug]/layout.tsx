import { ReactNode } from "react";

export default function ProjectLayout({
  children,
}: {
  children: ReactNode;
  params: { projectSlug: string };
}) {
  return <>{children}</>;
}
