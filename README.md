# Yes2SDK — Claude Code plugin

One integration ships your HTML5 game to Poki, CrazyGames, Yandex, GameDistribution, and YouTube Playables. One-step setup for Claude Code.

One-step access to the [Yes2SDK](https://developer.yes2games.com) MCP from Claude Code, plus
integrate/verify slash commands. Installing the plugin auto-registers the hosted
Yes2SDK MCP — no local server to build or run.

## Install

```
/plugin marketplace add yes2games/yes2sdk-claude-plugins
/plugin install yes2sdk@yes2games
```

Installing registers the `yes2sdk` MCP server (remote HTTP,
`https://mcp.yes2games.com/mcp`) and adds the commands below. Run `/mcp` to confirm
the server is connected.

## Commands

| Command | What it does |
|---|---|
| `/integrate-all [platform]` | Detect the engine, check the SDK is installed, then scaffold the unified init + ad loop with `isSupported()` guards, portable across all 5 platforms. |
| `/verify-all [buildPath]` | Run `yes2sdk:validate_integration` against all 5 platforms; one pass/fail table. |
| `/verify-poki [buildPath]` | Poki compliance + static checks. |
| `/verify-crazygames [buildPath]` | CrazyGames compliance + static checks. |
| `/verify-yandex [buildPath]` | Yandex Games compliance + static checks. |
| `/verify-gamedistribution [buildPath]` | GameDistribution compliance + static checks. |
| `/verify-youtube [buildPath]` | YouTube Playables compliance + static checks (strictest). |
| `/yes2sdk-docs <query>` | Search the Yes2SDK docs. |

The `/verify-*` commands take the path to your extracted WebGL build — pass it
inline (`/verify-poki ./build/webgl`) or leave it off and they ask once. An
Inspector event log can be supplied for behavioral checks.

## Skills

Skills fire on intent — you do not invoke them, you describe the problem.

| Skill | Fires when |
|---|---|
| `yes2sdk-install` | Onboarding a project, or a Yes2SDK reference will not resolve or compile. Detects the engine and install state before any code is written. |
| `yes2sdk-diagnose` | A symptom, a compliance FAIL you need to understand, or a "does this platform support X" question. |
| `yes2sdk-platform-rules` | Any Yes2SDK integration or compliance work; carries the cross-platform gotchas and points at the MCP for the authoritative rule set. |
| `yes2sdk-verify` | Invoked by the `/verify-*` commands — the single source of the verify procedure. |

`yes2sdk-diagnose` keeps its full tool-routing map in
`skills/yes2sdk-diagnose/references/tool-routing.md`, loaded only when needed.

## Agent

`yes2sdk-compliance-sweep` grades one build against all five platforms in its own
context and returns a triaged verdict — findings grouped by cause, so one missing
`gameplayStop()` reads as one fix rather than four failures. Ask for it by name:

```
Use the yes2sdk-compliance-sweep agent on ./build/webgl
```

Prefer `/verify-all` for a quick pass/fail table; prefer the agent before an upload,
when you want the five reports triaged rather than printed.

## MCP tool coverage

All 11 `yes2sdk` MCP tools are reachable:

| Tool | Fronted by |
|---|---|
| `detect_sdk` | `yes2sdk-install` skill, `/integrate-all` |
| `get_install_instructions` | `yes2sdk-install` skill, `/integrate-all` |
| `get_quickstart` | `/integrate-all`, `/yes2sdk-docs`, `yes2sdk-platform-rules` |
| `get_api_reference` | `/integrate-all`, `/yes2sdk-docs`, `yes2sdk-platform-rules` |
| `search_docs` | `/yes2sdk-docs` |
| `get_platform_requirements` | `yes2sdk-platform-rules` |
| `validate_integration` | all `/verify-*`, `/integrate-all`, `yes2sdk-verify`, `yes2sdk-compliance-sweep` |
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
notes live in exactly one file.

### MCP server version

This plugin is built against `yes2sdk` MCP server **0.3.0** and expects
`>=0.3.0 <1.0.0` — recorded in `.claude-plugin/plugin.json` under
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

## License

MIT — see [LICENSE](LICENSE).
