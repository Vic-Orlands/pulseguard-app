import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Activity,
  AlertCircle,
  Loader2,
  BarChart2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { format, subHours, subDays } from "date-fns";
import { fetchMetrics } from "@/lib/api/otlp-api";
import type { Project, Metric, TimeProp } from "@/types/dashboard";
import CustomErrorMessage from "../shared/error-message";

const MetricsTab = ({ project }: { project: Project }) => {
  const itemsPerPage = 20;

  const [error, setError] = useState<string>("");
  const [metrics, setMetrics] = useState([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<TimeProp>("24h");

  // Calculate start time
  const start = useMemo(() => {
    switch (timeRange) {
      case "1h":
        return subHours(new Date(), 1).toISOString();
      case "6h":
        return subHours(new Date(), 6).toISOString();
      case "24h":
        return subHours(new Date(), 24).toISOString();
      case "7d":
        return subDays(new Date(), 7).toISOString();
      default:
        return subHours(new Date(), 24).toISOString();
    }
  }, [timeRange]);
  const end = new Date().toISOString();

  // Fetch metrics with SWR
  // const {
  //   data: metrics = [],
  //   error,
  //   isLoading,
  // } = useSWR([project.id, { start, end }], () => fetchMetrics(project.id), {
  //   revalidateOnFocus: false,
  //   dedupingInterval: 3000,
  // });

  // Filter and search metrics
  const filteredMetrics = useMemo(() => {
    return metrics.filter((metric: Metric) => {
      const matchesSearch =
        metric.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        metric.ID?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        metric.Value?.toLowerCase().includes(searchTerm.toLowerCase());

      const metricTime = new Date(metric.Timestamp).getTime();
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();

      return matchesSearch && metricTime >= startTime && metricTime <= endTime;
    });
  }, [metrics, searchTerm, start, end]);

  // Paginated metrics
  const paginatedMetrics = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMetrics.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMetrics, currentPage]);

  // Reset current page when filtered metrics change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredMetrics]);

  const totalPages = Math.ceil(filteredMetrics.length / itemsPerPage);

  // Calculate summary stats for cards
  const summaryStats = useMemo(() => {
    const stats = {
      httpRequestsTotal: 0,
      httpErrorsTotal: 0,
      pageViewsTotal: 0,
      activeSessions: 0,
      userActivityTotal: 0,
      appErrorsTotal: 0,
      httpRequestDurationMs: 0,
    };

    metrics.forEach((metric: Metric) => {
      const value = parseFloat(metric.Value) || 0;
      switch (metric.Name) {
        case "http_requests_total":
          stats.httpRequestsTotal += value;
          break;
        case "http_errors_total":
          stats.httpErrorsTotal += value;
          break;
        case "page_views_total":
          stats.pageViewsTotal += value;
          break;
        case "user_sessions_active":
          stats.activeSessions = value; // Use latest value for gauge
          break;
        case "user_activity_total":
          stats.userActivityTotal += value;
          break;
        case "app_errors_total":
          stats.appErrorsTotal += value;
          break;
        case "http_request_duration_ms":
          stats.httpRequestDurationMs += value; // Sum for simplicity, consider averaging
          break;
      }
    });

    return stats;
  }, [metrics]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-slate-400">Loading metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && <CustomErrorMessage error={error} />}

      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <section>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search metrics, IDs, values..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600 text-gray-300 placeholder-gray-500"
                  />
                </div>

                <Select
                  value={timeRange}
                  onValueChange={(value: TimeProp) => setTimeRange(value)}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="1h">Last 1 Hour</SelectItem>
                    <SelectItem value="6h">Last 6 Hours</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/20">
              <CardContent className="flex items-center h-full justify-between p-4">
                <div>
                  <p className="text-blue-300 text-sm font-medium">
                    HTTP Requests
                  </p>
                  <p className="text-2xl font-bold text-blue-400">
                    {summaryStats.httpRequestsTotal}
                  </p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-500/20">
              <CardContent className="flex items-center h-full justify-between p-4">
                <div>
                  <p className="text-red-300 text-sm font-medium">
                    HTTP Errors
                  </p>
                  <p className="text-2xl font-bold text-red-400">
                    {summaryStats.httpErrorsTotal}
                  </p>
                </div>
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/20">
              <CardContent className="flex items-center h-full justify-between p-4">
                <div>
                  <p className="text-green-300 text-sm font-medium">
                    Page Views
                  </p>
                  <p className="text-2xl font-bold text-green-400">
                    {summaryStats.pageViewsTotal}
                  </p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <BarChart2 className="w-5 h-5 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-yellow-500/20">
              <CardContent className="flex items-center h-full justify-between p-4">
                <div>
                  <p className="text-yellow-300 text-sm font-medium">
                    Active Sessions
                  </p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {summaryStats.activeSessions}
                  </p>
                </div>
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-600/50">
                <TableHead>Metric ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-b border-slate-700/50">
              {filteredMetrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-32">
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">
                      No metrics match your filters
                    </p>
                    <p className="text-slate-500 text-sm">
                      Try adjusting your search criteria
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMetrics.map((metric: Metric) => (
                  <TableRow
                    key={metric.ID}
                    className="border-slate-700/30 hover:bg-slate-800/30 group transition-colors"
                  >
                    <TableCell className="text-gray-300 font-mono text-xs">
                      {metric.ID || "none"}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {format(new Date(metric.Timestamp), "PP, h:mmaaa")}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {metric.Name || "unknown"}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {metric.Value}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!error && metrics.length > itemsPerPage && (
            <CardFooter className="flex items-center justify-between mt-4 pl-0">
              <p className="text-sm text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredMetrics.length)}{" "}
                of {filteredMetrics.length} metrics
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="border-slate-600 text-gray-300"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="border-slate-600 text-gray-300"
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default MetricsTab;
