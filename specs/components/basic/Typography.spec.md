# SPEC · Typography
> 分类：basic · 阶段：M1
> 对标 Semi：Typography

## 1. 概述

Typography 是排版组件族，统一管理文本的字号、行高、字重、颜色语义与文本行为，避免业务侧散落 `font-size` / `color` 写死值。它由四个子组件组成，通过命名空间挂载（`Typography.Title` / `.Text` / `.Paragraph` / `.Link`，亦导出独立组件 `Title` / `Text` / `Paragraph` / `Link`）：

- **Title**：标题，`heading` 级别 1–6，对应渲染 `<h1>`–`<h6>`。
- **Text**：行内文本，渲染 `<span>`，支持各类语义修饰（强调、加粗、删除、下划线、代码、键盘键、链接化）。
- **Paragraph**：段落文本，渲染 `<p>`，块级，含间距。
- **Link**：超链接，渲染 `<a>`，含外链安全属性与 disabled 态。

四者共享三组核心行为能力：
1. **省略（ellipsis）**：单行 / 多行（`rows`）截断，可配 `suffix`、可展开/收起（`expandable`/`expandText`/`collapseText`）、可配 tooltip 显示完整内容（`showTooltip`）。
2. **复制（copyable）**：尾部追加复制按钮，点击复制文本或自定义内容，复制后图标态切换并 announce。
3. **可编辑（editable）**：双击或点击编辑图标进入 inline 编辑（textarea），回车/失焦提交、ESC 取消。

定位：M1 基础组件，是几乎所有上层组件（Card、List、Form label、Description 等）的文本基座。

非目标：富文本编辑（交给独立 RichText）、Markdown 渲染、数学公式。

## 2. 设计语义

| 维度 | 语义说明 |
|---|---|
| 字号阶梯 | Title 按 heading 1–6 映射 6 档；Text/Paragraph 按 `size` = small/default/large 映射 3 档；全部消费 `--cd-font-size-*` 阶梯，禁止裸值 |
| 行高 | 标题用紧凑行高 `--cd-typography-title-line-height`，正文用舒适行高 `--cd-typography-text-line-height`（≈1.5–1.6 保证可读性） |
| 字重 | Title 默认 `--cd-font-weight-semibold`；Text `strong` → bold；`weight` 显式覆盖 |
| 颜色语义 | `type`：default→`--cd-color-text-0`，secondary→`--cd-color-text-1`，tertiary→`--cd-color-text-2`，quaternary→`--cd-color-text-3`，warning→`--cd-color-warning`，danger→`--cd-color-danger`，success→`--cd-color-success`；不允许任意 hex |
| 链接态 | Link：默认 `--cd-color-link`，hover `--cd-color-link-hover`，active `--cd-color-link-active`，visited 可选 |
| 交互可视 | copy / edit 图标默认弱化（text-2），hover 提升至 primary；展开/收起为 link 态 |
| 状态语义 | disabled → text-disabled + `cursor: not-allowed`；mark（高亮）→ `--cd-color-warning-light-default` 背景 |
| 间距 | Paragraph 段间距 `--cd-typography-paragraph-spacing`，最后一段去除底部间距 |
| 密度 | small 尺寸下行高与图标尺寸同步收紧，供高密度表格/列表使用 |

## 3. 分层实现

Typography 大部分为纯展示，但 **ellipsis（多行测量/展开）**、**copyable（剪贴板+反馈）**、**editable（inline 编辑状态机）** 含交互与 a11y 逻辑，因此采用混合分层。

**@chenzy-design/core**：
- `createEllipsis(opts)`：管理单/多行截断测量。多行用 CSS `line-clamp` 为主路径；当需要 `expandable`、`suffix` 精确拼接或 `showTooltip` 判断"是否真的溢出"时，用 `ResizeObserver` + 二分测量回退。输出 `{ truncated, expanded, toggle(), measureRef }`。复用 `useId`（关联 tooltip）。
- `createCopyable(opts)`：封装 `navigator.clipboard.writeText` + `execCommand` 回退；管理 `copied` 短暂态（默认 3s 复位）；通过 `useLiveAnnouncer` 朗读"已复制"。输出 `{ copied, copy() }`。
- `createEditable(opts)`：inline 编辑状态机 `idle | editing`；管理草稿值、提交/取消、键盘（Enter 提交、Shift+Enter 换行、Esc 取消）、进入编辑时焦点移入、退出后焦点回到触发元素（复用 `useId` 关联 label/描述）。输出 `{ editing, draft, start(), confirm(), cancel(), inputProps }`。

