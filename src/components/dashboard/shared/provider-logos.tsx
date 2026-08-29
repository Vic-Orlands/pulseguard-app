const files: Record<string, string> = {
  slack: "/integrations/slack.svg",
  discord: "/integrations/discord.svg",
  github: "/integrations/github.svg",
  linear: "/integrations/linear.svg",
  clickup: "/integrations/clickup.svg",
  datadog: "/integrations/datadog.svg",
  pagerduty: "/integrations/pagerduty.svg",
  jira: "/integrations/jira.svg",
  microsoft_teams: "/integrations/microsoftteams.svg",
  telegram: "/integrations/telegram.svg",
  notion: "/integrations/notion.svg",
};

export function ProviderLogo({ provider }: { provider: string }) {
  if (provider === "webhook") {
    return (
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pg-surface">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-pg-text" aria-hidden>
          <path
            fill="currentColor"
            d="M10.6 13.4a1 1 0 0 1 0-1.4l3.2-3.2a3 3 0 0 1 4.2 4.2l-1.2 1.2a1 1 0 1 1-1.4-1.4l1.2-1.2a1 1 0 0 0-1.4-1.4l-3.2 3.2a1 1 0 0 1-1.4 0Zm2.8-2.8a1 1 0 0 1 0 1.4l-3.2 3.2a3 3 0 0 1-4.2-4.2l1.2-1.2a1 1 0 1 1 1.4 1.4L7.4 12a1 1 0 0 0 1.4 1.4l3.2-3.2a1 1 0 0 1 1.4 0Z"
          />
        </svg>
      </span>
    );
  }

  const src = files[provider];
  if (!src) {
    return (
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pg-surface text-[10px] font-semibold text-pg-muted">
        {provider.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-black/10 dark:bg-zinc-100">
      <img src={src} alt="" className="h-4 w-4 object-contain" />
    </span>
  );
}
