export function AppLoader({
  title = "Loading...",
  subtitle = "Please wait while we fetch your data.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pg-surface p-4 text-pg-text">
      <div className="text-center">
        <div className="mb-3 flex justify-center">
          <svg
            className="h-5 w-5 animate-spin text-pg-subtle"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
        <h2 className="text-xs font-medium tracking-tight text-pg-text">
          {title}
        </h2>
        <p className="mt-1 text-[10px] text-pg-muted">{subtitle}</p>
      </div>
    </div>
  );
}
