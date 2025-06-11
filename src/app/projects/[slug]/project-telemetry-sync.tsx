"use client";

import { useEffect } from "react";
import { useTelemetry } from "@/components/telemetry-provider";

export function ProjectTelemetrySync({ projectId }: { projectId: string }) {
  const { setProjectId } = useTelemetry();

  useEffect(() => {
    if (projectId) {
      setProjectId(projectId);
    }
  }, [projectId, setProjectId]);

  return null;
}
