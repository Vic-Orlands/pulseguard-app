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
import { AlertCircle, Search } from "lucide-react";
import type { Error } from "@/types/dashboard";
import { Input } from "@/components/ui/input";

interface ErrorsTabProps {
  errors: Error[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function ErrorsTab({
  errors,
  searchQuery,
  setSearchQuery,
}: ErrorsTabProps) {
  const filteredErrors = errors.filter(
    (error) =>
      error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="bg-black/30 border border-blue-900/40">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Error Tracking</CardTitle>
              <CardDescription>
                All errors across your platforms
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Filter errors..."
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
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Occurrences</TableHead>
                <TableHead>Affected Users</TableHead>
                <TableHead>Last Occurrence</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredErrors.map((error) => (
                <TableRow key={error.id} className="border-blue-900/20">
                  <TableCell className="font-medium">{error.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {error.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {error.message}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        error.status === "active" ? "destructive" : "outline"
                      }
                    >
                      {error.status === "active" ? "Active" : "Resolved"}
                    </Badge>
                  </TableCell>
                  <TableCell>{error.occurrences}</TableCell>
                  <TableCell>{error.affectedUsers}</TableCell>
                  <TableCell>{error.lastOccurrence}</TableCell>
                  <TableCell className="text-blue-400 hover:underline cursor-pointer">
                    {error.source}
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
            Showing {filteredErrors.length} of {errors.length} errors
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