**@chenzy-design/svelte**：
- `Title.svelte` / `Text.svelte` / `Paragraph.svelte` / `Link.svelte`：负责标签选择、className 组合、token 应用、slot 渲染，组合上述 core 原语。
- tooltip 显示完整内容时复用 `Tooltip` 组件（不在本组件内重复实现浮层/`useDismiss`）。
- 纯文本（无 ellipsis/copy/edit）路径零运行时开销，不实例化任何 core hook。

复用原语：`useId`（tooltip/编辑关联）、`useLiveAnnouncer`（复制/截断状态播报）。`useFocusTrap`/`useScrollLock`/`useRovingTabindex` 本组件不需要。

## 4. API

### 4.1 共享 Props（Text / Title / Paragraph / Link 通用）

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `type` | `'default' \| 'secondary' \| 'tertiary' \| 'quaternary' \| 'warning' \| 'danger' \| 'success'` | `'default'` | 颜色语义 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 字号档（Title 由 heading 决定，忽略 size） |
| `strong` | `boolean` | `false` | 加粗 |
| `weight` | `number \| 'regular' \| 'medium' \| 'semibold' \| 'bold'` | — | 显式字重，覆盖 strong |
| `disabled` | `boolean` | `false` | 禁用态（Link 同时移除 href 行为） |
| `mark` | `boolean` | `false` | 高亮背景 |
| `underline` | `boolean` | `false` | 下划线 |
| `delete` | `boolean` | `false` | 删除线 |
| `code` | `boolean` | `false` | 等宽代码样式 |
| `ellipsis` | `boolean \| EllipsisConfig` | `false` | 省略配置，见下 |
| `copyable` | `boolean \| CopyableConfig` | `false` | 复制配置，见下 |
| `editable` | `boolean \| EditableConfig` | `false` | 可编辑配置，见下 |
| `component` | `string` | 各自默认 | 覆盖渲染标签（如 Text 渲染为 `label`） |
| `class` | `string` | — | 透传类名 |

### 4.2 子组件专属 Props

| 组件 | Prop | 类型 | 默认 | 说明 |
|---|---|---|---|---|
| Title | `heading` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `1` | 标题级别，决定标签与字号 |
| Link | `href` | `string` | — | 链接地址 |
| Link | `target` | `string` | — | 同原生；`_blank` 时自动补 `rel="noopener noreferrer"` |
| Link | `rel` | `string` | — | 覆盖默认 rel |
| Link | `underline` | `boolean` | `true`(Link) | Link 默认带下划线 |

### 4.3 配置对象

| 对象 | 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|---|
| EllipsisConfig | `rows` | `number` | `1` | 截断行数 |
| | `expandable` | `boolean` | `false` | 是否可展开 |
| | `expandText` / `collapseText` | `string` | i18n | 展开/收起文案 |
| | `suffix` | `string` | — | 尾部保留文本（如" ...更多"前的固定后缀） |
| | `pos` | `'end' \| 'middle' \| 'start'` | `'end'` | 截断位置（middle/start 仅单行） |
| | `showTooltip` | `boolean \| { type?: 'tooltip' \| 'popover' }` | `false` | 溢出时悬浮显示完整内容 |
| | `onExpand` | `(expanded: boolean) => void` | — | 展开态变化回调 |
| CopyableConfig | `content` | `string` | 文本内容 | 实际复制内容（默认取节点文本） |
| | `successText` | `string` | i18n | 复制成功提示 |
| | `icon` / `successIcon` | `Snippet` | 内置图标 | 自定义图标 |
| | `render` | `Snippet<[copied, doCopy, config]>` | — | 完全接管复制控件渲染（对齐 Semi）；提供后 icon/successIcon 及内置 button 不渲染 |
| EditableConfig | `editing` | `boolean` | — | 受控编辑态 |
| | `trigger` | `'click' \| 'dblclick' \| 'icon' \| 'text' \| 'both'` | `'icon'` | 进入编辑方式：`icon` 仅点铅笔图标；`click`/`dblclick` 点/双击宿主；`text` 点文本进入（不显图标）；`both` 文本与图标皆可（图标仍显示） |
| | `maxLength` | `number` | — | 字符上限。**硬截断**：超出的字符打不进去（textarea 原生 `maxlength` + core `setDraft`/`start` 双重 clamp） |
| | `autosize` | `boolean` | `true` | textarea 自适应高度 |
| | `editIcon` | `Snippet` | 内置铅笔 | 自定义编辑触发图标 |
| | `tooltip` | `string \| false` | i18n `Typography.edit` | 编辑触发图标的 tooltip（title）；`false` 隐藏 title（`aria-label` 始终保留） |
| | `enterIcon` | `Snippet \| false` | 内置回车箭头 | 编辑框右下角「回车确认」图标，点击 = 提交；`false` 隐藏 |

