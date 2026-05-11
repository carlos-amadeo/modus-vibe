---
name: modus-wc-form-inputs
description: Wire Modus form controls (text-input, textarea, number-input, select, checkbox, switch, radio) with correct custom events, detail shapes, and the select options API—React, Vue, Angular, and vanilla. Covers the #1 Modus 2.0 footgun — feeding `<option>` children to `modus-wc-select` instead of the `options: ISelectOption[]` prop — which renders every option as a light-DOM orphan stacked above/below the empty combobox. Also covers the `inputChange` event contract (detail is an `InputEvent` for **every** form control, including checkbox/switch/radio in 2.x; value lives on `detail.target.value`, boolean on `detail.target.checked`, NOT on detail itself or `detail.newValue`). Use when you see dropdowns "displaying outside the container", a giant vertical list of options above a tiny empty select, selects that never update state, text inputs whose state stores "[object InputEvent]", or boolean toggles that never flip.
---

# Modus Web Components — form inputs

Use this skill when implementing or debugging **forms and controlled values** with Modus: **`modus-wc-text-input`**, **`modus-wc-textarea`**, **`modus-wc-number-input`**, **`modus-wc-select`**, **`modus-wc-checkbox`**, **`modus-wc-switch`**, **`modus-wc-radio-group`** / **`modus-wc-radio`**, and related labels/feedback. Prereqs: [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc) (styles, theme, Modus-only surface). For API specifics that vary by release, use **Modus Docs MCP** with your installed **`version`** (see [**modus-wc-mcp**](../modus-wc-mcp/SKILL.md)).

Modus Web Components 2.x is a **controlled form input library**. Every input is driven by a `value` prop, emits an `inputChange` custom event, and has its own opinions about how options/labels/feedback are passed in. These conventions differ from native HTML just enough to trip up anyone building on muscle memory.

## Confirm API version

1. Read **`@trimble-oss/moduswebcomponents`** from **`package.json`**.
2. Call MCP **`get_modus_component_data`** for each tag you use, with that **`version`**.
3. For narrative form patterns, call **`get_modus_implementation_data`** with **`docs_name`:** **`form-inputs`**.

## TL;DR rules

1. **`modus-wc-select` takes an `options: ISelectOption[]` prop. Never slot `<option>` children.**
2. **`modus-wc-select` has a built-in `label` prop. Don't wrap it in a `<label>` for visual labeling.**
3. **`inputChange` detail is the native event, not the value.** Read text/select values from **`e.detail?.target?.value`**.
4. **Checkbox / switch / radio in 2.x emit `detail: InputEvent` too** (not `{ newValue }` from 1.0). Read the boolean from **`e.detail?.target?.checked`**. The host's **`value`** prop is **boolean**, so write back **`Boolean(e.detail?.target?.checked)`**.
5. Centralize the readers in a tiny util (`readInputString` / `readInputChecked`) so a rename only happens in one place.
6. Prefer `size="sm"` for selects/inputs sitting in card headers or filter rails — default `md` is designed for full-width forms.

## Central idea: read values from `detail`, not guesses

In Modus 2.x, **every** form control listed above emits **`inputChange`** with **`detail: InputEvent`** (confirmed in MCP for `modus-wc-text-input`, `modus-wc-textarea`, `modus-wc-number-input`, `modus-wc-select`, `modus-wc-checkbox`, `modus-wc-switch`, `modus-wc-radio`). The 1.0 shape (`{ newValue }`, plain string `detail`) was removed.

| Control types | Primary event | How to read value |
|---------------|---------------|-------------------|
| Text input, textarea, number input, select | **`inputChange`** | **`detail`** is a native **`InputEvent`** — use **`e.detail?.target?.value`**. **Never** use **`String(e.detail)`** (yields `"[object InputEvent]"`) or `e.detail.newValue` (legacy 1.0). |
| Checkbox, switch, radio | **`inputChange`** | **`detail`** is also a native **`InputEvent`** — use **`e.detail?.target?.checked`** (the underlying input is `<input type="checkbox" \| radio>`). The host's **`value`** prop is **boolean**, so write back **`Boolean(e.detail?.target?.checked)`**. |
| Buttons | **`buttonClick`** | Not an input; use documented **`detail`** if any. |

## The universal event readers

Put this once in the project (e.g. `src/utils/modusFormEvents.ts`) and use it everywhere. Both helpers read from **`e.detail.target`** (the underlying native `<input>`); only the property differs (`value` vs `checked`).

