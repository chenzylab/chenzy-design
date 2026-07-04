# SPEC · Cropper

> 分类：show · 阶段：M4（富媒体补齐 · P3）
> 对标 Semi：[Cropper](https://semi.design/zh-CN/show/cropper) —— Semi 底层**无第三方库**，纯原生 DOM/canvas 自建（已从 semi-foundation 坐实：foundation.js 29.8K 全是几何计算，仅依赖 base）。
> **最高约束：一切以 Semi 实现为准**。API 命名、prop 语义、默认值、裁切框形状、角点、DOM/class 严格对齐 Semi。Semi 没有的默认不加；增强登记偏离。**不引 cropperjs 等第三方。**

## 1. 概述
通过设定裁切框宽高比例，自由裁切图片。支持拖动裁切框位置、拖动图片位置、缩放、旋转、形状（rect/round/roundRect）、实时预览。

## 2. 设计语义
- **用**：头像裁剪、图片上传前裁切、封面选区。
- **不用**：纯展示图片 → Image；仅预览无需裁切 → 不用本组件。

## 3. 分层实现
- **headless（core/）**：`packages/core/src/cropper.ts` —— 移植 Semi `CropperFoundation` 的几何逻辑（框架无关，adapter 注入 getContainer/getImg/notifyZoomChange）。核心：imgData/containerData 状态、8 角点 resize（corner: tl/tm/tr/ml/mr/bl/bm/br）、裁切框拖拽、图片拖拽、滚轮缩放、旋转、aspectRatio 约束、moveRange 边界钳制、resize 重算、预览渲染。**这是富媒体里几何最重的 core**，逐行对照 Semi foundation.js 移植。
- **渲染（svelte/）**：`Cropper.svelte` + 子件（裁切框 CropperBox、角点 Corner、遮罩 Mask、预览 Preview）。容器 + `<img>` + 裁切框叠加层，`$effect` 绑定 mousedown/mousemove/mouseup（角点/框/图片/遮罩各一套）+ wheel + resize observer，destroy 解绑。`getCropperCanvas()` 用 canvas 绘制裁切结果（ref 方法）。

## 4. API（对齐 Semi，完整）
### Props
| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| src | `string` | - | 图片地址 |
| shape | `'rect' \| 'round' \| 'roundRect'` | `'rect'` | 裁切框形状 |
| aspectRatio | `number` | - | 固定裁切框比例 |
| defaultAspectRatio | `number` | `1` | 初始裁切框比例 |
| rotate | `number` | - | 旋转角度（受控） |
| zoom | `number` | - | 缩放比例（受控） |
| minZoom | `number` | `0.1` | 最小缩放 |
| maxZoom | `number` | `3` | 最大缩放 |
| zoomStep | `number` | `0.1` | 缩放步长 |
| showResizeBox | `boolean` | `true` | 是否展示角点调整块 |
| cropperBoxStyle | `string` | - | 裁切框样式 |
| cropperBoxClassName | `string` | - | 裁切框类名 |
| fill | `string` | `'rgba(0,0,0,0)'` | 裁切结果非图片部分填充色 |
| preview | `() => HTMLElement` | - | 指定实时预览容器 |
| imgProps | `object` | - | 透传给 img 的属性 |
| class / style | | - | |
### Events
| 事件 | 载荷 | 说明 |
|---|---|---|
| onZoomChange | `(zoom: number) => void` | 缩放回调 |
### Methods（ref）
| 名称 | 说明 |
|---|---|
| getCropperCanvas() | 获取裁切结果的 canvas（用 `.toDataURL()` 取图） |
### Slots
无。

## 5. 主题 / Token
裁切框边框/角点/遮罩全走 token。
| Token | 默认 | 用途 |
|---|---|---|
| `--cd-cropper-box-border` | 品牌/白 | 裁切框边框 |
| `--cd-cropper-corner-bg` | 白 | 角点调整块 |
| `--cd-cropper-mask` | 半透明黑 | 遮罩 |
| `--cd-cropper-grid-line` | 半透明白 | 九宫格辅助线（若有） |
（禁写死；对照 Semi cropper.scss 的 class 挂 token。组件名多段 → manifest MULTI_SEGMENT 无需加（cropper 单段）。）

## 6. 无障碍（见 a11y.spec.md）
> 对齐优先：以 Semi 交互为基线。补纯 aria：容器 `role=application` 或 `img` + `aria-label`（走 i18n）；角点/裁切框可聚焦（tabindex）+ 键盘微调（↑↓←→ 移动裁切框，作为增强，Semi 若无则标注偏离）。
- 拖拽为主要交互；键盘增强不改鼠标语义。
- reduced-motion / RTL：跟随 Semi。

## 7. 国际化
- i18n key：`Cropper.{label,crop,reset}` 等（容器 aria-label、若有内置按钮）。全走 locale。

## 8. 文案
- 遵循 content-guidelines。

## 9. 性能（见 performance.spec.md）
### Perf Budget
| 指标 | 预算 |
|---|---|
| gzip 体积（几何逻辑在 core，不计入组件壳） | ≤ 4 KB（实测 3.13 KB，2026-07-04 校准） |
| 运行时 | mousemove 拖拽用 rAF/节流；缩放/旋转不重渲染整树 |
- 无第三方库。

## 10. AI 元数据
提供 `meta.ts`：props/events/methods/tokens/examples。

## 11. 测试
- 单测（core）：几何计算——resize 各角点位置、aspectRatio 约束、moveRange 边界钳制、zoom 钳制 min/max、坐标换算。
- e2e/dom：渲染 src；shape 切换；showResizeBox 开关；getCropperCanvas 返回 canvas（jsdom canvas 能力有限，测不到的标 skip 并 log）。
- a11y：axe + 容器 aria-label。

## 12. 验收标准
- [ ] 分层正确 · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过
- [ ] i18n 无硬编码 · [ ] 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页完成
