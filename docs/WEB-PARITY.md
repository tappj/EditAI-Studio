# iOS → web parity and differences

The source of truth is the sibling EditAI Swift app. Pure editorial prompts, independent review, selection validator, chat contract and summary validation are reused under `lib/ios` without changing iOS.

| iOS capability | Web implementation |
| --- | --- |
| Upload / multi-source recording | Browser file picker/drop, up to 50 sources, source-order timeline; HTML media validation |
| Main editor | Source-based split/trim/remove/move/duplicate, speed .25–4, volume, 100-step undo/redo |
| Caption studio | Retained-source anchors across cuts, splits, speed and duplicates; standard/boxed/single grouping; iOS font assets/licenses; manual text, colors, outlines, backgrounds, spacing, shadows, animations |
| Appearance | Fourteen named looks; sixteen adjustment controls, crop/rotation/flips; shared Canvas/WebGL preview and export |
| Layers | Image/video overlays with position/width/opacity and appearance; three audio lanes, fades, source in points, mix |
| AI best takes | Whole-recording semantic selection, independent review and conditional correction repair; stable original word IDs; conservative measured quiet pauses between protected speech |
| Transcribe / Analyze | Original words with clickable timestamps and text download/copy; main point/hook/highlights; Publik Chirp 3 word timestamps, cached/resumable jobs; OpenAI own-key option |
| Customize chat | Native structured edit contract, atomic validation, text/caption/style operations; image or sampled video reference frames |
| Recording / teleprompter | Browser MediaRecorder, segmented takes, explicit confirmation, 30s/60s/3min/10min cap, camera switch, scrolling script; UI never burned into source |
| Batch | Two–ten separate projects; optional sequential AI edits; originals retained on partial failure |
| Library | Identity-scoped IndexedDB originals and drafts, server timeline sync, rename/delete/reopen; optional private cloud source backup |
| Profile / settings | Profile name/avatar, light/dark/system appearance, language, Publik plan use as a percentage, consent, telemetry opt-out, data export/deletion |
| Export | Actual shared-compositor rendering and MP4 H.264/AAC encoding; original dimensions or 480/720/1080 widescreen long-edge targets; 24/30/60 fps |

## Deliberate platform differences

- Apple sign-in, StoreKit/RevenueCat checkout and DeviceCheck remain in iOS. The independent web app uses Publik identity and plan connection; no iOS billing/authentication bypass or production Supabase migration was added.
- Browser output is SDR and re-encoded. It cannot promise AVFoundation's original compressed packet copy, HDR metadata, VFR/source timestamps or source-frame-rate preservation. The filters approximate native visual intent with browser rendering, not bit-identical Core Image output. Keep the tab visible during real-time composition.
- Browser memory, codec and device limits vary. The import validator permits up to 1 GB and 30 minutes, but large HEVC/HDR inputs can exceed practical mobile memory; a smaller MP4 is the recovery path. AI stays within fifteen minutes/source, below Publik's current twenty-minute word-timestamp recommendation.
- Quiet-pause cuts require measured quiet audio between transcript anchors and never delete a whole non-speaking/B-roll clip. The native independent voice/face classifiers and exact source-frame snap are not reproduced in the browser.
- Photos saving becomes a browser download. Hardware camera torch/front-screen flash and native device capture quality are not promised by browser capture.
- The native transcript/analysis views are temporary. The web retains the imported project/words for recovery; it does not require a paid second transcription when reopening.
- Publik may return a linked account with no public ID/handle. Such accounts use the verified install key ID as a browser-scoped owner identity, with a persistent HTTP-only session. Different browsers will not automatically share those projects. Accounts with a returned public identity use account scope. Settings discloses the actual scope; export metadata and retain originals before changing browsers.
- Source backups are opt-in and capped at 100 MB/file and 500 MB/account. A timeline synced without source backup needs the original browser's local media. This is disclosed in Settings and errors.
- Native AI media-tool operations not advertised in `supportedOperations` are not emitted or silently treated as successful. Imported layers can be changed with their working manual controls.

Real Publik AI verification and its testing boundaries are recorded in VERIFICATION.md. The public authenticated AI/cloud-restore/export workflow and WebKit engine checks have passed. Publik catalog review, physical camera/microphone permissions, and an actual Safari/iPhone device check remain outstanding.
