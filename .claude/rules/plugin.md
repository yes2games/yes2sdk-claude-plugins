# Plugin Rules

This repo is a Claude Code **plugin**, not compiled code: manifests
(`.claude-plugin/*.json`), a remote-MCP registration (`.mcp.json`), slash-command
prompt-markdown (`commands/*.md`), four skills (`skills/*/SKILL.md`), one agent
(`agents/*.md`), and one dependency-free validator (`scripts/validate-plugin.mjs`). The
`package.json` carries metadata and the `validate` script only — no dependencies, no
build, no bundler, no `node_modules`.

Concern split: command/skill authoring lives in `commands.md`; manifest, `.mcp.json`,
versioning, and install mechanics live in `marketplace.md`. This file owns the
thin-front-end philosophy and the validator gate.

## Thin front-end — the cardinal rule

- **All real logic lives in the hosted `yes2sdk` MCP** (`https://mcp.yes2games.com/mcp`).
  This repo ROUTES; it never reimplements. Compliance rules, docs, API reference, and
  validation belong in the MCP — do NOT add them here.
- Commands, skills and the agent are pure natural-language instructions telling Claude
  which MCP tool to call and how to present results. No executable logic in them.
- README.md and SKILL.md both state verbatim that the plugin is a summary/wrapper that
  defers to the MCP. This is deliberate anti-drift framing — keep it, don't soften it.
  The skill auto-triggers on Yes2SDK-compliance work, so its "not source of truth"
  wording is what stops Claude answering from the summary instead of the MCP.
- **A needed server change is an issue on `yes2sdk-mcp`, never a workaround here.**

## Validation gate (`scripts/validate-plugin.mjs`)

- This plus `claude plugin validate` is the entire test/lint/build surface. Run
  `node scripts/validate-plugin.mjs` (exit 0 pass / 1 fail); `.github/workflows/ci.yml`
  runs it on push/PR (Node 20) alongside **both** `claude plugin validate` forms with
  `--strict`. The CLI is pinned there deliberately: unpinned, an upstream release can
  redden the job with no repo change.
- It is a STRUCTURE gate, not a semantic one: hand-parses frontmatter with a regex and
  checks *presence* of keys (`name`+`description` on skills, `name` on agents, `type`+`url`
  on the MCP server, `name`/`version`/`description` on `plugin.json`), not validity.
  Malformed-but-present frontmatter passes. Per-command `description` is deliberately NOT
  checked here and neither is the marketplace `description` — both belong to
  `claude plugin validate`, which CI runs; duplicating them was the one real overlap and it
  was removed. `commands/` is only checked for existing and holding at least one `.md`. It
  also enforces the manifest
  naming invariant, the three-way `version` agreement (see `marketplace.md`), and the
  agent-`name` lint that `--strict` misses.
- Do not add a test framework. There is no runtime code to unit-test — validation *is*
  the test. Do not couple CI to the live MCP server either.
- Keep it dependency-free — Node stdlib only (`node:fs`, `node:path`, `node:url`). No
  third-party deps, ever. Errors accumulate into `errors[]` then `process.exit(1)`; no
  throw-on-first (there is no build step to catch a later error).
