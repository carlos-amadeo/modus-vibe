---
name: modus-wc-react-slotted-hosts
description: >-
  Prevents React DOM errors (NotFoundError / removeChild) when using Trimble
  Modus Web Components with named or default slots. Use when building or
  debugging React (or similar) apps with @trimble-oss/moduswebcomponents-react,
  conditional children inside ModusWcCard or other slotted hosts, list vs empty
  state toggles, or after seeing "Failed to execute removeChild on Node".
---

# Modus WC + React — slotted hosts and `removeChild`

## What goes wrong

Modus components (Stencil) often **reparent** light-DOM children into **shadow DOM slots**. React still tracks those nodes as children of the **React parent** in the light tree.

If you **mount/unmount** slotted content with a ternary or conditional (e.g. empty state vs list, swapping two different roots), React’s commit phase calls `removeChild` on a parent that **no longer owns** that node. The browser throws:

`NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.`

Typical triggers: first item added / last item removed, tab-like swaps, toggling whole subtrees inside `ModusWcCard` **default slot** or other `slot="..."` regions, or **ternary-swapping** two large alternate bodies (e.g. IDE-specific setup panels) under the same card host. A separate pitfall: putting **`ModusWcButton`** in **`modus-wc-dropdown-menu`**’s **`slot="button"`** nests a button inside the component’s own trigger — invalid DOM and a common source of double-chrome / hydration weirdness; use host **`buttonVariant` / `buttonColor` / `buttonSize`** and slot only **non-button** content (see [**modus-wc-dropdown-menu**](../modus-wc-dropdown-menu/SKILL.md)).

## Required pattern

**Do not** mount/unmount alternate **roots** inside a Modus host’s slotted subtree for UI toggles.

**Do** keep both (or all) branches in the tree and toggle visibility:

- Prefer the **`hidden`** attribute on the host or a wrapper (`hidden={condition}` in JSX).
- Or **`display: none`** / a CSS class on a stable wrapper **without** removing it from the tree.

```tsx
/* Avoid: swapping roots inside ModusWcCard body */
{todos.length === 0 ? <ModusWcTypography>...</ModusWcTypography> : <ul>...</ul>}

/* Avoid: swapping two large alternate bodies (IDE panels, setup vs empty, etc.) */
{mode === "a" ? <PanelA /> : <PanelB />}

/* Prefer: both mounted, visibility toggled */
<ModusWcTypography hidden={todos.length > 0}>...</ModusWcTypography>
<ul hidden={todos.length === 0} aria-hidden={todos.length === 0 ? true : undefined}>...</ul>

/* Prefer: stable wrappers for alternate default-slot trees under ModusWcCard */
<div hidden={mode !== "a"} aria-hidden={mode !== "a" ? true : undefined}><PanelA /></div>
<div hidden={mode !== "b"} aria-hidden={mode !== "b" ? true : undefined}><PanelB /></div>
```

Apply the same idea when switching between **different Modus subtrees** in the same slot (e.g. two cards): either use **one** card with stable inner structure, or keep **both** mounted and toggle `hidden` / CSS.

## Related mitigations

- **React `StrictMode`**: double mount in dev can interact badly with slots; project rules often disable StrictMode around Modus-heavy trees until verified.
- **Side navigation / menu**: keep slotted shell nodes mounted; toggle **classes** or `hidden` instead of conditional **slot** children where possible (see **modus-wc-side-navigation** skill).

## Quick checklist

- [ ] No ternary that replaces one slotted **root** with another inside `ModusWc*` hosts.
- [ ] Empty vs list (or similar) uses **`hidden`** or CSS on **stable** siblings.
- [ ] After a fix, retest add-first / remove-last and any route-like slot swaps.
