import { ReactNode } from "react";

export type Project = {
  id: string;
  slug: string;
  name: string;
  platform: string;
  createdAt: string;
  errorCount: number;
  description: string;
  memberCount?: number;
};

export interface ProjectCardProps {
  href: string;
  index: number;
  project: Project;
  viewMode?: "grid" | "list";
}

export type ProjectFormProps = {
  onSubmit: (data: {
    name: string;
    description: string;
    platform: string;
  }) => void;
  onCancel: () => void;
  isLoading: boolean;
};

// Create Project Dialog Component
export interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  status: "creating" | "complete";
}

export interface DeleteProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: { slug: string; name: string };
}

export interface CustomAlertDialogProps {
  trigger: ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
}
