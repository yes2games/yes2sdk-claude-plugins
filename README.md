# Yes2SDK — Claude Code plugin

One integration ships your HTML5 game to every supported web game platform. One command, and Claude Code knows the whole SDK.

One-step access to the [Yes2SDK](https://developer.yes2games.com) MCP from Claude Code, plus
integrate/verify slash commands, skills that fire on intent, and a multi-platform
compliance agent. Installing the plugin auto-registers the hosted Yes2SDK MCP — no local
server to build or run.

## Install

```
/plugin marketplace add yes2games/yes2sdk-claude-plugins
/plugin install yes2sdk@yes2games
```

Installing registers the `yes2sdk` MCP server (remote HTTP,
`https://mcp.yes2games.com/mcp`) and adds the components below. Run `/mcp` to confirm
the server is connected.

## Commands

You type these.

| Command | What it does |
|---|---|
| `/integrate-all [platform]` | Detect the engine, check the SDK is installed, then scaffold the unified init + ad loop with `isSupported()` guards, portable across every supported platform. |
| `/verify-all [buildPath]` | Run `yes2sdk:validate_integration` against every supported platform; one pass/fail table. |
| `/verify-poki [buildPath]` | Poki compliance + static checks. |
| `/verify-crazygames [buildPath]` | CrazyGames compliance + static checks. |
| `/verify-yandex [buildPath]` | Yandex Games compliance + static checks. |
| `/verify-gamedistribution [buildPath]` | GameDistribution compliance + static checks. |
| `/verify-youtube [buildPath]` | YouTube Playables compliance + static checks (strictest). |
| `/verify-jest [buildPath]` | Jest universal checks, plus Jest's manual launch checklist listed as not yet checked. |
| `/yes2sdk-docs <query>` | Search the Yes2SDK docs. |

```
/integrate-all poki
/verify-youtube ./build/webgl
/verify-all
/yes2sdk-docs rewarded ad reward not granted
```

The `/verify-*` commands take the path to your extracted WebGL build — pass it
inline or leave it off and they ask once. An Inspector event log can be supplied for
behavioral checks.

## Skills

You do not invoke these. Describe the problem and the matching skill fires.

| Skill | Fires when | Say something like |
|---|---|---|
| `yes2sdk-install` | Onboarding a project, or a Yes2SDK reference will not resolve or compile. Detects the engine and install state before any code is written. | *"Set up Yes2SDK in this project."* |
| `yes2sdk-diagnose` | A symptom, a compliance FAIL you need to understand, or a "does this platform support X" question. | *"Rewarded ad plays but the reward never lands."* |
| `yes2sdk-platform-rules` | Any Yes2SDK integration or compliance work; carries the cross-platform gotchas and points at the MCP for the authoritative rule set. | *"What breaks if I ship this to Yandex and Poki?"* |
| `yes2sdk-verify` | Invoked by the `/verify-*` commands — the single source of the verify procedure. | (invoked for you) |

`yes2sdk-diagnose` keeps its full tool-routing map in
`skills/yes2sdk-diagnose/references/tool-routing.md`, loaded only when needed.

## Agent

`yes2sdk-compliance-sweep` grades one build against every supported platform in its
own context and returns a triaged verdict — findings grouped by cause, so one missing
`gameplayStop()` reads as one fix rather than one failure per platform. Ask for it by
name:

```
Use the yes2sdk-compliance-sweep agent on ./build/webgl
```

Prefer `/verify-all` for a quick pass/fail table; prefer the agent before an upload,
when you want the per-platform reports triaged rather than printed.

## MCP tool coverage

All 11 `yes2sdk` MCP tools are reachable:

| Tool | Fronted by |
|---|---|
| `detect_sdk` | `yes2sdk-install` skill, `/integrate-all` |
| `get_install_instructions` | `yes2sdk-install` skill, `/integrate-all`, `yes2sdk-platform-rules` |
| `get_quickstart` | `/integrate-all`, `/yes2sdk-docs`, `yes2sdk-platform-rules` |
| `get_api_reference` | `/integrate-all`, `/yes2sdk-docs`, `yes2sdk-platform-rules` |
| `search_docs` | `/yes2sdk-docs` |
| `get_platform_requirements` | `yes2sdk-platform-rules`, `yes2sdk-verify`, `/verify-jest`, `/verify-all`, `yes2sdk-compliance-sweep` |
| `validate_integration` | all `/verify-*`, `/integrate-all`, `yes2sdk-verify`, `yes2sdk-platform-rules`, `yes2sdk-compliance-sweep` |
| `get_compliance_rule` | `yes2sdk-diagnose`, `yes2sdk-compliance-sweep` |
| `troubleshoot` | `yes2sdk-diagnose` |
| `get_platform_capabilities` | `yes2sdk-diagnose` |
| `list_sdk_modules` | `yes2sdk-diagnose` |

The server's MCP **prompts** (`integrate_module`, `setup_new_project`) and
**resources** (`yes2sdk://modules`, `yes2sdk://docs/{module}`) are intentionally not
fronted: they are already reachable directly through any MCP client, and wrapping a
prompt in a prompt adds a layer without adding routing.

The plugin ships **no hooks**, deliberately. A hook here would either re-run this
repo's own validator (already covered by CI and a local hook, and of no use to
someone who installed the plugin) or intercept the MCP calls the commands make
explicitly — cost and noise on every matching tool call, for no compliance the
commands do not already enforce.

