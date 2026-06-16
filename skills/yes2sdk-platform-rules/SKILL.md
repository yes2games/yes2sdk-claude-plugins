---
name: yes2sdk-platform-rules
description: Use when integrating Yes2SDK or fixing platform-compliance issues for a Yes2SDK game (Poki, CrazyGames, Yandex, GameDistribution, YouTube). Carries the highest-leverage cross-platform gotchas and defers to the yes2sdk MCP for the authoritative rule set.
---

# Yes2SDK platform rules

Yes2SDK is one unified API across all five platforms — write the integration once
and gate platform-specific features with `isSupported()` so unsupported features
no-op. Never call a platform SDK directly. Never invent SDK methods.

## Highest-leverage rules (apply everywhere)

1. `await initializeAsync()` before any other SDK call. Call `startGameAsync()`
   only when the game is loaded and interactable — never during loading.
2. Call `game.gameplayStop()` BEFORE every interstitial; `game.gameplayStart()` to
   resume after.
3. Pause/mute in `beforeAd`, restore in `afterAd`. Grant rewarded-ad rewards in
   `adViewed` only — never `afterAd` (it fires even on dismissal).
4. No external `<script src="http...">` — all platforms sandbox or strip them.
5. Guard optional modules (`auth`, `banners`, `friends`) with `isSupported()`.

## This is a summary, not the source of truth

Per-platform rules diverge (Poki's 30s/60s ad timing, CrazyGames' 3-minute floor
and wrapper options, Yandex pause/resume + locale, GameDistribution's `gameId` and
event flow, YouTube's cert-mandatory pause/audio handling). These change. Do not
rely on this list for compliance decisions.

For the authoritative, current rule set, call the **yes2sdk MCP**:

- `get_platform_requirements` (platform) — the full rule list with severities.
- `validate_integration` (platform, buildPath and/or eventLogJson) — run the
  actual checks against a build or Inspector log and surface FAILs.
- `get_quickstart` (platform) / `get_api_reference` (module) — exact call
  sequences and method signatures.

When in doubt, fetch from the MCP rather than guessing.
