---
description: Scaffolds a Yes2SDK integration — detect, install check, ad loop, guards.
argument-hint: [platform]
allowed-tools:
  - Skill
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - mcp__yes2sdk__detect_sdk
  - mcp__yes2sdk__get_install_instructions
  - mcp__yes2sdk__get_quickstart
  - mcp__yes2sdk__get_api_reference
  - mcp__yes2sdk__validate_integration
disable-model-invocation: true
---

Scaffold a Yes2SDK integration into the current project. Yes2SDK is one unified API
that runs on every supported platform (poki, crazygames, yandex, gamedistribution,
youtube, jest); write the integration once and guard platform-specific features with
`isSupported()` so unsupported features no-op instead of breaking.

Target platform: "$ARGUMENTS" — default to `poki` when empty.

Steps:

1. Establish the engine and the install state by invoking the
   `yes2sdk:yes2sdk-install` skill, which holds the detection procedure and its
   preconditions. Do not ask the user which engine they are on. Ask only if
   detection cannot determine one: Defold (Lua, `yes2sdk.*`), Unity (C#,
   `Yes2SDK.Yes2SDK.*`), or plain TS/JS (`Yes2SDK.*`). Use the matching naming
   convention in all generated code.
2. **Stop here when the engine is `unity` or `defold` and the SDK is not
   installed.** Generated code would reference a namespace or module that does not
   resolve, so it cannot compile. Surface the install steps and write NO code
   referencing `Yes2SDK`, the `yes2sdk` module or `window.Yes2SDK`. Say the install
   is the blocker and offer to continue after it.

   Do not stop on a `js` project. There `installed: no` is expected and permanent —
   the web runtime is injected into the build at upload time, and its report lists
   steps that are the build-and-upload flow, not a package to add. Generate the
   code.
3. Call `yes2sdk:get_quickstart` for the target platform.
4. Call `yes2sdk:get_api_reference` for the `ads` and `lifecycle` modules to get
   exact method signatures. For `jest`, also call it for `iap`, `auth`, `data` and
   `referrals` as the quickstart needs them.
5. Generate the integration following the mandatory loop, in this order:
   - `initializeAsync()` — await it before any other SDK call.
   - `startGameAsync()` — call only when the game is loaded and interactable,
     never during a loading screen.
   - `game.gameplayStart()` when play begins.
   - `game.gameplayStop()` BEFORE showing any ad.
   - `ads.showInterstitial(...)` (or rewarded) — pause/mute in `beforeAd`, restore
     in `afterAd`; for rewarded, grant the reward only in `adViewed`.
   - `game.gameplayStart()` to resume after the ad.
   - Wrap every optional-feature call (`auth`, `banners`, `friends`, etc.) in its
     `isSupported()` guard.
   - For `jest`, there are no ads: keep the loop above so the code stays portable,
     never gate progression on a rewarded ad, and add the Jest calls the
     quickstart's launch checklist lists (guest save, registration prompt for
     guests only, notification sequence, purchase recovery, subscription check,
     `exitRequested` save). Image sharing works on Jest even though
     `context.isSupported()` is false, so do not gate it on that check.
6. After writing the code, run `yes2sdk:validate_integration` for the target
   platform and report any FAILs/WARNs with fix hints.

Do not call any platform SDK directly and do not invent SDK methods — use only what
the quickstart and API reference document.
