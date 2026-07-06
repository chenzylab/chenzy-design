# SPEC · DragMove

> 分类：other · 阶段：M6（增补，对标 Semi 后补齐——全量核实时发现漏判，实为 Semi 正式导出组件）
> 对标 Semi：[DragMove](https://semi.design/zh-CN/show/dragMove)（`export { DragMove }`）
> 通用拖拽移动容器：让子元素在约束区内被拖拽移动。core 沉淀 `createDragMove`，供本组件及 Modal/Cropper 等私有拖拽后续收敛复用。

## 1. 概述

DragMove 包裹一个子元素，使其可被拖拽在页面/约束容器内自由移动。典型场景：可拖动的浮层/卡片、自定义可拖拽 Modal、画布上的可移动元素。与 Resizable（改尺寸）正交——DragMove 改的是**位置**。

## 2. 设计语义

**何时用**：需要让一个元素能被用户拖着移动位置（受约束）。
**何时不用**：
- 拖拽调尺寸 → Resizable。
- 拖拽排序列表 → 未来的 sortable（非本组件）。
- 拖拽上传 → Upload 的 dragUpload。

## 3. 分层实现

- **headless（core/）**：`packages/core/src/drag-move.ts` 的 `createDragMove`：pointerdown（或指定 handler）记录起点 → document 绑 pointermove/pointerup → move 时计算 top/left（clamp 到 constrainer 约束区）→ 输出新位置或调 customMove → up 解绑 + 卸载兜底（红线 #3，不用响应式读几何）。allowMove 谓词决定是否允许本次拖拽。**设计约束**：签名要能覆盖 Modal 的可拖拽标题栏、Cropper 的画布拖拽（后续收敛这些私有实现）。
- **渲染（svelte/）**：`DragMove.svelte` 包裹 children，绑定 handler（缺省整个子元素），消费 createDragMove。

## 4. API

### Props

| 名称 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `handler` | `() => HTMLElement` | — | 拖拽触发元素（缺省为整个被包裹子元素）。返回把手 DOM。 |
| `constrainer` | `() => HTMLElement \| 'parent'` | — | 移动约束区。`'parent'`=父元素，或返回具体容器 DOM；缺省不约束（视口）。 |
| `allowMove` | `(e, element) => boolean` | — | 谓词：本次是否允许拖拽（如点在特定区域才允许）。 |
| `customMove` | `(el: HTMLElement, top: number, left: number) => void` | — | 自定义位置应用（缺省组件直接写 `el.style.top/left`）。 |
| `allowInputDrag` | `boolean` | `false` | 是否允许从 input/textarea 等表单元素上发起拖拽（默认 false，避免干扰文本选择）。 |
| `onMouseDown` / `onMouseMove` / `onMouseUp` | `(e: MouseEvent) => void` | — | 鼠标事件透传。 |
| `onTouchStart` / `onTouchMove` / `onTouchEnd` / `onTouchCancel` | `(e: TouchEvent) => void` | — | 触摸事件透传。 |
| `children` | `Snippet` | — | 被拖拽的子元素。 |

### Events

见 onMouseDown/Move/Up + onTouch* 透传。位置变化经 customMove 或组件内部 style 应用。

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 被拖拽移动的内容 |

## 5. 主题 / Token 表

| Token | 含义 | 默认引用 |
| --- | --- | --- |
| `--cd-dragmove-cursor` | 拖拽把手光标 | `move` |

（DragMove 主要是行为，视觉极少；光标/无障碍焦点由消费方决定。）

## 6. 无障碍

- 拖拽把手 `cursor: move`。
- **键盘可达**（超越 Semi——Semi 纯 pointer）：把手 `tabindex="0"` + 方向键移动位置（步长可配）+ `aria-label`（i18n「拖动」）。可选，视消费场景。
- allowInputDrag=false 时不干扰表单文本选择。
- 触摸拖拽 `touch-action: none` 防页面滚动冲突。
- reduced-motion：拖拽即时无动画，无需特殊处理。

## 7. 国际化

- i18n key：`DragMove.handleAriaLabel`（把手可访问名，zh「拖动」/ en「Drag to move」）。

## 8. 文案

- 无用户可见可视文案，仅把手 aria-label 走 i18n。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
| --- | --- | --- |
| svelte gzip | ≤ 2 KB | 包裹壳 |
| core `createDragMove` gzip | ≤ 1.2 KB | 拖拽几何 + 约束 |
| 拖拽帧成本 | pointermove 内 clamp + 写 style，无布局抖动 | |

- 命令式几何，全局监听 start 绑/up 解 + 卸载兜底（红线 #3）。

## 10. AI 元数据

`component.meta.ts`：
- `name: 'DragMove'`、`category: 'other'`、`stage: 'M6'`、`semiEquivalent: 'DragMove'`、`relatedTo: 'Resizable'`。
- props/events schema；`examples`：基础拖动卡片、约束在父容器、handler 指定把手、customMove 自定义应用、Modal 可拖拽 recipe。
- `doNot`：不要用它做 resize（用 Resizable）、不要用响应式读几何。

## 11. 测试

- **单元（core）**：createDragMove 位置计算、constrainer clamp（parent/自定义/无约束）、allowMove 谓词拦截、customMove 回调、allowInputDrag 从表单元素发起、生命周期绑定/解绑/卸载兜底。
- **组件**：拖拽移动 style 应用、handler 指定、事件透传、触摸拖拽。
- **a11y**：axe 无违规；把手 cursor/aria-label；（如实现键盘）方向键移动。
- **视觉回归**：拖拽态 × 约束边界。

## 12. 复用 / 收敛约束

`createDragMove` 是通用拖拽移动原语。**设计要覆盖并未来收敛**：Modal 的可拖拽标题栏（现私有 pointer 拖拽）、Cropper 的画布拖拽（现私有几何）。core API 以能替换这些为目标（类比 Resizable 的 createResizeDrag 覆盖 Table 列宽）。本 PR 只建组件 + core，收敛 Modal/Cropper 私有拖拽为后续可选任务。

## 13. 验收标准（对照 AGENTS.md §5 DoD）

- [ ] 分层正确（core createDragMove + svelte 壳） · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过
- [ ] i18n 无硬编码 · [ ] core/组件/a11y 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页 + demo 完成
