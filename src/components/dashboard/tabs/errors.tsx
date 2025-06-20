"use client";

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
  AlertCircle,
  Search,
  Users,
  Code,
  Globe,
  Hash,
  Clock,
  Bug,
  ChevronRight,
  Zap,
  Activity,
  Eye,
  Copy,
  ExternalLink,
  Tag,
  Check,
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
import type { Error } from "@/types/error";
import { updateErrorStatus } from "@/lib/api/error-api";
import { Skeleton } from "@/components/ui/skeleton";
import { getSeverityColor } from "@/lib/utils";

interface Filters {
  project_id: string;
  environment: string;
  status: string;
  search: string;
  page: number;
  limit: number;
}

interface ErrorsTabProps {
  total: number;
  errors: Error[] | null;
  filters: Filters;
  handleFilterChange: (key: string, value: string | number) => void;
  onErrorUpdate?: () => void;
}

interface ErrorMetaRowProps {
  label: string;
  value: string | number | null | undefined | React.ReactElement;
  badge?: boolean;
  monospace?: boolean;
  isLoading?: boolean;
}

// Component Stack Sheet Component
function ComponentStackSheet({ componentStack }: { componentStack: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="self-end px-3 py-2 text-xs bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
        >
          <Code className="h-3 w-3 mr-2" />
          View Component Stack
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-[70%] bg-slate-900 border-l border-slate-700 overflow-y-auto">
        <SheetHeader className="px-6">
          <SheetTitle className="text-white">Component Stack</SheetTitle>
        </SheetHeader>
        <div className="p-6 pt-0">
          <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap bg-slate-800/50 p-3 rounded-lg border border-slate-700">
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
      <div className="flex justify-between items-center">
        <span className="text-slate-400">{label}:</span>
        {isLoading ? (
          <Skeleton className="h-6 w-24 bg-slate-700/50" />
        ) : !badge ? (
          <span
            className={`${
              monospace ? "font-mono" : ""
            } text-white text-sm text-right`}
          >
            {value || "—"}
          </span>
        ) : (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {value || "—"}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={isStatusLoading ? () => {} : onClose}>
      <SheetContent className="w-[60%] bg-slate-900 border-l border-slate-700 shadow-2xl overflow-y-auto">
        {selectedError ? (
          <div className="p-6 space-y-6 pt-0">
            {/* Header */}
            <SheetHeader className="border-b border-slate-700 pb-4">
              {isStatusLoading ? (
                <Skeleton className="h-8 w-48 bg-slate-700/50" />
              ) : (
                <SheetTitle className="text-2xl font-bold text-white">
                  {selectedError.id}
                </SheetTitle>
              )}
              <p className="text-slate-400 mt-1">Error Details & Analysis</p>
            </SheetHeader>

            {/* Status and Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  {isStatusLoading ? (
                    <Skeleton className="h-12 w-full bg-slate-700/50" />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 ${
                          selectedError.status === "ACTIVE"
                            ? "bg-red-500/20"
                            : "bg-green-500/20"
                        } rounded-lg`}
                      >
                        {selectedError.status === "ACTIVE" ? (
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        ) : (
                          <Check className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Status</p>
                        <p className="text-white font-semibold capitalize">
                          {selectedError.status}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Hash className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Occurrences</p>
                      <p className="text-white font-semibold">
                        {selectedError.count} occurrence
                        {selectedError.count !== 1 && "s"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Clock className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Last Seen</p>
                      <p className="text-white font-semibold text-xs">
                        {format(
                          new Date(selectedError.lastSeen),
                          "MMM d, yyyy, ha"
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Message */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Bug className="h-5 w-5 text-red-400" />
                    Error Message
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                    onClick={() =>
                      navigator.clipboard.writeText(selectedError.message)
                    }
                    disabled={isStatusLoading}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isStatusLoading ? (
                  <Skeleton className="h-16 w-full bg-slate-700/50 rounded-lg" />
                ) : (
                  <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700">
                    <p className="text-red-300 font-mono text-sm leading-relaxed">
                      {selectedError.message}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stack Trace */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Code className="h-5 w-5 text-purple-400" />
                    Stack Trace
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                    onClick={() =>
                      navigator.clipboard.writeText(selectedError.stackTrace)
                    }
                    disabled={isStatusLoading}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isStatusLoading ? (
                  <Skeleton className="h-32 w-full bg-slate-700/50 rounded-lg" />
                ) : (
                  <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700 overflow-x-auto">
                    <pre className="text-purple-300 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                      {selectedError.stackTrace}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Environment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-400" />
                    Environment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-400" />
                    Session Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-yellow-400" />
                  URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isStatusLoading ? (
                  <Skeleton className="h-12 w-full bg-slate-700/50 rounded-lg" />
                ) : (
                  <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700">
                    <p className="text-yellow-300 font-mono text-sm break-all">
                      {selectedError.url}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {selectedError.tags.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <Tag className="h-5 w-5 text-orange-400" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isStatusLoading ? (
                    <div className="flex flex-wrap gap-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton
                          key={i}
                          className="h-6 w-20 bg-slate-700/50"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedError.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          className={getSeverityColor(tag.value)}
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
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleStatusChange("ACTIVE")}
                disabled={selectedError.status === "ACTIVE" || isStatusLoading}
              >
                {isStatusLoading && selectedError.status !== "ACTIVE" ? (
                  <Skeleton className="h-4 w-20 bg-slate-700/50" />
                ) : (
                  "Mark as Active"
                )}
              </Button>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleStatusChange("RESOLVED")}
                disabled={
                  selectedError.status === "RESOLVED" || isStatusLoading
                }
              >
                {isStatusLoading && selectedError.status !== "RESOLVED" ? (
                  <Skeleton className="h-4 w-20 bg-slate-700/50" />
                ) : (
                  "Ignore Error"
                )}
              </Button>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                disabled={isStatusLoading}
              >
                Create Issue
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <Skeleton className="h-8 w-48 bg-slate-700/50" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-slate-700/50" />
              ))}
            </div>
            <Skeleton className="h-16 w-full bg-slate-700/50 rounded-lg" />
            <Skeleton className="h-32 w-full bg-slate-700/50 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full bg-slate-700/50" />
              <Skeleton className="h-24 w-full bg-slate-700/50" />
            </div>
            <Skeleton className="h-12 w-full bg-slate-700/50 rounded-lg" />
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-9 w-24 bg-slate-700/50" />
              <Skeleton className="h-9 w-24 bg-slate-700/50" />
              <Skeleton className="h-9 w-24 bg-slate-700/50" />
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
  filters,
  handleFilterChange,
  onErrorUpdate,
}: ErrorsTabProps) {
  const [errorType, setErrorType] = useState<string>("");
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [loadingErrorIds, setLoadingErrorIds] = useState<string[]>([]);
  const [selectedError, setSelectedError] = useState<Error | null>(null);
  const [localErrors, setLocalErrors] = useState<Error[] | null>(errors);

  // Sync localErrors with prop changes
  useMemo(() => {
    setLocalErrors(errors);
  }, [errors]);

  const filteredErrors = useMemo(() => {
    return localErrors === null
      ? []
      : localErrors.filter((error) => {
          const matchesSearch =
            filters.search === "" ||
            error.message
              .toLowerCase()
              .includes(filters.search.toLowerCase()) ||
            error.type.toLowerCase().includes(filters.search.toLowerCase()) ||
            error.id.toLowerCase().includes(filters.search.toLowerCase()) ||
            error.source.toLowerCase().includes(filters.search.toLowerCase());

          const matchesStatus =
            filters.status === "" ||
            filters.status === "all" ||
            error.status === filters.status;
          const matchesEnvironment =
            filters.environment === "" ||
            filters.environment === "all" ||
            error.environment === filters.environment;
          const matchesTypes =
            errorType === "" ||
            errorType === "error" ||
            error.type.toLowerCase() ===
              (errorType === "all" ? "" : errorType.toLowerCase());

          return (
            matchesSearch && matchesStatus && matchesEnvironment && matchesTypes
          );
        });
  }, [
    localErrors,
    filters.search,
    filters.status,
    filters.environment,
    errorType,
  ]);

  const handleErrorClick = (error: Error) => {
    setSelectedError(error);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedError(null), 300);
  };

  const handleStatusChange = (errorId: string, newStatus: string) => {
    setLoadingErrorIds((prev) => [...prev, errorId]);
    setLocalErrors(
      (prev) =>
        prev?.map((err) =>
          err.id === errorId ? { ...err, status: newStatus } : err
        ) || null
    );
    setSelectedError((prev) =>
      prev && prev.id === errorId ? { ...prev, status: newStatus } : prev
    );

    setTimeout(() => {
      setLoadingErrorIds((prev) => prev.filter((id) => id !== errorId));
      onErrorUpdate?.();
    }, 500);
  };

  return (
    <div>
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search errors..."
                  className="pl-10 w-full lg:w-64 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-purple-400/50 focus:ring-purple-400/20"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  handleFilterChange("status", value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-32 bg-slate-800/50 border-slate-600/50 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
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
                <SelectTrigger className="w-36 bg-slate-800/50 border-slate-600/50 text-white">
                  <SelectValue placeholder="Environment" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all">All Envs</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                </SelectContent>
              </Select>

              <Select value={errorType} onValueChange={setErrorType}>
                <SelectTrigger className="w-36 bg-slate-800/50 border-slate-600/50 text-white">
                  <SelectValue placeholder="Error Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="error">All Types</SelectItem>
                  <SelectItem value="ReferenceError">
                    Reference Error
                  </SelectItem>
                  <SelectItem value="TypeError">Type Error</SelectItem>
                  <SelectItem value="SyntaxError">Syntax Error</SelectItem>
                  <SelectItem value="NetworkError">Network Error</SelectItem>
                  <SelectItem value="PromiseError">Promise Error</SelectItem>
                  <SelectItem value="CustomError">Custom Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <Activity className="h-4 w-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">
                  {filteredErrors.filter((e) => e.status === "ACTIVE").length}{" "}
                  Active
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Zap className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">
                  {filteredErrors.filter((e) => e.status === "RESOLVED").length}{" "}
                  Resolved
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-600/50">
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-b border-slate-700/50">
              {filteredErrors.map((error) => (
                <TableRow
                  key={error.id}
                  className="border-slate-700/50 hover:bg-slate-800/30 group transition-colors"
                >
                  <TableCell>
                    <div className="font-mono text-sm text-purple-300 font-medium">
                      {error.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1"
                    >
                      <Bug className="h-3 w-3" />
                      {error.type || "unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate text-slate-200 group-hover:text-white transition-colors">
                      {error.message}
                    </div>
                  </TableCell>
                  <TableCell>
                    {loadingErrorIds.includes(error.id) ? (
                      <Skeleton className="h-6 w-16 bg-slate-700/50" />
                    ) : (
                      <Badge
                        variant="outline"
                        className={
                          error.status === "ACTIVE"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-green-500/20 text-green-400 border-green-500/30"
                        }
                      >
                        {error.status === "ACTIVE" ? "Active" : "Resolved"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-300 font-medium">
                    {error.count}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                    >
                      {error.environment}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {format(new Date(error.lastSeen), "MMM d, yyyy, ha")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-slate-700/50 text-slate-300 border-slate-600/50 max-w-[250px]"
                    >
                      <span className="truncate block">{error.source}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white hover:bg-slate-700/50 group-hover:translate-x-1 transition-all duration-200"
                      onClick={() => handleErrorClick(error)}
                      disabled={loadingErrorIds.includes(error.id)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredErrors.length === 0 && (
            <div className="text-center py-32">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">
                No errors match your filters
              </p>
              <p className="text-slate-500 text-sm">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </CardContent>

        {total > 10 && (
          <CardFooter className="flex justify-between items-center text-sm text-slate-400">
            <span>
              Showing {filteredErrors.length} of {total} errors
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page <= 1}
                className="bg-slate-800/30 border-slate-600/50"
                onClick={() =>
                  handleFilterChange("page", Math.max(1, filters.page - 1))
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange("page", filters.page + 1)}
                className="bg-slate-800/30 border-slate-600/50 hover:bg-slate-700/50"
                disabled={filteredErrors.length < filters.limit}
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
