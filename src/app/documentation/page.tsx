import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/app/(auth)/signin/page";

export const metadata: Metadata = {
  title: "Documentation — PulseGuard",
  description:
    "A complete guide to PulseGuard: sign up, workspaces, projects, sessions, errors, traces, alerts, and workspace settings.",
};

const sections = [
  { id: "start", label: "Sign up and first project" },
  { id: "workspace", label: "Workspaces and projects" },
  { id: "overview", label: "Overview" },
  { id: "sessions", label: "Sessions" },
  { id: "errors", label: "Errors, logs, traces" },
  { id: "alerts", label: "Alerts" },
  { id: "members", label: "Members and roles" },
  { id: "settings", label: "Settings" },
];

export default function DocumentationPage() {
  return (
    <div className="docs-shell min-h-screen bg-background text-pg-text">
      <header className="sticky top-0 z-20 border-b border-pg-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="flex h-8 w-8 origin-left scale-[0.72] items-center justify-center overflow-hidden">
              <Logo />
            </span>
            <span className="text-sm font-semibold tracking-tight text-pg-text">
              PulseGuard
            </span>
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <ThemeToggle className="rounded-lg p-1.5 text-pg-muted transition-colors hover:bg-pg-group hover:text-pg-text" />
            <Link
              href="/signin"
              className="text-pg-muted no-underline transition-colors hover:text-pg-text"
            >
              Sign in
            </Link>
            <Link
              href="/projects"
              className="btn-primary h-8 rounded-lg px-3 text-xs font-medium no-underline"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            <p className="mb-3 text-[11px] text-pg-subtle">Guide</p>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded-lg px-2 py-1.5 text-[13px] text-pg-muted no-underline transition-colors hover:bg-pg-group hover:text-pg-text"
              >
                {section.label}
              </a>
            ))}
          </nav>
        </aside>

        <article className="max-w-3xl pb-24">
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            Product documentation
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pg-text">
            From first login to live telemetry
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-pg-muted">
            PulseGuard watches errors, sessions, logs, traces, and metrics for
            your web apps. This guide walks the product in the same order you
            use it — create an account, pick a workspace, connect a project,
            then read the dashboards and invite the rest of the team.
          </p>

          <div className="mt-10 overflow-hidden rounded-lg bg-pg-group">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-medium text-pg-text">Product walkthrough</p>
              <p className="text-[11px] text-pg-subtle">Dashboard tour</p>
            </div>
            <div className="aspect-video w-full bg-black">
              <video
                className="h-full w-full object-contain"
                controls
                playsInline
                preload="metadata"
                poster="/docs/videos/dashboard-summary-poster.jpg"
                src="/docs/videos/dashboard-summary.mp4"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          <Section id="start" title="Sign up and first project">
            <p>
              Create an account with email, Google, or GitHub. The first time
              you sign in, PulseGuard asks for a workspace name, then a
              project. That projects list only appears on first run. After you
              open a project, later logins return you there.
            </p>
            <ol className="mt-4 space-y-2 text-[14px] leading-6 text-pg-muted">
              <li>Open PulseGuard and create an account.</li>
              <li>Name the workspace. This is the company or product group.</li>
              <li>Create the first project. You land on Overview.</li>
              <li>Copy the project DSN and send a test event to verify the connection.</li>
            </ol>
          </Section>

          <Section id="workspace" title="Workspaces and projects">
            <p>
              The selector above the sidebar lists workspaces. Hover a
              workspace to see its projects in a panel to the right, then click
              a project to switch. Creating a project stays in that workspace.
              You never bounce back to the first-run projects page unless you
              have no last project saved.
            </p>
          </Section>

          <Section id="overview" title="Overview">
            <p>
              Overview is the health snapshot: system status, error totals,
              error rate, recent sessions, and recent errors. Use it to see
              whether the last deploy is quiet or noisy before you drill in.
            </p>
          </Section>

          <Section id="sessions" title="Sessions">
            <p>
              Sessions lists user visits with start time, duration, page views,
              and errors. Session activity uses a year-long heatmap from January
              to December — empty days are light grey, busier days move through
              dark grey to black. Daily, weekly, and cumulative views change
              how intensity is counted.
            </p>
          </Section>

          <Section id="errors" title="Errors, logs, and traces">
            <p>
              Errors groups exceptions with occurrence counts and status.
              Logs is the raw stream. Traces is the request waterfall — the
              page chrome stays put while the table body loads, so the view
              does not flash a full-page spinner.
            </p>
          </Section>

          <Section id="alerts" title="Alerts">
            <p>
              Alert rules watch error counts or new error groups. Create a
              rule with a threshold, window, and severity. The switch on each
              row turns the rule on or off. In-app notifications appear in the
              sidebar; email is optional. Settings → Alert rules opens this
              same page without remounting the dashboard.
            </p>
          </Section>

          <Section id="members" title="Members and roles">
            <p>
              PulseGuard uses workspaces and projects only — there are no
              separate teams. Invite someone with an email, a role, and
              project access.
            </p>
            <ul className="mt-4 space-y-2 text-[14px] leading-6 text-pg-muted">
              <li>
                <span className="text-pg-text">Member</span> can use the
                projects they were given.
              </li>
              <li>
                <span className="text-pg-text">Admin</span> can invite and
                remove members, rename the workspace, and delete it.
              </li>
              <li>
                Access can be every project, or a selected set, chosen at
                invite time and changed later by an admin or owner.
              </li>
            </ul>
          </Section>

          <Section id="settings" title="Settings">
            <p>
              Settings covers account, project name, API key, appearance,
              notifications, workspace members, and destructive actions.
              Delete project and delete account use a red confirmation so the
              risk is obvious. Type delete to confirm a project deletion.
            </p>
          </Section>

          <div className="mt-14 rounded-lg bg-pg-group p-6">
            <p className="text-sm font-medium text-pg-text">Need the SDK next?</p>
            <p className="mt-2 text-[13px] leading-6 text-pg-muted">
              Open a project&apos;s Connect tab, install <code>pulseguard</code>,
              and pass the project DSN to the SDK. Add a release to de-minify
              stack traces with uploaded source maps, and include the deployed
              commit SHA to link an error to its likely suspect change.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-pg-border pt-10 mt-10">
      <div className="flex gap-4">
        <span className="mt-1.5 h-8 w-px shrink-0 bg-emerald-500/70" />
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-pg-text">
            {title}
          </h2>
          <div className="mt-3 space-y-3 text-[14px] leading-7 text-pg-muted">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
