---
name: modus-wc-dropdown-menu
description: Wire modus-wc-dropdown-menu — slot="button" carries trigger *content* only (not ModusWcButton); use buttonVariant/buttonColor/buttonSize on the host; slot="menu" with modus-wc-menu-item children, menuVisibility (controlled), itemSelect on menu items (e.detail.value), placement and offset, closing the menu on selection — without shadcn DropdownMenu or nested-button triggers.
---

# Modus Web Components — dropdown menu (`modus-wc-dropdown-menu`)

Use this skill when adding a **trigger button that opens a list of actions or selectable values** — overflow menus, "More actions" buttons, account menus, contextual command lists. Prefer **`modus-wc-dropdown-menu`** + **`modus-wc-menu-item`** over shadcn/Radix DropdownMenu, hand-rolled `popover` divs, or `<select>` for non-form actions. Prereqs: [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc). Confirm the API with **`get_modus_component_data`** for **`modus-wc-dropdown-menu`** at your installed **`version`** (see [**modus-wc-mcp**](../modus-wc-mcp/SKILL.md)).

## API contract (Modus 2.x, confirm with MCP)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `buttonAriaLabel` | `string` | none | Accessible name for the trigger. **Always set this** when the trigger is icon-only. |
| `buttonColor` | `'primary' \| 'secondary' \| 'tertiary' \| 'warning' \| 'danger'` | `'primary'` | Default **`primary`** + **`filled`** drives the outer trigger; set **`tertiary`** / **`outlined`** / **`borderless`** here when the menu is not the sole primary CTA (see **One trigger button** below). |
| `buttonSize` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Match the surrounding density (`sm` in toolbars). |
| `buttonVariant` | `'borderless' \| 'filled' \| 'outlined'` | `'filled'` | Use `borderless` for tertiary triggers (kebab/overflow). |
| `disabled` | `boolean` | `false` | |
| `menuBordered` | `boolean` | `true` | Render the menu panel with a border. |
| `menuOffset` | `number` (px) | `10` | Distance between trigger and menu. |
| `menuPlacement` | `'top' \| 'top-start' \| 'top-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end' \| 'left' \| 'left-start' \| 'left-end' \| 'right' \| 'right-start' \| 'right-end'` | `'bottom-start'` | |
| `menuSize` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `menuVisible` | `boolean` | `false` | **Mutable** — component reflects opens/closes back. Treat as **controlled** in app code if you need to react to state. |
| `customClass` | `string` | `''` | |

**Slots:** `button` (the **inner** trigger content — text, icon, or both **only**), `menu` (the menu items).

**Event:** `menuVisibilityChange` with `detail: { isVisible: boolean }`.

