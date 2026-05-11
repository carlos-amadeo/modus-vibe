---
name: modus-wc-chart-colors
description: >-
  Wires data-visualization colors to Modus CSS variables so charts follow
  light/dark and theme switches. Covers the analytics-dashboard pattern
  (Recharts): multi-hue palette, tooltip chrome, axes, grid, fills, pie
  slices, and Recharts 3 ResponsiveContainer sizing inside Modus cards/flex
  (initialDimension, hidden routes, dev console warnings). For Angular +
  Chart.js, documents the window CustomEvent bridge from (themeChange); use
  when adding or fixing charts, dashboards, Recharts/Chart.js styling, or when
  the user wants theme-aligned analytics colors without hard-coded hex.
---

# Modus dynamic colors for charts

## Goal

Charts should use **Modus design tokens** (`var(--modus-wc-color-…)`) for every painted surface—series colors, axes, grid, tooltips, and pie separators—so they track **`data-theme` / mode** the same way as the rest of the app. Do not rely on default library palettes or static hex.

## Canonical reference (modus-blueprint)

Copy the approach from the analytics dashboard preview:

- **`src/components/template-data/DashboardAnalyticsPreview.tsx`** — full Recharts dashboard (bars, lines, areas, pies, dual series, stacked areas).
- **`src/components/template-data/WidgetsDashboardSample.tsx`** — same palette + tooltip object reused in widget charts.

**Tailwind theme (this repo):** [`src/styles/globals.css`](../../src/styles/globals.css) **`@theme inline`** defines **`--color-chart-1`…`--color-chart-5`** mapped to Modus semantic colors (primary, warning, success, error, info). Prefer **`var(--modus-wc-color-*)`** in Recharts props as below, or theme-backed utilities where your stack exposes them—keep one source of truth with that file.

## 1. Multi-series / pie palette

Define a small ordered palette that cycles for categories (pie `Cell`, grouped bars, etc.):

```ts
const CHART_COLORS = [
  "var(--modus-wc-color-primary)",
  "var(--modus-wc-color-warning)",
  "var(--modus-wc-color-success)",
  "var(--modus-wc-color-error)",
  "var(--modus-wc-color-secondary)",
];
```

Use `CHART_COLORS[i % CHART_COLORS.length]` per slice or category. Keep **semantic meaning** in mind when a series has a fixed meaning (e.g. “growth” → success); use the palette mainly for **categorical** breakdowns.

## 2. Tooltip (Recharts)

Spread a shared object on `<Tooltip />` so the popover matches card/chrome surfaces:

```ts
const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "var(--modus-wc-color-base-100)",
    border: "1px solid var(--modus-wc-color-base-200)",
    borderRadius: "var(--radius-button, 8px)",
    color: "var(--modus-wc-color-base-content)",
    padding: "8px 12px",
  },
  itemStyle: { color: "var(--modus-wc-color-base-content)" },
  labelStyle: { color: "var(--modus-wc-color-base-content)" },
  cursor: { fill: "var(--modus-wc-color-base-200)" },
};
```

Use as `<Tooltip {...CHART_TOOLTIP_STYLE} formatter={…} />`.

## 3. Axes and grid

- **Grid:** `stroke="var(--modus-wc-color-base-200)"` on `CartesianGrid` (keep `strokeDasharray="3 3"` if that matches product).
- **Axis lines / ticks:** `stroke="var(--modus-wc-color-base-content-low-contrast)"` on `XAxis` and `YAxis`.
- **Tick labels:** small font via `tick={{ fontSize: 11 }}` (or as design requires).

## 4. Series styling (bars, lines, areas)

- **Primary metric:** `fill` / `stroke` → `var(--modus-wc-color-primary)` (bars, main line, primary area).
- **Second series (contrast):** often `var(--modus-wc-color-warning)` or `var(--modus-wc-color-success)` depending on meaning.
- **Comparison / target / neutral band:** `var(--modus-wc-color-base-200)` with controlled `fillOpacity`; stroke can be `var(--modus-wc-color-base-content-low-contrast)`.
- **Dots on lines:** `dot={{ fill: "var(--modus-wc-color-base-100)" }}` so markers sit on the card surface color.
- **Pie slice separators:** `stroke="var(--modus-wc-color-base-100)"` on `<Pie />` so slices divide cleanly against the card.

