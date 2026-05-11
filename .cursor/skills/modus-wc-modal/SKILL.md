---
name: modus-wc-modal
description: Implement dialogs with modus-wc-modal—open/close via native <dialog>, the header/content/footer slots, focus and layering next to shell chrome, React/Next.js client boundaries—without ad-hoc div overlays or parallel dialog libraries.
---

# Modus Web Components — modal (`modus-wc-modal`)

Use this skill when adding **dialogs**, **confirmations**, **forms in overlay**, or **blocking workflows**. Prefer **`modus-wc-modal`** / **`ModusWcModal`** over **hand-rolled `fixed` + `z-index` divs**, **parallel dialog libraries** (shadcn/Radix), or **bare native `<dialog>`** elements styled from scratch. Prereqs: [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc). Fetch **`get_modus_component_data`** for **`modus-wc-modal`** with your installed **`version`** (see [**modus-wc-mcp**](../modus-wc-mcp/SKILL.md)).

## API contract (Modus 2.x, confirm with MCP)

`modus-wc-modal` is a **thin wrapper around the native HTML `<dialog>` element**. That has two big consequences that often surprise people coming from 1.0 or shadcn:

1. **No `visible` / `open` prop and no `onClose` / `closed` custom event** — open and close imperatively with the native dialog methods.
2. **Header/footer text and primary/secondary buttons are not built in** — compose them in slots.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `modalId` (`modal-id`) | `string` | required | The id assigned to the inner `<dialog>` element. Use it with `getElementById(...).showModal() / .close()`. |
| `backdrop` | `'default' \| 'static'` | `'default'` | `static` disables backdrop-click dismiss. |
| `position` | `'top' \| 'center' \| 'bottom'` | `'center'` | |
| `fullscreen` | `boolean` | `false` | |
| `showClose` | `boolean` | `true` | The built-in × button. |
| `showFullscreenToggle` | `boolean` | `false` | |

**Slots:** `header`, `content`, `footer` (named — there is **no** `body` slot).

**Events:** `modus-wc-modal` itself emits **none**. To react to dismiss, listen for the native dialog's **`close`** event on the inner `<dialog>` (the element identified by `modal-id`).

## Open / close pattern (vanilla / React)

```tsx
const modalId = "confirm-action-modal";

const dialog = () =>
  document.getElementById(modalId) as HTMLDialogElement | null;

const open = () => dialog()?.showModal();
const close = () => dialog()?.close();

<>
  <ModusWcButton onButtonClick={open}>Open dialog</ModusWcButton>

  <ModusWcModal
    modalId={modalId}
    backdrop="default"
    position="center"
    showClose
    aria-label="Confirm action"
  >
    <span slot="header">Confirm action</span>
    <div slot="content" className="flex flex-col gap-2">
      <ModusWcTypography hierarchy="p" size="md">
        Are you sure you want to continue?
      </ModusWcTypography>
    </div>
    <div slot="footer" className="flex justify-end gap-2">
      <ModusWcButton variant="outlined" color="tertiary" size="sm" onButtonClick={close}>
        Cancel
      </ModusWcButton>
      <ModusWcButton
        variant="filled"
        color="primary"
        size="sm"
        onButtonClick={() => { handleConfirm(); close(); }}
      >
        Confirm
      </ModusWcButton>
    </div>
  </ModusWcModal>
</>;
```

## Reacting to dismiss

The component does not emit a custom `close`. Use the native `<dialog>` event:

```tsx
useEffect(() => {
  const el = document.getElementById(modalId) as HTMLDialogElement | null;
  if (!el) return;
  const onClose = () => setOpen(false); // sync your local state if you mirror open/closed
  el.addEventListener("close", onClose);
  return () => el.removeEventListener("close", onClose);
}, [modalId]);
```

This fires for **every** dismiss path: × button, `Escape`, backdrop click (when `backdrop="default"`), and explicit `close()` calls. **`backdrop="static"`** disables backdrop-click dismissal but **not** `Escape`.

## Sync local state with imperative dialog state

If your code keeps a React `open` flag for conditional logic (analytics, blocking submit, etc.), drive it from imperative side effects rather than the prop on the modal:

