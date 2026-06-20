import type { Error, ErrorListResponse, ErrorFilterProps } from "@/types/error";

const url = process.env.NEXT_PUBLIC_API_URL;

export async function fetchErrors(
  filters: ErrorFilterProps
): Promise<ErrorListResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.append(key, value.toString());
    }
  });

  const response = await fetch(`${url}/api/errors?${params.toString()}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch errors: ${response.status}`);
  }

  return response.json();
}

export async function fetchErrorById(id: string): Promise<Error> {
  const response = await fetch(`${url}/api/errors/get?id=${id}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch error: ${response.status}`);
  }

  return response.json();
}

export async function updateErrorStatus(
  id: string,
  status: string
): Promise<Error> {
  const response = await fetch(`${url}/api/errors/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to update error status: ${response.status}`);
  }

  return response.json();
}
