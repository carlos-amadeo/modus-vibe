---
version: alpha
name: Modus Web Components (Trimble) — multi-theme
description: Design tokens for @trimble-oss/moduswebcomponents with explicit light and dark palettes (modus-modern-light / modus-modern-dark from modus-wc-styles.css); use var(--modus-wc-*) in app code. DESIGN.md layout aliases (background, surface, on_*) duplicate Modus base_* for tools that expect standard layout slots.
themes:
  light:
    colors:
      primary: "#0063A3"
      primary_content: "#FFFFFF"
      secondary: "#FBAD26"
      secondary_content: "#000000"
      secondary_pale: "#FFF5E4"
      accent: "#6A6E79"
      accent_content: "#FFFFFF"
      neutral: "#F1F1F6"
      neutral_content: "#171C1E"
      neutral_pale: "#F1F1F6"
      background: "#FFFFFF"
      surface: "#F1F1F6"
      on_background: "#171C1E"
      on_surface: "#171C1E"
      base_page: "#FFFFFF"
      base_100: "#F1F1F6"
      base_200: "#E0E1E9"
      base_300: "#CBCDD6"
      base_content: "#171C1E"
      base_content_low: "#464B52"
      info: "#0E416C"
      success: "#1E8A44"
      warning: "#E49325"
      error: "#DA212C"
  dark:
    colors:
      primary: "#019AEB"
      primary_content: "#000000"
      secondary: "#FEC157"
      secondary_content: "#000000"
      secondary_pale: "#FFF5E4"
      accent: "#90939F"
      accent_content: "#000000"
      neutral: "#252A2E"
      neutral_content: "#CBCDD6"
      neutral_pale: "#252A2E"
      background: "#000000"
      surface: "#252A2E"
      on_background: "#CBCDD6"
      on_surface: "#CBCDD6"
      base_page: "#000000"
      base_100: "#252A2E"
      base_200: "#353A40"
      base_300: "#171C1E"
      base_content: "#CBCDD6"
      base_content_low: "#A3A6B1"
      info: "#217CBB"
      success: "#4EA646"
      warning: "#FEC157"
      error: "#E86363"
# Flat colors mirror themes.light — required by @google/design.md for {colors.*} in components.
colors:
  primary: "#0063A3"
  primary_content: "#FFFFFF"
  secondary: "#FBAD26"
  secondary_content: "#000000"
  secondary_pale: "#FFF5E4"
  accent: "#6A6E79"
  accent_content: "#FFFFFF"
  neutral: "#F1F1F6"
  neutral_content: "#171C1E"
  neutral_pale: "#F1F1F6"
  background: "#FFFFFF"
  surface: "#F1F1F6"
  on_background: "#171C1E"
  on_surface: "#171C1E"
  base_page: "#FFFFFF"
  base_100: "#F1F1F6"
  base_200: "#E0E1E9"
  base_300: "#CBCDD6"
  base_content: "#171C1E"
  base_content_low: "#464B52"
  info: "#0E416C"
  success: "#1E8A44"
  warning: "#E49325"
  error: "#DA212C"
typography:
  body:
    fontFamily: Open Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  title_card:
    fontFamily: Open Sans
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: 2px
  md: 4px
  lg: 8px
  xl: 12px
  "2xl": 16px
  "3xl": 24px
  pill: 1000px
  box: 16px
  input: 8px
  btn: 8px
spacing:
  2xs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
components:
  # modus-wc-card: no border — Modus default bordered="false"; CSS equivalent border: none / border-width: 0.
  # backgroundColor uses Modus base-100; same hex as layout token `surface` (DESIGN.md layout slot).
  modus-wc-card:
    rounded: 16px
    backgroundColor: "{colors.base_100}"
    textColor: "{colors.on_surface}"
  modus-wc-button:
    rounded: 8px
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary_content}"
  layout-app-canvas:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on_background}"
  layout-elevated-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on_surface}"
  layout-modus-page:
    backgroundColor: "{colors.base_page}"
    textColor: "{colors.on_background}"
  modus-wc-navbar:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on_background}"
  modus-wc-divider:
    backgroundColor: "{colors.base_200}"
  modus-wc-input:
    backgroundColor: "{colors.base_300}"
    textColor: "{colors.base_content_low}"
  modus-wc-message:
    backgroundColor: "{colors.info}"
    textColor: "{colors.primary_content}"
  modus-wc-badge-success:
    backgroundColor: "{colors.success}"
  modus-wc-badge-warning:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.base_content}"
  modus-wc-badge-error:
    backgroundColor: "{colors.error}"
    textColor: "{colors.primary_content}"
  modus-wc-chip-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary_content}"
  modus-wc-chip-secondary-subtle:
    backgroundColor: "{colors.secondary_pale}"
    textColor: "{colors.secondary_content}"
  modus-wc-chip-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent_content}"
  modus-wc-toolbar:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.neutral_content}"
  modus-wc-alert-neutral:
    backgroundColor: "{colors.neutral_pale}"
    textColor: "{colors.neutral_content}"
---

