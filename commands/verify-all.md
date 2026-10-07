---
description: Validates a build against every supported platform's requirements.
argument-hint: [buildPath]
allowed-tools:
  - Skill
  - Read
  - Glob
  - mcp__yes2sdk__validate_integration
  - mcp__yes2sdk__get_platform_requirements
---

Verify this build for every supported platform.

Invoke the `yes2sdk:yes2sdk-verify` skill and follow its procedure once per
platform (`poki`, `crazygames`, `yandex`, `gamedistribution`, `youtube`, `jest`)
with the build path `$ARGUMENTS` (empty means ask once, then reuse the same build for
every platform). Lead the report with the summary table.
