# Yes2SDK — Claude Code plugin

One integration ships your HTML5 game to every supported web game platform. One command, and Claude Code knows the whole SDK.

One-step access to the [Yes2SDK](https://developer.yes2games.com) MCP from Claude Code, plus
integrate/verify/upload slash commands, skills that fire on intent, and a multi-platform
compliance agent. Installing the plugin auto-registers the hosted Yes2SDK MCP — no local
server to build or run.

Works with Unity, Defold and JavaScript/TypeScript games (Phaser, three.js or vanilla).
On JavaScript/TypeScript you write against `window.Yes2SDK` with the
[`@yes2games/js`](https://www.npmjs.com/package/@yes2games/js) package (runtime helpers,
types, a local-dev mock), build with Vite, and upload the plain build; the dashboard
injects the real SDK, so you never bundle it. See
https://developer.yes2games.com/docs/javascript.

## Install

```
/plugin marketplace add yes2games/yes2sdk-claude-plugins
/plugin install yes2sdk@yes2games
```

Installing registers the `yes2sdk` MCP server (remote HTTP,
`https://mcp.yes2games.com/mcp`) and adds the components below. Run `/mcp` to confirm
the server is connected.

## Sign in to the dashboard (for the dashboard tools only)

Signing in is opt-in, and only the dashboard tools need it: the docs, rules and
validation tools never do. Until you sign in, a dashboard tool just replies that you're
not signed in. To upload builds to the Yes2 dashboard with `/upload`, or to edit a game
there, sign in once with your dashboard account:

1. Say **"sign in to Yes2"** (or let `/upload` do it when it finds you're not signed in).
   Claude calls the `sign_in` tool and your browser opens the dashboard; log in if
   needed. You can also run `/mcp`, pick `yes2sdk` and choose **Authenticate**.
2. The approval page shows which app is asking, the account it will act as (your
   studio and role, or your personal games on a preview account) and what it may do:
   see your games and builds, create and edit games, upload builds. It cannot publish,
   download builds, or see analytics, revenue or your team. Approve, then go back to
   Claude Code. Asking "am I signed in to Yes2?" shows the account and studio in use.

Claude Code keeps the sign-in and refreshes it on its own. To disconnect it, open the
dashboard (avatar → **Settings → Connected apps**) and **Revoke** it.

Sign-in needs an owner, manager or developer seat in a studio, or a preview account with
no studio yet. A preview account works with its usual limits until the account is
verified: unlimited games; one build per game, and a new upload replaces the previous one
unless that build is in review or live. The tools say so when an upload can't go through.

### API key (optional, for CI and headless use)

Where nobody can approve in a browser, give the plugin a dashboard API key instead:

1. Create a key on the dashboard: a personal key under your avatar, **Settings →
   Personal API keys**, or a team key from the **Team** page.
2. Export it from your shell profile (`~/.zshrc`, `~/.bashrc`), never from a file in a
   project and never in a commit:

   ```bash
   export YES2_API_KEY=y2g_your_key_here
   ```

3. Open a new terminal and start Claude Code from it. The plugin's `.mcp.json` sends
   the key to the `yes2sdk` server as `X-Yes2-Api-Key: ${YES2_API_KEY:-}` on each
   request; the server passes it to the dashboard for that request only and never
   stores it.

Without the variable the header goes out empty, which the server treats as no key. The plugin deliberately does not use an `Authorization` header: in
Claude Code a configured `Authorization` header turns off sign-in for that server.
Claude never needs to see the key, so do not paste it into the chat.

Uploading puts a build on the dashboard, where you can open it in the Inspector. It
does not publish anything: publishing to platforms is requested on the dashboard and
done by a Yes2Games admin.

## Commands

You type these.

| Command | What it does |
|---|---|
| `/integrate-all [platform]` | Detect the engine (Unity, Defold or JavaScript/TypeScript), check the SDK is installed, then scaffold the unified init + ad loop with `isSupported()` guards, portable across every supported platform. On JavaScript/TypeScript it also wires the dev-only mock import. |
| `/verify-all [buildPath]` | Run `yes2sdk:validate_integration` against every supported platform; one pass/fail table. |
| `/verify-poki [buildPath]` | Poki compliance + static checks. |
| `/verify-crazygames [buildPath]` | CrazyGames compliance + static checks. |
| `/verify-yandex [buildPath]` | Yandex Games compliance + static checks. |
| `/verify-gamedistribution [buildPath]` | GameDistribution compliance + static checks. |
| `/verify-youtube [buildPath]` | YouTube Playables compliance + static checks (strictest). |
| `/verify-jest [buildPath]` | Jest universal checks, plus Jest's manual launch checklist listed as not yet checked. |
| `/yes2sdk-docs <query>` | Search the Yes2SDK docs. |
| `/upload [buildPath]` | Build (JS/TS), zip and upload a build to the Yes2 dashboard, then return its Inspector link. Offers to sign you in if you aren't (see above). |

```
/integrate-all poki
/verify-youtube ./build/webgl
/verify-all
/yes2sdk-docs rewarded ad reward not granted
/upload ./dist
```

The `/verify-*` commands take the path to your extracted WebGL/HTML5 build — pass it
inline or leave it off and they ask once. On a JavaScript/TypeScript project they
build it first with your Vite build script and check the output folder (`dist/`). An Inspector event log can be supplied for
behavioral checks.

## Skills

You do not invoke these. Describe the problem and the matching skill fires.

| Skill | Fires when | Say something like |
|---|---|---|
| `yes2sdk-install` | Onboarding a project, or a Yes2SDK reference will not resolve or compile. Detects the engine (Unity, Defold, or JavaScript/TypeScript with Phaser, three.js or Vite) and install state before any code is written. | *"Set up Yes2SDK in this project."* |
| `yes2sdk-diagnose` | A symptom, a compliance FAIL you need to understand, or a "does this platform support X" question. | *"Rewarded ad plays but the reward never lands."* |
| `yes2sdk-platform-rules` | Any Yes2SDK integration or compliance work; carries the cross-platform gotchas and points at the MCP for the authoritative rule set. | *"What breaks if I ship this to Yandex and Poki?"* |
| `yes2sdk-verify` | Invoked by the `/verify-*` commands — the single source of the verify procedure. | (invoked for you) |
| `yes2sdk-upload` | Uploading a build to the Yes2 dashboard; `/upload` runs it. Picks or creates the game, zips the build with `index.html` at the root, uploads it, waits for processing and returns the Inspector link and any upload warnings. Asks before reserving a version. | *"Upload this build to the Yes2 dashboard."* |

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

All 21 `yes2sdk` MCP tools are reachable:

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
| `sign_in` | `yes2sdk-upload`, `/upload` |
| `list_games` | `yes2sdk-upload`, `/upload` |
| `create_game` | `yes2sdk-upload`, `/upload` |
| `prepare_upload` | `yes2sdk-upload`, `/upload` |
| `finalize_upload` | `yes2sdk-upload`, `/upload` |
| `get_build_status` | `yes2sdk-upload`, `/upload` |
| `update_game` | `yes2sdk-upload`, `/upload` (on request) |
| `set_game_image` | `yes2sdk-upload`, `/upload` (on request) |
| `finalize_image_upload` | `yes2sdk-upload`, `/upload` (on request) |
| `rename_build` | `yes2sdk-upload`, `/upload` (on request) |

The last ten are the dashboard tools, `sign_in` first. The rest need you to sign in, or an API key (see
[Sign in to the dashboard](#sign-in-to-the-dashboard-for-the-dashboard-tools-only)).
The last four edit a game's profile or rename a build, and the skill offers them only
when you ask. `set_game_image` returns a `curl` PUT that sends the image from your
machine straight to storage with no credential in it, and `finalize_image_upload` then
sets it, so the image never passes through the chat or the MCP.

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
agent invoke `yes2sdk-install` and `yes2sdk-verify` rather than restating them, and
`/upload` invokes `yes2sdk-upload`, which hands its optional pre-upload check to
`yes2sdk-verify`.

### MCP server version

This plugin is built against `yes2sdk` MCP server **0.3.2** and expects
`>=0.3.2 <1.0.0`, recorded in `.claude-plugin/plugin.json` under
`metadata.mcpServer`. The hosted server is upgraded in place, so no action is
normally needed, and the plugin does not check the range at runtime.

The dashboard tools (`list_games`, `create_game`, `prepare_upload`, `finalize_upload`,
`get_build_status`, `update_game`, `set_game_image`, `finalize_image_upload`,
`rename_build`) and `sign_in` are newer than
that version. On a server without them, `/upload`
stops at its first step because `yes2sdk:list_games` does not exist.

You notice a mismatch as a symptom, not a version number: a `/verify-*` or
`/integrate-all` run fails because an MCP tool is missing or its arguments were
rejected. Update the plugin first (`/plugin update yes2sdk@yes2games`). If it
still fails, file an issue at
https://github.com/yes2games/yes2sdk-claude-plugins/issues with the failing
command and the error text.

`.mcp.json` points at the hosted HTTP endpoint for zero-install. If you are running
the MCP locally instead, register your local server (e.g.
`http://127.0.0.1:8091/mcp`) in your own MCP config; the slash commands work
against any server named `yes2sdk`. For uploads, give that entry the same
`"headers": { "X-Yes2-Api-Key": "${YES2_API_KEY:-}" }` (local HTTP), or put
`YES2_API_KEY` in its `env` (stdio). A local server does not offer sign-in.

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
