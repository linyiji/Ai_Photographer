# Automated regression evidence

Run on 2026-08-31 from `D:\Projects\Ai_Photographer`:

- Backend: final `uv run pytest -q` -> `121 passed in 20.49s`.
- Client TypeScript: `tsc --noEmit` -> PASS.
- Client test compile: `tsc -p tsconfig.test.json` -> PASS.
- Client Node tests: `97 passed`, `0 failed`.
- WeChat Taro build: PASS.
- H5 Taro build: PASS with existing asset/entry-size advisories.
- H5 runtime: `http://127.0.0.1:4185/#/pages/index/index` rendered title `向风行 · S01`, Home content was present, console errors/warnings `0 / 0`.

WeChat output verification:

- Import directory: `D:\Projects\Ai_Photographer\apps\client\dist\weapp`
- `app.json`: present
- compiled `app.js`: present
- `pages/`: present
- Scene scan commit path bundled: yes
- first-party Geometry multipart path bundled: yes
- `document.baseURI`: 0 files
- `self.location.href`: 0 files
- `new Worker`: 0 files
- `new URL(...)`: 0 files
- top-level `new TextEncoder`: 0 files

H5 and WeChat output roots remain isolated at `dist/h5` and `dist/weapp`; both outputs coexist.

Coverage includes contract/catalog validation, REAL/FAKE/REPLAY providers, standalone service, one-scan P1/P2 semantics, backend-only status authority, exact hashes, 640/960 px bounds, cache identity, request-failure distinction, failure degradation, supersession, Session history, normalized events, and static private-import/direct-mutation boundaries.
