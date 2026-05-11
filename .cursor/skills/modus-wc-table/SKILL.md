---
name: modus-wc-table
description: Build data tables with modus-wc-table—columns, data, cellRenderer, zebra striping, nested Modus components in cells, and scalable row counts—without raw HTML tables or nth-child hacks.
---

# Modus Web Components — data table (`modus-wc-table`)

Use this skill when implementing **tabular data**, **grids**, or **dense lists** that belong in a table. Prefer **`modus-wc-table`** / **`ModusWcTable`** over raw **`<table>`**, **`<tr>`**, **`<td>`** wrappers, or Tailwind-only “tables” that duplicate Modus behavior. Prereqs: [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc) **Component selection**. Confirm props (**`columns`**, **`data`**, **`cellRenderer`**, **`zebra`**, sorting, selection) with **Modus Docs MCP** and your installed **`version`** (see [**modus-wc-mcp**](../modus-wc-mcp/SKILL.md)).

## Confirm API version

1. Read **`@trimble-oss/moduswebcomponents`** from **`package.json`**.
2. **`get_modus_component_data`** with **`component_name`:** **`modus-wc-table`** and that **`version`**.
3. If you need sorting, pagination integration, or row selection, verify **event names** and **column definitions** in that response — they evolve with semver.

## Core pattern

- Supply **`columns`** (definitions: field keys, headers, optional render hints) and **`data`** (row objects).
- Use **`cellRenderer`** (or the documented equivalent for your version) to return **`string`** or **`HTMLElement`** per cell when cells need **badges, avatars, icons, buttons, or progress** — compose **other Modus components** inside the cell, not plain styled spans for those atoms.
- Use **`zebra`** (or the documented prop name from MCP) for **alternating row backgrounds**. **Do not** recreate zebra striping with **`nth-child`**, per-row utility classes, or ad hoc CSS when the table component already supports it.

## Layout and overflow

- Wrap the table in a container with **`min-w-0`** (flex/grid child) so **horizontal scroll** works when columns exceed width.
- Align with [.cursor/rules/modus-layout.mdc](../../rules/modus-layout.mdc) for **card + table** composition (toolbar above table, footer actions).

## Scale and performance

- For **large** datasets, prefer **server pagination**, **virtualization**, or **chunked data** over mounting thousands of row objects at once. The exact strategy is product-specific; the anti-pattern is **unbounded row arrays** with no paging.
- **`cellRenderer`** that allocates heavy DOM per cell scales with **rows × columns** — keep renderers lean; lazy-load row detail if needed.

## Pagination

Pair the table with **`modus-wc-pagination`** in the card footer (or directly under the table on full-bleed pages). Drive **`page`** as state, compute **`count = Math.ceil(totalRows / pageSize)`**, and slice rows server-side (preferred) or client-side. Read `pageChange` as **`e.detail.newPage`**, never `e.detail`. Full pattern (server vs client paging, page-size selector, reset-on-filter): see the [**modus-wc-pagination**](../modus-wc-pagination/SKILL.md) skill.

## Anti-patterns

- **Raw HTML `<table>`** with custom React/Vue **Th/Td** components for app data grids — use **`modus-wc-table`** unless MCP confirms **no** suitable API for your case (very rare).
- **Duplicating Modus table styling** with Tailwind on `<tr>`/`<td>` for standard product tables.
- **Guessing** sort or selection APIs — always **`get_modus_component_data`** for **`modus-wc-table`** at your **semver**.

## Related

- [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc) — **Tables (`modus-wc-table`)** UX defaults.
- [**modus-wc-pagination**](../modus-wc-pagination/SKILL.md) — paging in the table footer.
- [**modus-wc-form-inputs**](../modus-wc-form-inputs/SKILL.md) — filters and toolbar inputs above the table.