## How it's wired

The plugin is a thin wrapper. Every command, skill and agent routes to an MCP tool
(see the coverage table above); compliance rules, docs and validation live in the
MCP, not here.

Each `/verify-*` command is a wrapper that names its platform and invokes the
`yes2sdk-verify` skill, so the shared procedure and the per-platform rejection
notes live in exactly one file. Likewise `/integrate-all` and the compliance-sweep
agent invoke `yes2sdk-install` and `yes2sdk-verify` rather than restating them.

### MCP server version

This plugin is built against `yes2sdk` MCP server **0.3.2** and expects
`>=0.3.2 <1.0.0`, recorded in `.claude-plugin/plugin.json` under
`metadata.mcpServer`. The hosted server is upgraded in place, so no action is
normally needed, and the plugin does not check the range at runtime.

You notice a mismatch as a symptom, not a version number: a `/verify-*` or
`/integrate-all` run fails because an MCP tool is missing or its arguments were
rejected. Update the plugin first (`/plugin update yes2sdk@yes2games`). If it
still fails, file an issue at
https://github.com/yes2games/yes2sdk-claude-plugins/issues with the failing
command and the error text.

`.mcp.json` points at the hosted HTTP endpoint for zero-install. If you are running
the MCP locally instead, register your local server (e.g.
`http://127.0.0.1:8091/mcp`) in your own MCP config; the slash commands work
against any server named `yes2sdk`.

### Running the MCP on your own machine

Two tools accept either a filesystem path or inline file contents. **The hosted
server has no disk access**, so every component here passes contents inline —
`detect_sdk` gets `files`, `validate_integration` gets
`indexHtml`/`fileList`/`jsContents`.

The path forms fail loudly against the hosted server rather than passing thinly:
`detect_sdk` returns an error that names the cause, and `validate_integration`
returns a blocking `build-path` FAIL. If you run the server on your own machine
(stdio or local HTTP) the path forms work, but nothing in this plugin depends on
them.

## Contributing

`scripts/validate-plugin.mjs` is the whole test surface — no framework, Node stdlib
only. CI runs it plus both `claude plugin validate` forms:

```bash
node scripts/validate-plugin.mjs
claude plugin validate ./ --strict                          # marketplace manifest only
claude plugin validate .claude-plugin/plugin.json --strict   # plugin, commands, skills, agents
claude --plugin-dir ./                                       # load without installing
```

Both `validate` invocations are needed. When `.claude-plugin/marketplace.json`
exists, the directory form checks only that manifest — commands, skills and agents
are reached solely through the plugin-manifest form.

Authoring rules live in `.claude/rules/`: `plugin.md` (the thin-front-end rule and the
validator gate), `commands.md` (command, skill and agent authoring), and
`marketplace.md` (manifests, versioning, install path). They are tracked on purpose —
they are the repo's conventions, not anyone's personal notes, and the alternative was
every contributor rediscovering them. A `CLAUDE.local.md` at the root is gitignored and
stays personal.

Bumping the version means editing **three** files — `.claude-plugin/plugin.json`,
`.claude-plugin/marketplace.json` and `package.json`. The validator fails if they
disagree.

## License

MIT — see [LICENSE](LICENSE).
