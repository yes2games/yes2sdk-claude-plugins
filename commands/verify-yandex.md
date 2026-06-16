---
description: Validate the current build against Yandex Games platform requirements.
---

Call the `validate_integration` MCP tool (server: yes2sdk) with
`platform: "yandex"`.

- Pass the path to the user's extracted WebGL build as `buildPath`. Ask once if it
  is unknown, then run.
- An Inspector event log can be passed as `eventLogJson` for behavioral checks.

Summarize blocking FAILs first, then WARNs, each with the fix hint from the
finding. Yandex rejections usually trace to: `startGameAsync()` missing (loading
screen never dismisses), pause/resume not handled (audio not muted during ads),
`gameplayStop()` missing before ads, or locale not read from `session.getLocale()`.
