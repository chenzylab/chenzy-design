# SPEC · JsonViewer

> 分类：show · 阶段：M4（富媒体补齐）
> 对标 Semi：[JsonViewer](https://semi.design/zh-CN/plus/jsonviewer)
> **底层选型（已评估确认）**：直接引 Semi 自研独立内核包 **`@douyinfe/semi-json-viewer-core@^2.101.0`**（框架无关：零 React、仅依赖 `jsonc-parser`；导出一个 `JsonViewer` 类）。**不自研 text-buffer**。Svelte 层只做渲染壳 + 生命周期驱动，逻辑全在 core 包。

## 1. 概述
展示与编辑 JSON 数据。基于 Semi 的 JSON 编辑器内核（仿 VS Code text-buffer），支持大数据虚拟化（300w 行内 1s）、搜索替换、自定义渲染规则、格式化。

## 2. 设计语义
- **用**：JSON 预览/编辑，特定值定制渲染（如 URL 显缩略图、评分显星）。
- **不用**：需要编辑非 JSON 的其他语言/完整 IDE 能力 → 用 Monaco Editor（Semi 文档明确此边界）。

## 3. 分层实现
- **内核**：`@douyinfe/semi-json-viewer-core` 的 `JsonViewer` 类，用法（从 Semi foundation 坐实）：
  ```js
  const jv = new JsonViewer(editorEl /*DOM 容器*/, value /*json 字符串*/, { prefixCls, ...options });
  jv.emitter.on('customRender', e => { /* e.customRenderMap */ });
  jv.layout();                    // 挂载布局
  jv.getModel();                  // 取 model（getValue 等）
  jv.format();                    // 格式化
  jv.getSearchWidget();           // 搜索控件
  jv.dispose();                   // 销毁
  ```
- **headless（core/）**：**无需**自研逻辑。可选：一个薄 `packages/core/src/json-viewer.ts` 仅做 options 归一/类型再导出（不重复内核逻辑）。若无必要可跳过 core，直接在 svelte 层引内核包。
- **渲染（svelte/）**：`JsonViewer.svelte` —— `<div bind:this={editorEl}>`，`$effect` 里 `new JsonViewer(editorEl, value, opts)`，onDestroy/cleanup 调 `dispose()`。`value` 变化：**JsonViewer 是非受控组件**（对齐 Semi 提示：不要在 onChange 里 setState value），仅初始 value 建实例；取值走 ref/方法。搜索 UI 若 core 提供 widget 则挂载，自定义搜索按钮走 `renderSearchButton`（对齐 Semi）。customRenderRule 的 Svelte 渲染：监听 `customRender` 事件，把匹配节点渲染为 Svelte 内容（对齐 Semi 的 customRenderMap 机制）。

## 4. API（对齐 Semi，完整）
### Props
| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| value | `string` | - | 展示内容（JSON 字符串，非受控初始值） |
| height | `number \| string` | - | 高度 |
| width | `number \| string` | - | 宽度 |
| showSearch | `boolean` | `true` | 是否显示搜索 Icon |
| renderSearchButton | `(defaultButton, controls) => Snippet/Node` | - | 自定义渲染搜索按钮（对齐 Semi ≥2.95） |
| options | `JsonViewerOptions` | - | 编辑器配置（见下） |
| class / style | | - | |
### JsonViewerOptions（对齐 Semi）
| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| lineHeight | `number` | `20` | 行高 px |
| autoWrap | `boolean` | `true` | 自动换行 |
| readOnly | `boolean` | `false` | 只读 |
| customRenderRule | `CustomRenderRule[]` | - | 自定义渲染规则（仅只读模式生效） |
| formatOptions | `{tabSize;insertSpaces;eol}` | - | 格式化配置 |
### Events
| 事件 | 载荷 | 说明 |
|---|---|---|
| onChange | `(value: string) => void` | 内容变化 |
### Methods（ref 暴露，对齐 Semi）
`getValue()` / `format()` / `search(text, caseSensitive?, wholeWord?, regex?)` / `getSearchResults()` / `prevSearch(step?)` / `nextSearch(step?)` / `replace(text)` / `replaceAll(text)`。
### Slots
无（内容由 value + customRenderRule）。

## 5. 主题 / Token
内核用 `prefixCls`（传 `cd-json-viewer`）。JSON 语法配色（key/string/number/boolean/null/标点）全走 token，深浅双主题；对齐 Semi 视觉但配色映射本库 token。
| Token | 默认 | 用途 |
|---|---|---|
| `--cd-json-viewer-bg` | fill-0 | 背景 |
| `--cd-json-viewer-key` | 语义色 | 键名 |
| `--cd-json-viewer-string` | 语义色 | 字符串 |
| `--cd-json-viewer-number` | 语义色 | 数字 |
| `--cd-json-viewer-boolean` | 语义色 | 布尔 |
| `--cd-json-viewer-null` | text-2 | null |
| `--cd-json-viewer-line-number` | text-3 | 行号列 |
| `--cd-json-viewer-search-highlight` | 强调色 | 搜索命中 |
（禁写死；核对内核实际输出的 class/prefixCls 挂 token。）

## 6. 无障碍（见 a11y.spec.md）
> 对齐优先：内核自带的编辑器交互为基线。补纯 aria：容器 `role=textbox`/`aria-multiline`/`aria-label`（走 i18n）、只读时 `aria-readonly`。搜索控件按钮 `aria-label` 走 i18n。
- 键盘：内核自身处理编辑键位（不覆盖）。
- reduced-motion / RTL：跟随内核 + token。

## 7. 国际化
- i18n key：`JsonViewer.{editor,search,replace,replaceAll,prev,next,caseSensitive,wholeWord,regex}` 等（搜索/替换 UI 文案）。全走 locale。

## 8. 文案
- 搜索/替换 UI 文案遵循 content-guidelines。

## 9. 性能（见 performance.spec.md）
### Perf Budget
| 指标 | 预算 |
|---|---|
| gzip 体积（组件壳，内核动态 import 不计入） | ≤ 4 KB（实测 3.21 KB，2026-07-04 校准） |
| `@douyinfe/semi-json-viewer-core` | 内核体积较大（Semi 标称 ~203kb/gzip 51kb）；作为 dep，**建议动态 import** 内核，首次挂载异步加载，避免拖累主包 |
| 运行时 | 依赖内核虚拟化（300w 行内 1s，Semi 实测） |
- **必须动态 import 内核**，不进主 bundle。

## 10. AI 元数据
提供 `meta.ts`：props/events/methods/tokens/examples（含 customRenderRule、format、search）。

## 11. 测试
- 单测：options 归一（若有 core 层）；customRenderRule 匹配逻辑（若在本层实现）。
- e2e/dom：渲染 value；format 方法；只读模式；搜索（内核在 jsdom 的可测性有限，打桩或标注跳过项并 log）。
- a11y：axe + 容器 role/aria + 搜索按钮 aria-label。

## 12. 验收标准
- [ ] 分层正确（引内核而非自研） · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过
- [ ] i18n 无硬编码 · [ ] 测试达标 · [ ] Perf 达标（内核动态 import） · [ ] meta 提供 · [ ] 文档页完成
