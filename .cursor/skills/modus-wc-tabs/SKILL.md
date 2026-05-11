---
name: modus-wc-tabs
description: Wire modus-wc-tabs correctly — ITab[] objects, tabChange { previousTab, newTab }, tab-style variants, slotted tab content (slot="tab-N"), custom tab headers via slotName, vertical/scrollable layouts, and disabled tabs — without rolling your own tab bar.
---

# Modus Web Components — tabs (`modus-wc-tabs`)

Use this skill when implementing **section navigation inside a card or page**, **wizard-like step switching**, or **toggling alternate views of the same data**. Prefer **`modus-wc-tabs`** / **`ModusWcTabs`** over hand-rolled `<button>` rows with active-state CSS or shadcn/MUI tabs. Prereqs: [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc). Confirm the API with **`get_modus_component_data`** for **`modus-wc-tabs`** at your installed **`version`** (see [**modus-wc-mcp**](../modus-wc-mcp/SKILL.md)).

## API contract (Modus 2.x, confirm with MCP)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `tabs` | `ITab[]` | `[]` | Array of tab descriptors (label, icon, disabled, custom slot name). |
| `activeTabIndex` | `number` | `0` | Index of the visually-selected tab. **Mutable** (component reflects user clicks back), but treat as **controlled** in app code. |
| `tabStyle` (`tab-style`) | `'boxed' \| 'bordered' \| 'lifted' \| 'none'` | `'bordered'` | |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Compact toolbars use `sm`; navbar/page chrome uses `md`. |
| `customClass` | `string` | `''` | Inner div class hook. |

```ts
interface ITab {
  customClass?: string;
  disabled?: boolean;
  icon?: string;          // Modus icon name
  iconPosition?: 'left' | 'right';
  label?: string;         // Plain text header
  slotName?: string;      // Render the header from a named slot instead
}
```

**Event:** `tabChange` with `detail: { previousTab: number; newTab: number }` — read **`e.detail.newTab`**, not `e.detail` (which is the object, not an index) and not the legacy 1.0 single-id payload.

## Controlled pattern (recommended)

Drive `activeTabIndex` from local state. The component will still emit `tabChange` for clicks/keyboard, and you flow that back into state.

```tsx
const tabs: ITab[] = [
  { label: "Overview" },
  { label: "Activity", icon: "activity", iconPosition: "left" },
  { label: "Settings", icon: "settings", iconPosition: "left" },
  { label: "Archived", disabled: true },
];

const [active, setActive] = useState(0);

<ModusWcTabs
  size="sm"
  tabStyle="bordered"
  tabs={tabs}
  activeTabIndex={active}
  aria-label="Project sections"
  onTabChange={(e: CustomEvent<{ previousTab: number; newTab: number }>) => {
    setActive(e.detail.newTab);
  }}
/>;
```

## Tab panels (content per tab)

Two ways to render content **inside** the tab strip's panel area, both via the **default** slot:

### 1. Indexed slots (`slot="tab-0"`, `slot="tab-1"`, …)

The component projects content into the active panel based on the **tab index**. Keep all panels mounted — the component handles visibility.

```tsx
<ModusWcTabs tabs={tabs} activeTabIndex={active} onTabChange={...}>
  <section slot="tab-0">Overview content…</section>
  <section slot="tab-1">Activity feed…</section>
  <section slot="tab-2">Settings form…</section>
</ModusWcTabs>
```

Avoid mount/unmount of panels with a ternary inside the tabs host — Stencil's slot projection vs React reconciliation can leave orphan DOM in the wrong slot. See [**modus-wc-react-slotted-hosts**](../modus-wc-react-slotted-hosts/SKILL.md). If a panel is genuinely expensive, gate **its inner content** with `if (active === N)` rather than removing the slotted wrapper.

### 2. Render content outside the tabs

For pages where each tab opens a route, switch on `active` outside the tabs element and let the tabs component own only the strip:

