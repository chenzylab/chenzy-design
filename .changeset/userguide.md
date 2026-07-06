---
"@chenzy-design/svelte": minor
"@chenzy-design/core": minor
"@chenzy-design/locale": minor
"@chenzy-design/tokens": minor
---

新增 UserGuide 用户引导组件（对标 Semi UserGuide，a11y 大幅增强）。popup 模式用 svg mask 挖洞 spotlight 遮罩逐个高亮目标元素并用 floating 贴气泡讲解（目标 scrollIntoView 进视口）；modal 模式居中弹窗图文引导（cover 封面 + 圆点指示器）。core headless `createUserGuide` 提供步进状态机：current 受控/非受控、handleNext/handlePrev/handleSkip/handleFinish 回调去重、visible false→true 重置、popup 无 target 步骤跳过、spotlight padding 三层覆盖（step>props>默认5）、按钮显隐规则。a11y 超越 Semi（Semi 无 focus trap / Esc / inert / 键盘 / role=dialog）：role=dialog + aria-modal + aria-labelledby/describedby；打开移焦 focus-trap 困住 + 关闭归还；背景 inert；Esc=跳过、←/→=上一步/下一步；scroll-lock（getPopupContainer 时跳过）；进度 aria-label + live-announcer polite 播报。onFinish/onSkip 不自动关闭，使用方置 visible=false。进度文案国际化（补齐 Semi 未国际化的 stepIndicator）。
