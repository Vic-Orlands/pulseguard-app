import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Bug, Eye, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { RecentError } from "@/types/dashboard";

const getErrorSeverityColor = (severity: string) => {
  switch (severity) {
    case "active":
      return "text-red-400 bg-red-500/20";
    case "resolved":
      return "text-green-400 bg-green-500/20";
    default:
      return "text-yellow-400 bg-yellow-500/20";
  }
};

interface ErrorPreviewProps {
  errors: RecentError[];
  setActiveTab: (key: string) => void;
}

export default function ErrorPreview({
  errors,
  setActiveTab,
}: ErrorPreviewProps) {
  return (
    <Card className="bg-black/30 border border-blue-900/40 relative">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold text-white flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            Recent Errors
          </CardTitle>
        </div>

        <Button
          variant="ghost"
          className="text-blue-400 hover:text-blue-300 text-sm font-normal flex items-center border-none"
          onClick={() => setActiveTab?.("errors")}
        >
          <Eye className="w-4 h-4" />
          View all errors
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {errors === null || errors.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[330px] p-8 text-gray-400">
              <AlertTriangle className="w-12 h-12 mb-2" />
              <p>No errors in this project</p>
            </div>
          ) : (
            errors.map((error) => (
              <div
                key={error.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-blue-900 bg-grday-900/50 bg-blue-900/10"
              >
                <div className="p-2 rounded-full bg-red-500/20">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {error.type || "RuntimeError"}
                    </h3>
                    <Badge
                      className={`text-xs px-2 py-1 rounded-full ${getErrorSeverityColor(
                        error.status.toLowerCase()
                      )}`}
                    >
                      {error.status.toLowerCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 w-3/4 truncate text-ellipsis">
                    {error.message}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Bug className="w-3 h-3 mr-1" />
                      {error.count} occurrences
                    </span>
                    <span className="flex items-center m">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(new Date(error.lastSeen), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
