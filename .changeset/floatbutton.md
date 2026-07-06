---
"@chenzy-design/svelte": minor
"@chenzy-design/tokens": minor
"@chenzy-design/locale": minor
---

新增 FloatButton + FloatButtonGroup 悬浮操作按钮（basic，对标 Semi 2.101.0 并做 a11y 增强）。悬浮固定在视口的可操作入口：无 href 渲染 `<button type="button">`，有 href 渲染 `<a href target rel>`（`_blank` 自动补 `rel="noopener noreferrer"`），天然键盘可达；icon-only 必须 `ariaLabel`（dev 缺失 warn）。支持 shape(round/square)、size(small/default/large)、colorful AI 渐变、可选包裹 Badge。定位靠 style 逻辑属性（inset-inline-end/inset-block-end），RTL 友好。FloatButtonGroup 平铺容器（role="group"）遍历 items 渲染并事件委托回传 value。新增 `--cd-floatbutton-*` component token 与 locale key `FloatButton.groupAriaLabel`。
