---
"@chenzy-design/core": minor
"@chenzy-design/svelte": minor
"@chenzy-design/tokens": minor
"@chenzy-design/locale": minor
---

新增 DragMove 通用拖拽移动组件（other，对标 Semi 2.101.0 并做 a11y 增强）。包裹单个子元素使其可被拖拽在页面/约束区内自由移动（与 Resizable 改尺寸正交，DragMove 改位置）。core 沉淀第二个通用拖拽原语 `createDragMove`（继 createResizeDrag 之后）：pointerdown 记录起点 → document 绑 mouse/touch move/up → 计算 clamp 到 constrainer 的 top/left → customMove 或写 style.top/left → up 解绑 + 卸载兜底（命令式几何，红线 #3，不用响应式读几何），设计以能替换 Modal 可拖拽标题栏 / Cropper 画布拖拽为目标（后续收敛）。约束区支持 `'parent'`/自定义 DOM/无约束；`allowMove` 谓词拦截；`allowInputDrag` 控制是否从 input/textarea 发起（默认 false，避免干扰文本选择）；鼠标/触摸事件全透传。超越 Semi：可选 `keyboard` 把手键盘可达（tabindex + 方向键移动 + i18n aria-label），触摸 `touch-action:none`。新增 `--cd-dragmove-cursor` component token（默认 move）与 locale key `DragMove.handleAriaLabel`（zh「拖动」/ en「Drag to move」）。
