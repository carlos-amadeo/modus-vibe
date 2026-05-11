---
name: modus-wc-autocomplete
description: Set up Modus modus-wc-autocomplete correctly in web components (default), React, Angular, or Vue—items API, events, multi-select, async search, and MCP doc lookup.
---

# Modus Autocomplete (`modus-wc-autocomplete`)

Use this skill when adding or fixing **Modus Autocomplete**. Prereqs: Modus packages, global styles, and icons per [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc). For props/events that differ by release, re-fetch with the **Modus docs MCP** (see below).

## Confirm API version

1. Read `@trimble-oss/moduswebcomponents` from the project **`package.json`**.
2. Call MCP **`get_modus_component_data`** with `component_name: "modus-wc-autocomplete"` and that **`version`** (server `user-modus-docs`).
3. For framework setup patterns, use **`get_modus_implementation_data`** with `docs_name`: `react`, `angular`, `vue`, or `form-inputs`.

## Item shape (`IAutocompleteItem`)

Each option should include at least:

- **`label`** (string) — shown text  
- **`value`** (string) — stable id  
- **`visibleInMenu`** (boolean) — include in dropdown filtering  

Optional fields include **`selected`**, **`focused`**, **`disabled`**, **`checkbox`**, tooltip fields, etc. (see MCP output for the installed version).

## Critical: `items` is not “props only”

- Assign suggestions with the **`items`** property (array of `IAutocompleteItem`).
- **Create a new array reference** when options change so the component re-renders correctly (docs: “Creating a new array of items will ensure proper component re-render”).
- In **vanilla** or when frameworks struggle with deep property updates, set on the element:  
  `element.items = [...newItems]`.

## Events (different from plain text inputs)

| Event | `detail` / notes |
|-------|------------------|
| **`inputChange`** | Native-style **`Event`**; debounced by **`debounceMs`** (default 300; `0` disables). Read text with **`e.detail?.target?.value`** (guard `detail` / `target`). |
| **`itemSelect`** | **`IAutocompleteItem`** — use for committing selection. |
| **`chipRemove`** | **`IAutocompleteItem`** (multi-select chips). |
| **`chipsExpansionChange`** | `{ expanded: boolean }`. |
| **`clearClick`** | void. |
| **`inputFocus`** / **`inputBlur`** | `FocusEvent`. |

Do **not** assume `inputChange` passes a plain string in `detail`.

## Multi-select

- Set **`multiSelect`**.  
- Handle **`chipRemove`** and optionally **`chipsExpansionChange`**; use **`maxChips`** for overflow UI (`-1` disables cap).

## Async / server search

- On **`inputChange`**, read the query from **`e.detail?.target`**, optionally set **`showSpinner`**, then replace **`items`** with a **new array** when results arrive (see Modus Storybook “dynamic options” / spinner patterns in MCP-backed docs).

## Optional: custom filtering / keyboard / selection

- **`customInputChange`**, **`customItemSelect`**, **`customKeyDown`**, **`customBlur`** — if set, they **override** default behavior for that concern (use only when you need full control).

## Public methods (call on the host element)

Useful for tests or toolbar actions: **`selectItem(item | null)`**, **`openMenu()`**, **`closeMenu()`**, **`toggleMenu()`**, **`focusInput()`**, **`clearInput()`** — all async-returning in the documented API.

## Slots

- **`menu-items`** — custom menu content (advanced; often paired with custom handlers).  
- Custom start icon and similar patterns exist in component stories (verify slot names via MCP for your version).

## Framework bindings (event names)

Use the framework’s mapping for **custom events** on the host:

| Concern | Web component | React | Vue | Angular |
|--------|----------------|-------|-----|---------|
| Typing / debounced change | `inputChange` | `onInputChange` | `@input-change` | `(inputChange)` |
| Pick option | `itemSelect` | `onItemSelect` | `@item-select` | `(itemSelect)` |
| Clear control | `clearClick` | `onClearClick` | `@clear-click` | `(clearClick)` |

React wrapper tag: **`ModusWcAutocomplete`** from `@trimble-oss/moduswebcomponents-react` (ensure package variant matches your React major). Angular/Vue: use their Modus packages and `CUSTOM_ELEMENTS_SCHEMA` / registration per **`get_modus_implementation_data`**.

## Accessibility and UX defaults

- Provide **`aria-label`** or associated label when there is no visible **`label`**.  
- Inline / borderless fields: set **`bordered={false}`** / `bordered="false"` where product uses that pattern.  
- Use Modus **`noResults`** object for empty-state messaging instead of ad-hoc DOM.

## Related skills

- **MCP tool usage:** [.cursor/skills/modus-wc-mcp/SKILL.md](../modus-wc-mcp/SKILL.md)  
- **Repo shell / theme / React+WC:** [modus-wc-integration.mdc](../../rules/modus-wc-integration.mdc) and [modus-setup.mdc](../../rules/modus-setup.mdc); the **`trimble-oss/modus-blueprint`** GitHub repository is an optional full-app reference.

*Event and property summaries above are aligned with Modus Web Components **1.2.0** MCP output; always reconcile with `get_modus_component_data` for other versions.*
