# Vin Vid Player

Vin Vid Player is an offline-first Expo Android video library and player. It imports local videos, copies them into the app’s durable document directory, remembers the last position, and plays them without an internet connection.

## Features

The app includes Watch, Library, and Favorites tabs; multi-file Android import; durable offline copies; resume position persistence; play/pause, previous/next, seek, fullscreen, picture-in-picture, mute, playback speed, loop, and autoplay-next controls; search; favorites; removal with confirmation; and a broad video-container allowlist.

The visual system uses orange, deep blue, white, claymorphic cards, and glass-like translucent controls. A native device decoder still determines whether a specific codec can play. Container support is intentionally broad and includes MP4, M4V, MOV, MKV, WebM, AVI, WMV, FLV, TS, MTS, M2TS, 3GP, OGV, MPEG, and related variants.

## Project structure

Feature screens and state are JavaScript-first:

- `app/(tabs)/index.js` — Watch screen
- `app/(tabs)/library.js` — Library route
- `app/(tabs)/favorites.js` — Favorites route
- `components/video-player-context.js` — offline import, player state, persistence, and queue actions
- `components/video-library-screen.js` — searchable library and favorites UI
- `lib/video-utils.js` — format detection and deterministic utility functions
- `tests/video-utils.test.js` — JavaScript unit tests
- `design.md` — mobile design specification

The template’s server and database infrastructure remains present for project compatibility but is not used by the video player. No account, cloud-sync, or server API is required for local playback.

## Development

Install dependencies with `pnpm install`. Run the Expo development project with `pnpm dev`; use Expo Go or a development build for native video and document-picker behavior. Run deterministic tests with `pnpm exec vitest run tests/video-utils.test.js`. Run `pnpm exec tsc --noEmit --pretty false` to verify the remaining template infrastructure and JavaScript-compatible project configuration.

For a GitHub repository, commit the source files and `pnpm-lock.yaml`; do not commit `.expo`, generated Android build artifacts, local video files, or secrets. A typical workflow is:

```bash
git init
git add .
git commit -m "Build Vin Vid Player offline video library"
gh repo create vin-vid-player --private --source=. --remote=origin --push
```

## Offline storage notes

The Android document picker provides temporary access to selected files. Vin Vid Player immediately copies each accepted file into its own app document directory so it continues to work after restart and when the device is offline. Users can remove imported files from the library to reclaim storage. Video caching is enabled for the native player as an optimization; it is not required for imported local files.
