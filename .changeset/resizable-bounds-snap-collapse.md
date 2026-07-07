---
"@chenzy-design/svelte": minor
"@chenzy-design/core": minor
---

Resizable：补齐对齐 Semi 的组件缺口（单体 bounds / snap / snapGap），并新增本库独有的分栏双击折叠；docs demo 全场景覆盖（5 → 16，超过 Semi 13 场景）。

组件新增能力：

- **单体 `boundElement`**（对齐 Semi）：`'parent' | 'window' | HTMLElement`，拖拽时限制伸缩框不超出边界元素。core `createResizeDrag` 加 `getBoundMax`（svelte 层在 drag start 读 DOM 算可用最大宽高，core 保持 DOM-free）。
- **单体 `snap` / `snapGap`**（对齐 Semi）：吸附到指定像素尺寸数组，`snapGap` 控制吸附生效间隙（0=总吸附到最近目标）。core 新增 `snapToPoints`，与既有 `grid` 步长吸附共存。
- **分栏 `ResizeHandler collapsible`**（本库独有增强，Semi 无内建折叠）：双击把手折叠/展开左（上）侧面板，折叠时记住原百分比并腾给邻居、再次双击恢复，总和守恒。ResizeGroup context 加 `toggleCollapse`。

docs demo 补齐（5 → 16），对齐 Semi 13 场景 + 展示独有能力：拖拽回调、八方向把手、受控尺寸、键盘无障碍（独有）、自定义把手、多面板/锁定把手、嵌套分栏、动态方向、吸附、边界约束、双击折叠。meta 同步新增 props。core 新增 3 项单元测试（snapToPoints / snap 集成 / bounds 集成），共 21 项全通过。
