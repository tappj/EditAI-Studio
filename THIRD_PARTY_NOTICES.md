# Third-party notices

The root [LICENSE](LICENSE) applies to EditAI-authored code. It does not
relicense FFmpeg, its codecs, bundled fonts, vendored code or other third-party
components. Those components retain their respective copyright notices and
license terms. In particular, distributing FFmpeg binaries requires the
applicable GPL notices and corresponding source; the MIT license for EditAI
is not a substitute for those obligations.

## Browser FFmpeg WebAssembly core

- Component: `@ffmpeg/core` **0.12.10**, from the ffmpeg.wasm project.
- License: **GNU General Public License, version 2 or later
  (GPL-2.0-or-later)**, as declared by the distributed core package.
- Copyright: the FFmpeg developers and contributors, ffmpeg.wasm contributors,
  and the copyright holders identified in the included codec/library sources.
- Full license: [LICENSES/GPL-2.0-or-later.txt](LICENSES/GPL-2.0-or-later.txt),
  also shipped as [public/ffmpeg/COPYING.GPLv2](public/ffmpeg/COPYING.GPLv2).
- The existing [browser notice](public/ffmpeg/NOTICE.txt) accompanies the core.
- Source and build recipes: <https://github.com/ffmpegwasm/ffmpeg.wasm>.
  The exact distributed package is `@ffmpeg/core@0.12.10`; retain its
  upstream build inputs and third-party source notices when redistributing.
- Upstream FFmpeg source and licensing: <https://github.com/FFmpeg/FFmpeg>
  and <https://ffmpeg.org/legal.html>.

The browser core is distributed as `public/ffmpeg/ffmpeg-core.js` and two
WebAssembly byte chunks, `core-part-1.bin` and `core-part-2.bin`. Concatenating
the chunks reconstructs the original core binary; splitting it for the
hosting asset-size limit does not change its license. FFmpeg and its
third-party codecs are not EditAI-authored MIT code.

## Browser JavaScript wrapper

`@ffmpeg/ffmpeg` **0.12.15** and `@ffmpeg/util` **0.12.x** are MIT-licensed
JavaScript packages, separate from the GPL WebAssembly core. Their upstream
copyright and permission notices remain applicable. The distributed wrapper
notice is preserved in [public/ffmpeg/NOTICE.txt](public/ffmpeg/NOTICE.txt).
Source: <https://github.com/ffmpegwasm/ffmpeg.wasm>.

## Fonts and other dependencies

Font-specific license files are retained alongside the font files in
[public/fonts](public/fonts). Vendored UI and build integration licenses are
retained in [vendor](vendor) and [scripts/vite](scripts/vite). Package metadata
and lockfiles identify the exact JavaScript dependencies; their upstream
licenses and notices continue to apply.

FFmpeg is a trademark of Fabrice Bellard. This notice does not imply an
endorsement of EditAI by FFmpeg, ffmpeg.wasm, Electron or their contributors.