# Modus Web Components — design spec (multi-theme)

## Overview

Modus is Trimble’s design system for product UI delivered as Web Components. Adopt `@trimble-oss/moduswebcomponents` (and the matching framework wrapper) as the primary UI layer.

Trimble Modus design tokens for apps using `@trimble-oss/moduswebcomponents`. **Implementation** uses CSS custom properties from `modus-wc-styles.css` on `<html data-theme="modus-modern-light" | "modus-modern-dark" | …>` with resolved light/dark mode. The YAML **`themes.light`** / **`themes.dark`** blocks are **reference hex** for **`modus-modern-light`** and **`modus-modern-dark`** (re-verify after upgrading `@trimble-oss/moduswebcomponents`). **Secondary** is the Trimble yellow pair (`--modus-wc-color-secondary`); **tertiary-style** UI uses **`accent`** (`--modus-wc-color-accent`, gray ramp); **neutral** follows base surfaces (`--modus-wc-color-neutral` ↔ `base-100` in package CSS).

### Structure by theme

Use nested **`themes`** with **`light`** and **`dark`** each carrying a **`colors`** map (see the file’s YAML frontmatter). Shared scales (**`typography`**, **`rounded`**, **`spacing`**) stay at the top level next to **`themes`**.

## Colors

Semantic tokens (`--modus-wc-color-*`) in `modus-wc-styles.css` are the source of truth and change with **`data-theme`**. Use `var(--modus-wc-color-…)` in CSS or documented component props.

| Role | Typical tokens |
|------|----------------|
| Page / canvas | `--modus-wc-color-base-page` |
| Surfaces | `--modus-wc-color-base-100`, `--modus-wc-color-base-200`, `--modus-wc-color-base-300` |
| Text | `--modus-wc-color-base-content`, `--modus-wc-color-base-content-low-contrast` |
| Brand / actions | `--modus-wc-color-primary`, `--modus-wc-color-primary-content` |
| Secondary (Trimble yellow) | `--modus-wc-color-secondary`, `--modus-wc-color-secondary-content`, `--modus-wc-color-secondary-pale` |
| Tertiary / subdued (Modus **accent**) | `--modus-wc-color-accent`, `--modus-wc-color-accent-content` |
| Neutral chrome | `--modus-wc-color-neutral`, `--modus-wc-color-neutral-content`, `--modus-wc-color-neutral-pale` |
| Status | `--modus-wc-color-info`, `--modus-wc-color-success`, `--modus-wc-color-warning`, `--modus-wc-color-error` |

### DESIGN.md layout aliases → Modus

**DESIGN.md layout slots** (common agent / generator expectations) map 1:1 to Modus **`base_*`** — duplicate hex entries in frontmatter so **`{colors.background}`** / **`{colors.surface}`** resolve while **`modus-wc-card`** keeps **`{colors.base_100}`** as the explicit Modus surface token.

| DESIGN.md alias | Same hex as | Modus token |
|-----------------|-------------|-------------|
| `background` | `base_page` | `--modus-wc-color-base-page` |
| `surface` | `base_100` | `--modus-wc-color-base-100` |
| `on_background` | `base_content` | `--modus-wc-color-base-content` |
| `on_surface` | `base_content` | `--modus-wc-color-base-content` |

### YAML color keys → Modus

| YAML key | Modus token |
|----------|-------------|
| `primary` | `--modus-wc-color-primary` |
| `primary_content` | `--modus-wc-color-primary-content` |
| `secondary` | `--modus-wc-color-secondary` |
| `secondary_content` | `--modus-wc-color-secondary-content` |
| `secondary_pale` | `--modus-wc-color-secondary-pale` |
| `accent` | `--modus-wc-color-accent` (tertiary / subdued UI in Modus) |
| `accent_content` | `--modus-wc-color-accent-content` |
| `neutral` | `--modus-wc-color-neutral` |
| `neutral_content` | `--modus-wc-color-neutral-content` |
| `neutral_pale` | `--modus-wc-color-neutral-pale` |
| `base_page` | `--modus-wc-color-base-page` |
| `base_100` | `--modus-wc-color-base-100` |
| `base_200` | `--modus-wc-color-base-200` |
| `base_300` | `--modus-wc-color-base-300` |
| `base_content` | `--modus-wc-color-base-content` |
| `base_content_low` | `--modus-wc-color-base-content-low-contrast` |
| `info` | `--modus-wc-color-info` |
| `success` | `--modus-wc-color-success` |
| `warning` | `--modus-wc-color-warning` |
| `error` | `--modus-wc-color-error` |

## Typography

- **Family:** `--modus-wc-font-family` (Open Sans stack in package CSS).
- **Scale:** `--modus-wc-font-size-2xs` through `--modus-wc-font-size-4xl`; weights from `--modus-wc-font-weight-light` to `--modus-wc-font-weight-bold`.
- **Components:** Prefer `modus-wc-typography` / `ModusWcTypography` with correct hierarchy and size/weight.

## Layout

