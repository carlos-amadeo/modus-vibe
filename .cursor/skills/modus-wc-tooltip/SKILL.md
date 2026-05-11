---
name: modus-wc-tooltip
description: Wrap a single trigger element in modus-wc-tooltip — content prop or default slot, position auto/top/right/bottom/left, forceOpen for controlled visibility, dismissEscape, hover/focus parity, aria-describedby, and accessibility — without title attribute hacks or shadcn/Radix tooltips.
---

# Modus Web Components — tooltip (`modus-wc-tooltip`)

Use this skill when adding **on-hover / on-focus help** for icon-only buttons, truncated text, or controls that need an explanation without taking layout space. Prefer **`modus-wc-tooltip`** / **`ModusWcTooltip`** over the native `title` attribute (no styling, no focus support on touch), shadcn/Radix tooltips (parallel design system), or Tailwind-only tooltips. Prereqs: [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc). Confirm the API with **`get_modus_component_data`** for **`modus-wc-tooltip`** at your installed **`version`** (see [**modus-wc-mcp**](../modus-wc-mcp/SKILL.md)).

## API contract (Modus 2.x, confirm with MCP)

The tooltip **wraps the element it describes** — the trigger is the default slot child, and the tooltip text comes from the `content` prop:

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `content` | `string` | `''` | The text shown in the tooltip bubble. |
| `position` | `'auto' \| 'top' \| 'right' \| 'bottom' \| 'left'` | `'auto'` | `auto` flips to keep the bubble inside the viewport. |
| `disabled` | `boolean` | `false` | Suppresses the tooltip entirely (handy for conditional UI). |
| `forceOpen` (`force-open`) | `boolean` | `false` | Pins the bubble visible regardless of hover/focus — for testing, demos, or controlled tutorials. |
| `tooltipId` (`tooltip-id`) | `string` | `''` | The id assigned to the bubble; set this and `aria-describedby` on the trigger so screen readers announce it. |
| `customClass` | `string` | `''` | |

**Slot:** default — exactly **one** trigger element (the thing the tooltip describes).

**Event:** `dismissEscape` (detail: `void`) — fires when the user presses `Escape` while the bubble is visible. The bubble re-enables on the next `mouseenter`. There is no `open` / `close` event — visibility is owned by the component.

## Minimal pattern

```tsx
<ModusWcTooltip content="Settings" position="auto">
  <ModusWcButton variant="borderless" color="tertiary" shape="square" size="sm" aria-label="Settings">
    <ModusWcIcon name="settings" size="xs" decorative />
  </ModusWcButton>
</ModusWcTooltip>
```

That covers the most common case — **one icon-only button**, with the icon's accessible name on the button itself (`aria-label="Settings"`), and the tooltip mirroring it visually for sighted users.

## Accessible tooltip + `aria-describedby`

For controls that already have an accessible name and the tooltip adds **extra** information (e.g. a longer description, a keyboard shortcut), wire `tooltipId` so screen readers can find the bubble:

```tsx
<ModusWcTooltip
  tooltipId="save-tooltip"
  content="Save the current draft. Cmd/Ctrl + S"
  position="bottom"
>
  <ModusWcButton size="sm" aria-describedby="save-tooltip" onButtonClick={save}>
    Save
  </ModusWcButton>
</ModusWcTooltip>;
```

`aria-describedby` is the right relationship here — the button's accessible **name** stays "Save", and the tooltip provides additional **description** that assistive tech can fetch on demand.

For purely **decorative** tooltips that just restate the trigger's visible label, you do **not** need `tooltipId` / `aria-describedby` — the visible label is the announcement.

## Hover, focus, and touch parity

- The tooltip opens on **`mouseenter`** and **`focusin`** of the wrapped trigger and closes on `mouseleave` / `focusout` / `Escape`.
- Make sure the wrapped element is **focusable** — a real `<button>` (or `modus-wc-button`) is fine; a `<div>` is not. Adding `tabIndex={0}` to a `<div>` is an anti-pattern (no role, no key handling) — use a button.
- **Touch:** mobile browsers do not fire `mouseenter`. Plan for tooltips on touch by either (a) including the same information in a visible label nearby, or (b) using `forceOpen` driven by your own tap-to-toggle handler. Do not rely on a hover tooltip to convey **required** information on touch devices.

## Conditional and controlled visibility

- **Disable conditionally:** set `disabled={true}` (e.g. when the trigger is in an idle state and the tooltip would be misleading). The bubble does not render at all.
- **Force open:** set `forceOpen={true}` for demos, onboarding tours, or test snapshots. Pair with state to release control:

```tsx
const [pinned, setPinned] = useState(false);

<ModusWcTooltip
  content="This is the new bulk-edit menu"
  forceOpen={pinned}
  onDismissEscape={() => setPinned(false)}
>
  <ModusWcButton onButtonClick={() => setPinned(false)}>Got it</ModusWcButton>
</ModusWcTooltip>;
```

`dismissEscape` is the only documented event; if you need to detect normal hover-out, listen for `mouseleave` / `focusout` on the trigger directly (not on the tooltip host).

## Layout and overflow

- `position="auto"` is the right default — it flips to avoid clipping when the trigger is near a viewport edge.
- The tooltip bubble renders **inside the same scroll container** as the trigger — if the trigger is in an overflow-clipped scroll area (sidebar, table cell with `overflow: hidden`), the bubble can be clipped. Either move the trigger out of the clipped container or use a different control (e.g. a popover) for that region.
- Do **not** wrap **multiple** trigger elements in one tooltip — use one tooltip per trigger so the description is unambiguous.

## Anti-patterns

- **Native `title` attribute** for icon-only buttons — inconsistent styling, no focus support on touch, no theme awareness. Use `modus-wc-tooltip`.
- **Putting interactive content in `content`** — `content` is a **string**. Tooltips are not popovers; if the user must click inside, use **`modus-wc-dropdown-menu`** or **`modus-wc-modal`** instead.
- **Wrapping a non-focusable element** (`<span>`, `<div>` without role) — keyboard users get no tooltip, and assistive tech cannot announce it.
- **Long sentences in `content`** — keep tooltips short (a phrase or short sentence). Long help belongs in inline helper text or a panel.
- **Pinning a tooltip on a permanently-visible label** — that's just text; remove the tooltip and let the label speak for itself.

## Related

- [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc) — icon-only buttons, decorative icons, brevity.
- [.cursor/rules/modus-accessibility.mdc](../../rules/modus-accessibility.mdc) — naming and description distinctions (`aria-label` vs `aria-describedby`).