The dropdown does **not** emit a "selected" event — you wire that on each `modus-wc-menu-item` via its **`itemSelect`** event (`detail` includes `value` and the rest of the item's props).

## One trigger button only (critical)

**`modus-wc-dropdown-menu` renders its own `<button>` (or equivalent) internally** and passes **`buttonVariant`**, **`buttonColor`**, **`buttonSize`**, **`buttonShape`**, and **`buttonAriaLabel`** to that trigger.

- **`slot="button"` is not a slot for `ModusWcButton` / `<button>` / another interactive host.** Put only **non-button** markup there: typically a `<div>` (or `<span>`) with label text and an optional **`modus-wc-icon`**.
- **Do not** use `<ModusWcButton slot="button">…</ModusWcButton>`. That nests a button inside the dropdown’s button → **invalid HTML**, a **split-button / double-chrome** look (outer default **`filled` + `primary`** around your inner control), **axe / a11y failures**, and in **React 19 + slots** can contribute to **`removeChild` / `NotFoundError`** when the tree reparents.

**Correct:** style the **host** — e.g. `buttonVariant="borderless"`, `buttonColor="tertiary"`, `buttonSize="sm"`, plus `buttonAriaLabel` when the visible label is insufficient (icon-only triggers).

**Wrong:**

```tsx
/* Anti-pattern — nested buttons */
<ModusWcDropdownMenu>
  <ModusWcButton slot="button" variant="borderless" color="tertiary" size="sm">
    Quick actions
    <ModusWcIcon name="caret_down" size="xs" decorative />
  </ModusWcButton>
  ...
</ModusWcDropdownMenu>
```

**Right:**

```tsx
<ModusWcDropdownMenu
  buttonAriaLabel="Quick actions"
  buttonVariant="borderless"
  buttonColor="tertiary"
  buttonSize="sm"
  menuPlacement="bottom-end"
>
  <div slot="button" className="flex items-center gap-1">
    Quick actions
    <ModusWcIcon name="caret_down" size="xs" decorative />
  </div>
  ...
</ModusWcDropdownMenu>
```

## Minimal pattern (uncontrolled visibility)

```tsx
<ModusWcDropdownMenu
  buttonAriaLabel="More actions"
  buttonVariant="borderless"
  buttonColor="tertiary"
  buttonSize="sm"
  menuPlacement="bottom-end"
>
  <div slot="button" className="flex items-center gap-1">
    <ModusWcIcon name="more_vertical" size="xs" decorative />
  </div>

  <div slot="menu">
    <ModusWcMenuItem
      label="Rename"
      value="rename"
      onItemSelect={(e) => handleAction(e.detail.value)}
    />
    <ModusWcMenuItem
      label="Duplicate"
      value="duplicate"
      onItemSelect={(e) => handleAction(e.detail.value)}
    />
    <ModusWcMenuItem
      label="Delete"
      value="delete"
      onItemSelect={(e) => handleAction(e.detail.value)}
    />
  </div>
</ModusWcDropdownMenu>;
```

The menu opens on **trigger click** and closes on **outside click** by default. With **uncontrolled** `menuVisible`, you usually want to **manually close** the menu after a selection so the user sees the action take effect:

```tsx
const closeMenuFromEvent = (e: CustomEvent) => {
  const trigger = (e.target as HTMLElement | null)?.closest("modus-wc-dropdown-menu");
  if (trigger) {
    (trigger as HTMLElement & { menuVisible: boolean }).menuVisible = false;
  }
};

<ModusWcMenuItem
  label="Delete"
  value="delete"
  onItemSelect={(e) => {
    handleAction(e.detail.value);
    closeMenuFromEvent(e);
  }}
/>;
```

## Controlled visibility

Use this when you need to know "is the menu open" elsewhere in the app (analytics, blocking submit, etc.):

```tsx
const [open, setOpen] = useState(false);

<ModusWcDropdownMenu
  menuVisible={open}
  onMenuVisibilityChange={(e: CustomEvent<{ isVisible: boolean }>) => setOpen(e.detail.isVisible)}
  buttonAriaLabel="Sort by"
  buttonVariant="outlined"
  buttonColor="tertiary"
  buttonSize="sm"
>
  <div slot="button" className="flex items-center gap-1">
    Sort
    <ModusWcIcon name="expand_more" size="xs" decorative />
  </div>
  <div slot="menu">
    <ModusWcMenuItem label="Newest first" value="newest" onItemSelect={onSort} />
    <ModusWcMenuItem label="Oldest first" value="oldest" onItemSelect={onSort} />
    <ModusWcMenuItem label="Name (A–Z)"   value="name-asc" onItemSelect={onSort} />
  </div>
</ModusWcDropdownMenu>;
```

```tsx
const onSort = (e: CustomEvent<{ value: string }>) => {
  setSort(e.detail.value);
  setOpen(false);
};
```

## Trigger content patterns

- **Text + caret:** `Sort` + `expand_more` icon (size one step smaller than the button).
- **Icon-only kebab:** `more_vertical` icon, `buttonVariant="borderless"`, `buttonColor="tertiary"`, `buttonAriaLabel="More actions"` set so screen readers announce the trigger.
- **Avatar / username + caret:** account menus in the navbar.

Set **`buttonAriaLabel`** whenever the visible text alone is not a clear name (icon-only triggers, `Sort` next to a chart, etc.).

## Placement, offset, and overflow

- `menuPlacement="bottom-start"` is the right default for left-aligned triggers in toolbars.
- For triggers near the **right edge** (e.g. row actions in a table), use `bottom-end` so the menu does not get clipped off-screen.
- `menuOffset` defaults to `10` — increase to `14`–`16` when the menu needs to clear a focus ring or shadow.
- Avoid mounting the dropdown inside an `overflow: hidden` container — the menu panel is sized relative to its offset parent and will be clipped. Move the trigger into a normal stacking context.

## Accessibility

- **`buttonAriaLabel`** for icon-only triggers (mandatory for screen readers).
- Each `modus-wc-menu-item` should have a meaningful `label` — short verbs (Rename, Delete) instead of pronouns (Yes, OK).
- The component handles `Escape` and arrow-key navigation between menu items — do not bind your own `keydown` that swallows them.
- For a **destructive** action (Delete, Remove access), set its `value` and your handler should still confirm with a `modus-wc-modal` before doing the irreversible work — don't make the menu the final confirmation.

## Anti-patterns

- **`ModusWcButton`, native `<button>`, or any full button component inside `slot="button"`** — the host already provides the trigger; use **`buttonVariant` / `buttonColor` / `buttonSize`** on **`ModusWcDropdownMenu`** and **`slot="button"`** for markup only. See **One trigger button only** above.
- **shadcn DropdownMenu / Radix DropdownMenu** alongside Modus — violates the Modus-only-surface rule.
- **Native `<select>`** for an action menu — `<select>` is for **form values**, not "Run command".
- **Stuffing the menu with controls** (`<input>`, `<select>`) — the dropdown menu is for actions and value picks, not embedded forms. For a form-in-popover, use **`modus-wc-modal`** or a side panel.
- **Forgetting to close after selection** — uncontrolled menus stay open if you do not flip `menuVisible` after `itemSelect`. The user has to click outside.
- **Placing dropdowns inside `overflow: hidden` rows** (table cells, scrolled cards) — the menu gets clipped. Either change the cell's overflow or move the trigger.
- **Reading the chosen value from `menuVisibilityChange`** — that event is just open/closed. The selected value comes from the menu item's `itemSelect`.

## Related

- **`modus-wc-menu-item`** (verify `itemSelect` detail in MCP for your version).
- [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc) — icon-only buttons, brevity, decorative icons.
- [**modus-wc-modal**](../modus-wc-modal/SKILL.md) — when the action needs confirmation or a form.
