import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
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
import type { Project } from "@/types/dashboard";

const integrations: {
  id: string;
  name: string;
  status: string;
  type: string;
  lastSync: string;
}[] = [];

export default function IntegrationsTab({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      {integrations.length === 0 ? (
        <Card className="bg-card border border-border flex items-center justify-center shadow-none rounded-lg">
          <div className="py-32 text-center">
            <CardTitle className="text-sm font-semibold text-foreground mb-2">
              Third-party integrations for {project.name} coming soon
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
              Stay tuned for new integrations and features.
            </CardDescription>
          </div>
        </Card>
      ) : (
        <>
          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardHeader className="py-3 px-4 border-b border-border/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xs font-semibold text-foreground">Connected Integrations</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Third-party services connected to PulseGuard
                  </CardDescription>
                </div>
                <Button className="text-xs h-8 shadow-none bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer">
                  <HugeiconsIcon icon={Add01Icon} className="h-3.5 w-3.5 mr-1.5" />
                  Add Integration
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations.map((integration) => (
                  <Card
                    key={integration.id}
                    className="bg-card border border-border shadow-none rounded-lg"
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-semibold text-foreground">{integration.name}</CardTitle>
                        <Badge
                          variant={
                            integration.status === "connected"
                              ? "default"
                              : "secondary"
                          }
                          className="gap-1 text-[10px] shadow-none py-0.5"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                          {integration.status.charAt(0).toUpperCase() +
                            integration.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground">{integration.type}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between text-xs text-foreground">
                        <span className="text-muted-foreground">Last sync:</span>
                        <span>{integration.lastSync}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-8 shadow-none border-border hover:bg-muted text-foreground cursor-pointer">
                        Configure
                      </Button>
                      <Button
                        variant={
                          integration.status === "connected"
                            ? "destructive"
                            : "default"
                        }
                        size="sm"
                        className="text-xs h-8 shadow-none cursor-pointer"
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

          {integrations.length > 0 && (
            <Card className="bg-card border border-border shadow-none rounded-lg">
              <CardHeader className="py-3 px-4 border-b border-border/50">
                <CardTitle className="text-xs font-semibold text-foreground">Available Integrations</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Connect PulseGuard with your favorite services
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {}}
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-muted/50 border border-border rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors text-foreground text-xs font-semibold"
                  >
                    <SlackLogo className="h-10 w-10 text-foreground" />
                    <span>Slack</span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {}}
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-muted/50 border border-border rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors text-foreground text-xs font-semibold"
                  >
                    <GithubLogo className="h-10 w-10 text-foreground" />
                    <span>GitHub</span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {}}
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-muted/50 border border-border rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors text-foreground text-xs font-semibold"
                  >
                    <MicrosoftTeamsLogo className="h-10 w-10 text-foreground" />
                    <span>Teams</span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {}}
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-muted/50 border border-border rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors text-foreground text-xs font-semibold"
                  >
                    <AwsLogo className="h-10 w-10 text-foreground" />
                    <span>AWS</span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {}}
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-muted/50 border border-border rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors text-foreground text-xs font-semibold"
                  >
                    <GoogleCloudLogo className="h-10 w-10 text-foreground" />
                    <span>GCP</span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {}}
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-muted/50 border border-border rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors text-foreground text-xs font-semibold"
                  >
                    <Image
                      src="/azurelogo.svg"
                      alt="Azure Logo"
                      width={60}
                      height={60}
                      className="h-10 w-10 text-foreground"
                    />
                    <span>Azure</span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {}}
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-muted/50 border border-border rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors text-foreground text-xs font-semibold"
                  >
                    <Image
                      src="/datadog.svg"
                      alt="Datadog Logo"
                      width={60}
                      height={60}
                      className="h-10 w-10 text-foreground"
                    />
                    <span>Datadog</span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {}}
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-muted/50 border border-border rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors text-foreground text-xs font-semibold"
                  >
                    <Image
                      src="/new-relic.svg"
                      alt="Datadog Logo"
                      width={60}
                      height={60}
                      className="h-10 w-10 text-foreground"
                    />
                    <span>New Relic</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
