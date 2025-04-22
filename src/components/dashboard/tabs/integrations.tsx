import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  AwsLogo,
  AzureLogo,
  SlackLogo,
  GithubLogo,
  GoogleCloudLogo,
  MicrosoftTeamsLogo,
} from "@/components/Icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Integration } from "@/types/dashboard";

interface IntegrationsTabProps {
  integrations: Integration[];
}

export default function IntegrationsTab({
  integrations,
}: IntegrationsTabProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-black/30 border border-blue-900/40">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Connected Integrations</CardTitle>
              <CardDescription>
                Third-party services connected to PulseGuard
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card
                key={integration.id}
                className="bg-gray-900/50 border border-blue-900/40"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{integration.name}</CardTitle>
                    <Badge
                      variant={
                        integration.status === "connected"
                          ? "default"
                          : "secondary"
                      }
                      className="gap-1"
                    >
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                      {integration.status.charAt(0).toUpperCase() +
                        integration.status.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>{integration.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Last sync:</span>
                    <span>{integration.lastSync}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                  <Button
                    variant={
                      integration.status === "connected"
                        ? "destructive"
                        : "default"
                    }
                    size="sm"
                  >
                    {integration.status === "connected"
                      ? "Disconnect"
                      : "Connect"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border border-blue-900/40">
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>
            Connect PulseGuard with your favorite services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
            >
              <SlackLogo className="h-8 w-8" />
              <span>Slack</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
            >
              <GithubLogo className="h-8 w-8" />
              <span>GitHub</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
            >
              <MicrosoftTeamsLogo className="h-8 w-8" />
              <span>Teams</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
            >
              <AwsLogo className="h-8 w-8" />
              <span>AWS</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
            >
              <GoogleCloudLogo className="h-8 w-8" />
              <span>GCP</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
            >
              <AzureLogo className="h-8 w-8" />
              <span>Azure</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
            >
              <DatadogLogo className="h-8 w-8" />
              <span>Datadog</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
            >
              <NewRelicLogo className="h-8 w-8" />
              <span>New Relic</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder components for logos
function DatadogLogo({ className }: { className?: string }) {
  return <div className={className}>Datadog</div>;
}

function NewRelicLogo({ className }: { className?: string }) {
  return <div className={className}>New Relic</div>;
}
