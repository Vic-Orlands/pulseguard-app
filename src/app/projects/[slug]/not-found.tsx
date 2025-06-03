import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 text-white flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-bold mb-2">Project Not Found</h1>
      <p className="text-gray-400 mb-6">
        The project you’re looking for doesn’t exist or has been removed.
      </p>

      <Link
        href="/projects"
        className="inline-flex items-center gap-2 px-4 py-2 border border-blue-900/40 bg-black/30 rounded-lg hover:bg-black/50 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>
    </div>
  );
}
