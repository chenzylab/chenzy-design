# SPEC · Modal

> 分类：feedback · 阶段：M5
> 对标 Semi Modal。**示范组件**：作为「浮层/复杂 a11y」组件 SPEC 的范例。

## 1. 概述
模态对话框，在当前页面之上覆盖一层，需用户处理后才能继续。

## 2. 设计语义
用于打断式的关键交互（确认、表单填写）。轻量反馈用 Toast/Notification；侧边详情用 Drawer/SideSheet。

## 3. 分层实现
- **headless（core）**：`createModal` —— open 状态、`useFocusTrap`、`useScrollLock`、`useDismiss`（Esc / 点击遮罩）、焦点归还、`useId` 关联标题/内容。这些是跨框架可复用 a11y 原语。
- **渲染**：`Modal.svelte`（Portal 到 body）、遮罩、头/体/尾。提供 `Modal.confirm/info/warning/error` 命令式 API。

## 4. API
### Props
| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| open | `boolean` | `false` | 受控显隐 |
| title | `string\|Snippet` | — | 标题 |
| width | `number\|string` | `448` | 宽度 |
| centered | `boolean` | `false` | 垂直居中 |
| closable | `boolean` | `true` | 显示关闭按钮 |
| maskClosable | `boolean` | `true` | 点遮罩关闭 |
| keyboard | `boolean` | `true` | Esc 关闭 |
| confirmLoading | `boolean` | `false` | 确认按钮 loading |
| okText / cancelText | `string` | i18n 默认 | 按钮文案 |
| okType | Button type | `'primary'` | 确认按钮类型（危险用 danger）|
| destroyOnClose | `boolean` | `false` | 关闭即卸载内容 |
| getContainer | `() => HTMLElement` | `body` | Portal 容器（对标 Semi getPopupContainer，含 getContainerContext 语义）|
| modalRender | `Snippet<[Snippet]>` | — | 自定义包裹整个面板容器（对标 Semi modalRender），接收默认面板 Snippet |
| cancelLoading | `boolean` | `false` | 取消按钮 loading（对称 confirmLoading）|
| maskFixed | `boolean` | `true` | 遮罩 position:fixed；false 时 absolute 局部铺满 |
### Events
| 事件 | 载荷 | 说明 |
|---|---|---|
| on:ok | — | 确认 |
| on:cancel | — | 取消/关闭 |
| on:openChange | `boolean` | 显隐变化（一致性约定）|
| on:afterClose | — | 关闭动画结束 |
### Slots
| 名称 | 说明 |
|---|---|
| default | 内容 |
| title / footer | 自定义头尾 |

## 5. 主题 / Token
| Token | 默认 | 用途 |
|---|---|---|
| --cd-modal-radius | var(--cd-radius-3) | 圆角 |
| --cd-modal-bg | var(--cd-color-bg-0) | 面板底色 |
| --cd-modal-shadow | var(--cd-shadow-3) | 阴影 |
| --cd-modal-mask-bg | rgba(0,0,0,.45) | 遮罩 |
| --cd-modal-padding | var(--cd-spacing-6) | 内距 |

## 6. 无障碍（重点）
- 容器 `role="dialog"` + `aria-modal="true"`；`aria-labelledby`→标题，`aria-describedby`→内容。
- **focus trap**：打开时焦点移入（首个可聚焦或关闭按钮），Tab 循环不逃出；关闭后**焦点归还**触发元素。
- Esc 关闭（受 `keyboard` 控制）；点遮罩关闭（受 `maskClosable`）。
- 打开时 `useScrollLock` 锁背景滚动；背景内容对 SR `aria-hidden`/`inert`。
- 关闭按钮 `<button aria-label>`（i18n 文案）。
- reduced-motion 下用即时显隐替代动画。

## 7. 国际化
- key：`Modal.okText`(确定)、`Modal.cancelText`(取消)、`Modal.close`(关闭)。
- `Modal.confirm/warning/error` 等便捷方法默认文案来自 locale。

## 8. 文案
- 标题陈述动作，正文说明后果；按钮回显动作（如「删除 / 取消」而非「确定 / 取消」）。
- 危险/不可逆操作用 danger okType + 明确文案。遵循 content-guidelines。

## 9. 性能
### Perf Budget
| 指标 | 预算 |
|---|---|
| gzip 体积 | ≤ 5.85 KB（不含命令式工厂）|
| 内容渲染 | **惰性**：未打开不渲染内容；`destroyOnClose` 可选卸载 |
- Portal 复用单一容器；遮罩动画用 CSS。

## 10. AI 元数据
提供 `component.meta.ts`，标注命令式 API（confirm/info/...）。

## 11. 测试
- 单测：open 受控、ok/cancel/openChange、destroyOnClose、命令式 confirm。
- e2e：focus trap、焦点归还、Esc/遮罩关闭、scroll lock。
- a11y：axe 0 violations；role/aria-modal/labelledby/describedby 正确。

## 12. 验收标准
对照 AGENTS.md §5 DoD 全勾，**a11y 焦点管理为硬性门禁**。
