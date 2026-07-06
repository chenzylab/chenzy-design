# SPEC · Resizable（可伸缩 / 分栏）

> 分类：other · 阶段：M6（增补，对标 Semi 后补齐——上次对标漏判为「形容词别名」，实为 Semi 正式导出组件族）
> 对标 Semi：[Resizable 可伸缩](https://semi.design/zh-CN/show/resizable)（Semi 导出 `Resizable / ResizeGroup / ResizeItem / ResizeHandler`，单体逻辑参考 re-resizable v6.10.0）
> 提供两类能力：**单体可伸缩容器**（8 向拖拽把手）与**分栏组**（相邻面板联动伸缩）。core 沉淀通用拖拽几何 `createResizeDrag`，供本组件、SideBar Container、Table 列宽拖拽共同复用。

## 1. 概述

Resizable 组件族让容器/面板可通过拖拽把手调整尺寸：
- **Resizable**（单体）：一个容器，四边 + 四角共 8 个可选把手，拖拽改变自身宽/高，支持边界/网格吸附/锁定比例。
- **ResizeGroup / ResizeItem / ResizeHandler**（分栏）：水平或垂直排布的多面板，面板间放把手，拖拽时相邻两项联动（一增一减，总和不变）。

## 2. 设计语义

**何时用**：可调宽度的侧边栏、分栏编辑器/预览、可调大小的卡片/画布、面板布局。
**何时不用**：
- 拖拽**调值**（进度/音量/评分）→ 用 Slider（语义是值，不是尺寸）。
- 拖拽**切页/滑动手势** → Carousel。
- 裁剪框拖拽缩放 → Cropper（自成一套裁剪几何）。
- 内容自适应高度 → TextArea autosize（非拖拽）。

与 Slider 的根本区别：Resizable 改的是元素**尺寸**（width/height，输出 CSS 尺寸），Slider 改的是**抽象值**（输出数值）。

## 3. 分层实现

- **headless（core/）**：`packages/core/src/resizable.ts`：
  - **`createResizeDrag`**（核心通用原语）：管理一次拖拽的完整生命周期——pointerdown 记录起始尺寸 + 起始指针坐标 → document 绑定 pointermove/pointerup → move 时按轴计算 delta、clamp 到 min/max（可选 grid 吸附）→ up 解绑 → 提供卸载兜底清理。签名约束（**必须覆盖 Table 列宽场景**，见 §11）：
    ```
    createResizeDrag({
      axis: 'x' | 'y' | 'xy',
      getStart: () => { width?: number; height?: number },   // 起始尺寸
      min?, max?,                                             // clamp 边界（可分轴）
      grid?: [number, number],                               // 吸附步长
      lockAspectRatio?: boolean | number,
      onStart?(dir), onMove?(size, delta, dir), onEnd?(size, dir),
    }) => { start(event, direction): void; destroy(): void }
    ```
    绝不用响应式 attachment 读几何（红线 #3）；全局监听在 start 时绑、up/destroy 时解。
  - `computeGroupResize`：分栏组联动几何（**算法对齐 Semi ResizeGroupFoundation 权威源，已读 foundation.ts 核对**）：
    - 拖拽某 handler 时，取相邻的 `lastItem`(index) 与 `nextItem`(index+1)；`delta = direction==='horizontal' ? clientX-initX : clientY-initY`。
    - 联动核心：`lastNewSize = lastItemSize + delta`，`nextNewSize = nextItemSize - delta`（一增一减，两项之和守恒）。
    - 越界处理：任一项经 `judgeConstraint(size, min, max, parentSize, offset)` 判超限，则该项 `adjustNewSize` clamp 到 min/max，**另一项 = 两项原始和 − clamp 后的项**（守恒不变）。
    - 内部用 **百分比 Map（itemPercentMap）** 存各项尺寸消除浮点误差；用 **itemMinusMap** 给 handler 留出占位空间，各项实际尺寸表达为 `calc(percent% - minus)`。
    - offset = padding/border 补偿（getComputedStyle 读取）。
    - Item/Handler 通过 context 向 Group **注册**（registerItem 返回 index、registerHandler），Group 持有 itemRefs/min/max/defaultSize/回调的 Map。
  - 8 向 `Direction` / `Enable` 类型、Size 归一化（string|number → px）。
  - core 禁 explicit-any。导出到 core index。
- **渲染（svelte/）**：
  - `Resizable.svelte`（单体，消费 createResizeDrag，渲染 enable 指定的把手）。
  - `ResizeGroup.svelte` + `ResizeItem.svelte` + `ResizeHandler.svelte`（分栏，Group 用 context 收集 Item/Handler，声明式注册——注意 §9.3 effect 循环，注册用普通数组簿记）。

## 4. API

### 4.1 Resizable（单体）Props

| 名称 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `size` | `{ width?: string\|number; height?: string\|number }` | — | 受控尺寸。 |
| `defaultSize` | `Size` | — | 非受控初始尺寸。 |
| `enable` | `Partial<Record<Direction, boolean>> \| false` | 全 true | 启用哪些把手（top/right/bottom/left/topRight/bottomRight/bottomLeft/topLeft）。`false` 全禁用。 |
| `minWidth` / `minHeight` | `string \| number` | — | 最小宽/高。 |
| `maxWidth` / `maxHeight` | `string \| number` | — | 最大宽/高。 |
| `lockAspectRatio` | `boolean \| number` | `false` | 锁定宽高比（number 为指定比值）。 |
| `lockAspectRatioExtraWidth` | `number` | `0` | 锁比时附加宽。 |
| `lockAspectRatioExtraHeight` | `number` | `0` | 锁比时附加高。 |
| `grid` | `[number, number]` | — | 吸附网格步长 [x, y]。 |
| `snap` | `{ x?: number[]; y?: number[] }` | — | 吸附到指定坐标。 |
| `snapGap` | `number` | `0` | 吸附触发阈值。 |
| `boundElement` | `'parent' \| 'window' \| HTMLElement` | — | 拖拽边界约束。 |
| `boundsByDirection` | `boolean` | `false` | 按方向分别约束边界。 |
| `handleNode` | `Partial<Record<Direction, Snippet>>` | — | 自定义各向把手内容。 |
| `handleStyle` / `handleClass` | `Partial<Record<Direction, ...>>` | — | 各向把手样式/类。 |
| `handleWrapperStyle` / `handleWrapperClass` | `string` | — | 把手容器样式/类。 |
| `scale` | `number` | `1` | 画布缩放系数（拖拽 delta 除以 scale）。 |
| `ratio` | `number \| [number, number]` | `1` | 像素比（高分屏 delta 修正）。 |
| `onResizeStart` | `(e, dir) => void \| boolean` | — | 拖拽开始。**返回 `false` 可取消本次拖拽**（对齐 Semi ResizeStartCallback）。 |
| `onChange` | `(size, e, dir) => void` | — | 拖拽中（尺寸变化）。**载荷顺序对齐 Semi ResizeCallback：`(size, event, direction)`**。 |
| `onResizeEnd` | `(size, e, dir) => void` | — | 拖拽结束，签名同 onChange。 |
| `class` / `style` | `string` | — | 根节点。 |

### 4.2 ResizeGroup Props

| 名称 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `direction` | `'horizontal' \| 'vertical'` | — | **必填**。分栏方向（横向=调宽，纵向=调高）。 |
| `class` | `string` | — | 根节点类名。 |
| `children` | `Snippet` | — | 内含交替的 ResizeItem 与 ResizeHandler。 |

### 4.3 ResizeItem Props

| 名称 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `defaultSize` | `string \| number` | — | 初始尺寸（百分比字符串或 px）。 |
| `min` / `max` | `string` | — | 最小/最大尺寸（同单位）。 |
| `onResizeStart` / `onChange` / `onResizeEnd` | 回调 | — | 本项伸缩回调。 |
| `class` / `style` | `string` | — | 节点样式。 |
| `children` | `Snippet` | — | 面板内容。 |

### 4.4 ResizeHandler Props

| 名称 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `direction` | `Direction` | 随 group | 把手方向（一般由 group direction 决定）。 |
| `disabled` | `boolean` | `false` | 禁用该把手。 |
| `class` / `style` | `string` | — | 样式。 |
| `children` | `Snippet` | — | 自定义把手内容。 |

### Events

见各组件 `onResizeStart` / `onChange` / `onResizeEnd`。回调载荷含原生事件、方向、当前尺寸、delta。

## 5. 主题 / Token 表

| Token | 含义 | 默认引用 |
| --- | --- | --- |
| `--cd-resizable-handle-size` | 把手命中区厚度 | `--cd-spacing-tight` |
| `--cd-resizable-handle-color` | 把手可视线色 | `--cd-color-border` |
| `--cd-resizable-handle-color-hover` | hover/active 把手色 | `--cd-color-primary` |
| `--cd-resizable-handle-color-focus` | 键盘聚焦把手色 | `--cd-color-focus-ring` |
| `--cd-resizable-group-gap` | 分栏面板间隙 | `0`（把手本身占位） |

## 6. 无障碍

Semi 现状把手是 `div` + mouse/touch，**无键盘、无 ARIA**——本库**增强**：

- **把手语义**：每个把手 `role="separator"` + `aria-orientation`（horizontal 组=vertical 分隔线，反之亦然）+ `tabindex="0"` + `aria-label`（i18n）。
- **aria-value**：`aria-valuenow`（当前尺寸/百分比）+ `aria-valuemin` / `aria-valuemax`。
- **键盘**：把手聚焦后 `←/→`（横向）或 `↑/↓`（纵向）按步长调尺寸；`Home`/`End` 到 min/max；`Enter`/`Esc` 无特殊（拖拽即时生效）。步长默认对齐 grid 或固定像素。
- **拖拽反馈**：拖拽中 `aria-valuenow` 实时更新；可选 live-announcer 播报尺寸。
- **对比度**：把手可视线与背景 ≥3:1；focus 环独立可见。
- **reduced-motion**：无入场动画需处理；拖拽本身即时。
- **RTL**：横向把手方向与键盘 ←→ 语义镜像。
- **触控**：把手命中区 ≥24px（视觉线可细，命中区扩展满足 2.5.8）。

## 7. 国际化

- i18n key（locale `Resizable`）：`handleAriaLabel`（把手默认名，zh「调整大小」/ en「Resize」）；可选 `handleAriaLabelHorizontal`/`Vertical` 区分方向。
- 无日期/数字格式化需求。
- RTL：把手方向与键盘镜像。

## 8. 文案

- 无用户可见可视文案。仅把手 aria-label 走 i18n。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
| --- | --- | --- |
| Resizable 单体 gzip | ≤ 3.5 KB | 含 8 向把手 |
| ResizeGroup+Item+Handler gzip | ≤ 3 KB | 分栏 |
| core `createResizeDrag` gzip | ≤ 1.5 KB | 拖拽几何 + 生命周期 |
| 拖拽帧成本 | pointermove 内仅 clamp 计算 + 写尺寸，rAF 去抖，无布局抖动 | |

- 拖拽用命令式几何（不走响应式 attachment），全局监听 start 绑 / up 解 + 卸载兜底（红线 #3）。
- 分栏 Group 用 CSS flex-basis 承载尺寸，联动只改相邻两项。

## 10. AI 元数据

`component.meta.ts`（单体与分栏可共 meta 或分列）：
- `name: 'Resizable'`、`category: 'other'`、`stage: 'M6'`、`semiEquivalent: 'Resizable'`。
- props/events schema；`enable` 8 向枚举；分栏子组件关系。
- `a11yPattern: 'separator'`；`keyboardMap`（←→/↑↓/Home/End）。
- `examples`：单体右边缘调宽、四角自由缩放、锁比例、网格吸附、水平分栏、垂直分栏、边界约束。
- `doNot`：不要用它做 slider（值语义用 Slider）、不要漏把手键盘、不要用响应式读几何。

## 11. 测试

- **单元（core）**：`createResizeDrag` —— 单轴 x/y clamp 到 min/max、grid 吸附、lockAspectRatio、delta 计算、scale/ratio 修正、生命周期（绑定/解绑/卸载兜底）；`computeGroupResize` 相邻联动 + 总和守恒 + 各项 clamp。
- **组件**：单体 8 向拖拽改尺寸、受控/非受控、enable 子集、边界约束；分栏 Group 相邻联动、Item min/max、Handler disabled。
- **a11y**：axe 无违规；把手 role=separator + aria-orientation + aria-value* 正确；键盘 ←→/↑↓/Home/End 调尺寸；RTL 镜像；命中区尺寸。
- **视觉回归**：单体各向把手 × 分栏横纵 × 暗色 × RTL。
- **i18n**：把手 aria-label 随 locale。

## 12. 复用 / 收敛约束（重要——本组件的 core 原语要服务多方）

`createResizeDrag` 是**全库首个下沉到 core 的拖拽几何原语**，设计时必须满足以下现有/未来消费方，避免各处重复手写：

1. **Table 列宽拖拽（收敛，必做）**：现状 `Table.svelte` 里有私有命令式几何（`resizeHandles`/`resizingKey`/`startResize`：pointerdown 存 startWidth+startX → document 绑 move/up → move 时 `Math.max(MIN_COL_WIDTH, startWidth + deltaX)` → `widthOverrides.set` → 卸载兜底解绑）。这段**必须能用 `createResizeDrag({ axis:'x', getStart, min:MIN_COL_WIDTH, onMove: w => widthOverrides.set(key,w) })` 干净替换**，零行为变化、Table 现有列宽拖拽测试全绿。core API 设计以此为验收基准。
2. **SideBar Container（复用，后续）**：浮层左边缘拖拽调宽（单轴 x + clamp min/max），直接复用 createResizeDrag 或 Resizable 单体。
3. 其余 pointermove 组件（Slider/ColorPicker/Carousel/Cropper/VideoProgress 等）语义是**调值/手势/裁剪/定位**，**不收敛**（已全库排查确认）。

## 13. 验收标准（对照 AGENTS.md §5 DoD）

- [ ] 分层正确（core createResizeDrag + computeGroupResize；svelte 4 组件） · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过（separator + 键盘 + aria-value）
- [ ] i18n 无硬编码 · [ ] core/组件/a11y 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页 + demo 完成
- [ ] **core `createResizeDrag` 覆盖 Table 列宽场景**（为 #10 收敛铺路，API 已验证可替换）
