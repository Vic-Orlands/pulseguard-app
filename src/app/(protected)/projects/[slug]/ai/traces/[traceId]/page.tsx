"use client";

import { useParams } from "next/navigation";
import { TraceInspector } from "@/components/ai/trace-view";
import { useAI } from "@/components/ai/shell";

export default function TraceDetailPage() {
  const params = useParams<{ traceId: string }>();
  const { projectId, slug } = useAI();
  return <TraceInspector projectId={projectId} slug={slug} traceId={params.traceId} surface="ai" />;
}