```ts
type WithValue = { value?: string | null; checked?: boolean | null };

export function readInputString(e: CustomEvent): string {
  const t = (e.detail as InputEvent | undefined)?.target as WithValue | null;
  return t?.value ?? "";
}

export function readInputChecked(e: CustomEvent): boolean {
  const t = (e.detail as InputEvent | undefined)?.target as WithValue | null;
  return Boolean(t?.checked);
}
```

### Event detail shapes by component (Modus 2.x)

| Component                 | `inputChange` detail                                              | Reader                  |
| ------------------------- | ----------------------------------------------------------------- | ----------------------- |
| `modus-wc-select`         | `InputEvent` — `detail.target.value` is the selected `value`      | `readInputString(e)`    |
| `modus-wc-text-input`     | `InputEvent` — `detail.target.value` is the typed text            | `readInputString(e)`    |
| `modus-wc-number-input`   | `InputEvent` — `detail.target.value` is a stringified number      | `readInputString(e)` then `Number(...)` |
| `modus-wc-textarea`       | `InputEvent` — `detail.target.value` is the text                  | `readInputString(e)`    |
| `modus-wc-checkbox`       | `InputEvent` — `detail.target.checked` is the boolean             | `readInputChecked(e)`   |
| `modus-wc-switch`         | `InputEvent` — `detail.target.checked` is the boolean             | `readInputChecked(e)`   |
| `modus-wc-radio`          | `InputEvent` — `detail.target.checked` is the boolean             | `readInputChecked(e)`   |

> Anti-pattern: `String(e.detail ?? '')` — yields `"[object InputEvent]"` on text inputs and selects. `e.detail.newValue` — was the 1.0 shape, removed in 2.0. Always grab `detail.target.value` / `detail.target.checked`.

## The `<option>` disaster (what you actually came here for)

This renders a wall of text above the real combobox, not a dropdown:

### BAD — options as slotted children

```tsx
<ModusWcSelect
  value={tradeFilter}
  onInputChange={(e: CustomEvent) => setTradeFilter(String(e.detail ?? ''))}
>
  <option value="">All trades</option>
  {trades.map((t) => (
    <option key={t} value={t}>{t}</option>
  ))}
</ModusWcSelect>
```

Why it's broken:

- `modus-wc-select` **has no default slot**. Children are rendered as light-DOM orphans next to the shadow combobox — you'll see all 12 trades listed vertically in bare text, followed by an empty dropdown.
- `String(e.detail ?? '')` stores `"[object InputEvent]"` in state once the user somehow changes the value, because `detail` is the native `InputEvent`.

### GOOD — options prop + proper event reader

```tsx
import { readInputString } from '../utils/modusFormEvents';

<ModusWcSelect
  label="Trade / craft"
  size="sm"
  value={tradeFilter}
  options={[
    { label: 'All trades', value: '' },
    ...trades.map((t) => ({ label: t, value: t })),
  ]}
  onInputChange={(e: CustomEvent) => setTradeFilter(readInputString(e))}
/>
```

`ISelectOption` shape:

```ts
interface ISelectOption {
  label: string;      // visible text
  value: string;      // stored value (always a string)
  disabled?: boolean;
}
```

Dynamic options (async / fetched): build the array in a `useMemo` and pass it — React will diff-propagate to the `options` property. You never need `useEffect` with `el.options = …`.

## Boolean controls — checkbox, switch, radio

```tsx
import { readInputChecked } from '../utils/modusFormEvents';

<ModusWcCheckbox
  label="Email me weekly"
  value={isSubscribed}
  onInputChange={(e: CustomEvent) => setIsSubscribed(readInputChecked(e))}
/>

<ModusWcSwitch
  label="Notifications"
  value={notificationsOn}
  onInputChange={(e: CustomEvent) => setNotificationsOn(readInputChecked(e))}
/>
```

Notes:

- The host prop is **`value`** (boolean), **not** `checked` (a 1.0 prop name).
- `e.detail` is the **`InputEvent`**, not the boolean. `setState(e.detail)` will store the event object in state.
- `e.detail.newValue` was the 1.0 shape and was removed in 2.0.

## Labels, feedback, sizes

