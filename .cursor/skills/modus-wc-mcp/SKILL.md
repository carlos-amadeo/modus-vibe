---
name: modus-wc-mcp
description: Look up Modus Web Components props, events, slots, and implementation guides via the user-modus-docs MCP using the project’s installed package version.
---

# Modus Web Components — docs MCP

Use this skill when implementing or debugging Modus components and you need **authoritative** API details (properties, events, methods, slots, examples) or **framework integration** docs.

## Before any MCP call

1. Open the project **[package.json](package.json)** and read the version of **`@trimble-oss/moduswebcomponents`** (e.g. `1.2.0`).
2. Pass that string as the **`version`** argument on MCP tools that support it so returned docs match the installed build.

## Tools (server `user-modus-docs`)

Invoke the **`user-modus-docs`** server through your AI coding tool’s MCP integration, using each tool’s published schema. Typical tools:

### `get_modus_component_data`

- **Use for:** One component’s API and usage.
- **Arguments:** `component_name` (required), `version` (recommended).
- **Component names:** `modus-wc-{name}` (e.g. `modus-wc-button`, `modus-wc-navbar`, `modus-wc-side-navigation`).
- **Discovery:** `component_name` = `_all_components` returns the catalog when you need to find the exact tag name.

### `get_modus_implementation_data`

- **Use for:** Framework setup and cross-cutting guides.
- **Arguments:** `docs_name` (required), `version` (recommended).
- **Examples of `docs_name`:** `react`, `vue`, `angular`, `getting-started`, `form-inputs`, `accessibility`, `modus-icon-usage`, `styling`, `testing`.

## Workflow

1. Identify the **`modus-wc-*`** tag or React wrapper you are wiring.
2. Fetch **component data** with the installed **base package version**.
3. If the issue is bundler/framework setup (not one component), fetch **implementation data** for `react` (or your stack) and relevant guides (`form-inputs`, etc.).
4. Implement using **documented event names and `detail` shapes** from the response—not guesses.

### High-friction component: Autocomplete

For **`modus-wc-autocomplete`**, use the dedicated skill [.cursor/skills/modus-wc-autocomplete/SKILL.md](../modus-wc-autocomplete/SKILL.md)—it encodes **`items`** updates, **`inputChange`** vs **`itemSelect`**, multi-select, and framework bindings; still pass **`version`** into MCP when APIs drift.

## When not to rely on MCP alone

- **Integration pitfalls** (any stack) are summarized in [.cursor/rules/modus-wc-integration.mdc](../../rules/modus-wc-integration.mdc). A concrete **React / Vite** Modus shell also exists as the **`trimble-oss/modus-blueprint`** repo on GitHub; pair it with [modus-setup.mdc](../../rules/modus-setup.mdc) for narrative patterns.
