import { csrfHeaders } from "@/lib/security/csrf";

const url = process.env.NEXT_PUBLIC_API_URL;

const headers = () => ({
  "Content-Type": "application/json",
  ...csrfHeaders(),
});

export type AppNotification = {
  id: string;
  user_id: string;
  workspace_id?: string;
  project_id?: string;
  type: string;
  title: string;
  body: string;
  href?: string;
  read_at?: string | null;
  created_at: string;
};

export type NotificationPrefs = {
  user_id?: string;
  in_app: boolean;
  email_alerts: boolean;
  email_invites: boolean;
};

export async function listNotifications(): Promise<{
  notifications: AppNotification[];
  unread: number;
}> {
  const res = await fetch(`${url}/api/notifications`, {
    credentials: "include",
    headers: headers(),
  });
  if (!res.ok) {
    throw new Error("Failed to load notifications");
  }
  const data = await res.json();
  return {
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    unread: data.unread ?? 0,
  };
}

export async function markNotificationRead(id: string): Promise<void> {
  const res = await fetch(`${url}/api/notifications/${id}/read`, {
    method: "POST",
    credentials: "include",
    headers: headers(),
  });
  if (!res.ok) {
    throw new Error("Failed to mark notification read");
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const res = await fetch(`${url}/api/notifications/read-all`, {
    method: "POST",
    credentials: "include",
    headers: headers(),
  });
  if (!res.ok) {
    throw new Error("Failed to mark notifications read");
  }
}

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  const res = await fetch(`${url}/api/notifications/prefs`, {
    credentials: "include",
    headers: headers(),
  });
  if (!res.ok) {
    throw new Error("Failed to load notification preferences");
  }
  return res.json();
}

export async function saveNotificationPrefs(
  prefs: NotificationPrefs,
): Promise<NotificationPrefs> {
  const res = await fetch(`${url}/api/notifications/prefs`, {
    method: "PUT",
    credentials: "include",
    headers: headers(),
    body: JSON.stringify(prefs),
  });
  if (!res.ok) {
    throw new Error("Failed to save notification preferences");
  }
  return res.json();
}
