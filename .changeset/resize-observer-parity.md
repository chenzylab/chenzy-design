---
'@chenzy-design/svelte': minor
---

对标 Semi 补齐四处「尺寸感知」缺口，使 ResizeObserver 相关能力全面 ≥ Semi：

- **_floating 浮层观测尺寸重定位**：`useFloating` 除现有 window scroll/resize 监听外，用
  `ResizeObserver` 观测 trigger 与 popup 元素，任一尺寸变化时经现有 rAF 节流 `schedule()`
  重定位。异步加载内容撑高浮层、trigger 文字撑大等场景不再错位。惠及所有浮层组件
  （Tooltip/Popover/Dropdown/Select/Cascader/TreeSelect 等）。原生不可用时静默降级
  （window 监听仍在）。
- **TextArea autosize 宽度变化重算高度**：autosize 开启时用 core `createResizeObserver`
  观测 textarea content-box 宽度，容器变窄（换行增多需更高）/变宽时重跑同一套
  `computeAutosizeHeight`。首帧去重避免重复触发。
- **Anchor 观测可见性/内容变化重算**：用 core `createResizeObserver` 观测滚动容器
  （window 模式观测 `documentElement`）尺寸变化，内容变高或 section 从隐藏变可见但未滚动时
  触发一次 scroll-spy 重算，active 高亮/ink 位置及时更新。
- **ResizeObserver 组件新增 `observeParent` prop**（默认 false）：为 true 时观测包裹元素的
  `parentElement` 而非自身（对标 Semi `observeParent`）；与 `multiple` 互斥（同时为 true 时
  `multiple` 优先），父节点缺失时静默不观测。
