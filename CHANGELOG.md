# Changelog

All notable changes to this plugin. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `displayName` (`Yes2SDK`) in both manifests, so the plugin shows its product name
  instead of the lowercase install id. Set before the first public listing, because
  changing it later renames the plugin in every installed user's UI.

### Changed

- Command, agent, skill and README copy no longer state how many platforms Yes2SDK
  supports. The explicit platform ids stay where they are the list a command iterates;
  only the counts, which go stale silently as platforms are added, were removed.

## [0.2.0] — 2026-08-07

First tagged release. Covers the full `yes2sdk` MCP tool surface and brings every
component up to the current Claude Code plugin spec.

### Added

- `yes2sdk-install` skill — detects the engine and install state before any Yes2SDK code
  is generated, and blocks code generation on Unity and Defold when the SDK is not
  installed. Fronts `detect_sdk` and `get_install_instructions`.
- `yes2sdk-diagnose` skill — routes a symptom, a compliance rule id or a
  platform-capability question to the right tool. Fronts `troubleshoot`,
  `get_compliance_rule`, `get_platform_capabilities` and `list_sdk_modules`, with the
  full 11-tool routing map in a `references/` file loaded only when needed.
- `yes2sdk-verify` skill — the single home of the verify procedure, invoked by all six
  `/verify-*` commands.
- `yes2sdk-compliance-sweep` agent — grades one build against all five platforms in its
  own context and returns findings triaged by cause rather than by platform.
- `metadata.mcpServer` in `.claude-plugin/plugin.json` — records the MCP server version
  the plugin is built against (`0.3.0`) and the range it expects (`>=0.3.0 <1.0.0`).
- Marketplace and plugin manifest metadata: `author`, `homepage`, `license`,
  `repository`, `keywords`, `category`, and a marketplace `description`.
- `package.json`, `LICENSE` (MIT), and a `.gitignore`.
- CI gates on both `claude plugin validate` forms with `--strict`, plus an agent
  frontmatter lint. `scripts/validate-plugin.mjs` also pins the three `version` strings
  to each other.
- Repo authoring rules under `.claude/rules/` are now tracked.

### Changed

- `/integrate-all` establishes the engine through the `yes2sdk-install` skill instead of
  asking the user, and stops before writing code that could not compile.
- The five per-platform `/verify-*` commands and `/verify-all` are thin wrappers over the
  `yes2sdk-verify` skill; the shared procedure lives in one file instead of six copies.
- Every command carries `argument-hint`, `allowed-tools` and — where it has side effects
  — `disable-model-invocation`.
- README documents every command, skill and agent, maps all 11 MCP tools to what fronts
  them, and records the components deliberately not shipped.

### Fixed

- Every surface that told Claude to hand a filesystem path to `validate_integration`
  (`buildPath`) or `detect_sdk` (`projectPath`). This plugin registers the **hosted** MCP
  server, which has no disk access, so those arguments could never work — `detect_sdk`
  returns an error and `validate_integration` a blocking `build-path` FAIL. Both now pass
  file contents inline.
- Marketplace-manifest validation failed under `claude plugin validate ./ --strict` for a
  missing marketplace `description`.

## [0.1.0] — never tagged

The initial surface: the two manifests, `.mcp.json` registering the hosted MCP server,
`/integrate-all`, `/verify-all`, the five per-platform `/verify-*` commands,
`/yes2sdk-docs`, the `yes2sdk-platform-rules` skill, and
`scripts/validate-plugin.mjs`. Shipped from `main` without a git tag, so no `v0.1.0`
exists and none is created retroactively.

[0.2.0]: https://github.com/yes2games/yes2sdk-claude-plugins/releases/tag/v0.2.0
