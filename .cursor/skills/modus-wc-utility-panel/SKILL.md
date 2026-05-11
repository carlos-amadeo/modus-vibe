---
name: modus-wc-utility-panel
description: Wire modus-wc-utility-panel as a right-side drawer for filters, settings, or details — expanded prop, pushContent vs overlay mode, targetElement reference, header/body/footer slots, panelOpened/panelClosed events — without conflating it with the left side-navigation rail or hand-rolling a drawer.
---

# Modus Web Components — utility panel (`modus-wc-utility-panel`)

Use this skill when adding a **right-edge drawer** for filters, contextual settings, item details, or a "more options" panel that complements the main view. Prefer **`modus-wc-utility-panel`** / **`ModusWcUtilityPanel`** over hand-rolled `position: fixed` drawers, vaul, react-modal-sheet, or shadcn Sheet. Prereqs: [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc), [**modus-wc-side-navigation**](../modus-wc-side-navigation/SKILL.md). Confirm with **`get_modus_component_data`** for **`modus-wc-utility-panel`** at your installed **`version`** (see [**modus-wc-mcp**](../modus-wc-mcp/SKILL.md)).

## Where the utility panel fits in the shell

`modus-wc-utility-panel` is the **right-side counterpart** to `modus-wc-side-navigation`:

| Component | Default side | Purpose |
|-----------|--------------|---------|
| `modus-wc-side-navigation` | Left | Primary route navigation (always-visible rail or overlay drawer). |
| `modus-wc-utility-panel` | Right | Contextual filters / details / settings for the current view. |

They follow similar push-vs-overlay semantics, but the utility panel is **simpler** — it does not own a hamburger trigger, mainMenu state, or `targetContent` selector. You drive its `expanded` prop and (optionally) point `targetElement` at the DOM node it should push.

## API contract (Modus 2.x, confirm with MCP)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `expanded` | `boolean` | `false` | Open / closed. **Drive from app state**; the component does not auto-open. |
| `pushContent` (`push-content`) | `boolean` | `false` | `true` shifts `targetElement` left to make room (push mode); `false` overlays the panel on top of content. |
| `targetElement` | `HTMLElement` | none | The element to push when `pushContent` is true. Set imperatively from a ref. |

**Slots:** `header`, `body`, `footer`.

**Events:** `panelOpened` and `panelClosed` (both with `detail: void`).

The panel does not own a close button — provide your own in `slot="header"` or `slot="footer"` so users can dismiss it. There is no `Escape` handler unless you wire one.

## Minimal pattern (overlay mode)

Overlay is the easiest mode — no `targetElement`, no main-content margin sync:

```tsx
const [panelOpen, setPanelOpen] = useState(false);

<>
  <ModusWcButton
    variant="outlined"
    color="tertiary"
    size="sm"
    aria-label="Open filters"
    onButtonClick={() => setPanelOpen(true)}
  >
    <ModusWcIcon name="filter" size="xs" decorative />
    Filters
  </ModusWcButton>

  <ModusWcUtilityPanel
    expanded={panelOpen}
    pushContent={false}
    onPanelClosed={() => setPanelOpen(false)}
  >
    <div slot="header" className="flex items-center justify-between gap-3">
      <ModusWcTypography hierarchy="h4" size="sm" weight="semibold" label="Filters" />
      <ModusWcButton
        variant="borderless"
        color="tertiary"
        shape="square"
        size="xs"
        aria-label="Close filters"
        onButtonClick={() => setPanelOpen(false)}
      >
        <ModusWcIcon name="close" size="xs" decorative />
      </ModusWcButton>
    </div>

    <div slot="body" className="flex flex-col gap-3">
      {/* filter form */}
    </div>

    <div slot="footer" className="flex justify-end gap-2">
      <ModusWcButton variant="outlined" color="tertiary" size="sm" onButtonClick={resetFilters}>
        Reset
      </ModusWcButton>
      <ModusWcButton variant="filled" color="primary" size="sm" onButtonClick={() => { applyFilters(); setPanelOpen(false); }}>
        Apply
      </ModusWcButton>
    </div>
  </ModusWcUtilityPanel>
</>;
```

## Push mode

Push mode shifts a target element left so the panel does not cover content. You must set **`targetElement`** to a live DOM node — the component cannot accept a CSS selector.