Use `fillOpacity` / `strokeWidth` as in the analytics preview when layering areas or emphasizing a line.

## 4b. Recharts 3 — `ResponsiveContainer` sizing (Modus cards, flex shells, tabs)

Without this, devtools often show:

`The width(-1) and height(-1) of chart should be greater than 0…`

### Why it happens

- **Default `initialDimension`:** Recharts **3.x** initializes internal size state to **`{ width: -1, height: -1 }`**. That value is intentional “unmeasured”; the library **`warn`s on the first render** before `ResizeObserver` (or `getBoundingClientRect` in `useEffect`) applies real dimensions. One chart ⇒ at least one scary log per mount unless you seed a positive size.
- **`height: 100%` needs a definite parent:** Inside **`modus-wc-card`** bodies, **flex columns**, or **grid children**, a plain Tailwind **`h-56`** / **`h-64`** wrapper can still race layout or sit in a chain where **percentage height** does not resolve on frame zero. Prefer a **pixel `height` on the chart’s immediate wrapper** (e.g. `style={{ height: 224 }}` for `h-56`) so `%` height inside `ResponsiveContainer` always has a defined containing block.
- **`display: none`:** Do **not** leave **`ResponsiveContainer` mounted under an ancestor with `hidden` (HTML attribute)** or **`display: none`** when switching “tabs” or views—measurement stays **0×0** and warnings (or broken charts) persist. **Unmount** the chart tree when the view is inactive, or use **visibility** / off-screen layout only if you must keep state and can still give the chart a non-zero box (generally **prefer unmount** for analytics pages at **`<main>`** level; the **slotted-host `hidden` pattern** is for **Modus** components, not for Recharts).

### Required pattern (greenfield)

Wrap each chart in a small helper or consistent props:

1. **Outer div:** `className="min-h-0 w-full min-w-0"`, **`style={{ height: heightPx }}`** with **`heightPx` a number** (e.g. `224` for former `h-56`, `256` for `h-64`).
2. **`ResponsiveContainer`:** `width="100%"` `height="100%"` **`initialDimension={{ width: initialWidthPx, height: heightPx }}`** with **`initialWidthPx`** a modest positive guess (e.g. `480`)—replaced immediately by `ResizeObserver`; purpose is to **avoid the -1 dev warning** and a blank first frame.
3. **`minWidth={0}`** and **`minHeight={heightPx}`** on **`ResponsiveContainer`** — matches Recharts’ own flexbox guidance (`minWidth` defaults to `0` in the library; be explicit when copying snippets).
4. Optionally **`debounce={0}`** during shell debugging so resize feedback is immediate.

Example:

```tsx
<div className="min-h-0 w-full min-w-0" style={{ height: 224 }}>
  <ResponsiveContainer
    width="100%"
    height="100%"
    initialDimension={{ width: 480, height: 224 }}
    minWidth={0}
    minHeight={224}
  >
    <BarChart data={data}>{/* … */}</BarChart>
  </ResponsiveContainer>
</div>
```

### Checklist (sizing)

- [ ] No raw `ResponsiveContainer` with only `width="100%" height="100%"` and default **`initialDimension`** in Modus dashboard scaffolds—expect **-1** warnings.
- [ ] Chart wrapper has **pixel height**, not only Tailwind height class, when inside **cards / flex**.
- [ ] **`min-w-0`** on flex/grid ancestors of the chart block (see [modus-layout.mdc](../../rules/modus-layout.mdc)).
- [ ] Route or tab swaps: charts are **not** mounted under **`hidden`** / **`display: none`** for the active sizing pass.

## 5. Prerequisites

- Load **`modus-wc-styles.css`** before app CSS so tokens exist on `:root` / theme (see **modus-essentials** and [modus-setup.mdc](../../rules/modus-setup.mdc) for shell patterns).
- Keep **`html`** theme attributes and **`ModusWcThemeProvider`** (React) in sync so token values update when the user switches theme.

## 6. Other chart libraries

