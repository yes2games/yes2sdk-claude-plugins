---
description: Scaffold the unified Yes2SDK init + ad loop with isSupported() guards (portable across all 5 platforms).
---

Scaffold a Yes2SDK integration into the current project. Yes2SDK is one unified API
that runs on all five platforms (poki, crazygames, yandex, gamedistribution,
youtube); write the integration once and guard platform-specific features with
`isSupported()` so unsupported features no-op instead of breaking.

Steps:

1. Determine the engine. If it is not obvious from the project files, ask: Defold
   (Lua, `yes2sdk.*`), Unity (C#, `Yes2SDK.Yes2SDK.*`), or plain TS/JS
   (`Yes2SDK.*`). Use the matching naming convention in all generated code.
2. Call `get_quickstart` (server: yes2sdk) for the project's primary target
   platform. Default to `poki` if the target is unknown.
3. Call `get_api_reference` (server: yes2sdk) for the `ads` and `lifecycle`
   modules to get exact method signatures.
4. Generate the integration following the mandatory loop, in this order:
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
5. After writing the code, run `validate_integration` (server: yes2sdk) for the
   primary platform and report any FAILs/WARNs with fix hints.

Do not call any platform SDK directly and do not invent SDK methods — use only what
the quickstart and API reference document.
