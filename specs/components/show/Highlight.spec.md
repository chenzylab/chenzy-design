# SPEC · Highlight
> 分类：show · 阶段：M4
> 对标 Semi：Highlight

## 1. 概述

Highlight 是一个纯展示型文本高亮组件，用于在一段文本中标记并突出显示一个或多个关键词（典型场景：搜索结果联想、列表过滤、日志检索结果标注）。它接收原始文本 `sourceString` 和待高亮词 `searchWords`，在文本中查找匹配片段并用高亮样式（默认 `<mark>`）包裹，非匹配片段原样渲染。

核心特征：
- 支持单个关键词（string）或多个关键词（string[]）。
- 支持大小写敏感/不敏感、是否高亮全部匹配（仅首个 vs 全部）。
- 支持自定义高亮包裹元素/样式，或通过 slot 完全接管高亮片段渲染。
- 默认对所有关键词与文本做转义，避免正则注入与 XSS（不渲染原始 HTML，始终以纯文本节点输出）。

非目标：富文本高亮（HTML 内容内查找）、跨节点 DOM 范围高亮、虚拟滚动列表的高亮（由列表组件负责，本组件只处理单段文本）。因为是纯展示组件，**不包含 core 层 headless 逻辑**，匹配算法以可被 tree-shake 的纯函数形式内联在 `@chenzy-design/svelte`。

## 2. 设计语义

- 视觉语义：镜像 Semi——高亮片段默认背景 `--cd-color-highlight-bg`（亮 yellow-4 / 暗 yellow-2）、文字 `--cd-color-highlight`（亮 black / 暗 white）、字重 600，确保高亮态与正文有强区分度。匹配片段语义上是“被检索命中的内容”，因此使用 `<mark>` 元素承载浏览器/AT 的内建语义。
- 层级语义：高亮是文本内强调，不是状态，不复用 `status`（default/warning/error）API；如需多类高亮（命中/警告命中）由调用方通过 `highlightClassName` 或 slot 自行区分。
- 尺寸：高亮不引入独立 `size`，字号/行高继承上下文文本。对齐 Semi，`.cd-highlight-tag` 默认无 padding、无圆角（盒模型零侵入）；如需内边距/圆角由调用方经 `highlightStyle` 或对象数组每词 `style` 自定义。
- 留白与圆角：高亮片段加极小水平 padding 与 `--cd-highlight-radius`，避免相邻高亮词粘连时视觉糊在一起。
- 一致性：本组件无受控输入、无浮层，因此不涉及 `value/on:change`、`open/on:openChange` 约定；其 API 围绕“数据 in、片段 out”设计。

## 3. 分层实现

- **是否需要 core**：否。纯展示、无交互、无键盘、无焦点管理，故不提供 `createHighlight`。匹配算法 `highlightChunks(sourceString, searchWords, options)` 作为无副作用纯函数随 `@chenzy-design/svelte` 发布，便于 SSR 与列表组件直接复用。
- **复用 core 原语**：无。对齐 Semi，命中片段不带 id / aria 关联（不生成 `useId`），保持纯展示零侵入。不使用 useFocusTrap/useRovingTabindex/useDismiss/useScrollLock/useLiveAnnouncer。
- **算法要点**：
  1. 规范化 `searchWords` → 去空串、去重、按长度降序（保证更长匹配优先，避免被短词切断）。
  2. 对每个词做正则转义；按 `caseSensitive` 决定 `i` flag；始终高亮全部匹配（对齐 Semi，无 highlightAll）。对象数组每词的 `className`/`style` 随其命中区间一路带到输出 chunk。
  3. 合并重叠/相邻区间（样式载荷合并对齐 Semi：className 取 prev||next、style 浅合并），输出 `{ text, highlight, className?, style? }[]` chunk 数组；Svelte 模板对 `highlight` 片段渲染 `<mark class="cd-highlight-tag">`（或 `component` 指定标签），对普通片段渲染纯文本（`{text}`，自动转义）。
- **SSR**：纯函数 + 纯文本输出，无水合差异；不读 `window`。
- **RTL**：纯内联文本，跟随容器 `direction`，无需特殊处理（无 padding，天然镜像安全）。

## 4. API

### Props

严格对齐 Semi Highlight 的 API（Semi propTypes 中声明但 render 从不消费的 `className`/`style` 属于假 prop，已剔除；Semi 无 `highlightAll`，永远高亮全部匹配，故不提供）。

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `sourceString` | `string` | `''` | 待处理的原始文本（纯文本，HTML 会被转义而非解析） |
| `searchWords` | `string \| string[] \| HighlightWord \| HighlightWord[]` | `[]` | 需高亮的关键词；空文本自动忽略。对象形式 `{ text, className, style }` 支持差异化样式（Semi v2.71+） |
| `caseSensitive` | `boolean` | `false` | 是否大小写敏感匹配 |
| `autoEscape` | `boolean` | `true` | 是否对关键词做正则转义（关闭后 `searchWords` 视为正则源，谨慎） |
| `component` | `string` | `'mark'` | 高亮片段的包裹标签名 |
| `highlightClassName` | `string` | `''` | 追加到每个高亮片段（`cd-highlight-tag`）的自定义类名 |
| `highlightStyle` | `string` | `''` | 追加到每个高亮片段的内联样式；与对象数组每词 `style` 合并（词 `style` 优先） |

