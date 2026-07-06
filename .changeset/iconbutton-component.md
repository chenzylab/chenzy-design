---
"@chenzy-design/svelte": minor
---

新增 IconButton 便捷组件（对标 Semi 2.101.0），为纯图标按钮的薄封装：转发 Button 全部 props + icon，并强制 ariaLabel 必填（dev 模式缺失时 warn），保证可访问名。同时给 Button 增补 circle prop（正圆按钮，配合 icon-only 使用）。
