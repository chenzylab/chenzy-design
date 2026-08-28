# @chenzy-design/unocss-preset

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

## 0.3.1

### Patch Changes

- @chenzy-design/tokens@0.3.1

## 0.3.0

### Patch Changes

- 79aff09: 对齐 Semi tokens（第 2 步·语义重命名，**破坏性**）：全局 scale token 改用 Semi 语义名（值不变）。

  迁移映射：
  - **spacing**：`spacing-1/2/3/4/5/6/8/10` → `spacing-extra-tight/tight/base-tight/base/base-loose/loose/extra-loose/super-loose`（`spacing-12` 保留，Semi 无 48px 档）。
  - **font-size**：`font-size-1/2/3/4/5/6` → `font-size-small/regular/header-6/header-4/header-3/header-1`。
  - **radius**：`radius-1/2/3/full` → `border-radius-small/medium/large/full`。
  - **font-weight**：`font-weight-semibold` → `font-weight-bold`（值同 600）。

  全库 717 处 `var(--cd-...)` 引用经 codemod 同步替换；uno-theme.ts、docs token 分类器与 tokens-detail.json 一并更新。值零变化，6 个视觉回归基线零像素偏移。消费方若直接引用旧 `--cd-spacing-1` 等需按映射改名。

- Updated dependencies [0a3d18d]
- Updated dependencies [5558646]
- Updated dependencies [1076cac]
- Updated dependencies [8014c02]
- Updated dependencies [ce740ec]
- Updated dependencies [414acdb]
- Updated dependencies [784b315]
- Updated dependencies [e6f2022]
- Updated dependencies [6437ae5]
- Updated dependencies [f09285d]
- Updated dependencies [6ce9a71]
- Updated dependencies [b1f5f30]
- Updated dependencies [6d3a6e6]
- Updated dependencies [064382b]
- Updated dependencies [9780bf7]
- Updated dependencies [2560973]
- Updated dependencies [79aff09]
  - @chenzy-design/tokens@0.3.0

## 0.2.1

### Patch Changes

- 56a53aa: 补充 `license: "MIT"` 字段（此前 npm 显示 Proprietary）；新增 `@chenzy-design/svelte` 包 README，含安装、引入 tokens.css、快速开始接入说明。
- Updated dependencies [56a53aa]
  - @chenzy-design/tokens@0.2.1

## 0.2.0

### Minor Changes

- cacdfdc: Initial public release — 86 个 Svelte 5 组件，对标 Semi Design。

### Patch Changes

- Updated dependencies [cacdfdc]
  - @chenzy-design/tokens@0.2.0
