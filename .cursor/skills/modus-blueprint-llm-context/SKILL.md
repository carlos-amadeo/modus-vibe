---
name: modus-blueprint-llm-context
description: Resolve “modus pattern …” / “modus template …” (and Modus Blueprint doc URLs) to machine-readable Markdown and the same agent prompt used on modus.trimble.com—fetch public/modus-llm companion files and implement with Modus Web Components.
---

# Modus Blueprint — LLM context (patterns, templates, components)

Use this skill when the user references **Modus documentation patterns or templates** by name, or pastes a **`modus.trimble.com`** URL to `/patterns/...` or `/templates/...`, and you need **implementation-ready** code and guidance without relying on client-rendered SPA HTML alone.

## Canonical machine-readable files

The Modus Blueprint site ships static Markdown next to the SPA (no JavaScript required):

- **Index:** `https://modus.trimble.com/modus-llm/_index.json`  
  (When working inside the **modus-blueprint** repo, you can read [`public/modus-llm/_index.json`](../../../public/modus-llm/_index.json) instead.)

- **Per page:** `https://modus.trimble.com/modus-llm/{components|patterns|templates}/{slug}/{tab}.md`  
  Example: `https://modus.trimble.com/modus-llm/patterns/ai-ux-floating-prompt/overview.md`

`slug` and `tab` match the site URL path segments (lowercase, hyphenated).

## Workflow

1. **Normalize the user phrase** (e.g. “modus pattern floating prompt”, “AI UX floating prompt”) into a **slug** or **title** match:
   - Fetch **`_index.json`** and scan `entries` (`kind`, `slug`, `tab`, `title`, `description`, `path`).
   - Prefer **`kind: "pattern"`** when the user said “pattern”, **`kind: "template"`** for “template”, **`kind: "component"`** for a component page.

2. **Disambiguate:**
   - **Zero matches:** list the closest 5 entries by substring match on `title` / `slug` and ask one clarifying question.
   - **Multiple matches:** show the top candidates with `title` + full doc path and ask which one.

3. **Fetch the Markdown:** `GET` the chosen `path` on the same origin as `_index.json` (or use the full `https://modus.trimble.com` URL). Treat the file body (after YAML frontmatter) as the **source of truth** for code fences and narrative.

4. **Implement** using **Modus Web Components** only, **`@trimble-oss/moduswebcomponents`** + the correct framework package, **Modus Docs MCP** with the **`version`** from the frontmatter / project `package.json`, and the event/`detail` rules from the repo’s Modus rules (e.g. `inputChange`, `buttonClick`).

## Prompt parity with the site

The in-app **“Copy prompt”** button on component, pattern, and template pages builds the same style of instructions as [`src/utils/modusAgentPrompt.ts`](src/utils/modusAgentPrompt.ts): human page URL + companion `.md` URL + optional code excerpt. When the user asks you to “use the same prompt as the site,” mirror that structure (fetch companion MD first, then implement).

## Related

- **MCP:** [modus-wc-mcp](../modus-wc-mcp/SKILL.md) for per-component API after you know the tags involved.
- **Repo generator:** [`scripts/generate-modus-llm-context.ts`](../../../scripts/generate-modus-llm-context.ts) (run via `npm run generate:modus-llm-context` / `prebuild`).
