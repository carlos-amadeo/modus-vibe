---
name: modus-wc-file-dropzone
description: Wire modus-wc-file-dropzone — acceptFileTypes (.pdf,.doc or image/*), multiple, maxFileCount/maxFileNameLength/maxTotalFileSizeBytes, fileSelect (FileList), reset() method, slot="dropzone" for progress UI, customizable instructions/messages — without react-dropzone or hand-rolled drag-drop overlays.
---

# Modus Web Components — file dropzone (`modus-wc-file-dropzone`)

Use this skill when adding **drag-and-drop file upload** zones — single or multi-file, image-only, document-only, or restricted by size/count. Prefer **`modus-wc-file-dropzone`** / **`ModusWcFileDropzone`** over **react-dropzone**, **filestack**, or hand-rolled `<input type="file">` + drag overlays. Prereqs: [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc). Confirm the API with **`get_modus_component_data`** for **`modus-wc-file-dropzone`** at your installed **`version`** (see [**modus-wc-mcp**](../modus-wc-mcp/SKILL.md)).

## API contract (Modus 2.x, confirm with MCP)

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `acceptFileTypes` (`accept-file-types`) | `string` | none | Comma-separated extensions (`'.pdf,.docx'`) or MIME globs (`'image/*'`). |
| `multiple` | `boolean` | `false` | Allow more than one file. |
| `maxFileCount` (`max-file-count`) | `number` | none | Cap on how many files can be selected. |
| `maxFileNameLength` (`max-file-name-length`) | `number` | none | Per-filename character limit. |
| `maxTotalFileSizeBytes` (`max-total-file-size-bytes`) | `number` | none | Total bytes across all selected files. |
| `instructions` | `string` | (built-in) | Default dropzone copy. |
| `fileDraggedOverInstructions` (`file-dragged-over-instructions`) | `string` | (built-in) | Copy shown while files are hovered above the dropzone. |
| `invalidFileTypeMessage` (`invalid-file-type-message`) | `string` | (built-in) | Error shown when a rejected MIME type is dropped. |
| `successMessage` (`success-message`) | `string` | none | Shown after a successful upload (set yourself when your upload completes). |
| `includeStateIcon` (`include-state-icon`) | `boolean` | `true` | Show the upload/success/error icon. |
| `disabled` | `boolean` | `false` | |
| `customClass` | `string` | `''` | |

**Slot:** `dropzone` — extra content rendered **inside** the dropzone area. Common usage: a progress bar (`modus-wc-progress`) while an upload runs.

**Event:** `fileSelect` with `detail: FileList` — the user-selected files **(after** the component validates against `acceptFileTypes` / `maxFileCount` / `maxTotalFileSizeBytes`).

**Method:** `reset()` (returns `Promise<void>`) — clears error/success state and resets the dropzone to its initial appearance. Call from a ref / DOM lookup.

The dropzone **does not upload anything** — it only emits the chosen `FileList`. You wire the actual upload (fetch, S3, Drive, etc.) yourself.

## Minimal pattern

```tsx
import { useRef, useState } from "react";

const dropzoneRef = useRef<(HTMLElement & { reset: () => Promise<void> }) | null>(null);
const [files, setFiles] = useState<File[]>([]);
const [progress, setProgress] = useState<number | null>(null);
const [success, setSuccess] = useState(false);

<>
  <ModusWcFileDropzone
    ref={dropzoneRef}
    acceptFileTypes=".pdf,.doc,.docx"
    multiple
    maxFileCount={5}
    maxTotalFileSizeBytes={20 * 1024 * 1024}
    instructions="Drag files here or browse to upload"
    invalidFileTypeMessage="Only .pdf, .doc, and .docx files are allowed."
    successMessage={success ? "Files uploaded" : undefined}
    onFileSelect={async (e: CustomEvent<FileList>) => {
      const list = Array.from(e.detail);
      setFiles(list);
      setSuccess(false);
      try {
        await uploadAll(list, setProgress);
        setSuccess(true);
      } catch {
        // Component will already show error UI for type/size; this is for network errors
      } finally {
        setProgress(null);
      }
    }}
  >
    {progress !== null && (
      <div slot="dropzone" className="mt-3">
        <ModusWcProgress value={progress} label={`${progress}% uploaded`} />
      </div>
    )}
  </ModusWcFileDropzone>

  {files.length > 0 && (
    <ModusWcButton
      variant="outlined"
      color="tertiary"
      size="sm"
      onButtonClick={async () => {
        await dropzoneRef.current?.reset();
        setFiles([]);
        setSuccess(false);
      }}
    >
      Reset
    </ModusWcButton>
  )}
</>;
```

## Limits and validation

- **`acceptFileTypes`**: pass either extensions (`'.pdf,.png'`) or MIME globs (`'image/*'`). The component shows `invalidFileTypeMessage` when a user drops a rejected type.
- **`maxFileCount`** and **`maxTotalFileSizeBytes`** are checked together — the component blocks the selection (and shows an error) when either is exceeded.
- **`maxFileNameLength`** is per-file — useful for backends that limit object keys.
- **Cross-validation** the component does not do (e.g. "no two files with the same name", "PDFs ≤ 5MB but PNGs ≤ 1MB") goes in your `onFileSelect` handler — show your own error via a sibling `modus-wc-alert` or by toggling `feedback`-style messaging in the surrounding form.

## Single-file vs multi-file

- Default (no `multiple`): one file at a time. Re-selecting replaces the previous file.
- `multiple`: the user can drop or pick several files. The `FileList` may contain one or many; check `length`.
- When you only want one file but with strict validation, prefer **single mode + your own error** over `maxFileCount={1}` + `multiple` (single mode also disables the multi-file UI in the picker).

## Progress UI inside the slot

Mount the progress UI in **`slot="dropzone"`** so it sits inside the dropzone chrome. Toggle it with state — do **not** mount/unmount the slotted wrapper itself with conditional rendering at the parent level (that fights Stencil slot projection vs React reconciliation, see [**modus-wc-react-slotted-hosts**](../modus-wc-react-slotted-hosts/SKILL.md)). Render the wrapper unconditionally and toggle its **inner** content:

```tsx
<div slot="dropzone" className="mt-3">
  {progress !== null ? (
    <ModusWcProgress value={progress} label={`${progress}% uploaded`} />
  ) : null}
</div>
```

## Resetting

Call **`element.reset()`** to return to the initial state (clear progress, errors, and success). Two common ways to grab the element:

```tsx
// React ref (works on the React wrapper)
const ref = useRef<HTMLElement & { reset: () => Promise<void> }>(null);
<ModusWcFileDropzone ref={ref} … />;
await ref.current?.reset();

// Or by id
const el = document.getElementById("uploader") as HTMLElement & { reset: () => Promise<void> };
await el.reset();
```

`reset()` is async — `await` it (or `void it`) so React state updates after the component finishes resetting.

## Accessibility

- The dropzone exposes a real `<input type="file">` under the hood, so keyboard users can Tab to it and press Enter to open the OS file picker — keep that behavior intact.
- Provide an **`aria-label`** when the surrounding context is not obvious from the visible label, e.g. "Resume upload area".
- Make sure error messages are visible (do **not** override the component's error state with `display: none`); pair with a live region (`aria-live="polite"`) if your wrapper announces network errors.

## Anti-patterns

- **react-dropzone** alongside Modus — violates the Modus-only-surface rule.
- **Hand-rolled drag overlay** with `dragenter` / `dragleave` listeners on a div — no theme awareness, no MIME validation, no error UI.
- **Treating `fileSelect` `detail` as a `File[]`** — it's a `FileList`. Use `Array.from(e.detail)` to get an array.
- **Uploading inside `onFileSelect` without showing progress** for files larger than a few MB — use the `slot="dropzone"` progress pattern.
- **Mounting/unmounting `<div slot="dropzone">`** (the wrapper) — toggle its inner content instead.
- **Omitting `maxTotalFileSizeBytes`** when the backend has a payload limit — you'll surface confusing 413s instead of a user-friendly inline error.

## Related

- **`modus-wc-progress`** — progress UI inside `slot="dropzone"`.
- [**modus-wc-react-slotted-hosts**](../modus-wc-react-slotted-hosts/SKILL.md) — slot conditional content rules.
- [.cursor/rules/modus-essentials.mdc](../../rules/modus-essentials.mdc) — Modus-only surface, brevity in instructions.
