export default function Loading({ text = "projects" }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 text-white flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="flex justify-center mb-4">
          <svg
            className="animate-spin h-8 w-8 text-white"
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
        <h2 className="text-xl font-semibold mb-2">Loading {text}...</h2>
        <p className="text-sm text-gray-400">
          Please wait while we fetch your data.
        </p>
      </div>
    </div>
  );
}
