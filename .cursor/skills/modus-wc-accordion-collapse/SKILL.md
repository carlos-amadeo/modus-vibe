---
name: modus-wc-accordion-collapse
description: Wire modus-wc-accordion as a wrapper for one or more modus-wc-collapse children — ICollapseOptions (title, description, icon, iconAriaLabel, size), expanded prop, expandedChange events ({ expanded } on collapse, { expanded, index } on accordion), header vs content slots — without conditionally mounting the collapse children.
---

# Modus Web Components — accordion + collapse (`modus-wc-accordion`, `modus-wc-collapse`)

Use this skill when adding **expandable sections** — FAQs, settings groups, advanced filters, long-form details panels. Prefer **`modus-wc-collapse`** (alone) for a single expandable section, and wrap multiple collapses in **`modus-wc-accordion`** for grouped sections. Avoid `<details>`/`<summary>` for product UI (no theme awareness, limited slots) and shadcn/Radix accordions (parallel design system). Prereqs: [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc). Confirm with **`get_modus_component_data`** for both tags at your installed **`version`** (see [**modus-wc-mcp**](../modus-wc-mcp/SKILL.md)).

## API contract (Modus 2.x, confirm with MCP)

### `modus-wc-collapse` — the actual expandable section

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `expanded` | `boolean` | `false` | **Mutable** — component reflects user clicks back. Treat as **controlled** in app code. |
| `bordered` | `boolean` | `false` | Show a divider/border around the collapse. |
| `collapseId` | `string` | none | Set this when you have multiple collapses on the page (used for ARIA wiring). |
| `options` | `ICollapseOptions` | none | Pre-laid-out header (title + description + icon). **Do not set if you use `slot="header"`.** |
| `customClass` | `string` | `''` | |

```ts
interface ICollapseOptions {
  description?: string;
  icon?: string;          // Modus icon name
  iconAriaLabel?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  title: string;          // required
}
```

**Slots:** `header` (only when `options` is **not** set), `content` (the expandable body).

**Event:** `expandedChange` with `detail: { expanded: boolean }`.

### `modus-wc-accordion` — wraps multiple collapses

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `customClass` | `string` | `''` | |

**Slot:** default — one or more `modus-wc-collapse` children.

**Event:** `expandedChange` with `detail: { expanded: boolean; index: number }` — emitted whenever any child collapse toggles. **`index`** is the child position in the accordion's slotted DOM order.

The accordion itself does **not** automatically close other collapses when one opens. If you want **single-expand** semantics (only one section open at a time), implement that in app code — see "Single-expand" below.

## Single collapse (no accordion)

Use this when you have one expandable region (advanced filters, optional fields, long description):

```tsx
const [open, setOpen] = useState(false);

<ModusWcCollapse
  bordered
  expanded={open}
  options={{
    title: "Advanced filters",
    description: "Refine results by date and owner",
    icon: "filter",
    iconAriaLabel: "Filters",
    size: "sm",
  }}
  onExpandedChange={(e: CustomEvent<{ expanded: boolean }>) => {
    setOpen(e.detail.expanded);
  }}
>
  <div slot="content" className="flex flex-col gap-2">
    {/* Filter form */}
  </div>
</ModusWcCollapse>;
```

## Custom header (when `options` is not enough)

If you need interactive content in the header (e.g. an inline action button next to the title), use **`slot="header"`** **instead of** `options`:

```tsx
<ModusWcCollapse expanded={open} onExpandedChange={(e) => setOpen(e.detail.expanded)}>
  <div slot="header" className="flex items-center justify-between gap-3">
    <ModusWcTypography hierarchy="h4" size="sm" weight="semibold" label="Project notes" />
    <ModusWcButton size="xs" variant="borderless" onButtonClick={openNotesModal}>
      Edit
    </ModusWcButton>
  </div>
  <div slot="content">{/* … */}</div>
</ModusWcCollapse>;
```

`options` and `slot="header"` are **mutually exclusive** — setting both is an undefined state.

## Multiple collapses with `modus-wc-accordion`

```tsx
const collapses = [
  { title: "General",    icon: "settings",    description: "App preferences" },
  { title: "Privacy",    icon: "lock",        description: "Visibility and sharing" },
  { title: "Notifications", icon: "bell",     description: "Email and in-app alerts" },
];

const [expanded, setExpanded] = useState<boolean[]>(() => collapses.map(() => false));

<ModusWcAccordion
  aria-label="Account settings"
  onExpandedChange={(e: CustomEvent<{ expanded: boolean; index: number }>) => {
    setExpanded((prev) => {
      const next = [...prev];
      next[e.detail.index] = e.detail.expanded;
      return next;
    });
  }}
>
  {collapses.map((c, i) => (
    <ModusWcCollapse
      key={c.title}
      expanded={expanded[i]}
      options={{ ...c, iconAriaLabel: c.title, size: "md" }}
    >
      <div slot="content">{/* settings panel for {c.title} */}</div>
    </ModusWcCollapse>
  ))}
</ModusWcAccordion>;
```

## Single-expand (only one section open at a time)

The component does not enforce this — implement it in your `onExpandedChange` handler:

```tsx
onExpandedChange={(e: CustomEvent<{ expanded: boolean; index: number }>) => {
  setExpanded((prev) =>
    prev.map((_, i) => (i === e.detail.index ? e.detail.expanded : false)),
  );
}}
```

For multi-expand (any combination open), use the per-index handler in the previous section instead.

## Conditional content inside `slot="content"`

Do **not** mount/unmount the slotted `<div slot="content">` based on app state — that confuses Stencil slot projection vs React reconciliation. Keep the wrapper stable and toggle visibility inside it. See [**modus-wc-react-slotted-hosts**](../modus-wc-react-slotted-hosts/SKILL.md). Lazy-render expensive children with `if (open)` guards inside the stable wrapper.

```tsx
<div slot="content">
  {open ? <ExpensiveChart /> : null}   {/* OK — inner toggle */}
</div>
```

## Accessibility

- Provide an **`aria-label`** on `modus-wc-accordion` when it groups related sections.
- For collapses **without** `options` (custom `slot="header"`), make sure the heading text inside the header is readable for screen readers — wrap it in a real heading element (`h3`, `h4`) when appropriate.
- `iconAriaLabel` on `options` keeps the icon meaningful; if the icon is purely decorative next to a clear text title, leave it out.
- Don't trap focus inside a collapsed section — keyboard users should be able to Tab past the collapsed area normally.

## Anti-patterns

- **Setting both `options` and `slot="header"`** on the same collapse — pick one.
- **Setting `expanded` once at mount and ignoring `expandedChange`** — the user click then desyncs from your state. Keep it controlled.
- **Using `<details>`/`<summary>`** in product UI when Modus is the design system.
- **Hand-rolled accordion**: a row of clickable headers with hidden divs styled to look like Modus. Use the component.
- **Putting the index of an open collapse in URL query without offset awareness** — the index changes if you reorder collapses; prefer the title or a stable key.
- **Mounting/unmounting the `<modus-wc-collapse>` itself** based on filter state — the next mount loses `expanded` and animates from scratch. Render all collapses you might need; hide them with `display: none` if necessary.

## Related

- [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc) — Modus-only surface, icon naming.
- [**modus-wc-react-slotted-hosts**](../modus-wc-react-slotted-hosts/SKILL.md) — slot conditional content rules.
- [**modus-wc-form-inputs**](../modus-wc-form-inputs/SKILL.md) — when collapses contain forms.