```tsx
const mainRef = useRef<HTMLElement | null>(null);
const panelRef = useRef<(HTMLElement & { targetElement: HTMLElement | null }) | null>(null);

useEffect(() => {
  if (panelRef.current && mainRef.current) {
    panelRef.current.targetElement = mainRef.current;
  }
}, []);

<div className="flex h-full flex-col">
  <ModusWcNavbar … />
  <main ref={mainRef} id="main-content" className="flex-1 overflow-auto">
    {/* page content */}
  </main>
  <ModusWcUtilityPanel
    ref={panelRef}
    expanded={panelOpen}
    pushContent
    onPanelOpened={() => trackEvent("filters_open")}
    onPanelClosed={() => setPanelOpen(false)}
  >
    {/* slots as above */}
  </ModusWcUtilityPanel>
</div>;
```

The `useEffect` runs once after mount — by then both refs point to real elements and the component can compute its push margin. If the layout changes (orientation flip, container swap), reset `targetElement` accordingly.

## Coexisting with `modus-wc-side-navigation`

A typical product shell has both rails:

```
┌─────────────────────────────────────────────────────┐
│ modus-wc-navbar                                     │
├──────┬─────────────────────────────────────┬────────┤
│ side │ <main id="main-content">            │utility │
│ nav  │   page content                      │ panel  │
│      │                                     │        │
└──────┴─────────────────────────────────────┴────────┘
```

- The **side nav** uses `targetContent="#main-content"` (CSS selector via attr).
- The **utility panel** uses `targetElement = mainRef.current` (imperative reference to the same `<main>`).

When **both** are in push mode and both target the same `<main>`, the side nav reserves left margin and the utility panel reserves right margin — the main column gets squeezed from both sides. Decide what the design wants when both are open at narrow widths:

- Treat the utility panel as **overlay only** (`pushContent={false}`) below `lg`, so a phone-size viewport doesn't render an unreadable narrow strip of content.
- Or close the side nav automatically when the utility panel opens on narrow viewports (mirrors common iOS/Android sheet UX).

## Events

- **`panelOpened`** — fires after the open animation. Use for analytics, focus management ("move focus to the first input in the panel"), or fetching contextual data only when the user actually opens the panel.
- **`panelClosed`** — fires after the close animation. Sync your `expanded` state here in case the user dismissed the panel via your own close button (which already flipped state) **or** via some other path.

Listen only to what you need — it is fine to wire just `panelClosed`.

## Accessibility

- Set **`aria-label`** (or include a clear heading inside `slot="header"`) so screen readers announce the panel's purpose.
- Provide a **visible close control** with `aria-label="Close <panel name>"` — the panel does not include one.
- For the **filters** use case, when the user opens the panel you may want to move focus into the first form control:

  ```tsx
  onPanelOpened={() => firstInputRef.current?.focus()}
  ```
- Trapping focus inside the panel is **not** built in. If the panel covers the page (`pushContent={false}` on narrow viewports), consider `aria-modal="true"` and a focus trap so the user can Tab through panel controls only. For `pushContent={true}` desktop layouts, keeping focus free to leave the panel is usually fine.

## Anti-patterns

- **vaul / react-modal-sheet / shadcn Sheet** alongside Modus — violates the Modus-only-surface rule.
- **Treating the utility panel as a modal** — it is not blocking by default. Use **`modus-wc-modal`** when a workflow must be completed before continuing.
- **Passing a CSS selector to `targetElement`** — it expects an actual `HTMLElement`. Use a ref + `useEffect`.
- **`pushContent={true}` without `targetElement`** — the panel falls back to overlay behavior; intent and visual are inconsistent.
- **Mounting/unmounting the utility panel based on `expanded`** — set `expanded={false}` and let the component animate closed instead. Conditional mounting also fights slot projection (see [**modus-wc-react-slotted-hosts**](../modus-wc-react-slotted-hosts/SKILL.md)).
- **Two utility panels open at once on the same page** — the design is for one. If you need a secondary right panel, rethink whether it should be a `modus-wc-modal` instead.

## Related

- [**modus-wc-side-navigation**](../modus-wc-side-navigation/SKILL.md) — the left-rail counterpart with similar push/overlay semantics.
- [**modus-wc-modal**](../modus-wc-modal/SKILL.md) — when the workflow must be blocking.
- [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc) — UX defaults, brevity, button sizing.
