export interface Error {
  id: string;
  projectId: string;
  message: string;
  stackTrace: string;
  fingerprint: string;
  occurredAt: string;
  lastSeen: string;
  environment: string;
  count: number;
  source: string;
  type: string;
  url: string;
  componentStack: string;
  browserInfo: string;
  userId: string;
  sessionId: string;
  status: string;
  occurrences: ErrorOccurrence[];
  tags: ErrorTag[];
}

export interface ErrorOccurrence {
  id: string;
  errorId: string;
  userId: string;
  sessionId: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface ErrorTag {
  id: string;
  errorId: string;
  key: string;
  value: string;
}

export interface ErrorListResponse {
  errors: Error[];
  total: number;
}

export interface ErrorFilterProps {
  project_id: string;
  page?: number;
  limit?: number;
}

export interface ErrorsTabProps {
  total: number;
  errors: Error[] | null;
  onErrorUpdate?: () => void;
  config: {
    project_id: string;
    page: number;
    limit: number;
  };
  handleConfig: (key: string, value: number) => void;
}

export interface ErrorMetaRowProps {
  label: string;
  value: string | number | null | undefined | React.ReactElement;
  badge?: boolean;
  monospace?: boolean;
  isLoading?: boolean;
}
