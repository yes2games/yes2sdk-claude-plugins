---
description: Validates a build against Poki's requirements.
argument-hint: [buildPath]
allowed-tools:
  - Skill
  - Read
  - Glob
  - mcp__yes2sdk__validate_integration
---

Verify this build for Poki.

Invoke the `yes2sdk:yes2sdk-verify` skill and follow its procedure with
`platform: "poki"` and the build path `$ARGUMENTS` (empty means ask once).
