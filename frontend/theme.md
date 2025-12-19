# Theme & CSS Pipeline

This app relies on Tailwind + CSS variables to generate all utility classes and theme-aware tokens.

## Entry points
- `src/main.tsx` imports `src/index.css`, which registers Tailwind layers and the design tokens.
- `src/index.css` defines the CSS variables under `:root` (colors, radii, shadows) and pulls in Tailwind layers via `@tailwind base; @tailwind components; @tailwind utilities;`.

## Build chain
- `postcss.config.cjs` uses `@tailwindcss/postcss` (the Tailwind v4 PostCSS plugin) followed by `autoprefixer`. Using `tailwindcss` directly as a PostCSS plugin will fail on v4.
- Tailwind sources are explicitly set in `src/index.css` using `@config "./tailwind.config.cjs";` plus `@source "./index.html"; @source "./src/**/*.{ts,tsx}";`. This ensures the v4 plugin sees all JSX/TSX files when emitting utilities.
- `tailwind.config.cjs` extends theme tokens to map Tailwind colors/radii/shadows to the CSS variables from `index.css`, so classes like `bg-base`, `text-text`, `bg-surface`, `shadow-panel`, etc., resolve to real styles in the compiled CSS.
- `tailwind.config.cjs` now defines explicit `fontSize` entries (sm/base/lg/xl/2xl/3xl/4xl/5xl) to ensure text size utilities (e.g., `text-lg`, `text-xl`) are emitted.
- Runtime check: Dist builds produced before adding `@source` (and explicit font sizes) were missing theme utilities (`bg-primary`, `text-text`, `text-lg`, etc.). After adding `@source`, defining font sizes, and rebuilding with Node 20+, the emitted CSS includes the expected utilities.

## Adding or updating tokens
1) Add or adjust the CSS variable in `src/index.css` under `:root` (e.g., `--color-accent`).
2) Map it in `tailwind.config.cjs` under `theme.extend.colors` (or `borderRadius`, `boxShadow`, etc.) using the `rgb(var(--color-*) / <alpha-value>)` pattern.
3) Use the generated utility classes (e.g., `bg-accent`, `text-accent`) in JSX. They will be emitted because the content globs include all source files.

## Verifying utilities
- After running the build/dev server (Node 20+ required by Vite), you should see computed styles for custom utilities such as `bg-base`, `text-text`, `shadow-panel`, and the Button/Card classes. If a class renders without styles, ensure it is covered by the content globs and mapped in `tailwind.config.cjs`.
- Dist verification: open `dist/assets/index-*.css` and search for the utilities you rely on (e.g., `bg-primary`, `text-lg`, `rounded-panel`, `shadow-panel`). If they are missing, verify that `@source` covers your files and rebuild under a supported Node version (>=20.19).

## Spacing rules
- Default page padding: `PageContainer` uses the `roomy` preset (`px-8 sm:px-12` and `py-12 sm:py-14`) so content never touches screen edges on tablet/kiosk layouts. Stick with `roomy` for public-facing flows unless a screen must go edge-to-edge.
- Card padding: `Card` density `spacious` now provides generous internal padding (`p-10 sm:p-12`) to keep text and controls well off the borders. Use `spacious` for public/kiosk surfaces; `cozy` is reserved for denser admin tables/forms.
- Section spacing: use the shared stack utilities defined in `index.css` instead of ad-hoc gaps. `stack-page` creates primary vertical rhythm between page sections (2.5rem, then 3rem on sm+), `stack-section` spaces text blocks (1rem → 1.25rem), and `stack-actions` separates stacked buttons (1.25rem → 1.5rem).
- Button group spacing: when stacking primary actions, wrap them in a `stack-actions` container to ensure clear separation without relying on color.
- Dividers: use the `section-divider` helper (1px border with 1.5rem top padding, 1.75rem on sm+) to separate supporting/admin controls from primary flows while preserving breathing room.
- Apply these spacing helpers consistently across pages; avoid embedding raw spacing utilities in individual screens so padding/spacing stays uniform and kiosk-friendly.

