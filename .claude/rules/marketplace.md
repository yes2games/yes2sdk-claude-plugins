---
paths:
  - ".claude-plugin/**"
  - ".mcp.json"
---
# Marketplace & Distribution Rules

The plugin's identity, MCP registration, versioning, and install path. Manifests live in
`.claude-plugin/`; the MCP wiring lives in `.mcp.json` at the repo root.

## Manifests (`.claude-plugin/`)

- `plugin.json` — the identity Claude Code installs: `name` (`yes2sdk`), `displayName`
  (`Yes2SDK`), `version`, `description`, `author`, `homepage`, `license`, `repository`,
  `keywords`, and `metadata.mcpServer` (the MCP server version the plugin is built
  against).
- `marketplace.json` — the marketplace manifest: a top-level `description` (its absence
  is the one thing `claude plugin validate ./ --strict` fails on), owner Yes2Games, and one
  plugin entry with `name` (`yes2sdk`), `displayName` and `source` (`./`). This is what
  `/plugin marketplace add` reads.
- **`displayName` is the shown name; `name` stays the install/invocation id.** It is set in
  both manifests and must match. Treat it as frozen once the plugin is listed publicly —
  changing it renames the plugin in every installed user's UI.
- **`--strict` rejects unknown top-level `plugin.json` fields.** Anything not in
  https://code.claude.com/docs/en/plugins-reference goes under `metadata`, which is
  free-form and which Claude Code never reads.
- The duplicated `keywords` block in both manifests is format-forced — there is no include
  mechanism and this repo has no build step. Not a DRY defect.

## Naming invariant

- `marketplace.json` `plugins[].name` MUST equal `plugin.json` `name` (`yes2sdk`).
  `validate-plugin.mjs` asserts this — renaming one without the other fails CI.

## `.mcp.json` — hosted-MCP auto-registration

- Auto-registers the `yes2sdk` MCP server on install: `mcpServers.yes2sdk` =
  `{ type: "http", url: "https://mcp.yes2games.com/mcp" }`. Zero local install, no
  dependency to run.
- Commands are bound to the server NAME `yes2sdk`, not the URL. Local-MCP users register
  their own `yes2sdk`-named server (e.g. `http://127.0.0.1:8091/mcp`); the hosted HTTP
  transport has DNS-rebinding protection, so use `127.0.0.1:8091` exactly when testing
  locally (not `localhost`).

## Version bump location — three files, not one

- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` (the plugin entry) and
  `package.json` all carry the same string. `validate-plugin.mjs` asserts all three agree;
  miss the marketplace entry and the published listing goes stale with every gate green.
- Record the release in `CHANGELOG.md` and tag it `v<version>`, annotated and GPG-signed,
  on the commit that shipped it. There is no release automation — one tag by hand.
- It is the plugin's own SemVer, independent of the Defold/Unity/Core SDK versions — don't
  chase those numbers here.

## Install path (end user)

1. `/plugin marketplace add yes2games/yes2sdk-claude-plugins`
2. `/plugin install yes2sdk@yes2games`
3. `/mcp` to confirm the `yes2sdk` server connected.
