---
description: Validates a build against all five platforms' requirements.
argument-hint: [buildPath]
allowed-tools:
  - Skill
  - Read
  - Glob
  - mcp__yes2sdk__validate_integration
---

Verify this build for all five platforms.

Invoke the `yes2sdk:yes2sdk-verify` skill and follow its procedure once per
platform — `poki`, `crazygames`, `yandex`, `gamedistribution`, `youtube` — with
the build path `$ARGUMENTS` (empty means ask once, then reuse the same build for
all five). Lead the report with the summary table.
