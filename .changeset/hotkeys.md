---
"@chenzy-design/svelte": minor
"@chenzy-design/core": minor
"@chenzy-design/locale": minor
"@chenzy-design/tokens": minor
---

新增 HotKeys 快捷键组件（对标 Semi 2.101.0）。声明一组键盘组合、绑定全局/局部 keydown 监听、命中触发回调，并渲染语义化 `<kbd>` 键位提示。core headless 提供 Keys 常量枚举、keyToCode、isValidHotKeys 校验、matchHotKeys（修饰键精确匹配 + 普通键用 event.code 物理键位）。修复 Semi 未生效的 mergeMetaCtrl —— 真正实现跨平台合并 Cmd/Ctrl。a11y 增强（超越 Semi 的 span）：`<kbd>` 语义、`+` 分隔符 aria-hidden、aria-keyshortcuts、键位文本可选中。支持 preventDefault 拦截浏览器默认行为、content/render 自定义提示、getListenerTarget 局部监听。
