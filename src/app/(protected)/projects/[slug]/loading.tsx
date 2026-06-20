export default function Loading({ text = "projects" }: { text?: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <svg
            className="animate-spin h-5 w-5 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </div>
        <h2 className="text-xs font-medium text-foreground tracking-tight">Loading {text}...</h2>
        <p className="text-[10px] text-muted-foreground mt-1">
          Please wait while we fetch your data.
        </p>
      </div>
    </div>
  );
}
