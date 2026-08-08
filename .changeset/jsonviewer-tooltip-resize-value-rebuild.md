---
'@chenzy-design/svelte': patch
'@chenzy-design/tokens': patch
---

fix(json-viewer): 补齐 renderTooltip/autoWrap 重排/value 重建三个行为缺口 + 文档全量对齐 Semi

以 Semi 最新 `index.tsx`/`jsonViewer.scss` 源码逐条核对，补齐此前遗漏的行为与样式差异：

- **新增 `renderTooltip` prop**：内核 hover 700ms 后 emit `hoverNode` 事件（`{value,target}`），`renderTooltip` 返回的 `HTMLElement` 经 `renderHoverNode` 事件回传内核挂载到 tooltip 容器（对齐 Semi `notifyHover`）
- **autoWrap 容器宽度响应式重排**：新增 `ResizeObserver` 监听编辑器容器宽度变化，rAF 防抖后清空内核测量高度缓存并重新 `layout()`（对齐 Semi `setupResizeObserver`），此前容器宽度变化（如响应式布局）不会触发重新换行
- **`value` 变化重建内核实例**：外部主动传入新的 `value` 字面量现在会重建整个编辑器（对齐 Semi `componentDidUpdate` 的 dispose+init），文档同步补充"不建议在 onChange 中回写 value"的说明
- **样式修复**：行号列补 `text-align:center`、内容容器补齐三段隐藏原生滚动条写法、错误波浪线补 `text-underline-position:under`、补齐自动补全 `-complete-*` 系列样式
- **token 清理**：移除 3 个全库无消费方的死 token（`toolbar-btn-hover`/`-active`/`-shadow`），meta.ts 同步纠正为组件实际消费的 `search-options-item*` 系列

文档/demo 对齐：md API 表补 `limitSearchButtonBounds`/`renderTooltip` 两行；demo 补齐 Semi 原版外层 `marginBottom:16` 包裹 div；孤儿 demo `02-readonly.svelte` 接入文档新增「只读模式」章节。

顺带修复 `ConfigProvider` 打包警告：`import.meta.env` 改用 `esm-env` 的 `DEV` 导出，避免依赖 Vite 专有全局对象。
