---
name: modus-wc-icons-setup
description: >-
  Serve Modus Icons the same way as modus-blueprint: a small modus-icons.css with
  @font-face URLs to jsDelivr (@trimble-oss/modus-icons), optional woff2 preloads in
  HTML, and a link from the app shell. Use when adding or fixing Modus Web Components
  icon fonts in vanilla HTML, Vite, React, Angular, Vue, or any stack where modus-wc-icon
  shows empty or tofu glyphs.
---

# Modus Icons — font setup (blueprint pattern, any stack)

Modus Web Components render icons with the **Modus Icons icon font**. If the font never loads, icons are missing or show wrong glyphs. This skill mirrors **modus-blueprint** (`public/modus-web-components/modus-icons.css` + `index.html` preloads) in a **framework-agnostic** way.

## Do / don’t

- **Do** add a **small CSS file** that only defines `@font-face` for **`modus-icons`**, **`modus-icons-outlined`**, and **`modus-icons-solid`**, with `src` pointing at a **stable CDN URL** for `@trimble-oss/modus-icons` (blueprint uses **jsDelivr** and pins major **`@1`** in the path).
- **Do** load that CSS from your **HTML shell** with `<link rel="stylesheet" …>` **early** in `<head>` (before or alongside other app CSS, consistent with your Modus global styles order).
- **Do** optionally **preload** the two **woff2** files (outlined + solid) in `<head>` with `crossorigin` so first paint avoids font swap flicker—same URLs as in `@font-face`.
- **Do** use **only valid Modus icon `name` values** on `modus-wc-icon` / framework wrappers—**always confirm** against **`@trimble-oss/modus-icons`** (see **Valid `name` values** below); no emoji or third-party icon fonts as substitutes.
- **Don’t** rely on copying opaque binary font paths from node_modules without a clear deploy story—serving from **jsDelivr** (or your own CDN) keeps dev/prod consistent.
- **Don’t** assume installing `@trimble-oss/moduswebcomponents` alone registers icon fonts globally; **you still need this CSS (or equivalent) in the document.**

## 1. CSS file content (canonical shape)

Keep a file such as **`public/modus-web-components/modus-icons.css`** (path is arbitrary; name is conventional):

```css
@font-face {
  font-family: 'modus-icons';
  src: url('https://cdn.jsdelivr.net/npm/@trimble-oss/modus-icons@1/dist/modus-outlined/fonts/modus-icons.woff2')
    format('woff2');
  font-style: normal;
  font-weight: normal;
}

@font-face {
  font-family: 'modus-icons-outlined';
  src: url('https://cdn.jsdelivr.net/npm/@trimble-oss/modus-icons@1/dist/modus-outlined/fonts/modus-icons.woff2')
    format('woff2');
  font-style: normal;
  font-weight: normal;
}

@font-face {
  font-family: 'modus-icons-solid';
  src: url('https://cdn.jsdelivr.net/npm/@trimble-oss/modus-icons@1/dist/modus-solid/fonts/modus-icons.woff2')
    format('woff2');
  font-style: normal;
  font-weight: normal;
}

.modus-icons-outlined {
  font-family: 'modus-icons-outlined';
  font-style: normal;
  font-weight: normal;
}

.modus-icons-solid {
  font-family: 'modus-icons-solid';
  font-style: normal;
  font-weight: normal;
}

.modus-icons {
  font-family: 'modus-icons';
  font-style: normal;
  font-weight: normal;
}
```

**Version bumps:** When you intentionally upgrade Modus Icons, update **every** `modus-icons@…` segment (and preload `href`s) to the same semver range your design system targets; avoid mixing versions.

## 2. HTML `<head>` (blueprint-style)

**Optional preloads** (same URLs as `woff2` in CSS):

```html
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@trimble-oss/modus-icons@1/dist/modus-outlined/fonts/modus-icons.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="https://cdn.jsdelivr.net/npm/@trimble-oss/modus-icons@1/dist/modus-solid/fonts/modus-icons.woff2" as="font" type="font/woff2" crossorigin />
```

**Stylesheet** — serve the file from your **static root** so the path works in dev and production:

```html
<link rel="stylesheet" href="/modus-web-components/modus-icons.css" />
```

If the app uses a **subpath** (e.g. Vite `base`), resolve the href the same way you resolve other public assets (e.g. `%BASE_URL%modus-web-components/modus-icons.css` in Vite’s `index.html`, or your framework’s `publicPath` / `assetPrefix` equivalent).

