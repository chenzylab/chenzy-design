---
'@chenzy-design/svelte': minor
'@chenzy-design/tokens': minor
'@chenzy-design/locale': minor
---

feat(sidebar): FileContent 富文本查看/编辑列表（P5）

SideBar 套件 P5 阶段：新增 `SideBarFileContent` 富文本折叠列表 + `SideBarFileItem` 单编辑器。
基于 tiptap v3，默认扩展集对齐 Semi：StarterKit（link openOnClick:false）+ TextStyleKit + Image
+ TextAlign(types:['heading','paragraph']) + 自研 SelectionMark + 自研 ImageUploadNode（用
svelte-tiptap NodeViewRenderer 内嵌本库 Upload，支持 getUploadImageSrc），末尾拼接使用方 extensions。
`editable` 控制查看/编辑（编辑态渲染格式工具栏），`content` 为初始 HTML，`onContentChange`
回调 editor.getHTML()。tiptap 内核 + 3 官方扩展（@tiptap/extension-text-style /
extension-image / extension-text-align）+ svelte-tiptap 全程动态 import，不进主 bundle。
