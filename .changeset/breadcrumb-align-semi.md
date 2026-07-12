---
'@chenzy-design/tokens': patch
'@chenzy-design/svelte': patch
---

feat(breadcrumb): 全面对齐 Semi Breadcrumb（字段/API/moreType/截断/tokens）

以 Semi `semi-foundation/breadcrumb` + `semi-ui/breadcrumb` 源码为基准逐项对齐（无向后兼容）：

- **Route 字段**：`BreadcrumbRoute` 由 `{label, href}` 重构为 Semi 的 `{name, path, href, icon}`；`routes` 元素支持纯字符串（归一化为 `{name}`，对齐 Semi genRoutes）。所有 demo/测试同步 `label→name`。
- **moreType**：枚举由自造的 `'tooltip'|'popover'` 改为 Semi 的 `'default'|'popover'`，默认 `'default'`（点击三点图标就地展开）；`'popover'` 悬浮弹出可点击折叠项菜单。移除 `'tooltip'` 值。
- **默认值**：`maxItemCount` `0→4`（对齐 Semi）。
- **showTooltip 对象化**：由 `boolean` 扩展为 `boolean | { width, ellipsisPos, opts }`，默认 `{ width: 150, ellipsisPos: 'end' }`（对齐 Semi showToolTipProps）。**真正实现 `ellipsisPos: 'middle'` 中间截断**（JS action 二分裁剪为「头…尾」+ ResizeObserver 响应尺寸；完整名经 Tooltip 展示、`aria-label` 保留可访问名）。
- **折叠图标**：折叠触发器由文本 `…` 改为 IconMore 风格三点 SVG（对齐 Semi IconMore）。
- **新增 API**：`ariaLabel`（覆盖 i18n，对齐 Semi aria-label）、`style`（根节点内联样式）。
- **tokens 修复**：链接色由单一 `breadcrumb-color-link`（语义错位，指向 hover 蓝）拆为三态 `link`(常态灰 text-2) / `link-hover`(链接蓝) / `link-active`(深蓝)，对齐 Semi item 常态灰 → hover 蓝 → active 深蓝；新增 `breadcrumb-restitem-color`（折叠项文字色，对齐 Semi restItem）。样式补齐 Semi `.semi-breadcrumb { overflow: hidden }`。
- **文档**：新增 06-tooltip demo（截断 + width + end/middle 省略）；05-collapse 移除 tooltip 场景、改为 default/popover。
