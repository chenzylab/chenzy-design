---
'@chenzy-design/svelte': minor
'@chenzy-design/tokens': minor
'@chenzy-design/locale': minor
---

feat(tag): 新增 TagGroup 与 SplitTagGroup 两个 Tag 子组件（深度对标 Semi 2.101.0 导出符号级核对补齐）

- TagGroup：一组 Tag 成组渲染，`tagList` 数据驱动或 `children`；超过 `maxTagCount` 折叠剩余为「+N」标签，`showPopover` 时 hover 在 Popover 弹层展示被折叠项。透传 `size`/`avatarShape`，支持 `restCount`/`onTagClose`/`onPlusNMouseEnter`/`popoverProps`。复用本库 Tag/Popover。
- SplitTagGroup：连接式标签组，首子前缘圆角、末子后缘圆角、中间合并边，形成分段控件外观（纯 CSS 装饰）；`ariaLabel` 组可访问名。
- a11y：两者 `role="group"`；TagGroup +N 带 `aria-label`（i18n `TagGroup.restTagsAriaLabel`，含 {count}），弹层复用 Popover 键盘/Esc；SplitTagGroup 组容器 `aria-label`。
- tokens：新增 `--cd-taggroup-gap`、`--cd-splittaggroup-divider-width`、`--cd-splittaggroup-divider-color`。
- locale：新增 `TagGroup.restTagsAriaLabel`（zh/en）。
