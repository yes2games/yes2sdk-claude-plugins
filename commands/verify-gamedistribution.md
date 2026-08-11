---
description: Validates a build against GameDistribution's requirements.
argument-hint: [buildPath]
allowed-tools:
  - Skill
  - Read
  - Glob
  - mcp__yes2sdk__validate_integration
---

Verify this build for GameDistribution.

Invoke the `yes2sdk:yes2sdk-verify` skill and follow its procedure with
`platform: "gamedistribution"` and the build path `$ARGUMENTS` (empty means ask once).
