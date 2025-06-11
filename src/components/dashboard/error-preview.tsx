import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Eye } from "lucide-react";
import { useOverviewContext } from "@/context/overview-context";
import { formatDistanceToNow } from "date-fns";

export default function ErrorPreview() {
  const { errors, setActiveTab } = useOverviewContext();

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
          {errors === null ? (
            <div className="flex flex-col items-center justify-center min-h-[330px] p-8 text-gray-400">
              <AlertTriangle className="w-12 h-12 mb-2" />
              <p>No errors in this project</p>
            </div>
          ) : (
            errors.slice(0, 3).map((error) => (
              <div
                key={error.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-blue-900 bg-grday-900/50 bg-blue-900/10"
              >
                <div className="p-2 rounded-full bg-red-500/20">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {error.type || "RuntimeError"}
                    </h3>
                    <Badge
                      variant={
                        error.status === "active" ? "secondary" : "outline"
                      }
                    >
                      {error.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{error.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{error.count} occurrences</span>
                    <span>Source: {error.source}</span>
                    <span className="ml-auto">
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
