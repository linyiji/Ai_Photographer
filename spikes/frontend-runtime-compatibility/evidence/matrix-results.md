# Compatibility Matrix Results

## Runtime evidence

```text
Node: v24.18.0
npm: 11.6.2
Package manager: npm
Lock file: package-lock.json
```

## Matrix A

Taro `4.2.1` + React/React DOM `19.2.6` + TypeScript `5.9.3`: **FAIL**.

`npm install --no-audit --no-fund` stopped with `ERESOLVE` because `@tarojs/react@4.2.1` declares `react: ^18`. No `--force` or `--legacy-peer-deps` override was used.

## Matrix B

Taro `4.2.1` + React/React DOM `18.3.1` + TypeScript `5.9.3`: **PASS_WITH_WARNING**.

- clean install: PASS
- `npm ci --no-audit --no-fund`: PASS, 1172 packages
- `npm ls --depth=0`: PASS
- `npx tsc --noEmit`: PASS with `skipLibCheck` enabled
- WeChat build: PASS
- H5 build: PASS

## Matrix C

Not executed. TypeScript 5.9.3 did not cause an application or build failure, so changing another version would have obscured the proven cause of Matrix A.

## Dependency tree

All direct Taro packages resolve to `4.2.1`; React and React DOM resolve to `18.3.1`; TypeScript resolves to `5.9.3`; Webpack resolves to `5.91.0`; `@types/react` resolves to `18.3.31`. `npm ls --depth=0` exited with code 0 after both `npm install` and `npm ci`.
