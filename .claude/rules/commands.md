---
paths:
  - "commands/**/*.md"
  - "skills/**/*.md"
  - "agents/**/*.md"
---
# Command & Skill Authoring Rules

These are prompt-markdown files (instructions to Claude), not code. They contain no
executable logic — they tell Claude which `yes2sdk` MCP tool to call and how to present
the result.

## File shape

- YAML frontmatter first:
  - `description` — required on every command; `name` + `description` on every SKILL.md.
    Third person, leading with the key use case. It is injected into every session's
    system prompt, so keep it short and keep the point of view consistent.
  - `argument-hint` — on every command that takes an argument. Without it the argument
    is invisible in the slash menu and the command stops to ask for what the user could
    have typed inline.
  - `allowed-tools` — on every command and skill, scoped to what that file actually
    calls. MCP tools use the runtime matcher form `mcp__yes2sdk__<tool>`, NOT the
    `yes2sdk:<tool>` prose form. Parenthesised patterns are not supported for MCP rules;
    use `mcp__yes2sdk__*` to allow the whole server.
  - `disable-model-invocation: true` — on anything side-effecting, so it runs only when
    the user asks for it. It does **not** reduce always-on tokens (measured by removal:
    unchanged). The always-on driver is `description` length — keep those short.
- Then imperative second-person prose to Claude.
- Name MCP tools in prose as `yes2sdk:<tool>` — fully qualified, so Claude cannot bind
  to a same-named tool from another server.

## Conventions

- Kebab-case filename matching the slash-command name. Skill dir name == frontmatter `name`.
- All 11 MCP tools are fronted; the README's coverage table is the map. Install path:
  `detect_sdk`, `get_install_instructions`. Docs: `search_docs`, `get_quickstart`,
  `get_api_reference`, `list_sdk_modules`. Compliance: `get_platform_requirements`,
  `get_compliance_rule`, `get_platform_capabilities`, `validate_integration`. Symptoms:
  `troubleshoot`. Adding a tool to the server means adding it to a skill AND that table.
- **Two tools take a disk path OR inline content, and this plugin registers the HOSTED
  server, which has no disk access.** `detect_sdk` → pass `files`, not `projectPath`
  (exactly one mode per request). `validate_integration` → pass `indexHtml`/`fileList`/
  `jsContents`, not `buildPath`. The path forms fail loudly, not silently: `detect_sdk`
  returns an error result naming the hosted-server cause, `validate_integration` returns a
  blocking `build-path` FAIL. Wherever a path form is mentioned, say it needs a server
  running on the user's own machine — that is about where the process runs, not the
  transport, so local HTTP qualifies as much as stdio.
- SDK naming taught to users: Defold `yes2sdk.*` (Lua), Unity `Yes2SDK.Yes2SDK.*` (C#),
  JS `Yes2SDK.*` / `window.Yes2SDK`.
- Do NOT bake compliance rules or docs content into these files — defer to the MCP. Every
  command is a routing shim. **One named exception:** `yes2sdk-verify` and
  `yes2sdk-platform-rules` each carry a hedged "usual causes of rejection" list under an
  explicit *this is a summary, not the source of truth* heading, so a finding can be
  explained in the user's terms. Those lists may never be used as a decision input — never
  assert, gate on, or answer from one. Anywhere else, and in any new file, a numeric limit
  is a defect.

## One procedure, one file

A procedure lives in exactly one skill, and everything else invokes it by name. Two
established: `yes2sdk-verify` owns how to supply a build to `validate_integration`;
`yes2sdk-install` owns engine detection and its preconditions. `/integrate-all` and the
`yes2sdk-compliance-sweep` agent invoke them rather than restating them — both carry
`Skill` in their tool list for exactly that reason. A second copy of a hosted-vs-local
rule drifts silently and there is no test to catch it.

## The verify siblings

- The shared verify procedure lives in exactly one file: `skills/yes2sdk-verify/SKILL.md`.
  Edit it there. `verify-poki`, `verify-crazygames`, `verify-yandex`,
  `verify-gamedistribution`, `verify-youtube`, `verify-jest` and `verify-all` are thin
  wrappers that invoke that skill and pass a platform; they must not restate the procedure.
- Command files have no include mechanism and `${CLAUDE_PLUGIN_ROOT}` is substituted only
  in hooks and MCP configs, not in prompt markdown. A skill invoked by name is the one
  portable way for these files to share prose.
- Every verify command takes an optional `buildPath` argument and asks once only when it
  is empty.

## Agents (`agents/*.md`)

- Frontmatter: `name`, `description`, `tools` (list form). `model`, `color` and
  `proactive` are also accepted; omit them unless there is a reason.
- **No `:` anywhere in `name`** — it is reserved for plugin scoping, and an agent with one
  silently does not load. `claude plugin validate` does not catch it;
  `scripts/validate-plugin.mjs` does.
- `hooks`, `mcpServers` and `permissionMode` are silently ignored for plugin-shipped
  agents, for security. Never write an agent that depends on one.
- An agent costs about the same always-on as a skill (measured ~80 tokens, driven by
  `description` length, not by being an agent). Choose one for the right reason, not the
  cost: an agent when the work genuinely belongs in a separate context — many tool calls
  whose raw output the caller should not have to read.

## New work goes in `skills/`, not `commands/`

New capability is a skill. A command is for something a human wants to type as `/name`,
or a thin wrapper over a skill (as the `/verify-*` set is).

## After editing

- Run `node scripts/validate-plugin.mjs`. It checks frontmatter-key presence only, not
  validity — a passing run does not guarantee correct YAML values. A `PostToolUse` hook may
  run it for you, but that hook lives in the gitignored `.claude/settings.local.json`, so a
  fresh clone has none, and its body ends `2>/dev/null || true` — it can never report a
  failure. Never treat it as the gate. `claude plugin validate` flags none of `argument-hint`, `allowed-tools`,
  `disable-model-invocation`, so those stay hand-verified under `claude --plugin-dir ./`.
- Never put `: ` inside an unquoted `description`. It makes the whole frontmatter block
  fail to parse, and the file then loads with EVERY field silently dropped. The custom
  validator's regex sees the key and passes; only `claude plugin validate` catches it.
  Use an em dash.
- Too-tight `allowed-tools` breaks a command silently at invoke time, never at validate
  time. Invoke anything you re-scope before trusting it.
