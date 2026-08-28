# @chenzy-design/illustrations

## 0.2.1

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

## 0.2.0

### Minor Changes

- eb9f4ec: feat(illustrations): 新增 @chenzy-design/illustrations 包，路径级复刻 Semi 全部 16 个插画

  - 新增独立包 `@chenzy-design/illustrations`，对齐 Semi `@douyinfe/semi-illustrations`：
    8 语义（success/failure/noAccess/noContent/notFound/noResult/construction/idle）× light/dark
    共 16 个插画组件，路径级复刻 Semi 原始 SVG（非此前自造的简化几何占位图）
  - 品牌色 token 化：`var(--semi-color-primary*)` → `var(--cd-color-primary*)`，其余中性色对齐
    Semi 硬编码值；清理 Semi 源文件中残留的浏览器调试注入标记
  - `@chenzy-design/svelte` 删除内嵌的自造占位插画，改为依赖并 re-export 新包
  - Empty 补齐 `...rest` 属性透传到根节点，对齐 Semi `getDataAttr(rest)`
  - docs 站 Empty 的 5 个 demo 插画 import 改为从 `@chenzy-design/illustrations` 引入，对齐 Semi
    demo 从 `@douyinfe/semi-illustrations` 单独 import 的写法；`Empty.spec.md` 改写，删除 Semi
    原版没有的规划态特性（role=status/size/responsive/6预设枚举/imageError事件等）
