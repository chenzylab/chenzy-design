---
"@chenzy-design/svelte": minor
"@chenzy-design/core": minor
"@chenzy-design/locale": minor
"@chenzy-design/tokens": minor
---

UserGuide 用户引导破坏性重写，严格对齐 Semi userGuide（DOM / token / API / demo 全量对齐，无向后兼容）。popup 模式复用本库 Popover（`trigger="custom"`）贴气泡讲解 + svg mask 挖洞 spotlight 遮罩逐个高亮目标（四块透明矩形让高亮区可交互，目标不在视口时 scrollIntoView）；modal 模式复用本库 Modal（header/footer=null、centered、bodyStyle padding:0）图文引导（cover 封面 + 圆点指示器）。core headless `createUserGuide` 步进状态机对齐 Semi foundation：current 受控/非受控、handlePrev/handleNext/handleSkip 回调去重、末步 handleNext 触发 finish、visible false→true 重置 current=0 并锁 body 滚动（补偿滚动条宽、getPopupContainer 时跳过）、spotlight padding 三层覆盖（step>props>默认5）。指示器 popup 为纯文本 `n/total`（对齐 Semi 无 i18n），modal 为圆点。移除自造的、Semi 无的能力：focus-trap / inert / Esc / 箭头键 / role=dialog 契约 / live-announcer / stepIndicator i18n key。tokens 逐条镜像 Semi `variables.scss`（名 / 值 / 作用 DOM 对齐），移除 Semi 无的中间变量。position 支持 Semi 14 方位。demo 补齐至 8 个对齐 Semi（基本 / 主题 / 弹出位置 / 高亮区域大小 / 定制按钮 / 受控 / 弹窗式 / 无遮罩）。onFinish/onSkip 不自动关闭，使用方置 visible=false。
