"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";

// layouts
import Navbar from "@/components/layout/navbar";
import LogOverview from "@/components/layout/log/overview";
import AlertOverview from "@/components/layout/alert/overview";
import ErrorOverview from "@/components/layout/error/overview";
import TracesOverview from "@/components/layout/traces/overview";
import SessionOverview from "@/components/layout/session/overview";
import ConnectOverview from "@/components/layout/connect/overview";
import DashboardOverview from "@/components/layout/dashboard/overview";
import IntegrationOverview from "@/components/layout/integration/overview";

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-hbackground">
      {/* Navbar */}
      <Tabs defaultValue="logs" className="w-full">
        <Navbar />

        {/* Main content */}
        <main className="flex-1">
          <div className="container mx-auto px-4 py-4">
            <TabsContent value="logs" className="mt-0">
              <LogOverview />
            </TabsContent>

            <TabsContent value="errors" className="mt-0">
              <ErrorOverview />
            </TabsContent>

            <TabsContent value="sessions">
              <SessionOverview />
            </TabsContent>

            <TabsContent value="traces">
              <TracesOverview />
            </TabsContent>

            <TabsContent value="dashboards">
              <DashboardOverview />
            </TabsContent>

            <TabsContent value="alerts">
              <AlertOverview />
            </TabsContent>

            <TabsContent value="integrations">
              <IntegrationOverview />
            </TabsContent>

            <TabsContent value="connect">
              <ConnectOverview />
            </TabsContent>
          </div>
        </main>
      </Tabs>
    </div>
  );
}
