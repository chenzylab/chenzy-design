# @chenzy-design/unocss-preset

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
