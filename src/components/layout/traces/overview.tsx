import { useState } from "react";
import { Search, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function TracesOverview() {
  const [timeRange, setTimeRange] = useState("Last 15 minutes");

  return (
    <div>
      {/* Search and filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 py-2 w-full"
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-500">Monitor:</span>
            <Select defaultValue="all">
              <SelectTrigger className="w-24 h-8">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="errors">Errors</SelectItem>
                <SelectItem value="warnings">Warnings</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36 h-8">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Last 15 minutes">Last 15 minutes</SelectItem>
                <SelectItem value="Last 30 minutes">Last 30 minutes</SelectItem>
                <SelectItem value="Last hour">Last hour</SelectItem>
                <SelectItem value="Last 3 hours">Last 3 hours</SelectItem>
                <SelectItem value="Last 6 hours">Last 6 hours</SelectItem>
                <SelectItem value="Last 12 hours">Last 12 hours</SelectItem>
                <SelectItem value="Last 24 hours">Last 24 hours</SelectItem>
                <SelectItem value="Custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Traces</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No traces have been captured yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default TracesOverview;
