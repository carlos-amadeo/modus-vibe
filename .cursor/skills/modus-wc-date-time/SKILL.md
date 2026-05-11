---
name: modus-wc-date-time
description: Wire modus-wc-date and modus-wc-time-input — value formats (date format prop ISO/MMM DD/etc., time always HH:mm[:ss]), inputChange via e.detail.target.value, min/max bounds, weekStartDay, datalist for time options, IInputFeedbackProp for validation — without raw <input type="date|time">.
---

# Modus Web Components — date and time inputs (`modus-wc-date`, `modus-wc-time-input`)

Use this skill when adding **date pickers** or **time inputs** in forms. Prefer **`modus-wc-date`** / **`modus-wc-time-input`** over raw `<input type="date">` / `<input type="time">` (browser-default chrome, no theme awareness, inconsistent format) and over react-day-picker / day.js wrappers (parallel design system). Prereqs: [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc), [**modus-wc-form-inputs**](../modus-wc-form-inputs/SKILL.md). Confirm both APIs with **`get_modus_component_data`** at your installed **`version`** (see [**modus-wc-mcp**](../modus-wc-mcp/SKILL.md)).

## `modus-wc-date` — date picker

### API contract (Modus 2.x, confirm with MCP)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `value` | `string` | `''` | The current value, **formatted per the `format` prop**. Treat as **controlled**. |
| `format` | `'yyyy-mm-dd' \| 'dd-mm-yyyy' \| 'mm-dd-yyyy' \| 'yyyy/mm/dd' \| 'dd/mm/yyyy' \| 'mm/dd/yyyy' \| 'MMM DD, YYYY'` | `'dd-mm-yyyy'` | Drives both display and accepted input. |
| `min` / `max` | `string` | none | Bounds, in the same `format`. |
| `bordered` | `boolean` | `true` | |
| `disabled` / `readOnly` / `required` | `boolean` | as labeled | |
| `label` | `string` | none | Built-in label — prefer over wrapping in `<label>` + `ModusWcInputLabel`. |
| `feedback` | `IInputFeedbackProp` | none | Inline validation message: `{ level: 'error' \| 'warning' \| 'info' \| 'success', message?: string }`. |
| `weekStartDay` | `'sunday' \| 'monday' \| 'tuesday' \| … \| 'saturday'` | `'sunday'` | First column in the calendar grid. |
| `showWeekNumbers` | `boolean` | `false` | ISO 8601 week numbers (Monday-based, regardless of `weekStartDay`). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `customClass` | `string` | `''` | |

**Events:**

- `inputChange` — `detail: InputEvent`. Read **`e.detail?.target?.value`** (matches the rest of [**modus-wc-form-inputs**](../modus-wc-form-inputs/SKILL.md)).
- `inputBlur` / `inputFocus` — `detail: FocusEvent`.
- `calendarMonthChange` / `calendarYearChange` — `detail: number` (the new month/year). Use these to drive analytics or to fetch data (e.g. month-aware availability).

### Pattern

```tsx
import { readInputString } from "@/utils/modusFormEvents";

const [date, setDate] = useState("");                  // empty string until user picks

<ModusWcDate
  label="Start date"
  value={date}
  format="MMM DD, YYYY"
  min="Jan 01, 2025"
  max="Dec 31, 2026"
  size="sm"
  weekStartDay="monday"
  required
  feedback={!date ? { level: "error", message: "Pick a start date" } : undefined}
  onInputChange={(e: CustomEvent) => setDate(readInputString(e))}
/>;
```

### Storing dates as ISO

If you store dates in app state / API as **ISO `yyyy-mm-dd`**, render with `format="yyyy-mm-dd"` so the prop value matches your model and you do not need a parser. Other formats are display preferences — the value comes back in the same format you set.

## `modus-wc-time-input` — time picker

