# @chenzy-design/theme-cli

## 1.0.1

### Patch Changes

- d5c12ab: fix: 修复内部依赖 workspace:\* 协议未替换为真实版本号的发布缺陷

  1.0.0 发布过程中部分包改用 `npm publish` 手动补发（因新包首发遇到 npm
  OIDC 404 中断了 CI 的 `pnpm release`），`npm publish` 不识别 pnpm 的
  `workspace:*` 协议，导致 `@chenzy-design/svelte`（依赖 core/icons/
  illustrations/locale/tokens）、`@chenzy-design/unocss-preset`、
  `@chenzy-design/theme-cli`（均依赖 tokens）三个包的已发布 tarball 里，
  对应内部依赖字段原样写着 `workspace:*` 而非真实版本号——外部用户
  `pnpm/npm/yarn install` 时会直接因无法解析该协议而失败。

  本次修复通过正常 `pnpm release`（CI 内置的 `pnpm -r publish`）重新发布，
  pnpm publish 会正确将 `workspace:*` 替换为对应包的当前真实版本号。
  - @chenzy-design/tokens@1.0.1

## 1.0.0

### Major Changes

- chore: 1.0.0 首个稳定版本发布

### Patch Changes

- Updated dependencies [3dec738]
- Updated dependencies [f733205]
- Updated dependencies [3c5e00e]
- Updated dependencies
  - @chenzy-design/tokens@1.0.0

## 0.4.1

### Patch Changes

- @chenzy-design/tokens@0.4.1

## 0.4.0

### Minor Changes

- cc08791: 新增 `@chenzy-design/theme-cli` 主题 CLI 包：

  - `defineTheme(config)`：类型化配置辅助。
  - `chenzy-theme init`：生成 `theme.config.ts` 模板（已存在则不覆盖）。
  - `chenzy-theme build`：读 `theme.config.{ts,mts,mjs,js}`（TS 用 tsx 加载），
    按 `@chenzy-design/tokens` 的 token-manifest 校验 key 合法性，
    产出 `dist/theme.css`——`:root{}`（alias 段）+ `[data-theme="dark"]{}`（暗色段）。

### Patch Changes

- Updated dependencies [0c724b5]
- Updated dependencies [408a806]
- Updated dependencies [f8e51b8]
- Updated dependencies [53e38ca]
- Updated dependencies [cd037df]
- Updated dependencies [bfa7aff]
- Updated dependencies [6fa1c0e]
- Updated dependencies [af1fe99]
- Updated dependencies [6ce31d0]
- Updated dependencies [e4a6c5c]
- Updated dependencies [e7c9cd7]
- Updated dependencies [afd5848]
- Updated dependencies [af50bfe]
- Updated dependencies [c203124]
- Updated dependencies [57d5e82]
- Updated dependencies [a602da2]
- Updated dependencies [7ab4b65]
- Updated dependencies [a602da2]
- Updated dependencies [3d42e1d]
- Updated dependencies [aee0462]
- Updated dependencies [e2bd5f7]
- Updated dependencies [01b9b4d]
- Updated dependencies [6b11fb5]
- Updated dependencies [4a46919]
- Updated dependencies [da59fd4]
- Updated dependencies [7243000]
- Updated dependencies [84b6975]
- Updated dependencies [e96d53d]
- Updated dependencies [47f42ee]
- Updated dependencies [46dab20]
- Updated dependencies [e6202aa]
- Updated dependencies [046dc34]
  - @chenzy-design/tokens@0.4.0
