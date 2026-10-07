---
description: Validates a build against Jest's requirements.
argument-hint: [buildPath]
allowed-tools:
  - Skill
  - Read
  - Glob
  - mcp__yes2sdk__validate_integration
  - mcp__yes2sdk__get_platform_requirements
---

Verify this build for Jest.

Invoke the `yes2sdk:yes2sdk-verify` skill and follow its procedure with
`platform: "jest"` and the build path `$ARGUMENTS` (empty means ask once).