## 3. By stack (wiring only)

| Stack | Where to put the CSS file | How to link |
|--------|---------------------------|-------------|
| **Vanilla / static** | Any path served as static | `<link>` in `index.html`. |
| **Vite + React/Vue/Svelte** | `public/modus-web-components/modus-icons.css` | `<link href="/modus-web-components/modus-icons.css">` or with `base` use `%BASE_URL%…` like [index.html](../../../index.html). |
| **Angular** | `src/assets/…` or `public/` per workspace | Add `<link>` in `src/index.html`, or list the CSS in `angular.json` **`styles`** so it loads globally before component styles. |
| **Vue CLI** | `public/modus-web-components/…` | `<link>` in `public/index.html`. |
| **Next.js (App Router)** | `public/modus-web-components/…` | `<link>` in root `layout.tsx` via `<link rel="stylesheet" href={\`${basePath}/modus-web-components/modus-icons.css\`} />` or equivalent; keep **one** global entry. |
| **ASP.NET / other backends** | wwwroot / static files | Map URL to the file; one consistent URL in the layout template. |

Framework **wrappers** (`ModusWcIcon`, etc.) do not replace the need for **global** font faces—the document must still load this CSS (or duplicate `@font-face` in a global stylesheet you control).

## 4. Valid `name` values (always check `@trimble-oss/modus-icons`)

**Do not invent or “guess” icon strings** (e.g. `lightbulb` is wrong; the package ships **`lightbulb-on`** / **`lightbulb-off`**). Wrong names show empty boxes or wrong glyphs.

**Source of truth:** the **`@trimble-oss/modus-icons`** package at the **same major** you pin in jsDelivr (e.g. `modus-icons@1` in `@font-face` URLs → use **`@trimble-oss/modus-icons@1`** when checking names).

### Map package files → `name` on `modus-wc-icon`

Modus docs and Storybook use **`name`** strings with **underscores** for multi-part icons (e.g. `add_bold`, `accessibility_circle`, `bar_graph`). The npm package uses **kebab-case** file basenames and CSS class suffixes.

**Rule:** take the **`*.svg` basename** (without extension) from the package and replace **every hyphen (`-`) with an underscore (`_`)** to get the **`name`** prop.

| Package (`dist/.../svg/`) | `name` on `<modus-wc-icon>` / `ModusWcIcon` |
|---------------------------|---------------------------------------------|
| `lightbulb-on.svg` | `lightbulb_on` |
| `bar-graph.svg` | `bar_graph` |
| `accessibility-circle.svg` | `accessibility_circle` |
| `home.svg` | `home` |

Use **`dist/modus-outlined/svg/`** for **`variant="outlined"`** (or default outlined font) and **`dist/modus-solid/svg/`** for **`variant="solid"`**—an icon may exist in one set and not the other.

### How to verify (pick one)

1. **Install the package locally** (any machine):   `npm i @trimble-oss/modus-icons@1 --no-save`  
   Then list or search:  
   `ls node_modules/@trimble-oss/modus-icons/dist/modus-outlined/svg`  
   or   `rg -o 'modus-outlined-icon-[a-z0-9-]+' node_modules/@trimble-oss/modus-icons/dist/modus-outlined/css/modus-outlined-icons.css | sort -u`
2. **Visual gallery:** open **`node_modules/@trimble-oss/modus-icons/dist/modus-outlined/css/index.html`** in a browser (offline catalog).
3. **Online:** [Modus Icons](https://modus-icons.trimble.com/) — match the icon id / filename to the underscore **`name`** rule above.

After changing an icon **`name`**, confirm the glyph in the running app (not just TypeScript, which types **`name`** as `string`).

## 5. Verify font loading

- Network tab: **woff2** requests return **200** from jsDelivr (or your CDN).
- DOM: `modus-wc-icon` (or inner `i.modus-wc-icon`) computes to a **non-fallback** font when inspecting computed styles.
- CSP: if you use **Content-Security-Policy**, allow **`font-src`** (and **`style-src`** if blocking external CSS) for jsDelivr—or self-host the woff2 files and point `@font-face` at your origin.

## 6. Reference in this repo

- CSS: [public/modus-web-components/modus-icons.css](../../../public/modus-web-components/modus-icons.css)
- HTML: [index.html](../../../index.html) (preloads + stylesheet link)

For in-app mapping patterns and Modus component docs, see [modus-setup.mdc](../../rules/modus-setup.mdc) and the **modus-wc-mcp** skill.