- **SVG-based (Recharts, Victory, Nivo SVG):** pass `var(--modus-wc-color-…)` strings like above; the browser resolves them when painting.
- **Canvas (Chart.js, ECharts canvas, etc.):** the library must receive a **parseable** color string (`rgb()`, `rgba()`, hex). Do **not** assume `getComputedStyle(document.documentElement).getPropertyValue('--modus-wc-color-…')` is good enough.
  - Modus sets many tokens with **`light-dark(…)`** and nested **`var()`** chains. A theme may **override** `--modus-wc-color-primary` to a flatter `var(…)` while **warning / success / error / secondary** still resolve through `light-dark(…)`. In that case, `getPropertyValue` can return a **string Chart.js (and some parsers) do not understand**, which often shows as **black** fills.
  - **Reliable pattern:** force resolution through a real color property, then read the **used** `rgb()` / `rgba()` value (reuse one off-screen `div` for performance):

    ```ts
    let colorProbe: HTMLDivElement | null = null;

    function colorFromVar(name: string): string {
      // name is e.g. '--modus-wc-color-warning'
      if (!colorProbe) {
        colorProbe = document.createElement('div');
        colorProbe.setAttribute('aria-hidden', 'true');
        colorProbe.style.cssText =
          'position:absolute;left:0;top:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none;';
        document.body.appendChild(colorProbe);
      }
      colorProbe.style.color = `var(${name})`;
      void colorProbe.offsetHeight; // help some engines refresh used color after theme flip
      return getComputedStyle(colorProbe).color; // e.g. "rgb(1, 2, 3)"
    }
    ```

  - Use the same idea for any canvas prop that should track tokens (pale fills, tooltips, legend label colors, grid, ticks). Re-run (or `chart.update()`) after the **resolved** theme is visible in the cascade.
  - After assigning **`colorProbe.style.color = \`var(${name})\``**, force a layout read (**`void colorProbe.offsetHeight`**) before **`getComputedStyle(colorProbe).color`** if the browser returns stale values after a theme flip; optionally **`void document.documentElement.offsetHeight`** once before batch-reading the palette.
- **Angular (Chart.js / canvas):** do **not** rely on **`MutationObserver`** and/or **`document.addEventListener('themeChange')`** alone—Stencil + Angular timing often skips updates. Use an **app-level `window` `CustomEvent`** dispatched from the same **`(themeChange)`** handler that already wraps **`modus-wc-theme-switcher`** (e.g. root **`AppComponent`**), and **`window.addEventListener` / `removeEventListener`** in chart **`ngAfterViewInit` / `ngOnDestroy`**. Full contract, checklist, and **`colorFromVar`** usage: [modus-angular.mdc](../../rules/modus-angular.mdc) → **Theme + canvas charts (Chart.js)**.
- **Non-Angular stacks:** **`MutationObserver`** on **`document.documentElement`** for **`data-theme` / `data-mode` / `class`**, plus **`matchMedia('(prefers-color-scheme: dark)')`** **`change`** when **`data-mode`** is **`system`**, remain reasonable **secondary** hooks if you also have a definitive app signal.
- **getPropertyValue on `documentElement` (optional / legacy):** only when you know the variable resolves to a bare hex (or a single resolvable `var` chain) and the chart accepts it. Prefer **`colorFromVar` above** for Chart.js to avoid spurious all-black series.

## Checklist

- [ ] **Recharts 3:** `ResponsiveContainer` uses **positive `initialDimension`**, **pixel wrapper height**, **`minWidth={0}`**, and **`minHeight`** matching wrapper—no **-1** sizing warnings; charts not under **`hidden`** for inactive views (see **§4b**).
- [ ] No hard-coded hex in chart props for theme-bound UI.
- [ ] Grid and axes use **base-200** / **base-content-low-contrast**.
- [ ] Tooltip uses **base-100** / **base-200** / **base-content**.
- [ ] Categorical charts use **CHART_COLORS** (or equivalent) cycling the five semantic hues.
- [ ] Pie strokes use **base-100**; line dots use **base-100** where the preview does.
- [ ] **Chart.js / canvas:** palette and fills use **resolved** colors (`colorFromVar` or equivalent), not raw `getPropertyValue` on `light-dark` tokens, and charts refresh on **theme** changes (**Angular:** use the **`window` `CustomEvent`** bridge from **`(themeChange)`** — see **§6** and [modus-angular.mdc](../../rules/modus-angular.mdc) → **Theme + canvas charts (Chart.js)**).