## Form layout rules (public)
- Form shell: wrap public-facing forms in `form-shell` to establish base vertical rhythm (1.75rem gaps) and avoid ad-hoc spacing.
- Form shell padding: `form-shell` includes 0.75rem inner padding to keep controls slightly inset from the card edges while maintaining spacious card padding.
- Field stacks: use `field-stack` for each labeled input/select group; it spaces label, control, and support text evenly (0.75rem gaps) and keeps content off card edges.
- Control sizing: inputs/selects share the `form-control` style—full width, 60px min-height, 14px x 16px padding, rounded control radius, and 1.125rem text for kiosk readability. Add `form-control--error` when showing errors to align borders and focus rings.
- Labels and support text: `field-label` (1rem, semibold) sits above controls; `field-support` reserves space for hints/errors (min-height 1.25rem) and uses `field-error` for danger coloring. This prevents layout jump when validation appears.
- Actions: place primary form actions beneath fields inside the `form-shell` rhythm. For stacked actions, continue to use `stack-actions` or `form-actions` wrappers to maintain clear separation.
- Use `Card` with `density="spacious"` for public forms so internal padding stays consistent; combine with `PageHeader` and `PageContainer` to avoid edge-to-edge content.

## Selection layout rules (public)
- Use `selection-grid` to lay out option tiles with comfortable gaps (1rem → 1.25rem on sm+) and auto-fit columns (min 180px) so options don’t crowd on wider screens.
- Option tiles: apply `selection-tile` for card-like touch targets (min-height 150px, panel radius, generous padding, 1.75rem label) and `selection-tile--selected` for a clear selected state (strong border, soft ring, slight lift, alt surface). This avoids relying solely on color.
- Support text: place validation or helper text under the grid using `field-support`/`field-error` to reserve space and prevent layout jumps.
- Actions: separate the primary button from the options with `selection-actions` (adds top margin) and optionally `stack-actions` when stacking buttons, keeping the call to action visually distinct.
- Always wrap selection screens in `Card` with `density="spacious"` inside `PageContainer`/`PageHeader` to avoid edge-to-edge content and to match kiosk spacing standards.

## Pickup method selection (kiosk)
- Structure the screen with `PageHeader` plus a `Card` (tone `muted`, density `spacious`) centered in `PageContainer`/`PublicLayout`; cap width around 4xl so the two pickup options remain the focus.
- Place the pickup methods inside a `selection-grid`; each uses `selection-tile` with a concise method label (`text-2xl`/semibold) and a short helper line (`text-base text-text-muted`) to explain what will happen. Keep tiles free of icons or secondary buttons.
- Tiles are single-tap actions; do not add confirm buttons. Keep any supporting action (e.g., "Start over") below the grid using `selection-actions` + `stack-actions` so it never competes with the primary choices.
- Maintain calm spacing by wrapping the body in `stack-page` and the card contents in `stack-section`; this preserves the approved vertical rhythm and works in both portrait and landscape kiosk orientations.

## Secure code entry (public)
- Use `PageHeader` above a muted, spacious `Card` centered in `PageContainer` to keep inputs off the edges; cap width near 3xl for focused reading.
- Wrap the form in `form-shell` and group inputs with `stack-section` so labels, helpers, and fields stay separated and do not crowd the card padding.
- Make the primary code input visually dominant with a centered, large text style (e.g., `text-3xl font-semibold tracking-[0.24em] leading-tight`) and numeric input mode/OTP autocomplete to support kiosk keyboards.
- Reserve error space with `field-support`/`field-error` built into `Input`; do not add ad-hoc margins when errors appear.
- Place a single primary CTA beneath the inputs inside `stack-actions`; any supporting/secondary action should sit in a `section-divider` + `stack-actions` block to stay visually secondary.