`HighlightWord`：`{ text: string; className?: string; style?: Record<string, string | number> }`（自 `@chenzy-design/core` 导出，svelte 包透传）。

### Events

| 名称 | payload | 说明 |
|---|---|---|
| （无） | — | 纯展示组件，不派发事件。交互（如点击高亮词）由调用方在外层包裹自行绑定 |

### Slots

| 名称 | 作用域参数 | 说明 |
|---|---|---|
| （无） | — | 对齐 Semi：无 slot。差异化渲染通过 `component` / `highlightClassName` / `highlightStyle` / `searchWords` 对象数组实现 |

## 5. 主题 / Token 表

组件仅消费 Alias / Component 级 Token，禁止写死值。

镜像 Semi `highlight/variables.scss`（`.semi-highlight-tag` 仅 `color` / `background-color` / `font-weight` 三条属性——**无 radius、无 padding**）。Component token 定义在 `packages/tokens/src/components/highlight.ts`。

| Component Token | 取值（引用 Alias / Global） | 用途 |
|---|---|---|
| `--cd-highlight-color` | `var(--cd-color-highlight)`（亮 black / 暗 white） | 高亮片段文字色（镜像 Semi `$color-highlight-text-default`） |
| `--cd-highlight-bg` | `var(--cd-color-highlight-bg)`（亮 yellow-4 / 暗 yellow-2） | 高亮片段背景色（镜像 Semi `$color-highlight-text-bg-default`） |
| `--cd-highlight-font-weight` | `var(--cd-font-weight-bold)`（= 600） | 高亮片段字重（镜像 Semi `$font-highlight-text-fontWeight: 600`） |

对比度：`--cd-highlight-bg` 与 `--cd-highlight-color` 组合在亮/暗两套主题下均满足正文对比 ≥ 4.5:1（AA）。暗色主题通过 alias 层（`color-highlight` / `color-highlight-bg`）自动切换 yellow-2 底 + 白字，无需组件改动。

## 6. 无障碍

- **语义元素**：高亮片段默认使用原生 `<mark>`，浏览器与部分 AT 会暴露其“高亮/标记”语义，无需额外 `role`。根容器为 `<span>`，不打断阅读流。
- **不抢焦点**：组件全程不可聚焦、无 `tabindex`，避免在搜索结果列表中产生大量无意义 Tab 停留点。
- **不滥用 ARIA**：不对每个高亮加 `aria-label`（会让屏幕阅读器逐字播报“highlighted”，造成噪音）。如调用方需告知“共 N 处匹配”，应在外层用一次性 live region（如搜索框旁 `aria-live="polite"` 文案），不由本组件负责。
- **对比度**：见第 5 节，亮/暗主题均达 AA。调用方经 `highlightStyle` / 对象数组 `style` 覆盖颜色时，对比度责任转移给调用方，文档需明示。
- **reduced-motion**：组件无动画；若调用方为高亮加入入场动画，应自行包裹 `@media (prefers-reduced-motion: reduce)` 降级。
- **RTL**：纯内联文本无 padding，跟随 `dir` 自动镜像，无需特殊处理。
- **WCAG**：不依赖颜色单一通道传达信息——`<mark>` 自身具备语义元素标记，满足 1.4.1 不仅靠颜色区分（语义 + 背景双通道）。

## 7. 国际化

- **零硬编码**：本组件无内建可见文案（不含按钮/提示），i18n 负担最小。
- **i18n key**：仅在调用方需要“匹配计数”辅助文案时使用（非组件内置，列出以备复合场景统一）：

| key | 示例（en / zh） | 说明 |
|---|---|---|
| `Highlight.matchCount` | `{count} matches` / `{count} 处匹配` | 供外层 live region 复述命中数（复数用 ICU/Intl.PluralRules） |
| `Highlight.noMatch` | `No matches` / `无匹配` | 无命中时的可选提示 |

- **Intl**：`matchCount` 的数字格式与复数走 `Intl.NumberFormat` / `Intl.PluralRules`，禁止字符串拼接复数。
- **匹配语义**：`caseSensitive=false` 的默认匹配对带变音符号/全角半角的语言可能不直观；文档需说明本组件做的是码点级（非语言感知 collation）匹配，需要 locale-aware 匹配时由调用方预处理。

## 8. 文案

- 组件本体无可见文案。
- 外层辅助文案遵循 content-guidelines：计数用“N 处匹配”而非“N 个结果”（区分匹配片段与结果条目）；无命中用中性“无匹配”，不使用“出错/失败”等错误语气。
- **危险操作文案**：无。本组件不涉及任何破坏性/不可逆操作，无需危险文案。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
|---|---|---|
| gzip 体积 | ≤ 1.45 KB | 单组件 + `highlightChunks` 纯函数，无 core 依赖 |
| 单段匹配耗时 | < 0.3 ms | sourceString ≤ 2k 字符、searchWords ≤ 10 个的典型场景 |
| 重渲染 | 仅在 `sourceString`/`searchWords`/options 变化时重算 chunks（`$derived`/memo），props 不变不重算 |
| 内存 | 与 chunk 数线性；正常文本片段数为常量级 |

