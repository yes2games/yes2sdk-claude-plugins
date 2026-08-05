# Yes2SDK — Claude Code plugin

One-step access to the [Yes2SDK](https://yes2games.com) MCP from Claude Code, plus
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

`.mcp.json` points at the hosted HTTP endpoint for zero-install. If you are running
the MCP locally instead, register your local server (e.g.
`http://127.0.0.1:8091/mcp`) in your own MCP config; the slash commands work
against any server named `yes2sdk`.

## License

MIT — see [LICENSE](LICENSE).
