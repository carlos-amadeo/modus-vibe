---
name: modus-wc-toast
description: Wire modus-wc-toast as a positioning container for slotted modus-wc-alert messages — position presets, optional auto-dismiss delay, queueing/multiple toasts, z-index next to modal and side navigation, and aria-live for screen readers — without sonner / react-hot-toast or hand-rolled fixed divs.
---

# Modus Web Components — toast (`modus-wc-toast`)

Use this skill when adding **transient feedback** for save/copy/sync/etc. — “Saved”, “Copied to clipboard”, “Failed to load”, etc. Prefer **`modus-wc-toast`** + slotted **`modus-wc-alert`** over **`sonner`**, **`react-hot-toast`**, or hand-rolled `position: fixed` portals. Prereqs: [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc). Confirm the API with **`get_modus_component_data`** for **`modus-wc-toast`** at your installed **`version`** (see [**modus-wc-mcp**](../modus-wc-mcp/SKILL.md)).

## API contract (Modus 2.x, confirm with MCP)

`modus-wc-toast` is intentionally minimal — it is a **positioned, fixed container** for whatever message you slot inside. The visual chrome (icon, color, title) lives on the slotted **`modus-wc-alert`**. There are **no** built-in icons, types, or close buttons on the toast itself.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `position` | `'top-start' \| 'top-center' \| 'top-end' \| 'middle-start' \| 'middle-center' \| 'middle-end' \| 'bottom-start' \| 'bottom-center' \| 'bottom-end'` | `'top-end'` | Position is **relative to the toast's offset parent**, not the viewport — see "Where to mount" below. |
| `delay` | `number` (ms) | none | If set, the toast removes itself from view after `delay` ms. If omitted, it stays until you remove the toast element from the DOM. |
| `customClass` | `string` | `''` | |

**Slot:** default — typically a single `modus-wc-alert`, but any flow content works.

**Events:** none. Show by mounting the element; dismiss by unmounting it (or by setting `delay`).

## Minimal pattern (vanilla)

```html
<modus-wc-toast position="bottom-end" delay="4000">
  <modus-wc-alert
    variant="success"
    alert-title="Project saved"
  ></modus-wc-alert>
</modus-wc-toast>
```

## React pattern with a small queue

Because `modus-wc-toast` does not own state, the simplest robust integration is a thin queue at the app root:

```tsx
type Toast = {
  id: string;
  variant: "info" | "success" | "warning" | "error";
  title: string;
  message?: string;
  delayMs?: number;
};

function useToasts() {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    const delayMs = t.delayMs ?? 4000;
    setItems((prev) => [...prev, { ...t, id, delayMs }]);
    if (delayMs > 0) {
      window.setTimeout(
        () => setItems((prev) => prev.filter((x) => x.id !== id)),
        delayMs,
      );
    }
  }, []);
  return { items, push };
}

export function ToastHost({ items }: { items: Toast[] }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-200"
      aria-live="polite"
      aria-atomic="false"
    >
      {items.map((t, i) => (
        <ModusWcToast
          key={t.id}
          position="bottom-end"
          customClass="pointer-events-auto"
          // Stack subsequent toasts upward by translating each one
          style={{ transform: `translateY(-${i * 64}px)` }}
        >
          <ModusWcAlert
            variant={t.variant}
            alertTitle={t.title}
            // Long body copy goes inside the alert, not the toast
          >
            {t.message}
          </ModusWcAlert>
        </ModusWcToast>
      ))}
    </div>
  );
}
```

The auto-dismiss is driven by `setTimeout` in app code, not by the toast. The `delay` prop on `modus-wc-toast` is optional — when both are set, the JavaScript `setTimeout` is what removes the element from React state (which is what actually unmounts it). Use `delay` alone only for purely declarative HTML.

## Where to mount the toast

`position` is computed against the toast's **offset parent**, not the viewport. In practice that means:

- **Mount toasts at the app root**, not inside a card or scrolled `<main>`. If you mount inside a card, `position="top-end"` becomes "top-end of the card", not "top-end of the screen".
- A common pattern is a single `<ToastHost>` rendered as the last child of the React tree (above the side nav, below the modal `<dialog>` if any). The wrapper is `position: fixed; inset: 0; pointer-events: none` so it covers the viewport while letting clicks pass through everything except the toasts themselves.

## Stacking and z-index

Stacking order from bottom to top, in a typical Modus shell:

1. Page background / `<main>`
2. Side navigation rail (`modus-wc-side-navigation`)
3. Sticky navbar (`modus-wc-navbar`)
4. Toasts (`modus-wc-toast`) — typically `z-[200]` on the host wrapper
5. Modals (`modus-wc-modal`) — these render in the native **top layer** and sit above everything regardless of `z-index`

In practice you only need to give the toast wrapper a `z-index` higher than the navbar (e.g. `z-200` if the navbar is `z-120`). Do **not** try to put the toast above an open modal — native `<dialog>` always wins by design, and a toast over a blocking dialog would be a UX bug anyway.

## Accessibility

- Wrap the toast region in **`aria-live="polite"`** for non-critical messages (saves, sync, info) and **`aria-live="assertive"`** for errors that require immediate attention.
- Set **`aria-atomic="false"`** on the live region so a new toast does not cause re-announcement of older toasts that are still on screen.
- Choose `modus-wc-alert` **`variant`** that matches semantics: `error` → assertive region; `success`/`info` → polite region. Color alone is not the announcement — the alert title is.
- Keep title copy short; put detail in `message` so the live region announces a useful first sentence.

## Sizing and copy

- **One alert per toast**, two or three short words in the title (e.g. "Saved", "Copy failed"). Per [modus-essentials.mdc](../../rules/modus-essentials.mdc) brevity rule, longer detail goes in the alert body, not the title.
- For destructive errors that should not auto-dismiss, **omit `delay`** and provide a manual close button on the slotted alert.
- For confirmations with an "Undo", include the action button inside the slotted alert (or as a sibling element); keep `delay` long enough for the user to react (typically ≥ 5 seconds).

## Anti-patterns

- **`sonner` / `react-hot-toast` / `react-toastify`** alongside Modus — violates the Modus-only-surface rule in [modus-essentials.mdc](../../rules/modus-essentials.mdc).
- **`<modus-wc-toast>` with raw text children** — wrap content in `modus-wc-alert` so the message has the right icon, color, and ARIA semantics.
- **Mounting the toast inside the same card or scrolled view as the action that triggered it** — `position` then refers to that container, not the screen.
- **Reaching for `onClose` / `closed`** on the toast — there is no such event. Dismiss by unmounting.
- **Stacking multiple `<modus-wc-toast>` elements at the exact same `position`** without offsetting them — they overlap. Use a wrapper that translates each toast based on its index, as in the React example above.
- **Setting a custom `z-index` so high it would sit over a `<dialog>`** — that is fighting the platform's top layer; either don't show toasts while a modal is open, or accept that the dialog wins.

## Related

- **`modus-wc-alert`** — the visual chrome that goes inside the toast (confirm with MCP for variant/title/message API).
- [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc) — Modus-only surface, brevity, and color usage.
- [**modus-wc-modal**](../modus-wc-modal/SKILL.md) — when feedback is **blocking** rather than transient.
