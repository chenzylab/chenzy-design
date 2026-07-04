# SPEC · CodeHighlight

> 分类：show · 阶段：M4（富媒体补齐）
> 对标 Semi：[CodeHighlight](https://semi.design/zh-CN/plus/codehighlight) —— Semi 底层用 `prismjs@^1.29.0` + line-numbers 插件（已从 semi-foundation 源码坐实）。
> 底层依赖对齐 Semi：**prismjs**（框架无关，Svelte 直接可用）。

## 1. 概述
根据语法高亮页面中的代码块。传入代码纯文本 + 语言名，输出带高亮的 `<pre><code>`。用于展示代码片段。

## 2. 设计语义
- **用**：静态展示一段代码（文档、消息、JSON/配置片段）。
- **不用**：需要编辑代码 → 用编辑器；只展示 JSON 且要虚拟化/编辑 → JsonViewer。
- 与 `Highlight`（文本关键词高亮）区别：CodeHighlight 是**语法**高亮，Highlight 是**关键词命中**高亮。

## 3. 分层实现
- **headless（core/）**：`packages/core/src/code-highlight.ts` —— 纯函数 `resolveCodeClassName(language, lineNumber)` 生成 `language-<lang>` / `line-numbers` class（对齐 Semi foundation 的 `highlightCode` 逻辑），以及一个薄封装 `highlightElement(el, opts)` 调 `Prism.highlightElement(el, false)`。`Prism.manual = true`。
- **渲染（svelte/）**：`CodeHighlight.svelte` —— `<pre><code>` 结构，`$effect` 内在 code 元素挂载/更新后调 highlight。code 内容用 `{@html}` 前必须 Prism 处理后的 DOM，或直接把纯文本塞进 code 再 `Prism.highlightElement`（对齐 Semi：DOM 就地高亮，避免 XSS）。

## 4. API（对齐 Semi）
### Props
| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| code | `string` | - | 代码纯文本 |
| language | `string` | - | 语言类型（prismjs 语言名） |
| lineNumber | `boolean` | `true` | 是否显示行号 |
| defaultTheme | `boolean` | `true` | 是否使用默认主题；自定义主题时置 `false` |
| class | `string` | - | 类名 |
| style | `string` | - | 内联样式 |
### Events
无。
### Slots
无（内容由 `code` prop 提供）。

## 5. 主题 / Token
默认主题 CSS 对齐 prismjs 高亮 token 分类，但**颜色必须映射到本库 token / 暗色模式**，不直接拷 prismjs 默认 theme。
| Token | 默认 | 用途 |
|---|---|---|
| `--cd-code-highlight-bg` | `--cd-color-fill-0` | 代码块背景 |
| `--cd-code-highlight-text` | `--cd-color-text-0` | 普通文本 |
| `--cd-code-highlight-comment` | `--cd-color-text-2` | 注释 |
| `--cd-code-highlight-keyword` | 品牌/语义色 | 关键字 |
| `--cd-code-highlight-string` | 语义色 | 字符串 |
| `--cd-code-highlight-number` | 语义色 | 数字 |
| `--cd-code-highlight-line-number` | `--cd-color-text-3` | 行号列 |
（具体 token 分类由实现时对照 prismjs token 类补齐，全部走 token，禁写死色值。）

## 6. 无障碍
- `<pre>` 语义即可；装饰性高亮 span 不需 aria。
- 代码块可聚焦滚动（长代码）：`tabindex="0"` + `role="region"` + `aria-label` 走 i18n（如「代码块」）。
- reduced-motion：无动画。

## 7. 国际化
- i18n key：`CodeHighlight.codeBlock`（代码块区域 aria-label）。

## 8. 文案
- 无内置可见文案（除 aria-label）。

## 9. 性能
### Perf Budget
| 指标 | 预算 |
|---|---|
| gzip 体积（不含 prismjs core） | ≤ 3kb |
| prismjs core | 按需，作为 peer/optional，语言按需 import |
- prismjs 语言包**不全量打进**组件：core 语言（js/css/clike/html/svg）随 prismjs 默认；其他语言由使用方 `import "prismjs/components/prism-<lang>.js"`（对齐 Semi 文档说明）。

## 10. AI 元数据
提供 `meta.ts`：props/tokens/examples。

## 11. 测试
- 单测：`resolveCodeClassName` 各分支（含/不含 lineNumber、已有 language class 不重复加）。
- e2e：给定 code+language，渲染后含 `.token` 高亮 span。
- a11y：axe + 长代码块键盘可滚动。

## 12. 验收标准
- [ ] 分层正确 · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过
- [ ] i18n 无硬编码 · [ ] 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页完成
