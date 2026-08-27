# @chenzy-design/illustrations

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