### 4.4 Events

| 事件 | payload | 触发组件 | 说明 |
|---|---|---|---|
| `on:copy` | `{ content: string }` | 全部 | 复制成功后 |
| `on:change` | `{ value: string }` | editable | 编辑提交（受控输入约定：value + on:change） |
| `on:editStart` | `void` | editable | 进入编辑 |
| `on:editCancel` | `void` | editable | 取消编辑 |
| `on:expand` | `{ expanded: boolean }` | ellipsis | 展开/收起切换 |
| `on:click` | `MouseEvent` | Link | 链接点击（disabled 时阻止） |

### 4.5 Slots

| Slot | 组件 | 说明 |
|---|---|---|
| default | 全部 | 文本内容 |
| `copyIcon` | 全部 | 自定义复制图标（默认/成功两态可通过参数区分） |
| `editIcon` | editable | 自定义编辑触发图标（经 `editable.editIcon` 配置，替换默认铅笔） |
| `enterIcon` | editable | 自定义编辑框右下角「回车确认」图标（经 `editable.enterIcon` 配置；`false` 隐藏） |
| `expand` | ellipsis | 自定义展开/收起触发器（接收 `{ expanded, toggle }`） |

## 5. 主题 / Token 表

仅消费 Alias / Component 级 token，组件内禁止裸值。

| Component Token | 默认引用（Alias） | 用途 |
|---|---|---|
| `--cd-typography-color` | `--cd-color-text-0` | 默认正文色 |
| `--cd-typography-color-secondary` | `--cd-color-text-1` | secondary type |
| `--cd-typography-color-tertiary` | `--cd-color-text-2` | tertiary type |
| `--cd-typography-color-quaternary` | `--cd-color-text-3` | quaternary type |
| `--cd-typography-color-disabled` | `--cd-color-text-disabled` | disabled |
| `--cd-typography-color-warning` | `--cd-color-warning` | warning type |
| `--cd-typography-color-danger` | `--cd-color-danger` | danger type |
| `--cd-typography-color-success` | `--cd-color-success` | success type |
| `--cd-typography-link-color` | `--cd-color-link` | Link 默认 |
| `--cd-typography-link-color-hover` | `--cd-color-link-hover` | Link hover |
| `--cd-typography-link-color-active` | `--cd-color-link-active` | Link active |
| `--cd-typography-mark-bg` | `--cd-color-warning-light-default` | mark 高亮背景 |
| `--cd-typography-code-bg` | `--cd-color-fill-0` | code 背景 |
| `--cd-typography-code-color` | `--cd-color-text-1` | code 前景 |
| `--cd-typography-title-line-height` | `--cd-line-height-tight` | 标题行高 |
| `--cd-typography-text-line-height` | `--cd-line-height-normal` | 正文行高 |
| `--cd-typography-paragraph-spacing` | `--cd-spacing-4` | 段落间距 |
| `--cd-typography-font-size-small` | `--cd-font-size-1` | small 档 |
| `--cd-typography-font-size-default` | `--cd-font-size-2` | default 档 |
| `--cd-typography-font-size-large` | `--cd-font-size-3` | large 档 |
| `--cd-typography-action-color` | `--cd-color-text-2` | copy/edit 图标默认 |
| `--cd-typography-action-color-hover` | `--cd-color-primary` | 图标 hover |

字号阶梯（Title heading → token）：h1→`--cd-font-size-7` … h6→`--cd-font-size-2`，均经 Component token `--cd-typography-title-font-size-<n>` 暴露便于覆盖。

## 6. 无障碍（WCAG 2.1 AA）

