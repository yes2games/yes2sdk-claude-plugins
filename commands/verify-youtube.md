---
description: Validates a build against YouTube Playables' certification rules.
argument-hint: [buildPath]
allowed-tools:
  - Skill
  - Read
  - Glob
  - mcp__yes2sdk__validate_integration
---

Verify this build for YouTube Playables.

Invoke the `yes2sdk:yes2sdk-verify` skill and follow its procedure with
`platform: "youtube"` and the build path `$ARGUMENTS` (empty means ask once).
