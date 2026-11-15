# EditAI Web execution record

Source: ../EditAI/EditAI. Independent repository tappj/EditAI-Studio, branch codex/publik-web. Preserve original iOS and private tappj/editai-web marketing projects.

## Architecture
React/TypeScript with Vinext App Router, Cloudflare Worker via Sites; D1/R2 for authenticated data. Browser FFmpeg worker for extraction and MP4 export, IndexedDB media/drafts. Nondestructive source-anchored timeline shared by preview/export/AI/captions. Server-only Publik credentials, per-visitor install identity/wallet and HTTP-only sessions. Port existing pure editorial/summary algorithms; do not bypass existing Supabase/iOS entitlements.

## Tasks
- [x] Audit iOS features/design/algorithms, fellowship handbook and Publik docs.
- [x] Create independent project and hosting identity; preserve older projects.
- [ ] Approve hosted-web listing, device authorization, mint server token.
- [ ] Multi-source import, recording/teleprompter, batch, persistent library.
- [ ] Timeline split/trim/reorder/duplicate/delete, speed/volume, crop/filters/history.
- [ ] Captions/text, video/image overlays, audio lanes.
- [ ] Publik transcription, full-recording editorial selection, summary, editor chat.
- [ ] Matching playback and MP4 export.
- [ ] Settings/profile/consent/privacy/deletion and resilient errors.
- [ ] Algorithm/security tests; real browser upload/edit/export and AI tests.
- [ ] Deploy, verify live flows, publish Publik listing, document differences.

## Fellowship
Nov 9–Dec 15, 2026. Sunday check-ins Nov 15/22/29, Dec 6/13; no automation requested. WAU requires 25 min in a day or use on two days. Owner/bot/extra-account use excluded. Compute is eligible paying-user spend. Only official app_opened/active_session telemetry during actual use. Credits expire Dec 31; wallet must confirm available grants.

## Constraints
Publik checklist and browser approvals mandatory before integration/publication. Hosted web has no binary release and requires sign-in gate before application. Browser exports cannot promise AVFoundation HDR/VFR fidelity; measure memory limits. Apple IAP/DeviceCheck/Photos/camera torch require web alternatives. Domain purchase requires approval. No functionality claimed complete until verified.

## Validation
Implementation in progress; results will be recorded here.
