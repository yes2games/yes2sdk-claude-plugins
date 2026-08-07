---
name: yes2sdk-verify
description: Shared verify procedure the /verify-* commands run.
allowed-tools:
  - Read
  - Glob
  - mcp__yes2sdk__validate_integration
---

# Verifying a Yes2SDK build against a platform

This is the single source of the verify procedure. Every `/verify-*` command runs
it — they differ only in which platform (or platforms) they pass in. Edit the
procedure here, not in the commands.

## Procedure

1. Determine the build folder — the user's **extracted** WebGL build. The invoking
   command passes the path as an argument when the user supplied one. If it is
   empty, ask once, then reuse the same build for every platform in this run.
2. Supply that build to the tool the way the connected server can actually read
   it. The plugin registers the **hosted** server, and it has no disk access, so
   `buildPath` there comes back as a blocking `build-path` FAIL — read the build
   locally and pass it inline as `indexHtml`, `fileList` and `jsContents`.
   `jsContents` is what makes the Yes2SDK-bundling check possible; without it that
   check cannot run. Pass `buildPath` only when the user has the server running on
   their own machine.
3. An Inspector event log may be passed as `eventLogJson`, in addition to or
   instead of the build. The static checks need the build; the behavioral rules
   (gameplayStop before ads, reward only on `adViewed`, no ads in the first 30s)
   exist only in the event log and cannot be derived from files. With only one of
   the two, state plainly which checks did not run.
4. Call `yes2sdk:validate_integration` once per platform being verified.
5. Report blocking FAILs first, then WARNs, each with the fix hint carried on the
   finding. For a multi-platform run, lead with one summary table —
   `platform | blocking-FAIL count | WARN count` — then list the FAILs underneath,
   grouped by platform.
6. Never soften or reinterpret a FAIL. The rule set is the platform's, not this
   plugin's; if a finding looks wrong, report it as returned and say so.

## What each platform usually rejects on

Use these only to explain a finding in the user's terms. They are a summary, not
the rule set — `yes2sdk:validate_integration` is authoritative.

| Platform | Usual causes of rejection |
| --- | --- |
| `poki` | `gameplayStop()` missing before an interstitial; ads in the first 30s; interstitials more often than 1/60s; ads during loading; rewards granted in `afterAd` instead of `adViewed`; external `<script src="http...">`; non-responsive canvas. |
| `crazygames` | Missing wrapper options on init; loading not reported (`setLoadingProgress` / `startGameAsync`); gameplay not bracketed with `gameplayStart()`/`gameplayStop()`; audio not muted during ads; interstitials under the 3-minute floor; an `'unfilled'`/`'adblock'` ad error treated as a dismissal. |
| `yandex` | `startGameAsync()` missing, so the loading screen never dismisses; pause/resume not handled, so audio keeps playing during ads; `gameplayStop()` missing before ads; locale not read from `session.getLocale()`. |
| `gamedistribution` | `gameId` not set before the SDK loads; mute/pause not wired to `beforeAd`/`afterAd`; rewards granted in `afterAd` instead of `adViewed`; external scripts beyond GD's own SDK. |
| `youtube` | Strictest, and the checks are cert-mandatory: `startGameAsync()` not gating `gameReady()` (called during loading); `pause` not stopping game loop, audio and network; audio state not honored (`session.isAudioEnabled()` + `audioEnabledChange`); external scripts (CSP sandbox); cloud saves over the 3 MiB cap. |
