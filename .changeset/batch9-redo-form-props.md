---
"@chenzy-design/svelte": minor
---

补全表单/展示组件的 API props（对齐 Semi，基于最新 main 重做 batch9）：

- **Checkbox**：`addonId` / `extraId` / `preventScroll`
- **Radio**：`addonId` / `addonClassName` / `addonStyle` / `autoFocus` / `extraId` / `mode`('advanced') / `style` / `onMouseEnter` / `onMouseLeave` / `ariaLabel` / `preventScroll`
- **Rating**：`style` / `onBlur` / `onFocus` / `onKeyDown` / `preventScroll`
- **Slider**：`showBoundary` / `showArrow` / `showMarkLabel` / `tooltipOnMark` / `handleDot`(自定义手柄圆点) / `onMouseUp` / `ariaValuetext`
- **ColorPicker**：`topSlot` / `bottomSlot` / `style` / `height` / `width` / `usePopover`(等价 !inline)

均为新增可选 props，向后兼容；各组件 meta.ts 已补 props 表。971 单元 + 6 视觉全绿，无回归。
