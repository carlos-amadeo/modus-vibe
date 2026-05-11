---
name: modus-wc-breadcrumbs
description: Wire modus-wc-breadcrumbs — IBreadcrumb[] (label, optional url), breadcrumbClick event with the IBreadcrumb in detail, size variants, integration with React Router / Next.js routing — without rolling a custom <nav> + <ol> tree of links.
---

# Modus Web Components — breadcrumbs (`modus-wc-breadcrumbs`)

Use this skill when adding **path navigation** above a page title — "Projects → Acme → Phase 1 → Tasks". Prefer **`modus-wc-breadcrumbs`** / **`ModusWcBreadcrumbs`** over a hand-rolled `<nav><ol><li><a>…</a></li></ol></nav>` or shadcn breadcrumbs. Prereqs: [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc). Confirm the API with **`get_modus_component_data`** for **`modus-wc-breadcrumbs`** at your installed **`version`** (see [**modus-wc-mcp**](../modus-wc-mcp/SKILL.md)).

## API contract (Modus 2.x, confirm with MCP)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `items` | `IBreadcrumb[]` | `[]` | Array of crumbs from root to current page. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | `sm` is the right default for page headers; reserve `md` for prominent surfaces. |
| `customClass` | `string` | `''` | |

```ts
interface IBreadcrumb {
  label: string;        // Visible text — keep short (one or two words per crumb)
  url?: string;         // Optional href; emitted in breadcrumbClick
}
```

**Event:** `breadcrumbClick` with `detail: IBreadcrumb` — the **whole crumb object** (not just the URL). The component renders crumbs that have a `url` as anchors; in SPA frameworks you typically intercept `breadcrumbClick` to call your router and prevent the native navigation.

## Minimal pattern

```tsx
const items: IBreadcrumb[] = [
  { label: "Projects", url: "/projects" },
  { label: "Acme",     url: "/projects/acme" },
  { label: "Phase 1",  url: "/projects/acme/phase-1" },
  { label: "Tasks" },                                  // last crumb = current page, no url
];

<ModusWcBreadcrumbs
  aria-label="Page path"
  size="sm"
  items={items}
  onBreadcrumbClick={(e: CustomEvent<IBreadcrumb>) => {
    if (e.detail.url) navigate(e.detail.url);
  }}
/>;
```

The **last crumb** represents the current page and conventionally has **no `url`** — that prevents users from clicking a link to the page they are already on.

## With React Router

Intercept the click and call the router, so SPA navigation runs without a full page load:

```tsx
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

<ModusWcBreadcrumbs
  aria-label="Page path"
  size="sm"
  items={items}
  onBreadcrumbClick={(e: CustomEvent<IBreadcrumb>) => {
    if (e.detail.url) {
      navigate(e.detail.url);
    }
  }}
/>;
```

Native anchor navigation will still happen if the user middle-clicks or `Cmd/Ctrl + clicks` — that's correct (open in new tab). Do not call `e.preventDefault()` from `breadcrumbClick`; the event is already a custom event, not a click event.

## With Next.js App Router

```tsx
"use client";
import { useRouter } from "next/navigation";

const router = useRouter();

<ModusWcBreadcrumbs
  aria-label="Page path"
  size="sm"
  items={items}
  onBreadcrumbClick={(e: CustomEvent<IBreadcrumb>) => {
    if (e.detail.url) router.push(e.detail.url);
  }}
/>;
```

Render this from a client boundary per [.cursor/rules/modus-nextjs.mdc](../../rules/modus-nextjs.mdc).

## Building items from the route

For dynamic routes, derive `items` from your route state rather than hard-coding it:

```tsx
const items: IBreadcrumb[] = useMemo(() => {
  const segments = location.pathname.split("/").filter(Boolean);
  const acc: IBreadcrumb[] = [];
  let path = "";
  segments.forEach((seg, i) => {
    path += `/${seg}`;
    const isLast = i === segments.length - 1;
    acc.push({
      label: titleForSegment(seg, location, params),  // your label resolver
      url: isLast ? undefined : path,
    });
  });
  return acc;
}, [location, params]);
```

`titleForSegment` should return human-readable text — segments like `acme-corp` or `f7a3` should map to "Acme Corp" / the resource name from data, not the slug.

## Density and placement

- Default **`size="sm"`** in page headers and toolbar rows.
- Place the breadcrumbs **above the page title** (or in the navbar `start` slot for very dense apps), with **one or two words per crumb**. Long crumb labels wrap awkwardly and visually compete with the page title.
- For deep paths (5+ levels), consider truncating the middle (`Projects → … → Phase 1 → Tasks`) by replacing intermediate items with a single "…" crumb that opens a `modus-wc-dropdown-menu`. Modus does not auto-collapse; you implement the truncation in app code.

## Mobile / narrow viewports

The component does not auto-hide intermediate crumbs on narrow widths. Two options:

1. **Truncate** in app code: keep only the **last two** crumbs below `md` (`items.slice(-2)`).
2. **Hide entirely**: drop the breadcrumbs below `md` and rely on the page title + back button for context.

Pick one per surface; do not let breadcrumbs wrap onto two lines as a layout default.

## Accessibility

- Set **`aria-label="Page path"`** (or your localized equivalent) — screen readers announce the breadcrumbs as a navigation landmark.
- The component uses a `<nav>` with an ordered list internally — keep that. Do not wrap the host in another `<nav>` (duplicate landmark).
- The current page (last crumb) should be plain text, not a link — leave its `url` undefined. Modus respects that distinction; do not add `aria-current="page"` to a custom child element because the component owns the markup.

## Anti-patterns

- **Hand-rolled breadcrumbs** with `<a>` + arrow `<span>` separators — no theme awareness, no consistent spacing.
- **`url`** on every crumb including the last — the user clicks the page they're on and reloads it for no reason.
- **Calling `e.preventDefault()`** in `onBreadcrumbClick` — the event is a custom event, not a click event; there is no default to prevent.
- **Rendering the page title as the last crumb only** — keep the page title as a separate `modus-wc-typography` heading; breadcrumbs are path, not title.
- **Long crumb labels** ("Projects in your organization") — keep two or three words; full names belong in the page title.
- **Wrapping breadcrumbs onto two lines** as the default — truncate or hide on narrow viewports.

## Related

- [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc) — brevity, navbar slot integration.
- [.cursor/rules/modus-typography.mdc](../../rules/modus-typography.mdc) — pairing breadcrumbs with the page title.
- [**modus-wc-dropdown-menu**](../modus-wc-dropdown-menu/SKILL.md) — overflow / collapsed-middle pattern for deep paths.
