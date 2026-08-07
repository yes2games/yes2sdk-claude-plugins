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
| `/integrate-all` | Scaffold the unified init + ad loop with `isSupported()` guards, portable across all 5 platforms. |
| `/verify-all` | Run `validate_integration` against all 5 platforms; one pass/fail table. |
| `/verify-poki` | Poki compliance + static checks. |
| `/verify-crazygames` | CrazyGames compliance + static checks. |
| `/verify-yandex` | Yandex Games compliance + static checks. |
| `/verify-gamedistribution` | GameDistribution compliance + static checks. |
| `/verify-youtube` | YouTube Playables compliance + static checks (strictest). |
| `/yes2sdk-docs <query>` | Search the Yes2SDK docs. |

The `/verify-*` commands take the path to your extracted WebGL build (they ask if
unknown) and can also take an Inspector event log for behavioral checks.

The plugin also bundles a `yes2sdk-platform-rules` skill that carries the
cross-platform gotchas and points Claude at the MCP for the authoritative rule set.

## How it's wired

The plugin is a thin wrapper. Slash commands call MCP tools (`search_docs`,
`get_quickstart`, `get_api_reference`, `validate_integration`); compliance logic
lives in the MCP, not here.

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
