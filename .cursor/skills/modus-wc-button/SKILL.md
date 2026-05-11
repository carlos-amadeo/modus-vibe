---
name: modus-wc-button
description: >-
  Modus Web Components button patterns: paired horizontal rows (quiet / outlined tertiary left,
  filled primary right in LTR), de-emphasis defaults (`color="tertiary"` with outlined / borderless,
  not `secondary` for "second button"), primary (`filled` + `primary`) with leading `modus-wc-icon`,
  and icon-only controls (`shape="square"`, `aria-label`). Use when adding or reviewing heroes,
  modal footers, page headers, card actions, toolbars, and dense UI. In Modus Modern,
  `color="secondary"` is a semantic brand role (often warm / gold-adjacent), not neutral quiet chrome.
---

# Modus `modus-wc-button` — color, primary CTA, icon-only

In **Modus Modern**, the **`color`** prop on **`modus-wc-button`** / **`ModusWcButton`** is a **semantic role**, not a visual rank. **`secondary`** is its own brand color (often a warm / gold-adjacent fill), **not** a neutral fallback for "any button that is not primary." Defaulting de-emphasized chrome to **`color="secondary"`** spreads that semantic across the app and reads as a parade of warm pills next to the one filled-primary action.

The right de-emphasis default for low-emphasis buttons is **`color="tertiary"`** with **`variant="outlined"`** or **`variant="borderless"`** — this stays neutral against page chrome and reserves **`color="primary"`** for the one filled emphasis per section.

## Primary (`filled` + `primary`) and icons

The **section or page primary** (**`variant="filled"`** + **`color="primary"`**) should normally include a **leading `modus-wc-icon`** before the label, chosen for the **verb or object** (**Export** → **`export`**, **Download** → **`download`**, etc.). Use **`decorative`** when the label already states the action. **Always** confirm **`name`** exists in **`@trimble-oss/modus-icons`** for the **`variant`** (see **Icons** in [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc)). Keep **icon one size smaller** than the button (**`sm`** button → **`xs`** icon). Exceptions: product forbids icons, or no suitable glyph exists after catalog check—then text-only is acceptable if documented.

```tsx
<ModusWcButton variant="filled" color="primary" size="sm">
  <ModusWcIcon name="export" size="xs" decorative />
  Export
</ModusWcButton>
```

## Icon-only buttons (no visible label)

When **`ModusWcButton`** / **`modus-wc-button`** has **no visible text**—only a **`modus-wc-icon`** child—set **`shape="square"`**. That is the **supported** Modus configuration for icon-only controls (hit target and chrome). Always set **`aria-label`** on the **button** (recommended) or supply **`aria-label`** on the icon with **`decorative={false}`**. **Do not** omit **`shape="square"`** for icon-only buttons unless **Modus Docs MCP** for your **`version`** documents a different API.

```tsx
<ModusWcButton variant="borderless" color="tertiary" shape="square" size="sm" aria-label="Open filters">
  <ModusWcIcon name="filter" size="xs" decorative />
</ModusWcButton>
```

## Do this

```tsx
// Low-emphasis action — outlined tertiary
<ModusWcButton variant="outlined" color="tertiary" size="sm">
  Cancel
</ModusWcButton>

// Quietest action (header utility clusters, overflow rows) — borderless tertiary
<ModusWcButton variant="borderless" color="tertiary" size="sm">
  View more
</ModusWcButton>

// Icon-only quiet action (still tertiary)
<ModusWcButton
  variant="borderless"
  color="tertiary"
  shape="square"
  size="sm"
  aria-label="Open menu"
>
  <ModusWcIcon name="more_vertical" size="xs" decorative />
</ModusWcButton>
```

Pair with **`size="sm"`** in dense UI per **UX defaults** in [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc).

## Paired primary + quiet buttons (horizontal)

When **two** **`modus-wc-button`** siblings form the usual **quiet + primary** pair (**`outlined`/`borderless` + `tertiary`** next to **`filled` + `primary`** — e.g. **Schedule report** + **Export** in a dashboard hero), render **quiet first, primary second** so in **LTR** the **primary sits on the right** (aligned with modal footers: cancel left, confirm right). Use **`flex`** + **`gap`** (or grid **`auto`** columns); invert only for RTL or explicit product spec. Full wording: [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc) → **UX defaults** → **Paired actions in one horizontal row**.

```tsx
<div className="flex flex-wrap items-center gap-2">
  <ModusWcButton variant="outlined" color="tertiary" size="sm">
    Schedule report
  </ModusWcButton>
  <ModusWcButton variant="filled" color="primary" size="sm">
    <ModusWcIcon name="export" size="xs" decorative />
    Export
  </ModusWcButton>
</div>
```

## Do not do this

```tsx
// BAD: using `secondary` as a synonym for "second button" / non-primary
<ModusWcButton variant="outlined" color="secondary">Cancel</ModusWcButton>
<ModusWcButton variant="outlined" color="secondary">Back</ModusWcButton>
<ModusWcButton variant="borderless" color="secondary">Load sample</ModusWcButton>
```

These read as **brand-warm** chrome on every quiet control — that is rarely what the design intends, and it competes with the real **`color="primary"`** action.

## When `secondary` is OK on a button

Only when **product** or **Modus Docs MCP** (`modus-wc-button`, your installed **`version`**) explicitly calls for the **secondary** brand semantic — e.g. a deliberately **warm CTA** that is not the primary. Confirm allowed values for **`color`** with **`get_modus_component_data`** for your version (see [**modus-wc-mcp**](../modus-wc-mcp/SKILL.md)) before flagging a deliberate **`secondary`** as a regression.

**Non-button components** (`modus-wc-badge`, `modus-wc-chip`, etc.) may still use **`color="secondary"`** when that **status / token** is intentional — the **`secondary` → `tertiary`** default applies to **buttons**.

## Quick review heuristic

Treat **`color="secondary"`** on **`ModusWcButton`** / **`modus-wc-button`** in a diff as **suspicious** unless justified:

- Is this a Cancel / Back / Clear / overflow / utility cluster button? → **switch to `color="tertiary"`** (outlined or borderless).
- Is this an icon-only quiet action? → **`color="tertiary"`**, **`variant="borderless"`**, **`shape="square"`** (required when there is no label text), and **`aria-label`** on the button; flag diffs that omit **`shape="square"`** or an accessible name.
- Is this **`filled` + `primary`** with **no** leading **`modus-wc-icon`**? → add a **validated** icon for the action (see **Primary (`filled` + `primary`) and icons** above) unless the diff documents an approved exception.
- Is there a **two-button** hero/footer/toolbar row with **primary left** and quiet **right**? → swap DOM order so **quiet left**, **primary right** (LTR) — **Paired primary + quiet buttons (horizontal)** above.
- Is the design intentionally warm / gold-adjacent (and the spec mentions Modus secondary)? → leave as `secondary`, add a comment so the next reviewer does not flip it.

## Authoritative write-up

The full bullets and review heuristic live in the **always-applied** workspace rule [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc) → **UX defaults** → **`modus-wc-button` `color`** (including the carve-out that **`modus-wc-badge`**, **`modus-wc-chip`**, and other non-button components may still use **`secondary`** for status/token semantics), plus **Primary (`filled` + `primary`) actions and icons**, **Paired actions in one horizontal row**, **Icon-only buttons (no visible text label)**, and the **Ship checklist** primary-CTA line.

For per-component button scaffolding (variants, sizes, icon sizing inside buttons, navbar slot exception), see [.cursor/rules/modus-components-patterns.mdc](../../rules/modus-components-patterns.mdc) → **Buttons**.
