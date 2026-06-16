---
description: Validate the current build against Poki platform requirements.
---

Call the `validate_integration` MCP tool (server: yes2sdk) with `platform: "poki"`.

- Pass the path to the user's extracted WebGL build as `buildPath`. Ask once if it
  is unknown, then run.
- An Inspector event log can be passed as `eventLogJson` for behavioral checks.

Summarize blocking FAILs first, then WARNs, each with the fix hint from the
finding. Poki rejections usually trace to: `gameplayStop()` missing before an
interstitial, ads in the first 30s, interstitials more often than 1/60s, ads
during loading, rewards granted in `afterAd` instead of `adViewed`, external
`<script src="http...">`, or a non-responsive canvas.
