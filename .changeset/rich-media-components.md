---
'@chenzy-design/svelte': minor
'@chenzy-design/core': minor
'@chenzy-design/tokens': minor
'@chenzy-design/locale': minor
---

新增 7 个富媒体组件（对标 Semi Design Plus 族，底层选型从 semi-foundation 源码坐实）：

- **CodeHighlight**：代码语法高亮，底层 prismjs（297 语言、行号、可关默认主题）。
- **MarkdownRender**：Markdown 渲染，unified 管线（remark-parse + remark-gfm + remark-rehype → hast，Svelte 递归渲染），`components` 可注册 Svelte 组件覆盖元素 / 当自定义标签；代码块默认接 CodeHighlight。unified 生态动态 import。
- **VideoPlayer**：视频播放器，纯原生 `<video>` 自建控件（倍速 / 清晰度 / 线路 / 章节标记 / 画中画 / 镜像 / 全屏 / 字幕），零第三方媒体库。
- **AudioPlayer**：音频播放器，纯原生 `<audio>`，支持单曲 / 列表 / 封面标题，零第三方媒体库。
- **JsonViewer**：JSON 展示 / 编辑，引 `@douyinfe/semi-json-viewer-core` 框架无关内核（虚拟化大数据、搜索替换、自定义渲染规则、格式化），内核动态 import 不进主 bundle。
- **Chat**：AI / 普通会话容器，消息流 + SSE 流式 + 附件上传（复用 Upload）+ 角色配置 + 提示区 + 丰富的 render snippet；内容复用 MarkdownRender。
- **Cropper**：图片裁切，纯原生 DOM/canvas 几何引擎（8 角点 resize / 拖拽 / 缩放 / 旋转 / aspectRatio 约束 / rect·round·roundRect 形状 / getCropperCanvas 取结果），零第三方。

均含 Component Token（暗色）、i18n、组件 meta、a11y、size-limit 体积门禁与文档站 demo。所有对 Semi 的偏离已在各组件 spec §与 `specs/00-foundation/rich-media-gap-tracker.md` 登记。
