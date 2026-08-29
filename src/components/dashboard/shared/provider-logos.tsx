const LOBE_CDN = "https://unpkg.com/@lobehub/icons-static-svg@latest/icons";
const SIMPLE_CDN = "https://cdn.simpleicons.org";

const slugs: Record<string, { src: string; invert?: boolean }> = {
  slack: { src: `${SIMPLE_CDN}/slack/E01E5A` },
  discord: { src: `${SIMPLE_CDN}/discord/5865F2` },
  github: { src: `${LOBE_CDN}/github.svg`, invert: true },
  linear: { src: `${SIMPLE_CDN}/linear/5E6AD2` },
  clickup: { src: `${SIMPLE_CDN}/clickup/7B68EE` },
  datadog: { src: `${SIMPLE_CDN}/datadog/632CA6` },
  pagerduty: { src: `${SIMPLE_CDN}/pagerduty/06AC38` },
  jira: { src: `${SIMPLE_CDN}/jira/1868DB` },
  microsoft_teams: { src: `${SIMPLE_CDN}/microsoftteams/6264A7` },
  telegram: { src: `${SIMPLE_CDN}/telegram/26A5E4` },
  notion: { src: `${LOBE_CDN}/notion.svg`, invert: true },
  webhook: { src: "" },
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

  const logo = slugs[provider];
  if (!logo) {
    return (
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pg-surface text-[10px] font-semibold text-pg-muted">
        {provider.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-black/5 dark:bg-zinc-100">
      <img
        src={logo.src}
        alt=""
        className={`h-5 w-5 object-contain ${logo.invert ? "dark:invert" : ""}`}
      />
    </span>
  );
}
