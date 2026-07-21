---
'@chenzy-design/svelte': patch
'@chenzy-design/tokens': patch
---

fix(json-viewer): 严格对齐 Semi — DOM 结构/盒模型/搜索栏/token 公式

以 Semi 真实 DevTools DOM + jsonViewer.scss 源码为基准对齐：

- **盒模型**：height + padding(12px 0) 落在内核挂载层（对齐 Semi `.semi-json-viewer-background`），
  外层 relative div 无 padding/overflow，搜索栏浮层可溢出编辑器完整显示（此前 overflow:hidden 裁掉替换行）
- **搜索栏 DOM 结构**：一比一重写为 Semi `search-bar-container > search-bar(Input + ul.search-options + ButtonGroup + close) + replace-bar(Input + replace + replaceAll)`
- **搜索按钮**：改用 Button(theme=light type=primary)（浅灰底方块 + 蓝图标 + 32×32）
- **焦点**：输入后 refocus 搜索框（对齐 Semi `searchInputRef.focus()`），可连续输入
- **class 命名**：全改连字符（`cd-json-viewer-search-bar-*`），去 BEM `__`
- **SearchControls**：补全对齐 Semi 全字段（showSearchBar/onToggleSearchBar/onSearch/onPrevSearch/onNextSearch/onReplace/onReplaceAll）
- **样式全走 token 公式**：padding/gap/bg/border/radius/search-options 色改用 `--cd-*-json-viewer-*` token
  （tokens 新增 4 个 search-options-item 色 token，对齐 Semi text-2/default/primary/primary-light-default）
