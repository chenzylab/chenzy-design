---
"@chenzy-design/svelte": minor
"@chenzy-design/core": minor
"@chenzy-design/locale": minor
"@chenzy-design/tokens": minor
---

新增 Resizable 可伸缩组件族（对标 Semi Resizable，单体逻辑参考 re-resizable v6.10.0，分栏几何对齐 Semi ResizeGroupFoundation）。

- **core 拖拽原语**：`createResizeDrag`（全库首个下沉 core 的通用单次拖拽生命周期——pointerdown 记录起始尺寸+指针坐标 → document 命令式绑 pointermove/pointerup → move 内按轴 clamp min/max + grid 吸附 + scale/ratio/lockAspectRatio 修正 → up/destroy 解绑兜底，绝不用响应式 attachment 读几何）；`computeGroupResize`（分栏相邻两项联动一增一减、总和守恒、越界 clamp 后另一项=两项和−clamp 项；judgeConstraint/adjustNewSize/getOffset 补偿 padding/border）。设计以覆盖 Table 列宽拖拽场景为验收基准。
- **svelte 组件**：`Resizable`（单体，8 向可选把手 + enable 子集 + 受控/非受控 + 锁比例/网格/缩放）、`ResizeGroup/ResizeItem/ResizeHandler`（分栏，context 声明式注册用普通数组簿记避免 effect 循环，首帧测量延后纳入 cleanup）。
- **a11y 增强（超越 Semi 的裸 div）**：把手 `role="separator"` + aria-orientation + aria-value* + i18n aria-label + 键盘 ←→/↑↓（调尺寸）/Home/End（到 min/max）+ RTL 镜像 + 命中区 ≥24px。
- token（把手命中区/线色/hover/focus/间隙）、locale（Resizable.handleAriaLabel zh「调整大小」/en「Resize」）、meta（relatedTo Table/SideBar）。
