---
'@chenzy-design/svelte': minor
'@chenzy-design/core': patch
'@chenzy-design/tokens': patch
'@chenzy-design/locale': patch
---

feat(banner): 破坏性重写严格对齐 Semi（DOM/tokens/API/demo 全量对齐）

以 Semi `semi-ui/banner` + `semi-foundation/banner` 源码为唯一基准破坏性重写，移除全部 Semi 没有的自造能力，无向后兼容。

**移除的自造能力**：
- `resolveBannerRole` / `dynamic` / role·aria-live 推断 → 改为 Semi 固定 `role="alert"`；删除 `@chenzy-design/core` 的 `banner.ts`（`resolveBannerRole`/`BannerType`/`BannerRoleProps`）及其导出与单测。
- `closeOnEsc` / `animation` / slide 关闭过渡 / `onAfterClose` / `onOpenChange` / 受控 `open`·`defaultOpen` / `action` 插槽 / `ariaLabel`。
- 自造 SVG 语义图标 → 改用已对齐 Semi 的 `IconInfoCircle`/`IconTickCircle`/`IconAlertTriangle`/`IconAlertCircle`（`size="large"`）；关闭按钮改用已对齐 Semi 的 `IconButton`（`theme=borderless size=small type=tertiary` + `IconClose`）；标题/描述改用已对齐 Semi 的 `Typography.Title`(heading=5)/`Typography.Paragraph`。
- `full` 模式左侧 accent 竖条（Semi 无此概念）。

**DOM 结构对齐 Semi**：`div.cd-banner.cd-banner-{type}.cd-banner-full|in-container[.cd-banner-bordered] > .cd-banner-content-wrapper > (.cd-banner-content > .cd-banner-icon + .cd-banner-content-body(Title + Paragraph)) + .cd-banner-close`，`children` 渲染于平级 `.cd-banner-extra`。

**tokens 对齐**：移除全部 Semi 没有的自造中间消费层（`--cd-banner-radius`/`-accent`/`-motion`/`-close-*`/`-info-bg` 等约 30 个），仅保留 Semi `variables.scss` 的 22 个变量（名值一一对应），组件样式直连消费。样式逐条镜像 Semi `banner.scss` + `rtl.scss`。

**API（对齐 Semi）**：`type` / `fullMode` / `bordered` / `title` / `description` / `icon`(Snippet|null) / `closeIcon`(Snippet|null) / `children` / `onClose` / `class` / `style`；本库 Snippet 化补充 `titleSnippet` / `descriptionSnippet`（对齐 Semi title/description 传 ReactNode）。

**demo（对齐 Semi 机制、场景不少于 Semi）**：5 个 —— 基本用法（显隐切换 + onClose）、不同类型、非全屏模式（bordered + Link）、自定义内容（children→extra）、自定义图标（补全 Semi 官方未展示的 icon/closeIcon 自定义）。

**关联修复**：`@chenzy-design/locale` 三份文件移除无消费方的 `Banner.info/success/warning/danger` 键（保留 `closeButtonAriaLabel`）；docs content 与 component-briefs 简介同步为新实现。
