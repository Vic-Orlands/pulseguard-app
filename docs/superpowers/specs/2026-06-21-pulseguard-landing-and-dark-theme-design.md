# PulseGuard Landing and Dark Theme Design

## Intent

Replace the generic, centered SaaS landing page with a premium product surface informed by the supplied Firecrawl references: a near-white technical canvas, a fine structural grid, restrained borders, one disciplined brand accent, and real product interfaces used as the primary visual material. The page must feel precise and composed rather than card-driven or ornamental.

## Visual Direction

- Use a warm near-white page background with charcoal typography and a muted orange PulseGuard signal accent.
- Establish a repeatable architectural grid with hairline borders and large areas of negative space.
- Use compact, practical navigation with product, docs, and authentication paths; no promotional pill, hero eyebrow, gradient, floating decoration, or excess rounded surfaces.
- Give the hero a left-led editorial hierarchy: a direct headline, short supporting sentence, two clear actions, and a large telemetry application panel.
- Make each subsequent section feel like an extension of the product interface: a capabilities index, an installation/code surface, a correlated trace narrative, and a direct close-out call to action.
- Preserve existing functional routes and landing-page interaction: sign-up/sign-in routing, theme toggle, SDK tab selection/copy, simulated telemetry events, and clearing the telemetry console.
- Use only light, purposeful motion, respecting reduced-motion preferences.

## Landing Page Structure

1. Compact global navigation with the PulseGuard mark, product links, theme control, and account action.
2. Hero split between the core proposition and a large live telemetry panel. The panel shows a service list, a request-rate chart, status rows, and one selected incident.
3. Product capability index for logs, traces, errors, and metrics. Each item is concise and connected to a supporting interface fragment.
4. Integration section with the existing React, Node, and Go tabbed examples and copy behavior, restyled as a native product documentation panel.
5. Correlation section showing how a single request moves through frontend error capture, server logs, and trace spans.
6. Existing interactive telemetry simulator, restyled as a full-width product console with working action controls.
7. Quiet final call to action and a compact footer.

## Dark Mode Contract

- Dashboard dark mode is monochrome: black and charcoal backgrounds, white and gray text, gray borders, and gray control states.
- Decorative accent colors are excluded from dashboard dark-mode surfaces.
- Semantic status signals may retain muted severity colors only where the meaning would otherwise be lost, such as an error indicator or a success state.
- The landing page may retain its restrained PulseGuard accent in dark mode, but it must not leak into dashboard chrome.

## Technical Approach

Keep the landing page as a single client page because its existing interactions share local state and auth/theme hooks. Add landing-specific CSS tokens and scoped structural classes in `src/app/globals.css`, avoiding theme-token changes that would alter the dashboard unintentionally. Update the global dark theme tokens to enforce the dashboard monochrome palette and use existing semantic component tokens.

## Acceptance Criteria

- The first viewport conveys a premium, sparse, grid-based product identity and contains no generic SaaS card grid or hero badge.
- The layout is responsive without horizontal overflow at mobile widths.
- Existing navigation, authentication actions, theme toggle, code tabs/copy action, simulator controls, and clear action remain functional.
- Dashboard dark mode resolves to a black, white, and gray interface apart from genuinely semantic state indicators.
- Typecheck, lint, production build, desktop browser, and mobile browser verification succeed.
