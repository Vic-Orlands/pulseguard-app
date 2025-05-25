import Image from "next/image";
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
  SlackLogo,
  GithubLogo,
  GoogleCloudLogo,
  MicrosoftTeamsLogo,
} from "@/components/Icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Integration } from "@/types/dashboard";

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
            <div
              role="button"
              tabIndex={0}
              onClick={() => {}}
              className="flex flex-col items-center justify-center h-48 gap-2 bg-gray-900/50 border border-blue-900/40 rounded-lg p-4 cursor-pointer hover:bg-gray-900/70 transition-colors"
            >
              <SlackLogo className="h-15 w-15" />
              <span>Slack</span>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => {}}
              className="flex flex-col items-center justify-center h-48 gap-2 bg-gray-900/50 border border-blue-900/40 rounded-lg p-4 cursor-pointer hover:bg-gray-900/70 transition-colors"
            >
              <GithubLogo className="h-15 w-15" />
              <span>GitHub</span>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => {}}
              className="flex flex-col items-center justify-center h-48 gap-2 bg-gray-900/50 border border-blue-900/40 rounded-lg p-4 cursor-pointer hover:bg-gray-900/70 transition-colors"
            >
              <MicrosoftTeamsLogo className="h-15 w-15" />
              <span>Teams</span>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => {}}
              className="flex flex-col items-center justify-center h-48 gap-2 bg-gray-900/50 border border-blue-900/40 rounded-lg p-4 cursor-pointer hover:bg-gray-900/70 transition-colors"
            >
              <AwsLogo className="h-15 w-15" />
              <span>AWS</span>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => {}}
              className="flex flex-col items-center justify-center h-48 gap-2 bg-gray-900/50 border border-blue-900/40 rounded-lg p-4 cursor-pointer hover:bg-gray-900/70 transition-colors"
            >
              <GoogleCloudLogo className="h-15 w-15" />
              <span>GCP</span>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => {}}
              className="flex flex-col items-center justify-center h-48 gap-2 bg-gray-900/50 border border-blue-900/40 rounded-lg p-4 cursor-pointer hover:bg-gray-900/70 transition-colors"
            >
              <Image
                src="/azurelogo.svg"
                alt="Azure Logo"
                width={90}
                height={90}
                className="h-15 w-15"
              />
              <span>Azure</span>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => {}}
              className="flex flex-col items-center justify-center h-48 gap-2 bg-gray-900/50 border border-blue-900/40 rounded-lg p-4 cursor-pointer hover:bg-gray-900/70 transition-colors"
            >
              <Image
                src="/datadog.svg"
                alt="Datadog Logo"
                width={90}
                height={90}
                className="h-15 w-15"
              />
              <span>Datadog</span>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => {}}
              className="flex flex-col items-center justify-center h-48 gap-2 bg-gray-900/50 border border-blue-900/40 rounded-lg p-4 cursor-pointer hover:bg-gray-900/70 transition-colors"
            >
              <Image
                src="/new-relic.svg"
                alt="Datadog Logo"
                width={90}
                height={90}
                className="h-15 w-15"
              />
              <span>New Relic</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
