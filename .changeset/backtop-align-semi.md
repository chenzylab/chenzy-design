---
'@chenzy-design/core': patch
'@chenzy-design/tokens': patch
'@chenzy-design/svelte': patch
---

feat(backtop): 全面对齐 Semi BackTop（行为/tokens/样式）

以 Semi `semi-foundation/backtop` 源码为唯一基准逐项核对对齐：

- core：阈值判定 `isAboveThreshold` 由 `>=` 改为 `>`（严格大于，对齐 Semi `scrollTop > visibilityHeight`，边界处不显），单测同步。
- svelte：默认偏移对齐 Semi `$spacing-backtop-*`——`bottom` 40→50、`right` 40→100；样式补齐 Semi 的 `box-sizing:border-box` / `overflow:hidden` / `text-align:center`；`--cd-backtop-offset-*` 的 CSS fallback 同步为 50px/100px。
- tokens：`backtop-z` 由写死 `900` 改为消费 `var(--cd-z-affix)`（=10，对齐 Semi `$z-backtop: 10`，与 Affix 同层）；孤儿 token `--cd-backtop-border` 此前定义却从未消费，改由 `border` 真正吃它，去掉写死的 `transparent`；token 文件头注释重写为准确的 Semi 映射说明。
- 我们相对 Semi 的超集能力（受控 `visible` / `announceOnArrive` / 三尺寸 / 选择器 target / icon·children 双插槽 / `onVisibleChange`·`onScrollEnd` / RTL / reduced-motion）保留补全，其余视觉 token 为 Semi 靠 IconButton 提供、chenzy 圆形壳所必需，均回退 alias、无写死、无 Semi 不存在的语义中间变量。
