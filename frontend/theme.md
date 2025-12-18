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
