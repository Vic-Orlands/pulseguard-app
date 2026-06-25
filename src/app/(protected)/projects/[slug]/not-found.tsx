import NotFound from "@/app/not-found";

export default function ProjectNotFound() {
  return (
    <NotFound
      message="Sorry! The project you're looking for doesn't exist or has been removed."
      backHref="/projects"
      backLabel="Back to Projects"
    />
  );
}
