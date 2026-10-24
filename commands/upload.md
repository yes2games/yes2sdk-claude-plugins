---
description: Uploads a built game to the Yes2 dashboard and returns its Inspector link.
argument-hint: [buildPath]
allowed-tools:
  - Skill
  - Read
  - Glob
  - Bash(npm run build:*)
  - Bash(git describe:*)
  - Bash(zip:*)
  - Bash(unzip -l:*)
  - Bash(stat:*)
  - mcp__yes2sdk__list_games
  - mcp__yes2sdk__create_game
  - mcp__yes2sdk__prepare_upload
  - mcp__yes2sdk__finalize_upload
  - mcp__yes2sdk__get_build_status
  - mcp__yes2sdk__update_game
  - mcp__yes2sdk__set_game_image
  - mcp__yes2sdk__finalize_image_upload
  - mcp__yes2sdk__rename_build
  - mcp__yes2sdk__validate_integration
disable-model-invocation: true
---

Upload this build to the Yes2 dashboard.

Invoke the `yes2sdk:yes2sdk-upload` skill and follow its procedure with the build
path `$ARGUMENTS` (empty means work it out in the skill's build step, asking once if
needed).
