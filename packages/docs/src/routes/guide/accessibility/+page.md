# Accessibility 无障碍

以 WCAG 2.1 **AA** 为基线。所有交互组件键盘可达、对屏幕阅读器可理解、可见焦点、对比度达标。

## 全局规则

每个组件的 a11y 实现都对照以下规则：

- **键盘**：Tab / Shift+Tab 进出，Enter / Space 激活，Esc 关闭浮层，方向键在复合组件内导航（Menu / Tabs / Radio / Listbox 遵循 WAI-ARIA APG）。
- **焦点管理**：浮层（Modal / Drawer / Dropdown）进入时 focus trap，关闭后焦点归还触发元素；`useFocusTrap` 放在 `@chenzy-design/core`。
- **ARIA**：正确的 `role`、`aria-*`、`aria-expanded` / `aria-selected` / `aria-checked` / `aria-disabled`、`aria-labelledby` / `aria-describedby`；动态内容用 `aria-live`。
- **可见焦点**：统一 `:focus-visible` 样式，由 `--cd-color-focus` / `--cd-focus-ring` 控制，禁止 `outline:none` 而不补替代。
- **对比度**：文本 / 图标对背景 ≥ 4.5:1（大字 3:1）；token 设计阶段即校验。
- **动效**：`prefers-reduced-motion: reduce` 时关闭非必要过渡 / 动画。
- **屏幕阅读器专用文本**：提供 `.cd-sr-only` 工具类。
- **方向性**：支持 `dir="rtl"`，样式使用逻辑属性（如 `margin-inline-start`）。

## 核心原语

放在 `@chenzy-design/core`：`useFocusTrap`、`useRovingTabindex`、`useLiveAnnouncer`、`useId`、`useDismiss`（点击外部 / Esc）、`useScrollLock`。

## 测试要求

- 每个组件接入 axe（Playwright + @axe-core），目标 0 violations。
- 关键组件编写键盘操作 e2e（仅靠键盘完成全部交互）。
- 焦点归还、focus trap 有断言。

## 验收标准

- 不用鼠标可完成所有交互。
- NVDA / VoiceOver 能正确播报状态变化。
- axe 全绿；对比度全部达标。
- reduced-motion 生效；RTL 布局正确。
