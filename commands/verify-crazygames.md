---
description: Validate the current build against CrazyGames platform requirements.
---

Call the `validate_integration` MCP tool (server: yes2sdk) with
`platform: "crazygames"`.

- Pass the path to the user's extracted WebGL build as `buildPath`. Ask once if it
  is unknown, then run.
- An Inspector event log can be passed as `eventLogJson` for behavioral checks.

Summarize blocking FAILs first, then WARNs, each with the fix hint from the
finding. CrazyGames rejections usually trace to: missing wrapper options on init,
loading not reported (`setLoadingProgress` / `startGameAsync`), gameplay not
bracketed with `gameplayStart()`/`gameplayStop()`, audio not muted during ads,
interstitials under the 3-minute floor, or treating an `'unfilled'`/`'adblock'`
ad error as a dismissal.
