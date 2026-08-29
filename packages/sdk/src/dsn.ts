export type ParsedDSN = {
  protocol: string;
  host: string;
  ingestKey: string;
  projectId: string;
  ingestBase: string;
};

export function parseDSN(dsn: string): ParsedDSN {
  const value = dsn.trim();
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("PulseGuard: invalid DSN");
  }
  const ingestKey = decodeURIComponent(parsed.username || "");
  const projectId = parsed.pathname.replace(/^\/+/, "").split("/")[0] || "";
  if (!ingestKey || !projectId || !parsed.host) {
    throw new Error("PulseGuard: DSN must look like https://pg_xxx@host/project-id");
  }
  return {
    protocol: parsed.protocol.replace(":", "") || "https",
    host: parsed.host,
    ingestKey,
    projectId,
    ingestBase: `${parsed.protocol}//${parsed.host}`,
  };
}
