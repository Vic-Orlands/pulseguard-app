import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Activity01Icon, AlertCircleIcon, Bug01Icon, Clock01Icon, CodeIcon, Copy01Icon, GlobeIcon, Search01Icon, Tag01Icon, Tick01Icon } from "@/components/phosphor-icons";
import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import {
  Zap
} from "@/components/phosphor-icons";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { updateErrorStatus } from "@/lib/api/error-api";
import { Skeleton } from "@/components/ui/skeleton";
import { displayValue, formatTableTime, tagValue } from "@/lib/utils";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/dashboard/shared/page-skeleton";

import type { Error, ErrorMetaRowProps, ErrorsTabProps } from "@/types/error";

// Component Stack Sheet Component
function ComponentStackSheet({ componentStack }: { componentStack: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="self-end text-xs border-border text-foreground hover:bg-muted shadow-none cursor-pointer"
        >
          <HugeiconsIcon icon={CodeIcon} className="h-3 w-3 mr-2" />
          View Component Stack
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto p-6">
        <SheetHeader className="p-0 border-b border-border/50 pb-4 mb-4">
          <SheetTitle className="text-sm font-semibold text-foreground">Component Stack</SheetTitle>
        </SheetHeader>
        <div className="pt-0">
          <pre className="pg-code text-xs font-mono text-zinc-200 whitespace-pre-wrap p-3 rounded-lg">
            {componentStack}
          </pre>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function buildCommitUrl(repositoryUrl: string, commitSha: string) {
  if (!/^[a-f0-9]{7,64}$/i.test(commitSha)) return "";
  try {
    const parsed = new URL(repositoryUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";
    return `${parsed.toString().replace(/\/$/, "")}/commit/${encodeURIComponent(commitSha)}`;
  } catch {
    return "";
  }
}

// Error Details Sheet Component
export function ErrorDetailsSheet({
  isOpen,
  onClose,
  selectedError,
  onStatusChange,
}: {
  selectedError: Error | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (errorId: string, newStatus: string) => void;
}) {
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const latestMetadata = selectedError?.occurrences?.[0]?.metadata;
  const suspectCommit =
    typeof latestMetadata?.commitSha === "string"
      ? latestMetadata.commitSha
      : "";
  const repositoryUrl =
    typeof latestMetadata?.repositoryUrl === "string"
      ? latestMetadata.repositoryUrl.replace(/\/$/, "")
      : "";
  const commitUrl = buildCommitUrl(repositoryUrl, suspectCommit);

  const handleStatusChange = async (status: string) => {
    if (!selectedError) return;

    setIsStatusLoading(true);
    const originalStatus = selectedError.status;
    onStatusChange(selectedError.id, status);

    try {
      await updateErrorStatus(selectedError.id, status);
      setTimeout(() => {
        setIsStatusLoading(false);
      }, 300);
    } catch (err) {
      console.error("Error setting status:", err);
      onStatusChange(selectedError.id, originalStatus);
      setIsStatusLoading(false);
    }
  };

  function ErrorMetaRow({
    label,
    value,
    badge = false,
    monospace = false,
    isLoading = false,
  }: ErrorMetaRowProps) {
    return (
      <div className="min-w-0 space-y-0.5">
        <p className="text-[10px] font-medium text-pg-subtle">{label}</p>
        {isLoading ? (
          <Skeleton className="h-4 w-24 bg-muted" />
        ) : badge ? (
          <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 py-0.5 text-[10px] text-blue-600 shadow-none">
            {value || "—"}
          </Badge>
        ) : (
          <div
            className={`break-all text-[11px] leading-relaxed text-pg-text ${
              monospace ? "font-mono" : ""
            }`}
          >
            {value || "—"}
          </div>
        )}
      </div>
    );
  }

  const email = selectedError
    ? tagValue(selectedError.tags, ["email", "user.email", "user_email"])
    : "";
  const traceId = selectedError
    ? tagValue(selectedError.tags, ["traceid", "trace_id", "trace.id"])
    : "";
  const spanId = selectedError
    ? tagValue(selectedError.tags, ["spanid", "span_id", "span.id"])
    : "";

  return (
    <Sheet open={isOpen} onOpenChange={isStatusLoading ? () => {} : onClose}>
      <SheetContent className="gap-0 overflow-hidden p-0">
        {selectedError ? (
          <div className="flex h-full min-h-0 flex-col text-foreground">
            <SheetHeader className="shrink-0 border-b border-border/50 px-5 py-4 pr-12">
              {isStatusLoading ? (
                <Skeleton className="h-6 w-48 bg-muted" />
              ) : (
                <SheetTitle className="text-sm font-semibold text-foreground">
                  {selectedError.type || "Error"}
                </SheetTitle>
              )}
              <p className="truncate font-mono text-[10px] text-pg-muted">
                {selectedError.id}
              </p>
            </SheetHeader>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <div className="grid grid-cols-3 gap-2">
              <Card className="rounded-lg border border-border bg-card shadow-none">
                <CardContent className="flex items-center gap-2.5 p-2.5">
                  {isStatusLoading ? (
                    <Skeleton className="h-8 w-full bg-muted" />
                  ) : (
                    <>
                      <div
                        className={`p-2 ${
                          selectedError.status === "ACTIVE"
                            ? "bg-red-500/10 border border-red-500/20 text-red-500"
                            : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
                        } rounded`}
                      >
                        {selectedError.status === "ACTIVE" ? (
                          <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
                        ) : (
                          <HugeiconsIcon icon={Tick01Icon} className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] tracking-wide font-semibold text-muted-foreground">Status</p>
                        <p className="text-xs font-semibold text-foreground capitalize mt-0.5">
                          {selectedError.status}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-lg border border-border bg-card shadow-none">
                <CardContent className="flex items-center gap-2.5 p-2.5">
                  <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20 text-blue-500">
                    <HugeiconsIcon icon={Bug01Icon} className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-wide font-semibold text-muted-foreground">Occurrences</p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {selectedError.count} occurrence
                      {selectedError.count !== 1 && "s"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-lg border border-border bg-card shadow-none">
                <CardContent className="flex items-center gap-2.5 p-2.5">
                  <div className="p-2 bg-amber-500/10 rounded border border-amber-500/20 text-amber-500">
                    <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-wide font-semibold text-muted-foreground">Last Seen</p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {format(new Date(selectedError.lastSeen), "MMM d, yyyy, ha")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Message */}
            <Card className="bg-card border border-border shadow-none rounded-lg">
              <CardHeader className="py-3 px-4 border-b border-border/50 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <HugeiconsIcon icon={Bug01Icon} className="h-4 w-4 text-red-500" />
                  Error Message
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-muted w-8 h-8 rounded-md p-0 shadow-none flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedError.message);
                    toast.success("message copied successfully!");
                  }}
                  disabled={isStatusLoading}
                >
                  <HugeiconsIcon icon={Copy01Icon} className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="p-3">
                {isStatusLoading ? (
                  <Skeleton className="h-16 w-full rounded-lg bg-muted" />
                ) : (
                  <p className="break-all font-mono text-xs leading-relaxed text-red-600 dark:text-red-400">
                    {selectedError.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Stack Trace */}
            <Card className="bg-card border border-border shadow-none rounded-lg">
              <CardHeader className="py-3 px-4 border-b border-border/50 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <HugeiconsIcon icon={CodeIcon} className="h-4 w-4 text-primary" />
                  Stack Trace
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-muted w-8 h-8 rounded-md p-0 shadow-none flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedError.stackTrace);
                    toast.success("stackTrace copied successfully!");
                  }}
                  disabled={isStatusLoading}
                >
                  <HugeiconsIcon icon={Copy01Icon} className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="p-3">
                {isStatusLoading ? (
                  <Skeleton className="h-32 w-full rounded-lg bg-muted" />
                ) : (
                  <div className="pg-code max-h-48 overflow-auto rounded-lg p-3">
                    <pre className="whitespace-pre-wrap break-all font-mono text-[10px] leading-relaxed text-zinc-200">
                      {selectedError.stackTrace}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-lg border border-border bg-card shadow-none">
              <CardHeader className="flex flex-row items-center gap-1.5 border-b border-border/50 px-3 py-2">
                <HugeiconsIcon icon={GlobeIcon} className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs font-semibold">Context</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
                <ErrorMetaRow
                  label="Environment"
                  value={selectedError.environment}
                  badge
                  isLoading={isStatusLoading}
                />
                <ErrorMetaRow
                  label="Release"
                  value={selectedError.release}
                  monospace
                  isLoading={isStatusLoading}
                />
                <ErrorMetaRow
                  label="Suspect commit"
                  value={
                    commitUrl ? (
                      <a
                        href={commitUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-primary hover:underline"
                      >
                        {suspectCommit.slice(0, 12)}
                      </a>
                    ) : (
                      suspectCommit
                    )
                  }
                  monospace
                  isLoading={isStatusLoading}
                />
                <ErrorMetaRow
                  label="Browser"
                  value={selectedError.browserInfo}
                  isLoading={isStatusLoading}
                />
                <ErrorMetaRow
                  label="Source"
                  value={selectedError.source}
                  monospace
                  isLoading={isStatusLoading}
                />
                <ErrorMetaRow
                  label="URL"
                  value={selectedError.url}
                  monospace
                  isLoading={isStatusLoading}
                />
                <ErrorMetaRow
                  label="User ID"
                  value={selectedError.userId}
                  monospace
                  isLoading={isStatusLoading}
                />
                <ErrorMetaRow
                  label="User email"
                  value={email}
                  isLoading={isStatusLoading}
                />
                <ErrorMetaRow
                  label="Session ID"
                  value={selectedError.sessionId?.split(" at ")[0]}
                  monospace
                  isLoading={isStatusLoading}
                />
                <ErrorMetaRow
                  label="Time"
                  value={formatTableTime(selectedError.lastSeen)}
                  isLoading={isStatusLoading}
                />
                <ErrorMetaRow
                  label="Trace ID"
                  value={traceId}
                  monospace
                  isLoading={isStatusLoading}
                />
                <ErrorMetaRow
                  label="Span ID"
                  value={spanId}
                  monospace
                  isLoading={isStatusLoading}
                />
                {selectedError.componentStack ? (
                  <ErrorMetaRow
                    label="Component stack"
                    value={
                      <ComponentStackSheet
                        componentStack={selectedError.componentStack}
                      />
                    }
                    isLoading={isStatusLoading}
                  />
                ) : null}
              </CardContent>
            </Card>

            {/* Tags */}
            {selectedError.tags.length > 0 && (
              <Card className="bg-card border border-border shadow-none rounded-lg">
                <CardHeader className="py-3 px-4 border-b border-border/50">
                  <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <HugeiconsIcon icon={Tag01Icon} className="h-4 w-4 text-primary" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {isStatusLoading ? (
                    <div className="flex flex-wrap gap-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton
                          key={i}
                          className="h-5 w-20 bg-muted"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedError.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="bg-muted text-muted-foreground border-border text-[10px] shadow-none py-0.5"
                        >
                          {tag.key}: {tag.value}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            </div>

            <div className="flex shrink-0 gap-2 border-t border-border/50 px-5 py-3">
              <Button
                className="h-8 rounded-md text-xs shadow-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => handleStatusChange("ACTIVE")}
                disabled={selectedError.status === "ACTIVE" || isStatusLoading}
              >
                Mark as Active
              </Button>
              <Button
                variant="outline"
                className="h-8 rounded-md text-xs shadow-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => handleStatusChange("RESOLVED")}
                disabled={
                  selectedError.status === "RESOLVED" || isStatusLoading
                }
              >
                Ignore Error
              </Button>
              <Button
                variant="outline"
                className="h-8 rounded-md text-xs shadow-none cursor-pointer"
                disabled={isStatusLoading}
              >
                Create Issue
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Skeleton className="h-6 w-48 bg-muted" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-muted" />
              ))}
            </div>
            <Skeleton className="h-16 w-full bg-muted rounded-lg" />
            <Skeleton className="h-32 w-full bg-muted rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full bg-muted" />
              <Skeleton className="h-24 w-full bg-muted" />
            </div>
            <Skeleton className="h-12 w-full bg-muted rounded-lg" />
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-8 w-24 bg-muted" />
              <Skeleton className="h-8 w-24 bg-muted" />
              <Skeleton className="h-8 w-24 bg-muted" />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function ErrorsTab({
  total,
  errors,
  loading = false,
  config,
  handleConfig,
  onErrorUpdate,
}: ErrorsTabProps) {
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [loadingErrorIds, setLoadingErrorIds] = useState<string[]>([]);
  const [selectedError, setSelectedError] = useState<Error | null>(null);
  const [localErrors, setLocalErrors] = useState<Error[] | null>(errors);
  const [filters, setFilters] = useState({
    status: "" as string,
    errorType: "" as string,
    environment: "" as string,
    inputSearch: "" as string,
    page: 1 as number,
    limit: 20 as number,
  });

  useMemo(() => {
    setLocalErrors(errors);
  }, [errors]);

  const filteredErrors = useMemo(() => {
    return localErrors === null
      ? []
      : localErrors.filter((error) => {
          const matchesSearch =
            error.message
              .toLowerCase()
              .includes(filters.inputSearch.toLowerCase()) ||
            error.type
              .toLowerCase()
              .includes(filters.inputSearch.toLowerCase()) ||
            error.id
              .toLowerCase()
              .includes(filters.inputSearch.toLowerCase()) ||
            error.source
              .toLowerCase()
              .includes(filters.inputSearch.toLowerCase());

          const matchesStatus =
            filters.status === "" ||
            filters.status === "all" ||
            error.status === filters.status;
          const matchesEnvironment =
            filters.environment === "" ||
            filters.environment === "all" ||
            error.environment === filters.environment;
          const matchesTypes =
            filters.errorType === "" ||
            filters.errorType === "error" ||
            error.type.toLowerCase() ===
              (filters.errorType === "all"
                ? ""
                : filters.errorType.toLowerCase());

          return (
            matchesSearch && matchesStatus && matchesEnvironment && matchesTypes
          );
        });
  }, [
    localErrors,
    filters.status,
    filters.errorType,
    filters.inputSearch,
    filters.environment,
  ]);

  const handleErrorClick = (error: Error) => {
    setSelectedError(error);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedError(null), 300);
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // this func resolves status and vice versa
  const handleStatusChange = (errorId: string, newStatus: string) => {
    setLoadingErrorIds((prev) => [...prev, errorId]);
    setSelectedError((prev) =>
      prev && prev.id === errorId ? { ...prev, status: newStatus } : prev
    );

    setLocalErrors(
      (prev) =>
        prev?.map((err) =>
          err.id === errorId ? { ...err, status: newStatus } : err
        ) || null
    );

    setIsSheetOpen(false);

    setTimeout(() => {
      onErrorUpdate?.();
      setLoadingErrorIds([]);
    }, 500);
  };

  if (loading) {
    return <PageSkeleton variant="table" />;
  }

  return (
    <div>
      <Card className="bg-card border border-border shadow-none rounded-lg">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2.5">
              <div className="relative">
                <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search errors..."
                  className="pl-9 w-full lg:w-64 bg-card border-border text-foreground text-xs h-8 focus:ring-1 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground shadow-none"
                  value={filters.inputSearch}
                  onChange={(e) =>
                    handleFilterChange("inputSearch", e.target.value)
                  }
                />
              </div>

              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  handleFilterChange("status", value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-32 bg-card border-border text-foreground text-xs h-8 shadow-none">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="all" className="text-xs">All Status</SelectItem>
                  <SelectItem value="ACTIVE" className="text-xs">Active</SelectItem>
                  <SelectItem value="RESOLVED" className="text-xs">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.environment || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "environment",
                    value === "all" ? "" : value
                  )
                }
              >
                <SelectTrigger className="w-36 bg-card border-border text-foreground text-xs h-8 shadow-none">
                  <SelectValue placeholder="Environment" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="all" className="text-xs">All Envs</SelectItem>
                  <SelectItem value="production" className="text-xs">Production</SelectItem>
                  <SelectItem value="staging" className="text-xs">Staging</SelectItem>
                  <SelectItem value="development" className="text-xs">Development</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.errorType}
                onValueChange={(value) =>
                  handleFilterChange("errorType", value)
                }
              >
                <SelectTrigger className="w-36 bg-card border-border text-foreground text-xs h-8 shadow-none">
                  <SelectValue placeholder="Error Type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="error" className="text-xs">All Types</SelectItem>
                  <SelectItem value="ReferenceError" className="text-xs">
                    Reference Error
                  </SelectItem>
                  <SelectItem value="TypeError" className="text-xs">Type Error</SelectItem>
                  <SelectItem value="SyntaxError" className="text-xs">Syntax Error</SelectItem>
                  <SelectItem value="NetworkError" className="text-xs">Network Error</SelectItem>
                  <SelectItem value="PromiseError" className="text-xs">Promise Error</SelectItem>
                  <SelectItem value="CustomError" className="text-xs">Custom Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-600 text-xs font-semibold">
                <HugeiconsIcon icon={Activity01Icon} className="h-3.5 w-3.5" />
                <span>
                  {filteredErrors.filter((e) => e.status === "ACTIVE").length}{" "}
                  Active
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-600 text-xs font-semibold">
                <Zap className="h-3.5 w-3.5" />
                <span>
                  {filteredErrors.filter((e) => e.status === "RESOLVED").length}{" "}
                  Resolved
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto border-t border-border/50 p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Error</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredErrors.map((error) => (
                <TableRow
                  key={error.id}
                  className="cursor-pointer"
                  onClick={() => handleErrorClick(error)}
                >
                  {loadingErrorIds.includes(error.id) ? (
                    <TableCell colSpan={8}>
                      <Skeleton className="h-6 w-full bg-muted" />
                    </TableCell>
                  ) : (
                    <>
                      <TableCell className="max-w-[240px] overflow-hidden px-4 py-2">
                        <p
                          className="truncate text-xs font-medium"
                          title={error.message}
                        >
                          {error.message}
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <Badge
                          variant="outline"
                          className="border-none bg-amber-500/10 py-0.5 text-[10px] text-amber-600 shadow-none"
                        >
                          {error.type || "Error"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[180px] px-4 py-2">
                        <span className="block truncate font-mono text-[11px] text-pg-muted">
                          {displayValue(error.source || error.url)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <Badge
                          variant="outline"
                          className={
                            error.status === "ACTIVE"
                              ? "border-none bg-red-500/10 py-0.5 text-[10px] text-red-600 shadow-none"
                              : "border-none bg-emerald-500/10 py-0.5 text-[10px] text-emerald-600 shadow-none"
                          }
                        >
                          {error.status === "ACTIVE" ? "Active" : "Resolved"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-xs font-medium">
                        {error.count}×
                      </TableCell>
                      <TableCell className="px-4 py-2 font-mono text-[11px]">
                        {displayValue(error.userId)}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-[11px]">
                        {displayValue(
                          tagValue(error.tags, ["email", "user.email", "user_email"]),
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-2 text-[11px] text-muted-foreground">
                        {formatTableTime(error.lastSeen)}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredErrors.length === 0 && (
            <div className="text-center py-16">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground text-xs font-semibold">
                No errors match your filters
              </p>
              <p className="text-muted-foreground/60 text-[10px] mt-0.5">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </CardContent>

        {total > 10 && (
          <CardFooter className="flex justify-between items-center p-4 border-t border-border bg-card rounded-b-lg text-xs text-muted-foreground">
            <span>
              Showing {filteredErrors.length} of {total} errors
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={config.page <= 1}
                className="border-border text-foreground hover:bg-muted text-xs h-8 shadow-none cursor-pointer"
                onClick={() =>
                  handleConfig("page", Math.max(1, config.page - 1))
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConfig("page", config.page + 1)}
                className="border-border text-foreground hover:bg-muted text-xs h-8 shadow-none cursor-pointer"
                disabled={filteredErrors.length < config.limit}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Error Details Sheet */}
      <ErrorDetailsSheet
        selectedError={selectedError}
        isOpen={isSheetOpen}
        onClose={closeSheet}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