- **`label` prop** on select / text-input / checkbox / switch handles the accessible label, spacing, and `for`/`id` wiring. Use it instead of wrapping with `<label>` + `<ModusWcInputLabel>`. Only fall back to the manual pair when the design needs a label above a non-Modus control in the same column.
- **`feedback` prop** renders inline validation messages with icon + color:

  ```tsx
  <ModusWcSelect
    label="State"
    value={state}
    options={STATES}
    required
    feedback={
      state
        ? undefined
        : { level: 'error', message: 'State is required.' }
    }
    onInputChange={(e: CustomEvent) => setState(readInputString(e))}
  />
  ```
- **`size`**: `"sm" | "md" | "lg"`. Prefer `sm` in dense card headers and filter rails; default (`md`) in full-width forms; `lg` in marketing or single-action wizards.

## React-specific gotchas

1. **Controlled values only.** If you pass `value` once and stop updating it, the component becomes uncontrolled in weird ways on re-renders. Always sync state in the change handler.
2. **Don't put whitespace or comments inside `ModusWcSelect`.** It's a void shell in 2.x — anything you put inside is a light-DOM orphan (see above).
3. **React 19 shadow DOM patch.** Make sure the app shell already applies the patch from `modus-blueprint-wc` — without it, React's reconciler can crash when Modus components swap shadow children under conditional rendering (see [**modus-wc-react-slotted-hosts**](../modus-wc-react-slotted-hosts/SKILL.md)).
4. **Typed detail.** For strictness:

   ```tsx
   onInputChange={(e: CustomEvent<InputEvent>) => setX(readInputString(e))}
   onInputChange={(e: CustomEvent<InputEvent>) => setY(readInputChecked(e))}
   ```

## Framework-specific event names

| Framework | Listener for `inputChange` |
|-----------|----------------------------|
| React (`-react` wrapper) | `onInputChange={...}` |
| Vue (`-vue` wrapper) | `@input-change="..."` |
| Angular (`-angular` wrapper) | `(inputChange)="..."` |
| Vanilla DOM | `el.addEventListener('inputChange', ...)` |

The handler signature and `detail` shape are identical across frameworks; only the binding syntax differs.

## Quick audit checklist

Run this mental pass on every form in the app:

- [ ] No `<option>` children under `ModusWcSelect` / `modus-wc-select`.
- [ ] Every `ModusWcSelect` has `options={[...]}` (or `.options = …` in vanilla).
- [ ] Every `ModusWcSelect` uses the `label` prop, or is deliberately wrapped with `ModusWcInputLabel` for a specific layout reason.
- [ ] Every `onInputChange` goes through `readInputString` / `readInputChecked`.
- [ ] No `String(e.detail ?? '')`, no `Boolean(e.detail.newValue)`, no `e.detail.newValue` left in the tree.
- [ ] Sizes are deliberate: `sm` in card headers/filter rails, `md` in forms.
- [ ] Validation uses `feedback`, not ad-hoc `<div>` helper text.

## Migration snippet (Modus 1.x → 2.x)

| 1.x / HTML                                        | 2.x / correct                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| `<option>…</option>` children                     | `options={[{ label, value }]}`                                         |
| `String(e.detail ?? '')`                          | `readInputString(e)` (or `e.detail?.target?.value`)                    |
| `Boolean(e.detail?.newValue)` (checkbox/switch)   | `readInputChecked(e)` (or `Boolean(e.detail?.target?.checked)`)        |
| `error-text="..."` / `valid-text="..."`           | `feedback={{ level: 'error' / 'success', message: '...' }}`            |
| `placeholder="..."`                               | Not carried over — use a leading empty-`value` option like `All jobsites` |
| `size="medium"` / `size="large"`                  | `size="md"` / `size="lg"`                                              |
| External `<label for=…>` / `ModusWcInputLabel`    | Built-in `label="..."` prop                                            |
| `checked` (boolean) prop                          | `value` (boolean) prop                                                 |

## When something still looks off

1. Take a `browser_snapshot` — Modus selects should show up as `role: combobox` with a populated `options: […]`. If you see bare `listitem`s or loose text between buttons, the options are slotted children, not the prop.
2. Check installed version: `npm ls @trimble-oss/moduswebcomponents`.
3. Re-run the MCP query for that exact version — the `ISelectOption` shape or event names may have drifted.
4. For performance/flicker issues with large option lists (>200 items), switch to `modus-wc-autocomplete` — see [**modus-wc-autocomplete**](../modus-wc-autocomplete/SKILL.md).
