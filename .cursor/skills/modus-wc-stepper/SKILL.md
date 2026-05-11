---
name: modus-wc-stepper
description: Use modus-wc-stepper as a visual progress indicator for multi-step flows — IStepperItem[] with label/color/content, horizontal vs vertical orientation, mapping app step state into colors (completed/current/pending) — without expecting the component to drive navigation.
---

# Modus Web Components — stepper (`modus-wc-stepper`)

Use this skill when adding **visual progress indicators** for multi-step processes — onboarding, checkout, wizards, ordered tasks. Prefer **`modus-wc-stepper`** / **`ModusWcStepper`** over hand-rolled circle-and-line markup. Prereqs: [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc). Confirm the API with **`get_modus_component_data`** for **`modus-wc-stepper`** at your installed **`version`** (see [**modus-wc-mcp**](../modus-wc-mcp/SKILL.md)).

## API contract (Modus 2.x, confirm with MCP)

`modus-wc-stepper` is **purely visual** — it does **not** own a `currentStep` index, and it emits **no events**. You build the wizard logic in app code (next/back, validation, branching) and pass the result into `steps` to update what the user sees.

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `steps` | `IStepperItem[]` | `[]` | Array of step descriptors. Drive the array from your wizard state. |
| `orientation` | `'horizontal' \| 'vertical'` | (component default — confirm in MCP) | Vertical for sidebars, horizontal for pages. |
| `customClass` | `string` | `''` | |

```ts
interface IStepperItem {
  color?:
    | 'primary' | 'secondary' | 'accent'
    | 'info' | 'success' | 'warning' | 'error'
    | 'neutral';
  content?: string;       // Text/emoji shown inside the step indicator (e.g. "1", "✓")
  customClass?: string;
  label?: string;         // Caption rendered next to the indicator
}
```

There are **no** events, **no** `activeStep` / `currentStep` prop. Click handling, validation, and step gating all live in your app.

## Pattern: derive `steps` from wizard state

Map domain step status (`completed` / `current` / `pending`) → `color` so the stepper visually reflects progress:

```tsx
type StepStatus = "completed" | "current" | "pending" | "error";

const stepDefs: Array<{ key: string; label: string; status: StepStatus }> = [
  { key: "details",   label: "Details",   status: "completed" },
  { key: "review",    label: "Review",    status: "current"   },
  { key: "approval",  label: "Approval",  status: "pending"   },
  { key: "complete",  label: "Complete",  status: "pending"   },
];

const colorFor = (s: StepStatus): IStepperItem["color"] => {
  if (s === "completed") return "primary";
  if (s === "current")   return "info";
  if (s === "error")     return "error";
  return "neutral";
};

const items: IStepperItem[] = stepDefs.map((s, i) => ({
  label: s.label,
  color: colorFor(s.status),
  content: s.status === "completed" ? "✓" : String(i + 1),
}));

<ModusWcStepper steps={items} orientation="horizontal" aria-label="Project setup progress" />;
```

The wizard's **next/back buttons** live next to or below the stepper — they update your `stepDefs` state, not the stepper directly.

## Wizard scaffolding

Pair the stepper with your own form/view per step:

```tsx
const [activeIndex, setActiveIndex] = useState(0);

const next = () => {
  if (!validate(activeIndex)) return; // your per-step validation
  setActiveIndex((i) => Math.min(i + 1, stepDefs.length - 1));
};

const back = () => setActiveIndex((i) => Math.max(i - 1, 0));

<>
  <ModusWcStepper steps={items} aria-label="Project setup progress" />
  <section className="mt-4">
    {activeIndex === 0 && <DetailsStep />}
    {activeIndex === 1 && <ReviewStep />}
    {/* … */}
  </section>
  <div className="mt-4 flex justify-end gap-2">
    {activeIndex > 0 && (
      <ModusWcButton variant="outlined" color="tertiary" size="sm" onButtonClick={back}>
        Back
      </ModusWcButton>
    )}
    <ModusWcButton variant="filled" color="primary" size="sm" onButtonClick={next}>
      {activeIndex === stepDefs.length - 1 ? "Submit" : "Continue"}
    </ModusWcButton>
  </div>
</>;
```

## Orientation

- **Horizontal:** page-level wizards (checkout, onboarding) where the stepper sits **above** the form.
- **Vertical:** dense surfaces — settings panes, side rails, long approval chains. Combine with `modus-wc-divider` between sections only when needed.

Use one or the other — do not toggle orientation between viewports without testing label truncation; long step labels in horizontal orientation can wrap awkwardly.

## Accessibility

- Always set **`aria-label`** so the indicator is announced as a progress region.
- The stepper itself is non-interactive — make sure your **navigation buttons** are real, focusable controls, and consider an `aria-current="step"` on the equivalent step heading in the active panel.
- Don't put critical text only inside `IStepperItem.content` (e.g. "✓", "!") — pair with a meaningful `label` so the meaning is announced.

## Anti-patterns

- **Treating the stepper as a click target** — there is no `stepClick` event. If you want clickable steps (jump back to a completed step), wire your own buttons or a list of links above/below the stepper.
- **Looking for `activeStep` / `currentStep` props** — they do not exist. The "current" step is whichever one you give a distinct `color` (e.g. `info` or `warning`).
- **Hand-rolling the same chrome** with circles + connector lines in Tailwind — use `modus-wc-stepper` even for two steps.
- **Assigning semantic colors at random** (every step `primary`) — colors should communicate state. Use `neutral` for upcoming steps, a distinct color (`info` / `warning`) for the current step, and `primary` / `success` for completed steps.
- **Dropping long labels** like "Review and accept terms before continuing" inside the indicator — keep labels two or three words; put detail in the active panel.

## Related

- [**modus-wc-tabs**](../modus-wc-tabs/SKILL.md) — when steps are **non-linear** and the user can jump between sections.
- [**modus-wc-form-inputs**](../modus-wc-form-inputs/SKILL.md) — per-step form validation.
- [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc) — UX defaults, brevity.