性能策略：
- **不需要虚拟化**：单段文本，DOM 节点数 = 片段数（高亮+非高亮），通常 < 50。
- **不需要 destroyOnClose / 惰性渲染**：无浮层、无大子树。
- **列表场景**：当用于长列表（如 1000 行搜索结果）时，虚拟化由 List/Table 组件负责，本组件保持每行轻量；`highlightChunks` 为纯函数，可在列表层批量预计算复用。
- **正则缓存**：对相同 `searchWords + options` 复用编译后的正则（模块级 LRU，小容量），降低列表重复构造开销。
- **长词数组保护**：`searchWords` 去重 + 长度上限保护，避免病态正则导致的卡顿。

## 10. AI 元数据

提供 `component.meta.ts`，内容覆盖：
- `name: 'Highlight'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'Highlight'`。
- `props`/`slots` 的机器可读签名（含类型、默认值、枚举）。
- `tags: ['文本高亮','关键词','搜索结果','keyword','mark','search']`，便于 AI 选型检索。
- `usageHints`：典型场景片段（搜索联想、过滤列表）、与 Input/AutoComplete/List 的组合关系。
- `antiPatterns`：勿用于富文本/HTML 内查找；勿对每个高亮加可聚焦元素；`autoEscape=false` 的安全提示。
- `a11yNotes`：使用 `<mark>` 语义、不要逐项 aria-label。
- 确认随包发布并被文档站/AI 选型工具消费。

## 11. 测试

- **单元（highlightChunks 纯函数）**：
  - 单词/多词、空数组、空串、全空白词被忽略。
  - 大小写敏感/不敏感分支。
  - 始终高亮全部匹配（对齐 Semi）。
  - 重叠/相邻匹配的区间合并正确；对象数组差异化样式 className/style 随区间流转与合并（prev||next / 浅合并）。
  - `autoEscape=true` 时正则特殊字符（`.*+?()[]` 等）被当字面量；`autoEscape=false` 时作为正则。
  - XSS：`sourceString`/`searchWords` 含 `<script>` 时仅作为文本节点渲染。
- **组件渲染 / a11y（Svelte Testing Library + axe）**：
  - 高亮片段渲染为 `<mark class="cd-highlight-tag">`（或 `component` 指定标签），highlightClassName/highlightStyle 及对象数组每词 className/style 正确追加。
  - 对象数组差异化样式：每词单独 className/style（camelCase→kebab、数字→px）。
- **a11y**：axe 扫描无 violation；高亮态文字对比度断言（亮/暗主题）；确认无多余 tabindex。
- **SSR**：服务端渲染输出与客户端水合一致（snapshot diff）。
- **视觉回归**：亮/暗、LTR/RTL、多高亮相邻、长文本截断场景快照。

## 12. 验收标准 Checklist

- [ ] 匹配算法 `highlightChunks`（含 `HighlightWord` 类型）归属 `@chenzy-design/core`，具名导出且可 tree-shake；svelte 包透传 `HighlightWord` 类型。
- [ ] 高亮标签类名对齐 Semi：`cd-highlight-tag`（镜像 `semi-highlight-tag`）；无外层 wrapper（对齐 Semi render 返回片段序列）。
- [ ] CSS 仅消费 `--cd-highlight-color` / `--cd-highlight-bg` / `--cd-highlight-font-weight`（定义于 `components/highlight.ts`，值引用 alias `color-highlight` / `color-highlight-bg` / global `font-weight-bold`）；无写死颜色/尺寸；无 padding/radius（对齐 Semi 仅三属性）。
- [ ] Props 与第 4 节一致，严格对齐 Semi 7 个有效 prop；剔除 Semi 假 prop（`className`/`style`）与项目历史扩展（`highlightAll`/`unstyled`/`idPrefix`/`describedById`/`highlightAriaLabel`/slots）；无受控输入/浮层。
- [ ] searchWords 支持对象数组差异化样式（Semi v2.71+）；每词 style/className 与 highlightStyle/highlightClassName 合并（词优先）。
- [ ] 默认对文本与关键词转义，无 XSS；`autoEscape=false` 在文档与 meta 中标注安全风险。
- [ ] 高亮片段默认渲染 `<mark>`，语义正确；无多余 `tabindex`/`role`。
- [ ] 亮/暗主题下高亮文字对比度 ≥ 4.5:1（AA）。
- [ ] 无组件内硬编码可见文案。
- [ ] 提供 `meta.ts`，含 props 签名、tokens、a11y notes，随包发布并被文档站/AI 选型消费。
- [ ] 单元（core highlightChunks）/ a11y 测试齐备并通过。
- [ ] 文档站示例不少于 Semi：基本用法、指定高亮样式、差异化样式、指定标签，另补多关键词、大小写敏感（共 6 个）。
