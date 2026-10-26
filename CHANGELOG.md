# Changelog

All notable changes to this plugin. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] - 2026-10-26

Sign-in becomes the default way the dashboard tools act as you. It is opt-in: say
"sign in to Yes2" (the `sign_in` tool) or run `/mcp` → Authenticate. The docs and
validation tools never need it. `YES2_API_KEY` is now optional, for CI
and headless use. Also adds editing a game from the upload flow.

Needs the MCP's opt-in sign-in (yes2sdk-mcp#110) and the dashboard's OAuth sign-in.

### Added

- Sign-in through Claude Code's MCP OAuth. The dashboard tools no longer need a key.
  Without one they reply that the user is not signed in; `sign_in` (or `/mcp` →
  `yes2sdk` → **Authenticate**) opens the approval in the browser. The docs and
  validation tools never need it. The README covers the
  approval page, revoking under **Settings → Connected apps**, and preview accounts.
- `sign_in`, `update_game`, `set_game_image`, `finalize_image_upload` and
  `rename_build` in the README coverage table (21 tools), the authoring rules and the `allowed-tools` of
  `yes2sdk-upload` and `/upload`. After a build is ready, the skill can offer to rename
  it or edit the game's details, icon or banner, only when the user asks.
- `yes2sdk-upload` handles a not-signed-in reply (call `sign_in`, which opens the
  browser for the user, then retry), `INSUFFICIENT_SCOPE`, and a preview account's
  upload errors: `UPLOAD_ALREADY_OPEN`, `build_protected`, `game_limit_reached` and
  `build_limit_reached`. It tells a preview account that its upload replaces the game's
  current build (preview accounts: unlimited games; one build per game, and a new upload
  replaces the previous one unless that build is in review or live).

### Changed

- `.mcp.json` sends the optional key as `X-Yes2-Api-Key: ${YES2_API_KEY:-}` instead of
  `Authorization: Bearer ${YES2_API_KEY:-}`. A configured `Authorization` header turns
  off Claude Code's OAuth for that server. Unset, the header goes out empty, which the
  server treats as no key. Existing key users need no change.
- Setting an icon or banner uses the presigned flow: `set_game_image` takes the image's
  `size` and path and returns a `curl` PUT with no credential in it, then
  `finalize_image_upload` sets the image. The command no longer reads `$YES2_API_KEY`.
- The README's API key section now covers all dashboard tools, not only uploads, and
  sits under sign-in as the CI and headless option.

## [0.5.0] - 2026-10-23

Adds uploading a build to the Yes2 dashboard, through the authenticated dashboard
tools in the `yes2sdk` MCP.

### Added

- `yes2sdk-upload` skill, the single source of the upload procedure. It checks the key
  with `list_games`, picks the game or creates it with `create_game`, builds a JS/TS
  project with `npm run build` (or asks for the Unity/Defold WebGL/HTML5 output folder),
  zips it with `index.html` at the zip root, can run `yes2sdk-verify` first, then calls
  `prepare_upload`, runs the returned `curl` PUT as given, calls `finalize_upload` and
  polls `get_build_status` until the build is `ready` or `failed`. It reports the
  `inspectorUrl` and any upload warnings, and says that publishing to platforms stays an
  admin action on the dashboard. It never reads, prints or asks for the key.
- `/upload [buildPath]` command, a thin wrapper over the skill.
- `list_games`, `create_game`, `prepare_upload`, `finalize_upload` and
  `get_build_status` in the README coverage table (16 tools) and in the authoring
  rules.
- README section on setting `YES2_API_KEY` from the shell profile.

### Changed

- `.mcp.json` sends `Authorization: Bearer ${YES2_API_KEY:-}` to the hosted server. The
  `:-` default keeps the header empty when the variable is unset, so the docs and
  validation tools work without a key and only the upload tools ask for one.

## [0.4.0] - 2026-10-23

Adds JavaScript/TypeScript (Phaser, three.js, vanilla) as a supported engine, through
the `@yes2games/js` package.

### Added

- JavaScript/TypeScript in `yes2sdk-install`, `/integrate-all`, `yes2sdk-verify`,
  `yes2sdk-diagnose` and its tool-routing notes, `yes2sdk-platform-rules`,
  `/yes2sdk-docs`, the compliance-sweep agent and the README. `/integrate-all` places
  the JS init, loading and ad calls, routes ads and pause/mute through `@yes2games/js`
  (or its `/phaser` and `/three` helpers), imports the mock only under
  `import.meta.env.DEV`, and marks the game canvas `data-yes2-canvas`.
- `yes2sdk-verify` builds a JS project with its Vite build script before
  `validate_integration` and checks the output folder, never the source tree or a
  dev-server page.
- `/yes2sdk-docs` points JavaScript questions at
  https://developer.yes2games.com/docs/javascript.
- `javascript`, `typescript`, `phaser` and `threejs` keywords in both manifests.

### Changed

- On a JS project, `installed` now means the `@yes2games/js` package, which
  `get_install_instructions("js")` installs. The SDK itself is still never installed
  or bundled: the dashboard injects `window.Yes2SDK` at upload. The old wording, that
  `installed: no` is the expected permanent state on JS, is gone.
- `yes2sdk-install` passes the root `vite.config.*` to `detect_sdk` alongside
  `package.json`, so the server can report Phaser, three.js and Vite.
- `/integrate-all` verifies through the `yes2sdk-verify` skill instead of calling
  `validate_integration` itself, and may run `npm install` and `npm run build`.

## [0.3.0] - 2026-10-07

Adds Jest as a supported platform.

### Added

- `/verify-jest` command. It runs the universal checks against a Jest build and lists
  Jest's manual launch checklist, from `get_platform_requirements`, as not yet checked,
  because the automated run does not grade it.
- Jest in `/verify-all`, `/integrate-all`, the `yes2sdk-compliance-sweep` agent, the
  `yes2sdk-verify` rejection notes, the `yes2sdk-platform-rules` skill and the
  diagnose tool-routing notes. `/integrate-all` adds the Jest calls (guest save,
  registration prompt, notifications, purchase recovery, subscriptions, exit save) and
  never gates progression on a rewarded ad.
- `jest` keyword in both manifests.
- `displayName` (`Yes2SDK`) in both manifests, so the plugin shows its product name
  instead of the lowercase install id. Set before the first public listing, because
  changing it later renames the plugin in every installed user's UI.

### Changed

- `yes2sdk-verify`, `/verify-all` and the compliance-sweep agent may call
  `get_platform_requirements`, and report a platform's manual checks as not checked
  instead of letting a clean automated run read as a pass.
- `metadata.mcpServer` now records MCP server `0.3.2` (`>=0.3.2 <1.0.0`), the version
  that serves the `jest` platform.
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

[0.4.0]: https://github.com/yes2games/yes2sdk-claude-plugins/releases/tag/v0.4.0
[0.3.0]: https://github.com/yes2games/yes2sdk-claude-plugins/releases/tag/v0.3.0
[0.2.0]: https://github.com/yes2games/yes2sdk-claude-plugins/releases/tag/v0.2.0