```tsx
const [open, setOpen] = useState(false);
const ref = useRef<HTMLDialogElement | null>(null);

const openDialog = () => { ref.current?.showModal(); setOpen(true); };
const closeDialog = () => { ref.current?.close(); setOpen(false); };

// Resolve the inner dialog after the custom element upgrades
useEffect(() => {
  ref.current = document.getElementById(modalId) as HTMLDialogElement | null;
  const el = ref.current;
  if (!el) return;
  const onClose = () => setOpen(false);
  el.addEventListener("close", onClose);
  return () => el.removeEventListener("close", onClose);
}, [modalId]);
```

Do **not** try to render `<ModusWcModal open={open}>` — that prop does not exist and conditionally **mounting/unmounting** the modal at render time fights React's reconciliation against Stencil slot projection (see [modus-wc-react-slotted-hosts](../modus-wc-react-slotted-hosts/SKILL.md)).

## React + Next.js

- Modus modal wrappers are **client-side**. In Next.js App Router, keep modal trees under a **`'use client'`** boundary (or a client component module) per [.cursor/rules/modus-nextjs.mdc](../../rules/modus-nextjs.mdc).
- Do **not** wrap Modus imports in `next/dynamic({ ssr: false })` solely for modals — use the integration rule's client-boundary approach.
- Run the imperative `showModal()` from inside an event handler or `useEffect`, never from the component body.

## Slots and conditional children

- The default body lives in **`slot="content"`** (not a `body` slot, not the default slot).
- If you toggle **large** alternate bodies inside the same `<ModusWcModal>` (e.g. step 1 form vs step 2 review), follow [**modus-wc-react-slotted-hosts**](../modus-wc-react-slotted-hosts/SKILL.md): prefer **two stable wrappers** with `hidden` over swapping unrelated subtrees with a ternary, which can leave orphan DOM in the slot.

## Shell and z-index

The native `<dialog>` element renders in the **top layer**, so it sits **above** every regular stacking context — including a `position: fixed` navbar, side navigation, and toast (`modus-wc-toast`). You should rarely need a custom `z-index` for the modal itself. If a tooltip / popover from another library bleeds through, fix it on that other element rather than raising the modal.

If multiple modals open at once (avoid this when possible), the most recent `showModal()` call wins per native top-layer rules.

## Accessibility

- Always set **`aria-label`** (or label inside `slot="header"` and reference it with `aria-labelledby`) so screen readers announce the dialog.
- Native `<dialog>` traps Tab focus within the dialog and restores focus on close — keep it that way (do not pass `inert` to surrounding shell unless you also restore it on close).
- `Escape` is wired by the native element. Do not bind your own `keydown` handler that swallows it.

## Anti-patterns

- **shadcn Dialog / Radix Dialog** alongside Modus in the same shell — violates the Modus-only-surface rule in [modus-essentials.mdc](../../rules/modus-essentials.mdc).
- **Driving visibility with a non-existent `visible` / `open` prop** (`<ModusWcModal visible={isOpen} ...>` is a no-op).
- **Listening for `onClose` / `closed`** on `ModusWcModal` (no such custom event) — use the native dialog `close` event.
- **`<div slot="body">`** — there is no `body` slot; use `slot="content"`.
- **`headerText="..."`** — 1.0 prop, not in 2.x; use `slot="header"`.
- **Hand-rolling backdrop with `<div className="fixed inset-0 bg-black/50">`** — the component already provides a backdrop with light/dark theme handling.
- **Custom `z-index: 9999`** to "make it appear" — the top layer already handles stacking; if it isn't appearing, `showModal()` was probably never called (check `display: none` from `dialog:not([open])`).

## Related

- [**modus-wc-form-inputs**](../modus-wc-form-inputs/SKILL.md) — forms inside modals.
- [**modus-wc-react-slotted-hosts**](../modus-wc-react-slotted-hosts/SKILL.md) — conditional content in slotted hosts.
- [.cursor/rules/modus-wc-integration.mdc](../../rules/modus-wc-integration.mdc) — events and shell integration.
- [.cursor/rules/modus-components-patterns.mdc](../../rules/modus-components-patterns.mdc) → **Modal Dialog** scaffold.
