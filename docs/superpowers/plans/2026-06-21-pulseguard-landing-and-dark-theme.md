# PulseGuard Landing and Dark Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the PulseGuard landing page as a premium, grid-led product surface and enforce a black, white, and gray dashboard dark mode.

**Architecture:** The landing page remains a client component because its authentication, theme, code-copy, SDK tabs, and simulator interactions share local state. Landing-specific style tokens and layout primitives live in the global stylesheet with a `pg-` prefix, preventing its warm canvas and signal accent from affecting the dashboard. The existing semantic theme variables continue to drive dashboard components, with dark-mode dashboard overrides kept monochrome.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion, next-themes, Lucide React.

---

## File Structure

- `src/app/page.tsx` — landing-page content, routing, theme actions, SDK tabs, copy behavior, and telemetry simulator state.
- `src/app/globals.css` — monochrome dashboard dark-theme tokens plus scoped `pg-` landing design tokens, grid, responsive layout, and reduced-motion rules.
- `src/components/dashboard/shared/severity-icons.tsx` — semantic severity styles, with non-critical dark-mode colors changed to grayscale.
- `src/components/ui/switch.tsx` — remove the blue dark-mode switch thumb in favor of grayscale.
- `docs/superpowers/specs/2026-06-21-pulseguard-landing-and-dark-theme-design.md` — approved design contract.

### Task 1: Establish theme boundaries

**Files:**
- Modify: `src/app/globals.css:3-65`
- Modify: `src/components/ui/switch.tsx:18-28`

- [ ] **Step 1: Write the failing visual contract check**

Create a temporary checklist before editing:

```text
Dark dashboard background: black/charcoal only
Dark dashboard text: white/gray only
Dark dashboard border/control chrome: gray only
Dark switch checked state: gray, not blue
```

- [ ] **Step 2: Verify the current implementation fails the contract**

Run:

```bash
rg -n 'dark:data-\[state=checked\]:bg-blue|--background: #09090b|--border: #27272a' src/components/ui/switch.tsx src/app/globals.css
```

Expected: the switch reports a blue checked thumb, proving the dashboard chrome is not wholly grayscale.

- [ ] **Step 3: Implement monochrome dark-mode tokens and the landing namespace**

Update `.dark` theme variables to use only black, charcoal, white, and gray values. Add these scoped visual primitives:

```css
.pg-page { background: #f7f7f5; color: #1d1d1b; }
.pg-grid { background-image: linear-gradient(#e9e9e4 1px, transparent 1px), linear-gradient(90deg, #e9e9e4 1px, transparent 1px); }
.pg-signal { color: #ff5a1f; }
.pg-panel { border: 1px solid #dfdfda; background: rgba(255, 255, 253, .82); }
```

Replace the switch's checked blue utility with a gray utility.

- [ ] **Step 4: Verify the theme boundary**

Run:

```bash
rg -n 'dark:data-\[state=checked\]:bg-blue' src/components/ui/switch.tsx
pnpm typecheck
```

Expected: the search prints no matches and typecheck exits with status 0.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/components/ui/switch.tsx
git commit -m "style(theme): make dark dashboard chrome monochrome"
```

### Task 2: Rebuild the landing information architecture

**Files:**
- Modify: `src/app/page.tsx:1-560`
- Modify: `src/app/globals.css:65-220`

- [ ] **Step 1: Write the failing landing acceptance check**

Record the required visible surface before editing:

```text
Hero: left-led proposition + telemetry preview
Capabilities: logs, traces, errors, metrics index
Integration: React, Node, Go tabs + copy action
Correlation: frontend error -> API -> database narrative
Simulator: dispatch actions and clear action
Final CTA and footer
```

- [ ] **Step 2: Verify the current implementation fails the visual contract**

Run:

```bash
rg -n 'Feature Cards Grid|v1.0.0-beta|text-center flex flex-col' src/app/page.tsx
```

Expected: all three matches exist, showing the generic centered hero and feature-card structure are still present.

- [ ] **Step 3: Implement the landing shell and hero**

Replace the root, header, and hero markup with a `pg-page` canvas, an architectural grid, a compact navigation bar, a left-led hero, and a purpose-built telemetry preview. Keep the existing theme toggle and authentication route handlers unchanged.

- [ ] **Step 4: Implement product sections and preserve interactive content**

Keep `codeSamples`, SDK selection, copy state, simulator event generators, `handleSimulate`, console auto-scroll, and clear action. Recompose the rendered sections into a capabilities index, integration panel, correlation narrative, full-width simulator, final CTA, and compact footer.

- [ ] **Step 5: Implement responsive and motion rules**

Add explicit breakpoints for a single-column mobile hero and preview, clipped grid background, scrolling code and console regions, and a `prefers-reduced-motion` rule that disables decorative movement without disabling interactions.

- [ ] **Step 6: Verify static and type contracts**

Run:

```bash
rg -n 'Feature Cards Grid|v1.0.0-beta|text-center flex flex-col' src/app/page.tsx
pnpm lint
pnpm typecheck
```

Expected: the search prints no matches; lint and typecheck exit with status 0.

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "feat(landing): rebuild product marketing surface"
```

### Task 3: Make dark dashboard semantics restrained

**Files:**
- Modify: `src/components/dashboard/shared/severity-icons.tsx:1-45`
- Modify: `src/components/dashboard/shared/error-message.tsx:1-20`

- [ ] **Step 1: Write the failing dark-semantics check**

```text
Informational and lifecycle dashboard icon states use grayscale in dark mode.
Error indicators remain visibly distinct but muted.
```

- [ ] **Step 2: Verify the current implementation fails**

Run:

```bash
rg -n 'text-(green|blue)-400|bg-(blue|yellow)-500' src/components/dashboard/shared/severity-icons.tsx
```

Expected: the search returns colored informational/lifecycle styles.

- [ ] **Step 3: Implement grayscale semantic chrome**

Change non-error severity icon backgrounds, borders, and glyphs to `neutral` utilities. Preserve error emphasis with a single muted red treatment because that color communicates a genuine error state.

- [ ] **Step 4: Verify the result**

Run:

```bash
rg -n 'text-(green|blue)-400|bg-(blue|yellow)-500' src/components/dashboard/shared/severity-icons.tsx
pnpm typecheck
```

Expected: the search prints no matches and typecheck exits with status 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/shared/severity-icons.tsx src/components/dashboard/shared/error-message.tsx
git commit -m "style(dashboard): reduce dark mode status colors"
```

### Task 4: Run production and visual verification

**Files:**
- No production files required unless verification identifies a defect.

- [ ] **Step 1: Build the application**

Run:

```bash
pnpm build
```

Expected: Next.js production build exits with status 0.

- [ ] **Step 2: Verify desktop and mobile landing behavior**

Start the app with `pnpm dev`, then use the in-app browser to inspect the landing page at a desktop viewport and a 390px-wide viewport. Confirm the hero, telemetry preview, capabilities, SDK tab selection, copy action, simulator actions, clear action, CTA, and footer work without clipping.

- [ ] **Step 3: Verify dashboard dark mode**

Use the theme control on a protected dashboard surface and confirm its backgrounds, typography, borders, cards, controls, and switch are black, white, and gray. Note any retained semantic error signal separately.

- [ ] **Step 4: Compare visual fidelity**

Capture desktop screenshots of the landing implementation and inspect them against the supplied references. Check at least: whitespace, grid rhythm, border weight, palette restraint, first viewport composition, product UI density, and mobile collapse.

- [ ] **Step 5: Commit any verification fixes**

```bash
git add <verified-fix-files>
git commit -m "fix(landing): correct visual verification findings"
```
