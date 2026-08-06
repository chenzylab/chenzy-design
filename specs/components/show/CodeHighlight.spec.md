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
- **headless（core/）**：`packages/core/src/code-highlight.ts` —— 纯函数 `resolveCodeClassName(currentClassName, language, lineNumber)` 生成 `language-<lang>` / `line-numbers` class（对齐 Semi foundation `highlightCode` 的 class 拼接逻辑：已有 `language-*` 不重复加）。`Prism` 调用留在渲染层，core 不依赖 prismjs。
- **渲染（svelte/）**：`CodeHighlight.svelte` —— `Prism.manual = true`；`div > pre > code` 结构，`$effect` 内对 code 元素设 class + `textContent`（纯文本写入，不经 `{@html}`），再 `Prism.highlightElement(el, false)` 就地高亮（对齐 Semi：DOM 就地高亮，避免 XSS）。根 class 顺序对齐 Semi `cls(className, PREFIX, "semi-light-scrollbar", {defaultTheme条件类})`：外部 class 在最前。

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
严格对齐 Semi：无组件级 token 命名空间（对齐 Semi 空 `variables.scss`）。默认主题（dabblet 配色）按 Semi codeHighlight.scss 逐条实现：
- 能映射到色板/语义色的位置直接引用本库既有 token（如 `color: var(--cd-color-text-0)` 对齐 Semi `var(--semi-color-text-0)`；`.token.keyword` 用 `var(--cd-color-purple-6)` 对齐 Semi `rgba(var(--semi-purple-6),1)`）。
- Semi 写死的十六进制色值（如 `#895fe2` / `#f9f7f9` / `#6b7075` / `#999` / `#d0955f` / `#b3d4fc` / `#ebf4ff` / `#0064d2`）本库同样写死，不映射 token、不随暗色模式自适应（与 Semi 一致的真实行为，非本库缺陷）。

## 6. 无障碍
- `<pre>` 语义即可；装饰性高亮 span 不需 aria。
- 严格对齐 Semi：根节点无 `tabindex`/`role`/`aria-label`（Semi 源码无此增强，本库不添加自造超集）。
- reduced-motion：无动画。

## 7. 国际化
- 无内置 i18n key（原 `CodeHighlight.codeBlock` 随 a11y 增强一并移除，避免无消费方的悬空键）。

## 8. 文案
- 无内置可见文案。

## 9. 性能
### Perf Budget
| 指标 | 预算 |
|---|---|
| gzip 体积（含 prismjs core + 语言组件 markup/js/ts/css/bash/json + prism-svelte + line-numbers 插件） | ≤ 16 KB（实测 14.27 KB，2026-07-08 校准；语言组件客户端懒加载，为生产 build 下正确高亮所必需） |
| prismjs core | 按需，作为 peer/optional，语言按需 import |
- prismjs 语言包**不全量打进**组件：core 语言（js/css/clike/html/svg）随 prismjs 默认；其他语言由使用方 `import "prismjs/components/prism-<lang>.js"`（对齐 Semi 文档说明）。

## 10. AI 元数据
提供 `meta.ts`：props/tokens/examples。

## 11. 测试
- 单测：`resolveCodeClassName` 各分支（含/不含 lineNumber、已有 language class 不重复加）。
- e2e：给定 code+language，渲染后含 `.token` 高亮 span。
- render：根节点 class 顺序（外部 class 在前，对齐 Semi）、无 role/aria-label/tabindex、axe 无违规。

## 12. 验收标准
- [ ] 分层正确 · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过
- [ ] i18n 无硬编码 · [ ] 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页完成
