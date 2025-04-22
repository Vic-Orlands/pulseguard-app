import { ChevronDown, Plus } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card className="bg-black/30 border border-blue-900/40">
        <CardHeader>
          <CardTitle>Project Settings</CardTitle>
          <CardDescription>Configure your PulseGuard project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Project Name
                </label>
                <Input
                  defaultValue="DigitalOcean"
                  className="bg-black/30 border border-blue-900/40"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Project ID
                </label>
                <Input
                  defaultValue="digitalizing"
                  className="bg-black/30 border border-blue-900/40"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Team Members</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/user1.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-gray-400">john@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Owner</Badge>
                  <Button variant="ghost" size="sm" disabled>
                    Remove
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/user2.png" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Alice Smith</p>
                    <p className="text-sm text-gray-400">alice@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Developer
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border border-blue-900/40">
                      <DropdownMenuItem>Owner</DropdownMenuItem>
                      <DropdownMenuItem>Admin</DropdownMenuItem>
                      <DropdownMenuItem>Developer</DropdownMenuItem>
                      <DropdownMenuItem>Viewer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Installation Guide</h3>
            <div className="p-4 rounded-lg bg-gray-900/50">
              <Tabs defaultValue="nextjs" className="w-full">
                <TabsList className="bg-gray-800 border border-blue-900/40">
                  <TabsTrigger value="nextjs">Next.js</TabsTrigger>
                  <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                  <TabsTrigger value="react">React</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>
                <div className="mt-4">
                  <div className="space-y-3 text-sm">
                    <p>1. Install the npm package:</p>
                    <div className="p-3 rounded bg-gray-800 font-mono text-blue-400">
                      npm install @pulseguard/nextjs
                    </div>
                    <p>
                      2. Initialize the client SDK in your Next.js application:
                    </p>
                    <div className="p-3 rounded bg-gray-800 font-mono text-blue-400">
                      {`// src/app/layout.tsx\nimport { PulseGuard } from '@pulseguard/nextjs/client';\n\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode\n}) {\n  return (\n    <html>\n      <body>\n        <PulseGuard projectId="digitalizing" />\n        {children}\n      </body>\n    </html>\n  )\n}`}
                    </div>
                  </div>
                </div>
              </Tabs>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Danger Zone</h3>
            <div className="p-4 rounded-lg border border-red-900/50 bg-red-900/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-medium">Delete Project</h4>
                  <p className="text-sm text-gray-400">
                    Once you delete a project, there is no going back. Please be
                    certain.
                  </p>
                </div>
                <Button variant="destructive">Delete Project</Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
