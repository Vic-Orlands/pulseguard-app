import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { Trace } from "@/types/dashboard";
import { Input } from "@/components/ui/input";
import TestErrorsPage from "@/app/test-errors/page";

interface TracesTabProps {
  traces: Trace[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function TracesTab({
  traces,
  searchQuery,
  setSearchQuery,
}: TracesTabProps) {
  return <TestErrorsPage />;

  return (
    <div className="space-y-6">
      <Card className="bg-black/30 border border-blue-900/40">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Distributed Traces</CardTitle>
              <CardDescription>
                Performance traces across your services
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Filter traces..."
                className="pl-10 w-full md:w-64 bg-black/30 border border-blue-900/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Spans</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {traces.map((trace) => (
                <TableRow key={trace.id} className="border-blue-900/20">
                  <TableCell className="font-medium">{trace.id}</TableCell>
                  <TableCell>{trace.name}</TableCell>
                  <TableCell>{trace.duration}ms</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        trace.status === "error" ? "destructive" : "outline"
                      }
                    >
                      {trace.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{trace.spans}</TableCell>
                  <TableCell>
                    {new Date(trace.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-400">
            Showing {traces.length} traces
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
