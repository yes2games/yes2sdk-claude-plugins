---
description: Validate the current build against GameDistribution platform requirements.
---

Call the `validate_integration` MCP tool (server: yes2sdk) with
`platform: "gamedistribution"`.

- Pass the path to the user's extracted WebGL build as `buildPath`. Ask once if it
  is unknown, then run.
- An Inspector event log can be passed as `eventLogJson` for behavioral checks.

Summarize blocking FAILs first, then WARNs, each with the fix hint from the
finding. GameDistribution rejections usually trace to: `gameId` not set before the
SDK loads, mute/pause not wired to `beforeAd`/`afterAd`, rewards granted in
`afterAd` instead of `adViewed`, or external scripts beyond GD's own SDK.
