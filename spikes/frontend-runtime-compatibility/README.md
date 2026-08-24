# XFX Frontend Runtime Compatibility Spike

This directory is an isolated Taro compatibility probe. It is not the production frontend skeleton.

## Tested Candidate Inputs

```text
Node 24.18.0
npm 11.6.2
Taro 4.2.1
React 18.3.1
TypeScript 5.9.3
Package manager: npm
```

Node and npm are locked at Environment L0. Taro, React, and TypeScript remain `L1_CANDIDATE` until the next gate.

## Commands

```powershell
npm ci
npm run build:weapp
npm run build:h5
```

The same shared TypeScript module is consumed by both targets. Platform selection remains outside the shared module.
