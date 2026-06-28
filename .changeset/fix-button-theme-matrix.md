---
"@chenzy-design/svelte": patch
---

修复 Button 的 `theme` 渲染：`solid` / `light` / `borderless` 三个 theme 此前无样式，全部退回 `type` 的实心填充（看起来和 solid 一样），只有 `outline` 不同。重构为「`type` 提供色相、`theme` 决定填充方式」的正交矩阵（对齐 Semi）：solid=实心色+反色字、light=浅色调底+色字、borderless=透明+色字、outline=透明+色边框+色字，并补各 theme 的 hover/active 态。
