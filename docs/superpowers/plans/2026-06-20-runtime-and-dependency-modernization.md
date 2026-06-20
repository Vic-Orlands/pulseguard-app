# Runtime and Dependency Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the frontend, Go backend, and Docker Compose stack reproducible with supported pinned runtimes and a pnpm-only frontend workflow.

**Architecture:** Keep the existing Next.js and Go application boundaries intact. Upgrade only packages that are used by the source, replace obsolete build commands and unpinned images, and verify each application independently before validating Compose configuration and image builds.

**Tech Stack:** pnpm, Next.js, React, TypeScript, Go, Docker Compose, OpenTelemetry, PostgreSQL, Grafana stack.

---

### Task 1: Establish pnpm as the sole frontend package manager

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Delete: `package-lock.json`
- Create: `.dockerignore`

- [ ] Add a `packageManager` field matching the installed pnpm major and update scripts to commands supported by the selected Next.js version.
- [ ] Run `pnpm install` to regenerate the lockfile.
- [ ] Remove the npm lockfile and exclude dependencies, build output, environment files, logs, and Git metadata from Docker build context.
- [ ] Run `pnpm install --frozen-lockfile` and `pnpm exec tsc --noEmit`.

### Task 2: Upgrade JavaScript dependencies by compatibility boundary

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: frontend source files only where package APIs require it

- [ ] Inspect `pnpm outdated` and import usage.
- [ ] Apply latest compatible direct dependency versions, including the missing `framer-motion` runtime dependency.
- [ ] Remove direct packages that are not imported by application code.
- [ ] Use `pnpm build` and `pnpm lint` to identify and correct upgrade-specific API or configuration changes.

### Task 3: Modernize and verify Go modules

**Files:**
- Modify: `backend/go.mod`
- Modify: `backend/go.sum`
- Modify: `backend/Dockerfile`

- [ ] Run `go get -u ./...` followed by `go mod tidy`.
- [ ] Build and test all Go packages.
- [ ] Replace the backend image with a pinned multi-stage build that copies only the static binary and CA certificates into a non-root final image.
- [ ] Build the backend Docker image.

### Task 4: Make Docker Compose repeatable and service-aware

**Files:**
- Modify: `Dockerfile.frontend`
- Modify: `docker-compose.yml`
- Modify: `README.md`

- [ ] Replace the invalid npm-based frontend Dockerfile with a pinned Node LTS pnpm multi-stage image.
- [ ] Pin observability, database, and application image tags; remove interactive container settings; add health checks and dependency conditions.
- [ ] Correct in-network telemetry URLs and make runtime configuration overridable from environment variables without committed credentials.
- [ ] Validate `docker compose config` and build all local application images.

### Task 5: Final verification and operational documentation

**Files:**
- Modify: `README.md`

- [ ] Document pnpm, Go, and Docker Compose prerequisites and exact startup commands.
- [ ] Run the frontend lint, typecheck, production build, Go tests, Go build, Compose validation, and local image builds from a clean dependency state.
- [ ] Record any externally required runtime settings without revealing secret values.
