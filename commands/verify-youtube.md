---
description: Validate the current build against YouTube Playables requirements (strictest certification).
---

Call the `validate_integration` MCP tool (server: yes2sdk) with
`platform: "youtube"`.

- Pass the path to the user's extracted WebGL build as `buildPath`. Ask once if it
  is unknown, then run.
- An Inspector event log can be passed as `eventLogJson` for behavioral checks.

Summarize blocking FAILs first, then WARNs, each with the fix hint from the
finding. YouTube has the strictest, cert-mandatory checks; rejections usually
trace to: `startGameAsync()` not gating `gameReady()` (called during loading),
`pause` not stopping game loop/audio/network, audio not honored
(`session.isAudioEnabled()` + `audioEnabledChange`), external scripts (CSP
sandbox), or cloud saves over the 3 MiB cap.
