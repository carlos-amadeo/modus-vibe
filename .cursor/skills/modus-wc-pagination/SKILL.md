---
name: modus-wc-pagination
description: Wire modus-wc-pagination correctly — count vs page (1-based), pageChange { newPage, prevPage }, optional next/prev button text vs default icons, ariaLabelValues for screen readers, and integration with server-paged or client-paged modus-wc-table — without hand-rolled prev/next button rows.
---

# Modus Web Components — pagination (`modus-wc-pagination`)

Use this skill when paging **tables**, **search results**, or any **long list** that can be sliced into pages. Prefer **`modus-wc-pagination`** / **`ModusWcPagination`** over hand-rolled prev/next button rows or shadcn pagination. Prereqs: [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc), [**modus-wc-table**](../modus-wc-table/SKILL.md). Confirm the API with **`get_modus_component_data`** for **`modus-wc-pagination`** at your installed **`version`** (see [**modus-wc-mcp**](../modus-wc-mcp/SKILL.md)).

## API contract (Modus 2.x, confirm with MCP)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `count` | `number` | `1` | **Total number of pages**, not total rows. Compute as `Math.ceil(totalRows / pageSize)`. |
| `page` | `number` | `1` | **1-based** index of the current page. Treat as **controlled** in app code. |
| `nextButtonText` (`next-button-text`) | `string` | none | If set, the next button shows text instead of an icon. |
| `prevButtonText` (`prev-button-text`) | `string` | none | Same for the previous button. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Match the surrounding density (table footer, dense list). |
| `ariaLabelValues` (`.ariaLabelValues=`) | `IAriaLabelValues` | provider defaults | Screen-reader labels for each control. |
| `customClass` | `string` | `''` | |

```ts
interface IAriaLabelValues {
  firstPage?: string;       // e.g. "First page"
  lastPage?: string;
  nextPage?: string;
  previousPage?: string;
  page?: string;            // Use {0} as placeholder, e.g. "Page {0}"
}
```

**Event:** `pageChange` with `detail: { newPage: number; prevPage: number }`. Read **`e.detail.newPage`**, not `e.detail` (which is the object, not a number) and not the legacy 1.0 single-number payload.

The component renders **at most 5 page buttons** plus first/last/prev/next. There are no ellipses — the strip slides as `page` moves.

## Controlled pattern

```tsx
const totalRows = 423;
const pageSize = 25;
const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
const [page, setPage] = useState(1);

<ModusWcPagination
  count={totalPages}
  page={page}
  size="sm"
  ariaLabelValues={{
    firstPage: "First page",
    lastPage: "Last page",
    nextPage: "Next page",
    previousPage: "Previous page",
    page: "Page {0}",
  }}
  onPageChange={(e: CustomEvent<{ newPage: number; prevPage: number }>) => {
    setPage(e.detail.newPage);
  }}
/>;
```

## With `modus-wc-table` — server paging

When the table backend supports `LIMIT`/`OFFSET`, slice on the server and render only the current page's rows:

```tsx
const { data, isLoading, totalRows } = useTableQuery({ page, pageSize });
const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

<>
  <ModusWcTable columns={columns} data={data} zebra />
  <div className="flex items-center justify-between mt-2">
    <ModusWcTypography hierarchy="p" size="sm">
      Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalRows)} of {totalRows}
    </ModusWcTypography>
    <ModusWcPagination
      count={totalPages}
      page={page}
      size="sm"
      onPageChange={(e: CustomEvent<{ newPage: number; prevPage: number }>) =>
        setPage(e.detail.newPage)
      }
    />
  </div>
</>;
```

## With `modus-wc-table` — client paging

For data already in memory, derive the visible slice from `page`:

```tsx
const start = (page - 1) * pageSize;
const visible = useMemo(() => allRows.slice(start, start + pageSize), [allRows, start, pageSize]);

<ModusWcTable columns={columns} data={visible} zebra />;
```

If the dataset is **very** large (thousands+ of rows), prefer **server paging** or **virtualization** over slicing in memory each render — see [**modus-wc-table**](../modus-wc-table/SKILL.md) → **Scale and performance**.

## Page-size selector

`modus-wc-pagination` does not include a page-size selector. Pair it with a `modus-wc-select` when product needs one:

```tsx
const sizes: ISelectOption[] = [
  { label: "10 / page", value: "10" },
  { label: "25 / page", value: "25" },
  { label: "50 / page", value: "50" },
];

<div className="flex items-center gap-3">
  <ModusWcSelect
    label="Rows"
    value={String(pageSize)}
    options={sizes}
    onInputChange={(e: CustomEvent) => {
      const next = Number(readInputString(e));
      setPageSize(next);
      setPage(1); // Reset to first page when size changes
    }}
  />
  <ModusWcPagination count={totalPages} page={page} onPageChange={...} />
</div>;
```

Always **reset `page` to 1** when `pageSize` changes — otherwise the new total page count may be smaller than the current page and the table goes empty.

## Density

- Inside a **card footer** or under a table, default `size="sm"`.
- For **standalone** pagination on a search results page, `md` is fine.
- Avoid `lg` unless the design explicitly calls for it.

## Accessibility

- **Always set `ariaLabelValues`** in production apps so screen readers announce "First page", "Page 3", "Next page" etc. The defaults are English-only.
- Localize the strings via your i18n layer; the **`page`** label uses `{0}` as the page-number placeholder.
- The component emits `pageChange` for keyboard arrows on the focused buttons — don't add your own keydown handlers that swallow Left/Right/Enter.

## Reading `pageChange` correctly

| Wrong | Right |
|-------|-------|
| `setPage(e.detail)` | `setPage(e.detail.newPage)` |
| `e.detail.page` | `e.detail.newPage` |
| `e.detail.value` | `e.detail.newPage` |
| `e.detail.activePage` | `e.detail.newPage` (legacy 1.0 prop name `active-page` is gone) |

## Anti-patterns

- **Hand-rolled prev/next button rows** with a numeric input — use `modus-wc-pagination`.
- **`count` set to total rows** instead of total pages — the component renders one button per page; thousands of buttons will obviously break the strip.
- **0-based `page`** — the component is 1-based.
- **Mounting pagination with `count={0}`** when there are no rows — render an empty state instead, hide the pagination.
- **Different `size` on the table and the pagination** under it — keep both `sm` (or both `md`) so the footer line reads consistently.
- **Forgetting to reset `page` to 1 on a filter or page-size change** — the most common cause of "the table looks empty after I filter".

## Related

- [**modus-wc-table**](../modus-wc-table/SKILL.md) — primary host for pagination.
- [**modus-wc-form-inputs**](../modus-wc-form-inputs/SKILL.md) — the page-size select.
- [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc) — UX defaults (compact controls, brevity).