```tsx
<ModusWcTabs tabs={tabs} activeTabIndex={active} onTabChange={onTabChange} />
{active === 0 && <OverviewView />}
{active === 1 && <ActivityView />}
{active === 2 && <SettingsView />}
```

This is fine when the page already manages the panels in its own grid; the tabs component still renders the keyboard-accessible strip.

## Custom tab headers (badges, counters, status icons)

Use **`slotName`** on the `ITab` to render a header from your own markup instead of a plain label:

```tsx
const tabs: ITab[] = [
  { label: "Home", icon: "home", iconPosition: "left", slotName: "home-header" },
  { slotName: "actions-header" },
  { slotName: "notifications-header" },
];

<ModusWcTabs tabs={tabs} activeTabIndex={active} onTabChange={onTabChange}>
  <span slot="home-header" className="inline-flex items-center gap-2">
    Home
  </span>
  <span slot="actions-header" className="inline-flex items-center gap-2">
    Actions
    <ModusWcIcon name="warning" variant="solid" size="sm" decorative />
  </span>
  <span slot="notifications-header" className="inline-flex items-center gap-2">
    Notifications
    <ModusWcBadge color="primary" variant="counter">5</ModusWcBadge>
  </span>
</ModusWcTabs>;
```

When you want the strip to also show a panel for that tab, pair the named header slot with the indexed slot (`slot="tab-N"`).

## Sizing, density, and overflow

- `size="sm"` is the right default for tabs **inside a card** (matches the compact-control rule in [modus-essentials.mdc](../../rules/modus-essentials.mdc)). Stay at `md` for **page-level** tabs and navbar-adjacent strips.
- For **icon + label** tabs, set `iconPosition` per tab; do not stack icons via custom CSS.
- For **scrolling** tab strips on narrow viewports, wrap the host in a horizontally-scrollable container (`overflow-x: auto; min-width: 0`) — the component itself does not scroll. Keep individual tab labels short (two or three words) per the brevity rule.

## Vertical or non-default chrome

Modus tabs in 2.x render horizontally. For **vertical** navigation rails, use **`modus-wc-side-navigation`** instead — do not try to rotate the tabs component with CSS transforms. Confirm with MCP if your version exposes a `direction` / vertical option (none in 2.x at the time of writing).

## Accessibility

- Always set **`aria-label`** (or wrap in a labelled region) so the strip is announced as a tab list.
- The component manages `role="tab"` / `role="tabpanel"` and arrow-key navigation internally — do **not** add your own `keydown` handlers that swallow Left/Right or Home/End.
- Use **`disabled: true`** on `ITab` for tabs the user cannot reach right now (e.g. wizard steps); do not visually grey them with CSS only.
- Pair `slotName` headers that include only an icon with a visually-hidden label or `aria-label` so the tab is named for assistive tech.

## Anti-patterns

- **Hand-rolled tab bars**: a row of `<button>`s with active-state CSS — use `modus-wc-tabs` even for two tabs.
- **Reading `e.detail` as the index**: `tabChange` emits the object `{ previousTab, newTab }`. `setActive(e.detail)` stores the wrong value.
- **Slotting panel content with `slot="panel-N"`** (made up) — the documented slot pattern is `slot="tab-N"`.
- **Mount/unmount entire tabs subtrees** with a ternary inside `<ModusWcTabs>` — see [modus-wc-react-slotted-hosts](../modus-wc-react-slotted-hosts/SKILL.md).
- **Wrapping `ITab.label` in long sentences** — keep two or three words; put detail in the panel content.

## Related

- [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc) — **UX defaults** (compact controls, tab-label brevity).
- [.cursor/rules/modus-events-and-overrides.mdc](../../rules/modus-events-and-overrides.mdc) → **Tabs** event handler.
- [**modus-wc-side-navigation**](../modus-wc-side-navigation/SKILL.md) — when the design wants **vertical** navigation.
- [**modus-wc-react-slotted-hosts**](../modus-wc-react-slotted-hosts/SKILL.md) — conditional content inside slotted hosts.
