# ux-skill (project install)

Installed from [Laith0003/ux-skill](https://github.com/Laith0003/ux-skill) for Cursor Agent Skills + local data manifests.

## What was installed

- **30 skills** under `.cursor/skills/ux-*` and `.cursor/skills/ux-agent-*`
- **`data/`** — styles, palettes, anti-patterns, brands, etc. (for CLI/engine)
- **`ux-skill/references/process/`** — discovery and process docs
- **`.cursorrules`** — default UX workflow header for the agent
- **`.cursor/rules/ux-skill.mdc`** — optional rule pointer (not always applied)

## Using in Cursor

Ask naturally or name a skill, for example:

- “Plan a user research study for …” → `ux-research`
- “Run discovery for a fintech landing page” → `ux-discover` then `ux-recommend`
- “Lint this component for AI slop” → `ux-lint`

Runtime state is written to `.ux/` (gitignored).

## Python CLI (optional)

The deterministic recommender and linter need Python:

```bash
pip install uxskill
ux init    # if installing in a fresh clone without these files
```

On this machine, `python3` may fail until the Xcode license is accepted (`sudo xcodebuild -license`) or a standalone Python 3.9+ is installed.

## Upgrading

Re-clone or copy from upstream `commands/`, `agents/`, and `data/`, then re-run the Node transform used during install, or use `pip install -U uxskill` when Python is available.
