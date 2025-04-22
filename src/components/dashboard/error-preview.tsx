import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Error } from "@/types/dashboard";

interface ErrorPreviewProps {
  errors: Error[];
}

export default function ErrorPreview({ errors }: ErrorPreviewProps) {
  return (
    <Card className="bg-black/30 border border-blue-900/40">
      <CardHeader>
        <CardTitle>Recent Errors</CardTitle>
        <CardDescription>
          The most frequent errors in your applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {errors.map((error) => (
            <div
              key={error.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-gray-900/50"
            >
              <div className="p-2 rounded-full bg-red-500/20">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{error.type}</h3>
                  <Badge
                    variant={
                      error.status === "active" ? "destructive" : "outline"
                    }
                  >
                    {error.status === "active" ? "Active" : "Resolved"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mt-1">{error.message}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>{error.occurrences} occurrences</span>
                  <span>{error.affectedUsers} users affected</span>
                  <span>Last: {error.lastOccurrence}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          className="text-blue-400"
          onClick={() => setActiveTab("errors")}
        >
          View all errors
        </Button>
      </CardFooter>
    </Card>
  );
}