- **语义标签**：Title 渲染真实 `<h1>`–`<h6>`，不破坏文档大纲（提示：勿仅为字号选 heading，可用 `component` 改标签保留视觉）。Paragraph→`<p>`，Link→`<a>`，Text→`<span>`。
- **Link**：必须有可辨识文本；外链 `target="_blank"` 自动 `rel="noopener noreferrer"`；disabled Link 渲染为 `<a aria-disabled="true">` 并移除 `href`、`tabindex="-1"`、阻止默认。
- **copyable**：复制按钮为 `<button type="button">`，`aria-label` 来自 i18n（`Typography.copy`）；复制成功通过 `useLiveAnnouncer`（`aria-live="polite"`）朗读 `Typography.copied`，图标切换不依赖颜色（形状变化）。
- **editable**：编辑触发为 `<button>` 带 `aria-label`（`Typography.edit`）；进入编辑 textarea 自动聚焦，`aria-label` 关联原文本；ESC 取消并把焦点送回触发按钮。
- **ellipsis + tooltip**：截断节点 `title` 或 tooltip 提供完整文本；`showTooltip` 时用 `aria-describedby` 关联；纯 CSS clamp 时确保 DOM 仍含完整文本供 SR 读取（视觉截断不截断可访问名）。
- **expandable**：展开/收起触发为 `<button aria-expanded>`，文案区分。
- **对比度**：tertiary（text-3）等弱色需校验 ≥ 4.5:1（小字）/3:1（大字 ≥18.66px 或 14px bold）；danger/warning 文本同样校验。mark 背景与文字组合校验对比度。
- **reduced-motion**：复制图标切换、展开过渡在 `prefers-reduced-motion: reduce` 下取消动画。
- **RTL**：`pos: 'start'/'end'` 截断、suffix 位置、图标排布随 `dir` 镜像；省略号位置逻辑使用 logical 属性。
- **键盘**：copy/edit/expand 按钮均可 Tab 聚焦、Enter/Space 触发；编辑态 Enter 提交、Shift+Enter 换行、Esc 取消。

## 7. 国际化

用户可见文案零硬编码，全部经 i18n。日期/数字若出现于 Paragraph 由调用方用 `Intl` 格式化（组件不内置）。

| i18n key | 默认（zh-CN / en-US） | 用途 |
|---|---|---|
| `Typography.copy` | 复制 / Copy | 复制按钮 aria-label/tooltip |
| `Typography.copied` | 已复制 / Copied | 复制成功提示与 announce |
| `Typography.copyFailed` | 复制失败 / Copy failed | 剪贴板失败提示 |
| `Typography.edit` | 编辑 / Edit | 编辑按钮 aria-label |
| `Typography.editConfirm` | 完成 / Save | 编辑确认（可选可视按钮） |
| `Typography.editCancel` | 取消 / Cancel | 取消编辑 |
| `Typography.enter` | 回车确认 / Press Enter to confirm | 编辑框回车确认图标 aria-label |
| `Typography.expand` | 展开 / Expand | ellipsis 展开 |
| `Typography.collapse` | 收起 / Collapse | ellipsis 收起 |
| `Typography.ellipsisSuffix` | … / … | 省略符（一般沿用 U+2026） |

RTL 语言（ar/he）下文本方向、截断位置、图标顺序随 `dir` 自动适配。

## 8. 文案

遵循 content-guidelines：

- 动作文案用动词原形、短：复制、编辑、展开、收起。
- 提示态简洁、确认性："已复制"而非"复制成功了！"。
- 展开/收起成对、对称，避免"查看更多"与"收起"风格不一致；默认"展开"/"收起"。
- 截断省略号统一使用单字符 `…`（U+2026），不用三个点。
- **危险操作文案**：Typography 自身无破坏性操作。`type="danger"` 仅表达视觉语义（如错误文本），不承载删除等动作；若调用方将 Link/Text 用作删除入口，危险确认文案应由上层 Modal/Popconfirm 承担，本组件不提供 destructive 默认文案。

## 9. 性能（Perf Budget）

| 场景 | 预算 / 策略 |
|---|---|
| gzip 体积（svelte，纯展示路径） | ≤ 2.5 KB（Text/Title/Paragraph/Link 基础渲染） |
| gzip 体积（含 ellipsis+copy+edit 全功能） | ≤ 6.5 KB（core 原语按需 tree-shake，未用功能不打入） |
| core 原语 gzip | createEllipsis ≤ 1.5 KB / createCopyable ≤ 0.6 KB / createEditable ≤ 1.2 KB |
| 纯文本渲染 | 零 hook 实例化、零 ResizeObserver、零 effect；仅 class 拼接 |
| 多行 ellipsis（CSS clamp 路径） | 不挂 ResizeObserver；纯 CSS `-webkit-line-clamp`，0 运行时测量 |
| 多行 ellipsis（expandable/suffix/showTooltip 精确路径） | 每实例 1 个 ResizeObserver，测量 `requestAnimationFrame` 节流；列表中 100+ 实例建议外层虚拟化（List/Table 提供） |
| copy 反馈 | 单 timer（3s），卸载清理 |
| 长列表 | 组件不内置虚拟化（行内/单条文本粒度太细）；交由容器组件虚拟化，Typography 保证单实例轻量 |
| destroyOnClose | 不适用（无浮层自身；tooltip 由 Tooltip 管理惰性渲染） |

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：