- **Spacing:** `--modus-wc-spacing-2xs` through `--modus-wc-spacing-3xl`.
- **Breakpoints:** Tailwind-style `sm` / `md` / `lg` / `xl` / `2xl` (640 / 768 / 1024 / 1280 / 1536 px).

## Elevation & Depth

Use token-driven app-level shadows (e.g. blueprint `--app-elevation-sm` / `--app-elevation-md`) rather than fixed-color box-shadow values that ignore theme.

## Shapes

Border radii below are **pixel values** only — the same numbers as the YAML **`rounded`** map in frontmatter and as resolved from `modus-wc-styles.css` for **`modus-modern-*`** themes. (In application CSS, wire radius through **`var(--modus-wc-border-radius-…)`** so theme changes stay correct.)

### Scale (px)

| Step | Radius |
|:--|:--|
| **sm** | 2px |
| **md** | 4px |
| **lg** | 8px |
| **xl** | 12px |
| **2xl** | 16px |
| **3xl** | 24px |
| **pill** | 1000px |

### Semantic roles (px)

| Role | Radius | YAML `rounded` key (frontmatter) |
|:--|:--|:--|
| Badge | 4px | — (maps to **md** in package CSS) |
| Button | 8px | **btn** |
| Card / table | 16px | **box** |
| Chip / tab | 8px | — (maps to **lg** in package CSS) |
| Input | 8px | **input** |
| Alert | 4px | — (maps to **md** in package CSS) |

**Implementation:** use **`var(--modus-wc-border-radius-sm)`** … **`3xl`** and semantic **`--modus-wc-border-radius-btn`**, **`--modus-wc-border-radius-box`**, **`--modus-wc-border-radius-input`**, etc., in application stylesheets so **`data-theme`** stays authoritative.

## Components

### Frontmatter and token usage

The **`components`** block uses **`{colors.*}`** so **`@google/design.md` lint** can resolve references; those entries **match `themes.light.colors`** (default / `modus-modern-light`). At runtime, Modus resolves the same logical roles from **`data-theme`** and **`color-scheme`** — use **`var(--modus-wc-color-…)`** (or documented component props), not hard-coded YAML hex.

**Layout slots:** **`layout-app-canvas`** and **`layout-elevated-surface`** use **`background` / `on_background`** and **`surface` / `on_surface`** for consumers that expect MATERIAL/DESIGN.md-style names. **`layout-modus-page`** keeps **`base_page`** explicit. **`modus-wc-navbar`** uses **`background`** / **`on_background`** (same as **`base_page`** / **`base_content`**). **`modus-wc-card`** keeps **`base_100`** for the fill (prioritized Modus mapping) and **`on_surface`** for body text (same hex as **`base_content`**).

**Border radii in `components`:** **`modus-wc-card`** and **`modus-wc-button`** use **`16px`** and **`8px`**, matching the **`rounded`** scale in frontmatter and the **## Shapes** px tables. In shipped CSS, Modus still exposes these steps as **`--modus-wc-border-radius-*`** — use those variables in app code so upgrades stay aligned; **`DESIGN.md`** records the **numeric px** contract in **Shapes** and **`rounded`**.

### `modus-wc-card`

| Property | Value |
|----------|-------|
| **`border`** | **`none`** — use **`border-width: 0`** in scoped CSS if needed; on the Modus host prefer **`bordered={false}`** (default). |

The frontmatter **`components.modus-wc-card`** entry uses **`base_100`** for the fill (same hex as **`surface`**) and **`on_surface`** for text; **`@google/design.md`** does not accept a **`borderWidth`** sub-token yet, so borderless chrome is recorded here and in the YAML comment on that block.

Catalog: Modus Web Components (`modus-wc-theme-provider`, `modus-wc-navbar`, `modus-wc-side-navigation`, `modus-wc-card`, `modus-wc-button`, inputs, table, modal, tabs). Charts should resolve colors from `--modus-wc-color-*` variables.

## Do's and Don'ts

**Do:** Load `modus-wc-styles.css` before app utilities; use documented custom events; use `customClass` and tokens before shadow piercing; meet WCAG 2.1 AA.

**Don't:** Mix parallel component libraries with Modus in the same shell; rely on `useEffect` alone for first-paint theme; conditionally unmount slotted Modus children without mitigations for React + named slots.

## Validation

From the repository root (after `npm install` so `@google/design.md` resolves):

```bash
npx @google/design.md lint DESIGN.md
npx @google/design.md lint --format json DESIGN.md
cat DESIGN.md | npx @google/design.md lint -
```

If the third line errors with **Missing required positional argument: FILE**, the `-` token did not reach the linter (common when stdin is a pipe). Use the same stdin with an explicit path: `cat DESIGN.md | npx @google/design.md lint /dev/stdin`.

**npm** (same checks): `npm run lint:design-md`, `npm run lint:design-md:json`, `npm run lint:design-md:pipe` (pipe + `/dev/stdin`), `npm run lint:design-md:stdin` (`lint /dev/stdin < DESIGN.md`).

After editing this file, run **`npm run generate:modus-ai-setup`** so `public/modus-ai-setup` and IDE variants pick up the changes.
