---
name: ux-skill
description: Index for the ux-skill plugin installed in this repo — design intelligence, research, discovery, recommend, lint, and UI workflows. Use when the user invokes /ux-* commands or asks for UX research, anti-AI-slop lint, or design-system recommendations.
---

# ux-skill (suite index)

Project install of [ux-skill v2](https://github.com/Laith0003/ux-skill). Data manifests live in `data/` at the repo root.

## Command skills (invoke by name or natural language)

| Skill | Purpose |
|-------|---------|
| `ux-discover` | Mandatory 10-field discovery before generation |
| `ux-recommend` | Flagship — merged style / palette / type / motion recommendation |
| `ux-design` | Generate frontend from a recommendation |
| `ux-research` | Plan studies or `--synthesize` findings |
| `ux-workshop` | Facilitated design workshop |
| `ux-frame` | Frame the problem before solving |
| `ux-system` | Full design system output |
| `ux-component` | Single component |
| `ux-dashboard` | Dashboard surface |
| `ux-motion` | Motion treatment |
| `ux-copy` | Microcopy review |
| `ux-a11y` | Accessibility audit |
| `ux-critique` | Design critique |
| `ux-audit` | Linter + LLM review |
| `ux-lint` | Deterministic anti-slop linter |
| `ux-polish` / `ux-fix` | Fix loops |
| `ux-case-study` | Case study writing |
| `ux-expert` | Expert advice |
| `ux-next` | Suggest next command |
| `ux-init` | Installer / setup helper |
| `ux-evolve` / `ux-stats` / `ux-mcp` / `ux-image-to-code` | Advanced v2 utilities |

## Sub-agent skills

| Skill | Purpose |
|-------|---------|
| `ux-agent-research-synthesizer` | Digest interviews, analytics, competitors |
| `ux-agent-frontend-engineer` | Production React/Next/Vue UI |
| `ux-agent-motion-engineer` | Motion with reduced-motion fallbacks |
| `ux-agent-copy-writer` | Brand-voice microcopy |
| `ux-agent-design-system-architect` | Tokens and foundations |

## Typical chains

1. **Research → design:** `ux-research` → run study → `ux-research` (synthesize) → `ux-discover` / `ux-recommend` → `ux-design`
2. **Greenfield UI:** `ux-discover` → `ux-recommend` → `ux-design` → `ux-lint` → `ux-fix`
3. **Existing code:** `ux-lint` → `ux-audit` → `ux-polish`

## Modus projects

For Modus-branded surfaces, follow repo Modus rules (`modus-essentials`, component skills). ux-skill complements research and generic UI experiments; it does not replace `modus-wc-*`.

## Python CLI (optional)

```bash
pip install uxskill
ux recommend --brief-file=.ux/last-discovery.json
ux lint path/to/component.tsx
```

Requires Python 3.9+. If system Python fails (e.g. unsigned Xcode license on macOS), install Python from [python.org](https://www.python.org/downloads/) or `brew install python@3.12`, then re-run `pip install uxskill`.