## Phone identification (public)
- Mirror the secure input shell: `PageHeader` + muted `Card` (spacious) centered in `PageContainer`, capped around 3xl to keep focus on the phone field.
- Use `form-shell` with `stack-section` to separate helper text, phone input, and reserved error space; keep inputs off the edges and avoid dense stacking.
- Make the phone field touch-friendly and readable with larger centered text (e.g., `text-2xl font-semibold tracking-[0.12em]`), `inputMode="tel"`, and `autoComplete="tel"` to align the kiosk keyboard.
- Present helper copy above the input to explain how the number is used (e.g., sending an OTP). Keep it concise and low-emphasis (`text-text-muted`).
- Surface validation or API errors via `field-support`/`field-error` below the input so the layout doesn't jump.
- Keep a single primary CTA in a `stack-actions` block beneath the inputs; any optional supporting action belongs in a `section-divider` + `stack-actions` block to remain visually secondary.

## OTP verification (public)
- Follow the same shell as other secure steps: `PageHeader` plus a muted, spacious `Card` centered in `PageContainer`, capped near 3xl to keep the OTP field dominant.
- Use `form-shell` with `stack-section` to separate helper text, the OTP input, and reserved hint/error space. Keep text centered for quick scan at kiosk distance.
- Make the OTP input the hero element: centered large type such as `text-3xl font-semibold tracking-[0.24em] leading-tight`, `inputMode="numeric"`, and `autoComplete="one-time-code"` to surface numeric keyboards.
- Reserve a `field-support` line beneath the input for API/validation errors or resend hints; avoid ad-hoc margins so spacing stays stable when messages appear.
- Place a single primary CTA in `stack-actions` below the input. Keep any supporting actions (e.g., resend, start over) in a `section-divider` with `stack-actions` so they remain secondary and do not compete with the OTP field.

## List selection (public)
- Structure list picks with `PageHeader` and a muted, spacious `Card` centered in `PageContainer`; cap width near 4xl for readability on kiosks.
- Use `stack-section` inside the card to space helper text, list content, and feedback blocks; keep loading/empty states centered and calm.
- Render parcels as full-width tappable rows: `rounded-panel border border-border/70 bg-surface px-6 py-5 shadow-panel`, flexing to stack on mobile and align side-by-side on sm+.
- Make selection obvious without relying solely on color by swapping to `bg-surface-alt`, strengthening the border, and keeping focus/outline rings for keyboard users.
- Keep primary list text at least `text-xl` with semibold weight; supporting meta (e.g., expiry) at `text-base text-text-subtle`; use a pill for secondary attributes like size.
- Place a single primary CTA beneath the list in a `section-divider` + `stack-actions` block; keep refresh/back or other secondary actions in the same block but visually secondary to avoid crowding the list.

## Pickup success (public)
- Use the same shell as other public screens: `PageHeader` plus a muted, spacious `Card` centered in `PageContainer`, capped near 3xl for focused reading.
- Center the success message in a `stack-section` with a simple badge or glyph (no new icons required) and calm headline/body pairing (`text-3xl`/`text-lg`) to be readable at kiosk distance.
- Keep any supporting parcel detail in a subtle bordered panel beneath the message; use uppercase label chips and semibold code text to confirm the right parcel without crowding the hero message.
- Place a single primary end-of-flow CTA in a `section-divider` + `stack-actions` block to separate it from the message and maintain a low-density finish; avoid secondary actions.

## Language switch & i18n
- The language switcher lives inside both layouts: top-right in `PublicLayout` (touch-friendly pills) and beside the header in `AdminLayout` (compact pills). Do not add per-page switches.
- Keep the switch visible but low emphasis; use outline/primary pills within a subtle pill container (border + soft shadow) and avoid crowding primary actions.
- All user-facing text must use i18n keys from `src/i18n/translations.ts` via `useTranslation().t(...)`. Do not hardcode strings in components.
- To add copy: create a semantic key under `common`, `public.*`, or `admin.*`, provide both `th` (default) and `en` strings, then consume with `t('path.to.key')`. Use `{placeholder}` tokens for interpolated values.
- To add a new language: extend `SUPPORTED_LANGUAGES`, add translations for every existing key, and ensure `DEFAULT_LANGUAGE`/`FALLBACK_LANGUAGE` are set appropriately.
