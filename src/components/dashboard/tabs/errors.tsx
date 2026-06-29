import { HugeiconsIcon } from "@hugeicons/react";
import { Activity01Icon, AlertCircleIcon, ArrowRight01Icon, Bug01Icon, Clock01Icon, CodeIcon, Copy01Icon, GlobeIcon, LinkSquare01Icon, Search01Icon, Tag01Icon, Tick01Icon, UserGroupIcon, ViewIcon } from "@hugeicons/core-free-icons";
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
} from "lucide-react";
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
import { getSeverityColor } from "@/lib/utils";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import React, { useEffect } from "react";

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
      <SheetContent className="sm:max-w-2xl bg-card border-l border-border text-foreground overflow-y-auto">
        <SheetHeader className="p-0 border-b border-border/50 pb-4 mb-4">
          <SheetTitle className="text-sm font-semibold text-foreground">Component Stack</SheetTitle>
        </SheetHeader>
        <div className="pt-0">
          <pre className="text-xs font-mono text-foreground whitespace-pre-wrap bg-muted p-3 rounded-lg border border-border">
            {componentStack}
          </pre>
        </div>
      </SheetContent>
    </Sheet>
  );
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
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">{label}:</span>
        {isLoading ? (
          <Skeleton className="h-5 w-24 bg-muted" />
        ) : !badge ? (
          <span
            className={`${
              monospace ? "font-mono text-[10px]" : ""
            } text-foreground text-right`}
          >
            {value || "—"}
          </span>
        ) : (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] shadow-none py-0.5">
            {value || "—"}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={isStatusLoading ? () => {} : onClose}>
      <SheetContent className="sm:max-w-2xl bg-card border-l border-border text-foreground shadow-none overflow-y-auto">
        {selectedError ? (
          <div className="space-y-6 text-foreground">
            {/* Header */}
            <SheetHeader className="p-0 border-b border-border/50 pb-4 mb-4">
              {isStatusLoading ? (
                <Skeleton className="h-6 w-48 bg-muted" />
              ) : (
                <SheetTitle className="text-sm font-semibold text-foreground">
                  Error Details & Analysis
                </SheetTitle>
              )}
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Error ID: {selectedError.id}</p>
            </SheetHeader>

            {/* Status and Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-card border border-border shadow-none rounded-lg">
                <CardContent className="p-4 flex items-center gap-3">
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
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Status</p>
                        <p className="text-xs font-bold text-foreground capitalize mt-0.5">
                          {selectedError.status}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border border-border shadow-none rounded-lg">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20 text-blue-500">
                    <HugeiconsIcon icon={Bug01Icon} className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Occurrences</p>
                    <p className="text-xs font-bold text-foreground mt-0.5">
                      {selectedError.count} occurrence
                      {selectedError.count !== 1 && "s"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border shadow-none rounded-lg">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded border border-amber-500/20 text-amber-500">
                    <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Last Seen</p>
                    <p className="text-xs font-bold text-foreground mt-0.5">
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
              <CardContent className="p-4">
                {isStatusLoading ? (
                  <Skeleton className="h-16 w-full bg-muted rounded-lg" />
                ) : (
                  <div className="bg-muted rounded-lg p-4 border border-border">
                    <p className="text-red-600 dark:text-red-400 font-mono text-xs leading-relaxed break-all">
                      {selectedError.message}
                    </p>
                  </div>
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
              <CardContent className="p-4">
                {isStatusLoading ? (
                  <Skeleton className="h-32 w-full bg-muted rounded-lg" />
                ) : (
                  <div className="bg-muted rounded-lg p-4 border border-border overflow-x-auto">
                    <pre className="text-foreground font-mono text-[10px] leading-relaxed whitespace-pre-wrap">
                      {selectedError.stackTrace}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Environment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-card border border-border shadow-none rounded-lg">
                <CardHeader className="py-3 px-4 border-b border-border/50">
                  <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <HugeiconsIcon icon={GlobeIcon} className="h-4 w-4 text-primary" />
                    Environment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <ErrorMetaRow
                    label="Environment"
                    value={selectedError.environment}
                    badge
                    isLoading={isStatusLoading}
                  />
                  <ErrorMetaRow
                    label="Source"
                    value={selectedError.source}
                    isLoading={isStatusLoading}
                  />
                  <ErrorMetaRow
                    label="Browser"
                    value={selectedError.browserInfo}
                    isLoading={isStatusLoading}
                  />
                </CardContent>
              </Card>

              <Card className="bg-card border border-border shadow-none rounded-lg">
                <CardHeader className="py-3 px-4 border-b border-border/50">
                  <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <HugeiconsIcon icon={UserGroupIcon} className="h-4 w-4 text-primary" />
                    Session Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <ErrorMetaRow
                    label="User ID"
                    value={selectedError.userId}
                    monospace
                    isLoading={isStatusLoading}
                  />
                  <ErrorMetaRow
                    label="Session ID"
                    value={selectedError.sessionId?.split(" at ")[0]}
                    monospace
                    isLoading={isStatusLoading}
                  />
                  {selectedError.componentStack && (
                    <ErrorMetaRow
                      label="Component Stack"
                      value={
                        <ComponentStackSheet
                          componentStack={selectedError.componentStack}
                        />
                      }
                      isLoading={isStatusLoading}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* URL */}
            <Card className="bg-card border border-border shadow-none rounded-lg">
              <CardHeader className="py-3 px-4 border-b border-border/50">
                <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <HugeiconsIcon icon={LinkSquare01Icon} className="h-4 w-4 text-primary" />
                  URL
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {isStatusLoading ? (
                  <Skeleton className="h-12 w-full bg-muted rounded-lg" />
                ) : (
                  <div className="bg-muted rounded-lg p-3 border border-border">
                    <p className="text-foreground font-mono text-xs break-all">
                      {selectedError.url}
                    </p>
                  </div>
                )}
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

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border/50">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs h-8 shadow-none rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleStatusChange("ACTIVE")}
                disabled={selectedError.status === "ACTIVE" || isStatusLoading}
              >
                {isStatusLoading && selectedError.status !== "ACTIVE" ? (
                  <Skeleton className="h-4 w-20 bg-muted" />
                ) : (
                  "Mark as Active"
                )}
              </Button>
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-muted text-xs h-8 shadow-none rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleStatusChange("RESOLVED")}
                disabled={
                  selectedError.status === "RESOLVED" || isStatusLoading
                }
              >
                {isStatusLoading && selectedError.status !== "RESOLVED" ? (
                  <Skeleton className="h-4 w-20 bg-muted" />
                ) : (
                  "Ignore Error"
                )}
              </Button>
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-muted text-xs h-8 shadow-none rounded-md cursor-pointer"
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

  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    setMounted(true);
  }, []);
  const isDark = mounted && resolvedTheme === "dark";

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

        <CardContent className="p-0 border-t border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground h-9 px-4">ID</TableHead>
                <TableHead className="text-xs text-muted-foreground h-9 px-4">Type</TableHead>
                <TableHead className="text-xs text-muted-foreground h-9 px-4">Message</TableHead>
                <TableHead className="text-xs text-muted-foreground h-9 px-4">Status</TableHead>
                <TableHead className="text-xs text-muted-foreground h-9 px-4">Count</TableHead>
                <TableHead className="text-xs text-muted-foreground h-9 px-4">Environment</TableHead>
                <TableHead className="text-xs text-muted-foreground h-9 px-4">Last Seen</TableHead>
                <TableHead className="text-xs text-muted-foreground h-9 px-4">Source</TableHead>
                <TableHead className="text-xs text-muted-foreground h-9 px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredErrors.map((error) => (
                <TableRow
                  key={error.id}
                  className="border-border hover:bg-muted/50 transition-colors"
                >
                  {loadingErrorIds.includes(error.id) ? (
                    <TableCell colSpan={9}>
                      <Skeleton className="h-6 w-full bg-muted" />
                    </TableCell>
                  ) : (
                    <>
                      <TableCell className="font-mono text-[10px] text-foreground font-medium py-2 px-4">
                        {error.id}
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-mono shadow-none border-none py-0.5 flex items-center gap-1"
                        >
                          <HugeiconsIcon icon={Bug01Icon} className="h-3 w-3" />
                          {error.type || "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs py-2 px-4">
                        <div className="truncate text-foreground text-xs">
                          {error.message}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <Badge
                          variant="outline"
                          className={
                            error.status === "ACTIVE"
                              ? "bg-red-500/10 text-red-600 border-red-500/20 text-[10px] shadow-none border-none py-0.5"
                              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] shadow-none border-none py-0.5"
                          }
                        >
                          {error.status === "ACTIVE" ? "Active" : "Resolved"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground font-medium text-xs py-2 px-4">
                        {error.count}
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <Badge
                          variant="outline"
                          className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] shadow-none border-none py-0.5"
                        >
                          {error.environment}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs py-2 px-4 whitespace-nowrap">
                        {format(new Date(error.lastSeen), "MMM d, yyyy, ha")}
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <Badge
                          variant="outline"
                          className="bg-muted text-muted-foreground border-border text-[10px] shadow-none py-0.5 max-w-[200px] truncate"
                        >
                          <span className="truncate block">{error.source}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div className="flex items-center justify-end">
                          <Button
                            variant="ghost"
                            className="text-primary hover:bg-muted hover:text-primary/85 text-xs h-8 shadow-none py-1 px-2.5 cursor-pointer flex items-center gap-1"
                            onClick={() => handleErrorClick(error)}
                            disabled={loadingErrorIds.includes(error.id)}
                          >
                            <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" />
                            <span>View</span>
                            <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
                          </Button>
                        </div>
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
