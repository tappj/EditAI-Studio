# Verification record

## What has actually been exercised

November 15, 2026. The new app is independently deployed through Sites at https://editai-web.givingarmadillo8.chatgpt.site. The original iOS project and its production Supabase functions have not been modified. The existing private marketing/waitlist website has not been modified.

`npm run typecheck` and the production Worker build pass. Fifteen model/security tests pass: source-safe split/cut/duplicate and caption anchors; atomic AI operations; crop/audio bounds; overlap-safe quiet-pause evidence; AES-GCM authentication/random IVs; cross-origin request rejection; bounded JSON; safe payment links; nullable Publik account handles; and bounded recovery of a lost one-time install credential.

Nine Playwright browser tests pass against the final production build (16.9 seconds) and public deployment version 3 (28.3 seconds), source commit `304b59dd9a9a380d77afdd322a7f8f78c813e835`:

1. Public homepage requires the Publik gate; responsive desktop/mobile layout.
2. Real browser video import, split, undo/redo, GPU exposure adjustment, square canvas, text, real MP4 export, persistent reopen, and mobile editor layout.
3. AI 402 recovery preserves the timeline (fixture error response).
4. Actual browser MediaRecorder recording, teleprompter, WebM duration repair and import, with a generated camera/audio source.
5. Image overlay + imported audio, actual exported media.
6. Batch creates independent persistent projects (AI disabled for this fixture test).
7. Deployed mutation endpoint rejects foreign-origin requests before data access.
8. Chirp upload/job/poll contract with word timestamps and transcript caching (fixture backend).
9. Actual browser-decoded reference image frames are attached to the chat request (fixture reply).

The authenticated UI tests use Playwright-only API route fixtures. They do **not** install a production authentication bypass and do **not** prove real Publik connectivity. Real video decoding, compositing, audio, WebAssembly, export and IndexedDB remain active in those tests. Generated media contains no real person's recordings.

Inspected exported file: H.264 + AAC, 854×854, 30 fps, about 4.16 seconds. A decoded output frame contains the actual source and text overlay. Images: `outputs/editor-desktop.png`, `outputs/editor-mobile.png`, `outputs/export-frame.png` (local, ignored). Decoded audio is non-silent (RMS approximately 0.070 in the main export and non-silent in the layered export). Automated camera coverage uses a generated stream; actual OS camera/microphone permission and physical-device behavior require a manual check.

The final regression caught an empty MediaRecorder output when the Mac physical audio clock froze despite a running AudioContext. Export now uses the supported silent output sink while retaining the real audio graph/capture destination, checks clock progress, rejects empty captures, and restores the prior output afterward. Final upload/edit/export and generated-camera tests pass with this change. Physical audio output remains outside automated coverage. Reference: https://developer.chrome.com/blog/audiocontext-setsinkid

## Real Publik integration status

- Hosted-web checklist approved by owner.
- Builder device approval received after completing Review → Approve in the browser.
- Listing registered: https://publikhq.com/editai-studio, `held_for_review`; public catalog URL may return 404 until Publik clears review.
- Hosted app token minted for `ai.chat` and `ai.transcribe`, stored as a secret runtime variable. No app token or install key is committed or included in frontend assets.
- Real `/installs` call returned 201. A real initial chat call returned 402 on an unlinked install, with the documented claim recovery link; no successful paid call is claimed from that attempt.
- The deployed app's real gate provisioned a browser install, and the owner completed its official claim. Publik returned `claim_state: claimed`, available credit, a stable key ID, and a null public handle. That real response exposed an account-mapping defect, fixed with verified linked-key scope and covered by regression tests.
- Real chat returned HTTP 200 and the requested connection-verification phrase. Direct Chirp upload → signed PUT → job creation → polling completed with 51 word timestamps for a 19-second synthetic recording.
- A second, unmocked browser run used the exact production Worker build with isolated local D1/R2 and the already-approved owner-test credential. It exercised real wallet authentication, plan connection, AI consent, WAV extraction in FFmpeg, authenticated streaming upload, Chirp polling, 12 caption phrases, and editor chat applying the Warm look. No browser exceptions. The official claim was completed on the live install; only its encrypted test credential was placed in the isolated test DB to avoid another human sign-in. There is no production auth bypass.
- Real server summary and full-recording editorial selection + independent review passed against Publik. A forged audio-upload ticket was rejected with 403. These checks used retained real ASR words; they did not repeat transcription.
- Browser testing exposed Google's missing upload CORS headers. The corrected app streams bounded WAV audio through the authenticated Worker using a short-lived encrypted owner-bound ticket, exact-length stream and fixed Google host; no entire video is buffered. Actual upload/job completion passed after this change.
- The paid real-AI browser run was against the production build locally, **not an authenticated browser session on the final public deployment**. Deployed browser edit/export checks use the fixtures described above. This distinction is retained explicitly.
- No synthetic leaderboard activity or credit burning. Automated test context sends DNT and disables telemetry. Owner/test usage is excluded by Publik's fellowship rules.

Update this section only with observed live results. Do not describe unverified integration as complete.

## Reproducing browser checks

Install dependencies with Node 22.13+ and a compatible Playwright Chromium. Start a fresh built Worker after any rebuild; an older Worker can retain stale asset manifests. `TEST_BASE_URL` selects local or deployed tests.

Generate fixtures with `node scripts/make-fixture.mjs` against its configured local origin. FFmpeg converts the generated WebM to `outputs/fixture.mp4`; create an overlay PNG and short PCM sine-wave WAV for the layer tests. No real user videos or paid AI calls are needed for the fixture suite.

`npm run test:e2e` runs fixture tests. `node scripts/verify-live.mjs` performs a separate real authentication/AI flow; it needs human Publik sign-in and an account with available plan/grant credit. Its HTTP-only test-session state is kept under ignored `outputs/` with mode 0600. Never commit it.

For an already approved owner test install, `scripts/verify-linked-local.mjs` accepts `LIVE_TEST_KEY_HEADER_PATH` pointing to its private authorization-header file. It seeds only isolated local D1 with an encrypted credential and a random test cookie, runs a fresh production Worker on 5186, and stops it afterward. Never use this to modify production sessions. `LIVE_CONTRACTS_ONLY=1` checks summary/editorial contracts using the prior retained transcript. These are real paid test requests; run intentionally, not in CI. Reports under ignored `outputs/` contain verification results, and private browser state is mode 0600.
