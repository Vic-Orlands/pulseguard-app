"use client";

import { useState } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { ErrorBoundary } from "@/components/error-boundary";

// Component that will throw an error
const BuggyComponent = () => {
  // This will cause a runtime error
  const [count, setCount] = useState(0);

  const causeError = () => {
    throw new Error("Intentional test error");
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-semibold mb-2">Buggy Component</h3>
      <p>Count: {count}</p>
      <button
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
        onClick={causeError}
      >
        Cause Error
      </button>
      <button
        className="mt-2 ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
    </div>
  );
};

export default function TestErrorsPage() {
  const telemetry = useTelemetry({ pageId: "test-errors" });

  const causeUnhandledPromiseRejection = () => {
    // This will cause an unhandled promise rejection
    new Promise((_, reject) => {
      reject(new Error("Unhandled promise rejection test"));
    });
  };

  const causeManualError = () => {
    // Report a manual error
    telemetry.reportError(new Error("Manually reported error"));
  };

  const causeNetworkError = () => {
    // Fetch from a non-existent endpoint
    fetch("/api/non-existent-endpoint")
      .then((res) => res.json())
      .catch((err) => console.error("Network error occurred:", err));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Error Tracking</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white shadow rounded">
          <h2 className="text-xl font-semibold mb-4">
            Component Error (Error Boundary Test)
          </h2>
          <ErrorBoundary>
            <BuggyComponent />
          </ErrorBoundary>
        </div>

        <div className="p-6 bg-white shadow rounded">
          <h2 className="text-xl font-semibold mb-4">Other Error Types</h2>

          <div className="space-y-4">
            <button
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded"
              onClick={causeUnhandledPromiseRejection}
            >
              Cause Unhandled Promise Rejection
            </button>

            <button
              className="w-full px-4 py-2 bg-purple-500 text-white rounded"
              onClick={causeManualError}
            >
              Report Manual Error
            </button>

            <button
              className="w-full px-4 py-2 bg-green-500 text-white rounded"
              onClick={causeNetworkError}
            >
              Cause Network Error
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
