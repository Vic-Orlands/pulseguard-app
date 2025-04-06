import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function ConnectOverview() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Connect Your App</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Follow these steps to connect your application.
          </p>
          {/* Connection instructions would go here */}
        </CardContent>
      </Card>
    </div>
  );
}

export default ConnectOverview;
