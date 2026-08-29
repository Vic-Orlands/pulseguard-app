import assert from "node:assert/strict";
import test from "node:test";

import {
  initPulseguard,
  parseDSN,
  reportError,
  reportTrace,
} from "../dist/index.js";

test("parseDSN extracts the public ingest endpoint and project", () => {
  assert.deepEqual(
    parseDSN("https://pg_test@example.com/project-123"),
    {
      protocol: "https",
      host: "example.com",
      ingestBase: "https://example.com",
      ingestKey: "pg_test",
      projectId: "project-123",
    },
  );
});

test("the SDK sends DSN-authenticated session and error events", async () => {
  const requests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    requests.push({ url, init });
    return new Response(null, { status: 202 });
  };

  try {
    initPulseguard({
      dsn: "https://pg_test@example.com/project-123",
      release: "2.0.0",
      commitSha: "abc123",
      repositoryUrl: "https://github.com/acme/app",
    });
    reportError(new Error("checkout failed"));
    reportTrace({
      name: "checkout",
      startTime: new Date().toISOString(),
      duration: 12,
      spans: [
        {
          name: "POST /checkout",
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: 12,
        },
      ],
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(requests.length, 3);
  assert.equal(requests[0].url, "https://example.com/api/ingest/session/start");
  assert.equal(requests[1].url, "https://example.com/api/ingest/error");
  assert.equal(requests[1].init.headers["X-PulseGuard-Key"], "pg_test");
  assert.equal(requests[1].init.headers["X-Project-ID"], "project-123");
  const body = JSON.parse(requests[1].init.body);
  assert.equal(body.release, "2.0.0");
  assert.equal(body.metadata.commitSha, "abc123");
  assert.equal(body.metadata.repositoryUrl, "https://github.com/acme/app");
  assert.equal(requests[2].url, "https://example.com/api/ingest/trace");
});
