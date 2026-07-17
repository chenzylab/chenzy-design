---
'@chenzy-design/svelte': major
'@chenzy-design/core': minor
'@chenzy-design/tokens': patch
'@chenzy-design/locale': patch
---

feat(color-picker)!: 破坏性重写严格对齐 Semi（值改 ColorValue 对象 + 复用六件套 + token 去死中间层）

破坏性重写 ColorPicker 严格对齐 Semi Design，无向后兼容。

**值契约**：`value` / `defaultValue` / `onChange` 从 hex 字符串改为 Semi `ColorValue`
对象 `{ hsva, rgba, hex }`（`hsva` 的 `s`/`v` 为 0-100）。`defaultValue` 默认改为
Semi 品牌绿 `#39c5bb` 对象；`defaultFormat` 枚举 `hex|rgb|hsv|hsl` → `hex|rgba|hsva`。
core 新增 `color-value.ts`（三态互转 + 输入串格式化/解析，镜像 Semi convert 语义）。

**复用组件六件套**：DataPart 复用本库 Popover / Input / InputNumber(alpha% suffix +
hideButtons) / Select / InputGroup / Button(吸管)，替换原生自造浮层 / dismiss /
focus-trap / 原生 `<input>`/`<select>`/`<button>`。`usePopover` 时包裹 Popover，
`children` 缺省渲染默认色块 trigger。

**删超集**：`open`/`defaultOpen`/`onOpenChange`、`presets`、`size`、`status`、
`disabled`、`outputUppercase`、`format`/`showFormatToggle`/`onFormatChange`、`inline`
（改 `usePopover`）、`recentColors`/`recentMax`、`ariaLabel`。
**补缺失**：`popoverProps`、`class`、`width`/`height`、topSlot/bottomSlot。

**token**：20 个 Semi token 全部改为组件真消费（非对称圆角、InputNumber/Select 宽、
间距、demoblock/alphaSliderInner 圆角、popover padding、把手边框），删除原 20+ 死中间层。

**demos**：删 presets/states/format/BasicDemo（4 例），保留/改写 basic/alpha/eyeDropper/
slots/custom-trigger/controlled（均改 ColorValue 对象受控）。
