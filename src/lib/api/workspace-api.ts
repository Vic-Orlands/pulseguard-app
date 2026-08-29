const url = process.env.NEXT_PUBLIC_API_URL;

const headerConfig = {
  credentials: "include" as const,
  headers: { "Content-Type": "application/json", "X-CSRF-Token": "pulseguard-web" },
};

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: string; // 'owner', 'admin', 'member'
  status: string; // 'active', 'invited', 'blocked'
  allProjects?: boolean;
  projectIds?: string[];
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  workspaceName?: string;
  email: string;
  role: string;
  token?: string;
  expiresAt: string;
  status: string;
  allProjects?: boolean;
  projectIds?: string[];
}

export interface Team {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export const createWorkspace = async (name: string): Promise<Workspace> => {
  const res = await fetch(`${url}/api/workspaces`, {
    method: "POST",
    ...headerConfig,
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create workspace");
  }
  return res.json();
};

export const listWorkspaces = async (): Promise<Workspace[]> => {
  const res = await fetch(`${url}/api/workspaces`, {
    ...headerConfig,
  });
  if (!res.ok) {
    throw new Error("Failed to fetch workspaces");
  }
  return res.json();
};

export const inviteMember = async (
  workspaceId: string,
  email: string,
  role: string,
  allProjects = true,
  projectIds: string[] = [],
): Promise<WorkspaceInvitation> => {
  const res = await fetch(`${url}/api/workspaces/${workspaceId}/invite`, {
    method: "POST",
    ...headerConfig,
    body: JSON.stringify({ email, role, allProjects, projectIds }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to invite member");
  }
  return res.json();
};

export const getInvitation = async (token: string): Promise<WorkspaceInvitation & { workspaceName: string }> => {
  const res = await fetch(`${url}/api/invitations/get`, {
    method: "POST",
    ...headerConfig,
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    throw new Error("Invitation not found or expired");
  }
  return res.json();
};

export const acceptInvitation = async (token: string): Promise<void> => {
  const res = await fetch(`${url}/api/invitations/accept`, {
    method: "POST",
    ...headerConfig,
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to accept invitation");
  }
};

export const listWorkspaceMembers = async (workspaceId: string): Promise<WorkspaceMember[]> => {
  const res = await fetch(`${url}/api/workspaces/${workspaceId}/members`, {
    ...headerConfig,
  });
  if (!res.ok) {
    throw new Error("Failed to fetch members");
  }
  return res.json();
};

export const listInvitations = async (workspaceId: string): Promise<WorkspaceInvitation[]> => {
  const res = await fetch(`${url}/api/workspaces/${workspaceId}/invitations`, {
    ...headerConfig,
  });
  if (!res.ok) {
    throw new Error("Failed to fetch invitations");
  }
  return res.json();
};

export const updateMemberRole = async (
  workspaceId: string,
  userId: string,
  role: string
): Promise<void> => {
  const res = await fetch(`${url}/api/workspaces/${workspaceId}/members/${userId}/role`, {
    method: "PUT",
    ...headerConfig,
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update member role");
  }
};

export const updateMemberStatus = async (
  workspaceId: string,
  userId: string,
  status: string
): Promise<void> => {
  const res = await fetch(`${url}/api/workspaces/${workspaceId}/members/${userId}/status`, {
    method: "PUT",
    ...headerConfig,
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update member status");
  }
};

export const removeWorkspaceMember = async (
  workspaceId: string,
  userId: string
): Promise<void> => {
  const res = await fetch(`${url}/api/workspaces/${workspaceId}/members/${userId}`, {
    method: "DELETE",
    ...headerConfig,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to remove member");
  }
};

export const updateWorkspace = async (
  workspaceId: string,
  name: string,
): Promise<Workspace> => {
  const res = await fetch(`${url}/api/workspaces/${workspaceId}`, {
    method: "PUT",
    ...headerConfig,
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update workspace");
  }
  return res.json();
};

export const deleteWorkspace = async (workspaceId: string): Promise<void> => {
  const res = await fetch(`${url}/api/workspaces/${workspaceId}`, {
    method: "DELETE",
    ...headerConfig,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete workspace");
  }
};

export const updateMemberAccess = async (
  workspaceId: string,
  userId: string,
  allProjects: boolean,
  projectIds: string[] = [],
): Promise<void> => {
  const res = await fetch(
    `${url}/api/workspaces/${workspaceId}/members/${userId}/access`,
    {
      method: "PUT",
      ...headerConfig,
      body: JSON.stringify({ allProjects, projectIds }),
    },
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update project access");
  }
};

export const listTeams = async (workspaceId: string): Promise<Team[]> => {
  const res = await fetch(`${url}/api/workspaces/${workspaceId}/teams`, {
    ...headerConfig,
  });
  if (!res.ok) {
    throw new Error("Failed to fetch teams");
  }
  return res.json();
};

export const createTeam = async (workspaceId: string, name: string): Promise<Team> => {
  const res = await fetch(`${url}/api/workspaces/${workspaceId}/teams`, {
    method: "POST",
    ...headerConfig,
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create team");
  }
  return res.json();
};

export const addTeamMember = async (
  workspaceId: string,
  teamId: string,
  userId: string
): Promise<void> => {
  const res = await fetch(`${url}/api/workspaces/${workspaceId}/teams/${teamId}/members/${userId}`, {
    method: "POST",
    ...headerConfig,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to add team member");
  }
};

export const removeTeamMember = async (
  workspaceId: string,
  teamId: string,
  userId: string
): Promise<void> => {
  const res = await fetch(`${url}/api/workspaces/${workspaceId}/teams/${teamId}/members/${userId}`, {
    method: "DELETE",
    ...headerConfig,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to remove team member");
  }
};

export const listTeamMembers = async (
  workspaceId: string,
  teamId: string
): Promise<string[]> => {
  const res = await fetch(`${url}/api/workspaces/${workspaceId}/teams/${teamId}/members`, {
    ...headerConfig,
  });
  if (!res.ok) {
    throw new Error("Failed to fetch team members");
  }
  return res.json();
};