- `name: 'Typography'`，`subComponents: ['Title','Text','Paragraph','Link']`，`category: 'basic'`，`stage: 'M1'`。
- `props` / `events` / `slots` 的结构化描述（类型、默认、枚举值、是否受控），与本 SPEC 第 4 节同源。
- `tokens`：暴露的 Component token 列表（第 5 节）。
- `a11yRoles`：`['heading','link','button']` 及 ARIA 用法说明。
- `i18nKeys`：第 7 节全部 key。
- `examples`：典型用法片段（带省略+展开、可复制、inline 编辑、外链安全）。
- `relatedComponents`: ['Tooltip','Highlight','Numeral']。
- `aiHints`：选用建议（"需要文档大纲用 Title 并匹配 heading 级别；仅放大字号用 component 改标签"；"长文本截断优先 CSS clamp，需展开/tooltip 才走测量路径"）。

## 11. 测试

- **单元（core）**：`createEllipsis` 测量与 truncated 判定（含 ResizeObserver mock）；`createCopyable` clipboard 成功/失败回退与 copied 复位计时；`createEditable` 状态机（start/confirm/cancel、Enter/Shift+Enter/Esc、maxLength 截断）。
- **组件渲染**：各 type/size/strong/weight/mark/code/underline/delete 的 class 与 token 应用快照；Title heading→标签映射；Link `_blank`→rel 自动补全；disabled Link 移除 href + aria-disabled。
- **a11y（axe + 手测）**：heading 大纲合法；copy/edit/expand 按钮有 aria-label 与 aria-expanded；live region 播报；键盘全链路（Tab/Enter/Space/Esc/Shift+Enter）；对比度自动校验各 type 色。
- **交互（Testing Library / Playwright）**：复制写入剪贴板并触发 on:copy + announce；inline 编辑提交 on:change、取消还原、焦点回到触发器；ellipsis 展开/收起 on:expand 与 aria-expanded 同步；showTooltip 溢出时出现/未溢出不出现。
- **i18n/RTL**：切换 locale 文案更新；`dir="rtl"` 下截断与图标镜像快照。
- **视觉回归**：字号阶梯、行高、段间距、mark/code 样式跨主题（亮/暗）截图。
- **reduced-motion**：开启后无过渡动画。

## 12. 验收标准 Checklist

- [ ] 提供 `Title` / `Text` / `Paragraph` / `Link` 四子组件，并支持 `Typography.*` 命名空间与独立导入两种用法。
- [ ] 仅消费 `--cd-` Alias/Component token，零裸值（lint 校验通过）。
- [ ] 类名遵循 `cd-typography` BEM-like 约定（`cd-typography__action`、`cd-typography--ellipsis` 等）。
- [ ] 受控编辑遵循 `value + on:change`；无浮层显隐（tooltip 委托 Tooltip 的 `open + on:openChange`）。
- [ ] `size` 支持 small/default/large；`type` 含 default/secondary/tertiary/warning/danger/success。
- [ ] ellipsis 支持单行/多行/expandable/suffix/pos/showTooltip，CSS clamp 为默认路径、测量路径按需启用。
- [ ] copyable 含成功反馈、自定义内容/图标、live announce、剪贴板回退。
- [ ] editable 含 click/dblclick/icon/text/both 触发、editIcon/enterIcon/tooltip 自定义、maxLength 超限变红且阻止提交、autosize、键盘提交/取消、焦点归还。
- [ ] Title 渲染语义 heading；外链自动 `rel="noopener noreferrer"`；disabled Link `aria-disabled` 且不可聚焦。
- [ ] 全部用户可见文案走 i18n，含第 7 节所有 key；RTL 镜像正确。
- [ ] a11y：axe 无 violation，键盘全可达，对比度 AA，reduced-motion 生效。
- [ ] 纯文本渲染零运行时开销（无 hook/observer/timer）；满足第 9 节 Perf Budget。
- [ ] headless 逻辑（ellipsis/copyable/editable）位于 `@chenzy-design/core` 的 `create*`，复用 `useId`/`useLiveAnnouncer`。
- [ ] 提供 `component.meta.ts`（含 props/events/slots/tokens/i18nKeys/examples/aiHints）。
- [ ] 单元 + 组件 + a11y + 交互 + i18n/RTL + 视觉回归测试齐备并通过 CI。