### API contract (Modus 2.x, confirm with MCP)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `value` | `string` | `''` | **Always 24-hour, zero-padded:** `HH:mm` or `HH:mm:ss` (when `showSeconds` is true). |
| `showSeconds` | `boolean` | `false` | Adds `:ss` to display and value. Sets `step` to 1 internally. |
| `step` | `number` (s) | `60` | Granularity in seconds. Overrides `showSeconds` if both are set. |
| `min` / `max` | `string` | none | `HH:mm` or `HH:mm:ss`. |
| `datalistId` | `string` | none | ID of an external `<datalist>` element with `<option value="HH:mm">…`. |
| `datalistOptions` | `string[]` | `[]` | Inline list of pre-defined options (alternative to `datalistId`). |
| `bordered` / `disabled` / `readOnly` / `required` | `boolean` | as labeled | |
| `label` | `string` | none | |
| `feedback` | `IInputFeedbackProp` | none | |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | |
| `autoComplete` | `'on' \| 'off'` | none | |

**Events:** `inputChange` — `detail: Event` (the underlying `<input>` change). Read **`e.detail?.target?.value`**.

### Pattern

```tsx
const [time, setTime] = useState("");                  // "" → "09:30" once picked

<ModusWcTimeInput
  label="Meeting time"
  value={time}
  size="sm"
  min="08:00"
  max="18:00"
  datalistOptions={["09:00", "09:30", "10:00", "13:00", "14:30"]}
  onInputChange={(e: CustomEvent) => setTime(readInputString(e))}
/>;
```

### Datalist suggestions

Two options:

1. **Inline list** — `datalistOptions={[…]}`. Easiest; the component creates the `<datalist>` for you.
2. **External `<datalist>`** — render `<datalist id="…"><option value="08:30"/>…</datalist>` somewhere in the same document and pass `datalistId="…"`.

Each option must be in **`HH:mm`** or **`HH:mm:ss`** format.

## Cross-cutting: pairing date + time

A common pattern is a "scheduled at" picker:

```tsx
const [date, setDate] = useState("");
const [time, setTime] = useState("");

<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
  <ModusWcDate
    label="Date"
    value={date}
    format="yyyy-mm-dd"
    size="sm"
    onInputChange={(e: CustomEvent) => setDate(readInputString(e))}
  />
  <ModusWcTimeInput
    label="Time"
    value={time}
    size="sm"
    onInputChange={(e: CustomEvent) => setTime(readInputString(e))}
  />
</div>;

const isoTimestamp = date && time
  ? `${date}T${time.length === 5 ? `${time}:00` : time}`
  : "";
```

## Localization

- **`format`** on `modus-wc-date` covers the most common product locales. For locales the prop does not list (e.g. day-month with month name in another script), preprocess the user-facing string in app code; do **not** monkey-patch the inner shadow DOM.
- `modus-wc-time-input` always emits `HH:mm[:ss]` 24-hour. Convert to AM/PM only at display surfaces (e.g. read-only summary text) — keep state and storage in 24-hour format.
- `weekStartDay` should follow the user's locale (Sunday for en-US, Monday for most other locales).

## Validation

- **Required:** set `required` and pair with `feedback={{ level: 'error', message: '…' }}` in your render when the value is empty after submit.
- **Range:** use `min` / `max` for native validation; show a clearer message via `feedback` if the user types out of range.
- **Cross-field:** for "end ≥ start", validate in your form handler and set `feedback` on the offending input — neither component does cross-field checks.

## Anti-patterns

- **Raw `<input type="date">` / `<input type="time">`** in product UI — inconsistent across browsers and themes.
- **Storing the displayed string as the model** — fine for `modus-wc-date` because format is round-trippable, but **don't** store "9:30 AM" from a hand-formatted helper as state when the component will hand you `09:30`. Use what the component emits.
- **Reading the value from `e.detail`** instead of `e.detail.target.value` — the `detail` is an `InputEvent` (or `Event`), not the string.
- **Custom calendar/clock UIs** with react-day-picker, dayjs, or moment — pick Modus and lean on `format` + `feedback`.
- **Forgetting `weekStartDay`** in non-US products — Sunday-first calendars look wrong in Europe and most of Asia.
- **Treating `step` and `showSeconds` as additive** — `step` overrides `showSeconds` when both are provided.

## Related

- [**modus-wc-form-inputs**](../modus-wc-form-inputs/SKILL.md) — `inputChange` / `detail` rules apply identically here.
- [.cursor/rules/modus-events-and-overrides.mdc](../../rules/modus-events-and-overrides.mdc) → **Event Handling Patterns**.
- [.cursor/rules/modus-accessibility.mdc](../../rules/modus-accessibility.mdc) — required fields, error messaging.
