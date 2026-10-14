"use client";

import { useEffect, useState } from "react";
import { csrfHeaders } from "@/lib/security/csrf";
import { useAI } from "@/components/ai/shell";

const base = process.env.NEXT_PUBLIC_API_URL;

export function useAIData<T>(path: string) {
  const { projectId, from, to } = useAI();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ from, to });
    const joiner = path.includes("?") ? "&" : "?";
    fetch(`${base}/api/projects/${projectId}/ai/${path}${joiner}${query}`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await response.text());
        }
        return response.json() as Promise<T>;
      })
      .then((body) => {
        setData(body);
        setError("");
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") {
          return;
        }
        setError(reason instanceof Error ? reason.message : "Request failed");
      });
    return () => controller.abort();
  }, [projectId, path, from, to]);

  return { data, error };
}

export async function aiSend<T>(projectId: string, path: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(`${base}/api/projects/${projectId}/ai/${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...csrfHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export function usd(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value !== 0 && Math.abs(value) < 1 ? 4 : 2,
  });
}

export function pct(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1)}%`;
}

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-pg-border bg-[#161618] p-4">
      <h2 className="mb-3 text-xs uppercase tracking-[0.14em] text-pg-subtle">{title}</h2>
      {children}
    </section>
  );
}

export function Empty({ error, label }: { error: string; label: string }) {
  if (error) {
    return <p className="text-sm text-red-300">{error}</p>;
  }
  return <p className="text-sm text-pg-muted">{label}</p>;
}
