---
description: Validate the current build against all five platform requirement sets.
---

Run the `validate_integration` MCP tool (server: yes2sdk) once for each platform:
`poki`, `crazygames`, `yandex`, `gamedistribution`, `youtube`.

- Pass the path to the user's extracted WebGL build as `buildPath`. If the build
  path is unknown, ask once, then reuse the same path for all five platforms.
- If the user has an Inspector event log instead of (or in addition to) a build,
  pass it as `eventLogJson` for behavioral checks.
- Present one summary table with columns: platform | blocking-FAIL count | WARN
  count. List the actual FAILs underneath the table, grouped by platform, with the
  fix hint from each finding.
