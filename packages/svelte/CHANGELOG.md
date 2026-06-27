# @chenzy-design/svelte

## 0.2.1

### Patch Changes

- 56a53aa: 补充 `license: "MIT"` 字段（此前 npm 显示 Proprietary）；新增 `@chenzy-design/svelte` 包 README，含安装、引入 tokens.css、快速开始接入说明。
- 66c1fa1: 发布包不再包含测试与夹具产物：svelte-package 会把 src 下的 `*.test.*` / `*Fixture.svelte` / `test-utils/` / `*.bench.*` 一并编译进 dist（0.2.0 误含 529 个此类文件）。新增 `clean-dist.mjs` 在打包后清理，显著减小包体积。
- 66c1fa1: 修复 Badge 组件 dev 模式下 mount 时的 TDZ 运行时错误（`prevDisplayCount` 在 `displayCount` 声明前用 `$state(displayCount)` 预读，触发 `Cannot access 'displayCount' before initialization`）。改为 `undefined` 起始，由首个 effect seed。视觉回归测试发现。
- Updated dependencies [56a53aa]
  - @chenzy-design/core@0.2.1
  - @chenzy-design/locale@0.2.1
  - @chenzy-design/tokens@0.2.1

## 0.2.0

### Minor Changes

- cacdfdc: Initial public release — 86 个 Svelte 5 组件，对标 Semi Design。

### Patch Changes

- f1f8c54: 修复 npm 安装后消费方 dev 模式因 `.svelte.ts` 内 TS 语法报 `js_parse_error`：`exports` 与 `svelte` 字段从指向未编译的 `src/index.ts` 改为指向已编译（类型已剥离）的 `dist/index.js`，并从发布文件中移除 `src`（包体积 6.2MB → ~0.9MB）。
- Updated dependencies [cacdfdc]
  - @chenzy-design/core@0.2.0
  - @chenzy-design/locale@0.2.0
  - @chenzy-design/tokens@0.2.0
