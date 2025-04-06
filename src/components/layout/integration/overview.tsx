import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function IntegrationOverview() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Connect your app to other services.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default IntegrationOverview;
