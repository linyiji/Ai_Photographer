# Build Evidence

## WeChat Mini Program

Command: `npm run build:weapp`

Result: **PASS**. The post-`npm ci` build exited 0, Webpack compiled successfully, and 19 files were emitted. The expected application/page JS, JSON, WXML, and WXSS artifacts exist. `XFX runtime probe` is present in `dist/pages/index/index.js`.

An initial scaffold-only configuration error referenced the omitted generator plugin. Removing that unused generator plugin from the build configuration fixed the issue without changing any tested runtime version.

## H5

Command: `npm run build:h5`

Result: **PASS**. The post-`npm ci` build exited 0, Webpack compiled successfully in 27.43 seconds, and 11 files were emitted, including `index.html`, JavaScript, and CSS. `XFX runtime probe` is present in `dist/js/628.a94227f9.js`.

Warnings: the 299 KiB H5 entrypoint exceeds Webpack's recommended 244 KiB limit, and Taro/Webpack emits a nonfatal `[hash]` to `[fullhash]` deprecation warning.

## Node 24 classification

No fatal deprecated API, ESM/CJS, OpenSSL, CLI, Webpack, or child-process incompatibility occurred. Node 24.18.0 is classified `PASS_WITH_WARNING` because ecosystem deprecation warnings remain visible, although neither install nor build failed.
