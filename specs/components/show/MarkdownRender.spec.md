# SPEC · MarkdownRender

> 分类：show · 阶段：M4（富媒体补齐）
> 对标 Semi：[MarkdownRender](https://semi.design/zh-CN/plus/markdownrender) —— Semi 底层用 `@mdx-js/mdx@^3.0.1` + `remark-gfm@^4.0.0`（已从 semi-foundation 源码坐实），运行时 `evaluate(raw, {remarkPlugins, rehypePlugins, format, ...jsxRuntime})`。
>
> **框架差异决策（已定）**：Svelte 无 React JSX runtime，无法复用 Semi 的 `evaluate`（产出 React 组件）。本组件采用 **unified 管线（remark-parse + remark-gfm + remark-rehype + rehype）把 Markdown 编译为 hast，再用 Svelte 组件递归渲染 hast 节点**。**不支持** md 正文里的任意 JSX 表达式求值（Semi 的 `format='mdx'` 深度能力），**但支持** `components` 注册 Svelte 组件覆盖元素 / 当自定义标签。对齐 Semi 的 remark/rehype 插件生态、GFM、`raw`/`components`/`remarkPlugins`/`rehypePlugins` API。此偏离已登记于 `specs/00-foundation/rich-media-gap-tracker.md §3`。

## 1. 概述
在网页中即时渲染 Markdown。传入纯文本 `raw`，输出符合本库样式规范的富文本。用于文档站、知识库、SSE 动态内容、偏展示的轻交互内容。

## 2. 设计语义
- **用**：渲染用户/后端提供的 Markdown 字符串；知识库富文本；Chat 消息内容（Chat 复用本组件）。
- **不用**：编译期已知的静态 md 页面 → 走 mdsvex preprocessor 更高效（本组件是**运行时** raw 渲染）。
- 与 mdsvex 区别：mdsvex 编译期；本组件运行时接收 `raw` 字符串动态渲染。

## 3. 分层实现
- **headless（core/）**：`packages/core/src/markdown-render.ts` —— `compileToHast(raw, opts)`：用 unified（`remark-parse` + 条件 `remark-gfm` + `remark-rehype` + 透传 remark/rehype 插件）把 raw 编译成 hast root。纯函数，框架无关，返回 hast，供任意框架渲染层消费。
- **渲染（svelte/）**：
  - `MarkdownRender.svelte` —— `$derived`/`$effect` 调 `compileToHast`，把 hast root 交给递归渲染子组件。
  - `HastNode.svelte`（内部）—— 递归渲染 hast：element → 查 `components[tagName]`，命中则渲染注册的 Svelte 组件（props = hast properties + children snippet），否则渲染原生标签；text → 文本；忽略未知/危险节点。
  - **代码块**：`<pre><code class="language-x">` 默认接 CodeHighlight（#1）做高亮（对齐 Semi Chat 内也用 prismjs）。
  - **安全**：默认**不**渲染 raw HTML（对齐 Semi `format='md'` 默认剥离 HTML 的行为）；如需保留由使用方显式传 rehype-raw 插件并自负 XSS。

## 4. API（对齐 Semi）
### Props
| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| raw | `string` | - | Markdown 纯文本 |
| components | `Record<string, Component>` | - | 覆盖元素 tag 或注册自定义标签对应的 Svelte 组件 |
| format | `'md'` | `'md'` | 传入类型。**本实现仅支持 `'md'`**（不支持 `'mdx'` 的 JSX 求值）；保留 prop 以对齐 Semi API 形状 |
| remarkGfm | `boolean` | `true` | 是否开启 GFM（表格/任务列表/删除线/autolink） |
| remarkPlugins | `unknown[]` | `[]` | 自定义 remark 插件 |
| rehypePlugins | `unknown[]` | `[]` | 自定义 rehype 插件 |
| class | `string` | - | 类名 |
| style | `string` | - | 内联样式 |
> 可覆盖的基本元素 tag（对齐 Semi）：`a blockquote br code em h1..h6 hr img li ol p pre strong ul table`。
> 提供 `MarkdownRender.defaultComponents` 供二次封装（对齐 Semi）。
### Events
无（纯渲染）。
### Slots
无（内容由 `raw` 提供；自定义组件经 `components`）。

## 5. 主题 / Token
富文本排版全部走本库 typography token + 间距 token，不写死。
| Token | 默认 | 用途 |
|---|---|---|
| `--cd-md-text` | `--cd-color-text-0` | 正文 |
| `--cd-md-heading` | `--cd-color-text-0` | 标题 |
| `--cd-md-link` | `--cd-color-link` | 链接 |
| `--cd-md-code-inline-bg` | `--cd-color-fill-0` | 行内 code 背景 |
| `--cd-md-blockquote-border` | `--cd-color-border` | 引用左边框 |
| `--cd-md-table-border` | `--cd-color-border` | 表格边框 |
| `--cd-md-spacing-block` | `--cd-spacing-*` | 块间距 |
（表格/列表/引用样式对齐既有 Typography 语义，复用 typography token。）

## 6. 无障碍
- 输出语义化 HTML（h1..h6/ul/ol/table/blockquote），天然可访问。
- 标题层级不跳级由内容负责；组件不强改层级。
- 链接 `a` 默认非新窗；外链新窗时补 `rel="noopener"`。
- 图片 `img` 无 alt 时按内容降级（`alt=""` 视为装饰）。

## 7. 国际化
- 无内置可见文案。RTL：容器继承 `dir`，列表/引用镜像由 CSS 逻辑属性保证。

## 8. 文案
- 无内置文案。

## 9. 性能
### Perf Budget
| 指标 | 预算 |
|---|---|
| gzip 体积（组件壳，unified 生态动态 import 不计入） | ≤ 3.5 KB（实测 2.88 KB，2026-07-04 校准） |
| unified + remark + rehype | 作为 dep，按需；评估是否可 code-split（首次渲染前动态 import 编译器） |
- 大文档：hast 递归渲染，超大文档考虑惰性；SSE 场景 `raw` 高频更新需 debounce 编译（Chat 层处理）。
- 编译器（unified 生态）体积较大，**建议动态 import**，组件首次挂载时异步加载，避免拖累主包（对齐 Semi 也是异步 evaluate）。

## 10. AI 元数据
提供 `meta.ts`：props/slots/tokens/examples（含 components 覆盖示例、自定义标签示例）。

## 11. 测试
- 单测：`compileToHast` —— GFM 表格/任务列表/删除线；开关 remarkGfm；透传插件生效；raw HTML 默认剥离。
- e2e：渲染基本 md（标题/加粗/链接/列表/表格/代码块）；`components` 覆盖 h1；注册自定义标签渲染 Svelte 组件。
- a11y：axe 通过；标题/表格语义正确。

## 12. 验收标准
- [ ] 分层正确 · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过
- [ ] i18n 无硬编码 · [ ] 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页完成
