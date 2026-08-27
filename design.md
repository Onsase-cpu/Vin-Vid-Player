# Vin Vid Player — Mobile Interface Design

## Product direction

Vin Vid Player is an **offline-first local video library and player** for Android. It imports videos from the device, copies them into the app’s durable document storage, remembers the library and the last position, and plays supported local media without requiring an internet connection. Network playback may also use Expo’s persistent video cache, but local files remain the primary offline path.

## Screen list

| Screen | Primary content and behavior |
|---|---|
| **Watch** | Main player screen with a large video canvas, play/pause, skip 10 seconds, previous/next, progress scrubber, playback speed, mute, fullscreen, and a “Continue watching” card. |
| **Library** | Searchable FlatList of imported videos with thumbnails or branded placeholders, duration, watched progress, favorites, sort/filter, remove, and Add Videos. |
| **Favorites** | Filtered library view showing favorited videos for quick access. |
| **Player settings sheet** | Bottom sheet for speed, repeat, autoplay-next, muted state, and cache cleanup. |

## Visual language

The palette is **orange, blue, and white** with soft depth rather than a flat card grid. The base surface is a warm white (`#FFF8F1`), primary orange is `#FF7A30`, deep blue is `#12284A`, and electric blue is `#2F80ED`. Claymorphic components use rounded forms, matte warm highlights, and restrained inset shadows. Glassmorphic overlays use translucent white, a cool border, and background blur where supported. Orange is reserved for watch actions and progress; blue carries navigation and metadata.

## Key user flows

| Flow | Steps |
|---|---|
| **Import videos** | User taps **Add Videos** → Android document picker opens for multiple video files and broad MIME types → each selected file is copied to the app document directory → metadata is added to the library → the first item opens in Watch. |
| **Resume watching** | User opens Watch → the last video and last position are restored if the file still exists → user taps play → progress is periodically persisted. |
| **Browse and play** | User opens Library → searches or filters → taps a video row → Watch opens with the selected source and metadata → playback resumes from the saved position. |
| **Manage storage** | User opens settings → sees cache/storage information → clears disposable network cache or removes imported files with confirmation. |

## Offline and compatibility decisions

Imported videos are copied into the app’s document directory so their paths remain available after restart. The picker accepts `video/*`, common application/octet-stream cases, and a broad extension allowlist including MP4, M4V, MOV, MKV, WebM, AVI, WMV, FLV, TS, MTS, M2TS, 3GP, OGV, and MPEG variants. Actual codec support depends on the operating system media decoder; unsupported files receive a clear playback error instead of a blank screen.

## Interaction principles

All primary controls use at least 44-point targets. The most frequent actions stay in the lower thumb-reach zone. Video controls fade after inactivity on the native player surface, while an explicit controls toggle keeps the interface usable with accessibility services. No account, cloud sync, advertisement, or server processing is required.
