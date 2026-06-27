# @chenzy-design/svelte

## 0.2.0

### Minor Changes

- cacdfdc: Initial public release — 86 个 Svelte 5 组件，对标 Semi Design。

### Patch Changes

- f1f8c54: 修复 npm 安装后消费方 dev 模式因 `.svelte.ts` 内 TS 语法报 `js_parse_error`：`exports` 与 `svelte` 字段从指向未编译的 `src/index.ts` 改为指向已编译（类型已剥离）的 `dist/index.js`，并从发布文件中移除 `src`（包体积 6.2MB → ~0.9MB）。
- Updated dependencies [cacdfdc]
  - @chenzy-design/core@0.2.0
  - @chenzy-design/locale@0.2.0
  - @chenzy-design/tokens@0.2.0
