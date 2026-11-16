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
- Follow-up live verification completed on November 15 at 19:20 UTC against the actual public URL, with normal linked-session cookies and **no API route fixtures or injected credentials**. The public app generated 51 real Chirp words and 12 caption phrases. Version 5 passed real editor chat, summary, full editorial selection/review, and MP4 export. A fresh browser restored the real project and byte-identical private R2 source. The final AI-edited export is H.264/AAC, 854×480, about 14.97 seconds. Report: `outputs/deployed-real-verification.json`; artifact: `outputs/deployed-real-ai-export.mp4` (ignored).
- A nondeterministic model reply failed the chat schema on the first public attempt. The server now includes the full output schema in the system instructions in addition to the API response format, validates before applying edits, and reports rejected edits as recoverable 502 responses. The repeated public request passed and preserved unrelated cuts/captions.
- No synthetic leaderboard activity or credit burning. Automated test context sends DNT and disables telemetry. Owner/test usage is excluded by Publik's fellowship rules.

Update this section only with observed live results. Do not describe unverified integration as complete.

## Reproducing browser checks

Install dependencies with Node 22.13+ and a compatible Playwright Chromium. Start a fresh built Worker after any rebuild; an older Worker can retain stale asset manifests. `TEST_BASE_URL` selects local or deployed tests.

Generate fixtures with `node scripts/make-fixture.mjs` against its configured local origin. FFmpeg converts the generated WebM to `outputs/fixture.mp4`; create an overlay PNG and short PCM sine-wave WAV for the layer tests. No real user videos or paid AI calls are needed for the fixture suite.

`npm run test:e2e` runs fixture tests. `node scripts/verify-live.mjs` performs a separate real authentication/AI flow; it needs human Publik sign-in and an account with available plan/grant credit. Its HTTP-only test-session state is kept under ignored `outputs/` with mode 0600. Never commit it.

For an already approved owner test install, `scripts/verify-linked-local.mjs` accepts `LIVE_TEST_KEY_HEADER_PATH` pointing to its private authorization-header file. It seeds only isolated local D1 with an encrypted credential and a random test cookie, runs a fresh production Worker on 5186, and stops it afterward. Never use this to modify production sessions. `LIVE_CONTRACTS_ONLY=1` checks summary/editorial contracts using the prior retained transcript. These are real paid test requests; run intentionally, not in CI. Reports under ignored `outputs/` contain verification results, and private browser state is mode 0600.

## WebKit acceptance

Playwright WebKit 27.2 is installed and used through `TEST_BROWSER=webkit`. WebKit testing found a Blob/File IndexedDB backing-store failure; media now falls back to 4 MB ArrayBuffer chunks with an atomic manifest, reassembly validation and deletion cleanup. Grid tracks now explicitly constrain the inspector so its lower controls remain clickable above the footer.

Ten browser checks pass locally in Chromium (17.9 seconds) and WebKit (28.4 seconds), including upload/edit/export, generated-camera recording, batch, captions/references, and a padded MP4 crossing the chunk boundary that survives a full reload and is completely removed on deletion. The generated camera fixture retains its MediaDevices object to survive WebKit's wrapper lifecycle. This validates WebKit engine behavior; physical camera/microphone permissions and an actual Safari/iPhone device check remain manual. The fixture suite does not make real AI calls.

Final public-deployment regression: version 6 (app source `7ef1caf474237e5b9c6d12d7ffacd0f6818ab910`) passed all ten Chromium checks in 27.6 seconds and all ten WebKit checks in 38.8 seconds. The deployed harness now waits for the visible signed-in studio before setting hidden file inputs; this removes a test-only race with the asynchronous sign-in gate. No AI responses are mocked in the separate deployed real-AI verification above.


## Publik open-source review corrections — November 16, 2026

Added root MIT `LICENSE`, root `THIRD_PARTY_NOTICES.md`, the full GPL-2.0 license under `LICENSES/`, README licensing links and MIT package/lockfile metadata for the submitted public web repository. The existing `public/ffmpeg/NOTICE.txt` and GPL license remain intact. The MIT grant applies to EditAI-authored code; the `@ffmpeg/core@0.12.10` WebAssembly core retains GPL-2.0-or-later and its source/build notices. Hosted credentials remain server-side; no public desktop bootstrap resource was copied into the hosted web repository.

Typecheck, all 15 model/security tests and the production build passed using the current shared dependency installation through a temporary local symlink (removed after validation). No application/editor or authentication behavior changed. Publik review acceptance remains external; adding repository license files alone is not a claim that the listing is live.

GitHub's license API recognizes this repository as MIT. The documented Publik derive request confirms the existing `editai-studio` listing with `repo_already_listed` (409); no duplicate was submitted or claimed accepted.
