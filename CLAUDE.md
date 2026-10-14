# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static Astro site introducing two Windows apps: 야식메뉴판 Plus (game library, `qqoro/yasig-menu-plus`) and 동인메뉴판 (comic library, `qqoro/doujin-menu`). All copy is Korean. Deployed to GitHub Pages.

## Commands

Package manager is **pnpm** (Node >= 22). There is no test suite or linter; `pnpm check` is the only automated verification.

```bash
pnpm dev       # dev server
pnpm build     # output to dist/
pnpm preview   # serve the build
pnpm check     # astro check (type check, strict tsconfig)
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml` (withastro/action → deploy-pages). A daily cron rebuild refreshes release numbers. There is no other release step.

## Architecture

**Pages.** `src/pages/index.astro` is the landing page (Hero → MenuBoard → FeatureStack → Why). `yasig-menu-plus.astro` and `doujin-menu.astro` are per-app feature pages built from `src/components/features/*` (FeatureHead, FeatureLead, FeatureGrid, FeatureChips, CrossLink). Page content (titles, body copy, screenshot imports) lives as inline data arrays in each page's frontmatter, and the landing page's `FeatureStack.astro` keeps its own separate copy of some of the same entries. Editing a feature's copy may mean editing both.

**URLs.** `astro.config.mjs` sets `build.format: 'file'` and `trailingSlash: 'never'`, so pages ship as `/yasig-menu-plus.html`. Internal links must include `.html`.

**Build-time GitHub data.** `src/lib/github.ts` `fetchRelease()` pages through the Releases API at build time for the latest non-prerelease version and the total download count across all releases. Uses `GITHUB_TOKEN` if set. On any failure it returns `null` and the UI omits the number; never substitute placeholder or fake numbers.

**Client-side navigation.** `Base.astro` uses Astro's `<ClientRouter />`. Bundled `<script>` modules execute only once per session, so anything touching page DOM must:
- set up on `astro:page-load` and tear down on `astro:before-swap` (see `src/scripts/motion.ts`, which wraps per-page GSAP work in a `gsap.context` reverted before each swap), or
- use document-level delegated listeners that re-query elements each time (see `Lightbox.astro`).

The nav logo uses `transition:persist="brand"`, so its animation is attached once, not per page.

**Motion.** `src/scripts/motion.ts` (GSAP + ScrollTrigger) is entirely skipped under `prefers-reduced-motion`; CSS must look correct without it. Elements opt in via `data-motion` attributes (`title`, `hero`, `lede`, `card`, `shot`, `logo`, `dl-icon`) and `data-count` for count-up numbers. Separately, `.reveal` elements get an `.in` class from an IntersectionObserver in `Base.astro`.

**Screenshots.** Images live in `src/assets/screenshots/` and are imported as modules. Render them through `Zoomable.astro`, which emits a downscaled webp thumbnail plus a full-resolution webp as the link target; `Lightbox.astro` animates the thumbnail into a `<dialog>` and swaps in the full image once loaded. Zoom links carry `data-astro-reload` so the router ignores them. On feature pages, `features/Shot.astro` with `img: null` renders a hatched "스크린샷 준비 중" placeholder; use that instead of fake screenshots.

**Styling.** Design tokens (oklch colors, type scale, spacing, radii, easings) are CSS custom properties in `src/styles/global.css`; components use scoped `<style>` blocks that reference only those tokens. 야식메뉴판 uses the mint `--color-accent`; 동인메뉴판 uses the warm `--color-accent-2`, toggled by a `warm` prop / `--warm` modifier class. The `Hallmark · ...` header comments record design-audit results from the Hallmark design skill; keep them in sync if a redesign changes what they describe.

**Static assets.** `public/` holds the favicon and per-page OG images (`og.png`, `og-yasig.png`, ...), passed to `Base.astro` via the `ogImage` prop.
