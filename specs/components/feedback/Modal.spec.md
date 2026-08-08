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

> 本表由 `packages/svelte/src/modal/meta.ts` 真源生成（2026-07-30 重校）。此前本表列的 prop 多为 Semi 对齐前的旧名或已删除项（如 `value`→`activeKey`、`change`→`onChange`），改 prop 时请同步 meta.ts，勿手写「规划中」的 prop。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| visible | `boolean` | `undefined` | 对话框是否可见（受控；受控时不回写） |
| title | `string \| Snippet` | `undefined` | 标题（string 或 Snippet，对齐 Semi ReactNode） |
| header | `Snippet \| null` | `undefined` | 自定义头部，null 不展示头部 |
| width | `number \| string` | `448` | 宽度 |
| height | `number \| string` | `undefined` | 高度 |
| size | `'small' \| 'medium' \| 'large' \| 'full-width'` | `undefined` | 预设宽度：small(448) / medium(684) / large(920) / full-width(100vw-64px) |
| centered | `boolean` | `false` | 垂直居中 |
| closable | `boolean` | `true` | 右上角关闭按钮 |
| closeIcon | `Snippet` | `undefined` | 自定义关闭图标 |
| maskClosable | `boolean` | `true` | 点遮罩关闭 |
| closeOnEsc | `boolean` | `true` | Esc 关闭 |
| confirmLoading | `boolean` | `false` | 确认按钮 loading |
| okText | `string` | `undefined` | 确认按钮文字 |
| cancelText | `string` | `undefined` | 取消按钮文字 |
| okType | `'primary'\|'secondary'\|'tertiary'\|'warning'\|'danger'` | `'primary'` | 确认按钮类型 |
| okButtonProps | `Record<string, unknown>` | `undefined` | 确认按钮额外 props |
| cancelButtonProps | `Record<string, unknown>` | `undefined` | 取消按钮额外 props |
| hasCancel | `boolean` | `true` | 是否显示取消按钮 |
| footer | `Snippet<[{ ok; cancel }]> \| null` | `undefined` | null 隐藏默认按钮；snippet 自定义尾部（接收 { ok, cancel }） |
| footerFill | `boolean` | `false` | 底部按钮撑满 |
| mask | `boolean` | `true` | 是否显示遮罩 |
| maskStyle | `string` | `undefined` | 遮罩内联样式 |
| bodyStyle | `string` | `undefined` | 内容区内联样式 |
| style | `string` | `undefined` | 根节点内联样式（如 top） |
| class | `string` | `undefined` | 根节点类名 |
| modalContentClass | `string` | `undefined` | 内容区类名 |
| fullScreen | `boolean` | `false` | 全屏（覆盖 width/height） |
| motion | `boolean` | `true` | 动画开关 |
| getPopupContainer | `() => HTMLElement \| null` | `undefined` | 指定父级 DOM，缺省 document.body |
| zIndex | `number` | `undefined` | 遮罩/面板的 z-index（缺省由堆叠计数分配） |
| keepDOM | `boolean` | `false` | 关闭时保留内部组件不销毁 |
| lazyRender | `boolean` | `true` | 配合 keepDOM，为 true 时挂载时不渲染 |
| icon | `Snippet` | `undefined` | 命令式类型图标 |
| modalRender | `Snippet<[Snippet]>` | `undefined` | 自定义渲染 Modal content；接收默认 content Snippet，返回包裹结构（可拖拽经此 + DragMove） |
| children | `Snippet` | `undefined` | 内容主体 |
| aria-label | `string` | `undefined` | 无 title 时的 aria-label |
| preventScroll | `boolean` | `false` | 聚焦时是否阻止浏览器滚动文档以显示新聚焦元素（作用于组件内 focus） |
| onOk | `() => void \| Promise<unknown>` | `undefined` | 点击确认；返回 Promise 时确认按钮自动 loading |
| onCancel | `() => void \| Promise<unknown>` | `undefined` | 取消/关闭；返回 Promise 时取消按钮自动 loading |
| afterClose | `() => void` | `undefined` | 对话框完全关闭后回调 |
| onVisibleChange | `(visible: boolean) => void` | `undefined` | 显隐变化通知 |
| maskFixed | `boolean` | `true` | 遮罩是否 position:fixed；false 时 absolute，配合 getPopupContainer 局部弹层 |

**事件**（回调 prop 形式，对齐 Semi）：

| 事件 | 说明 |
| --- | --- |
| `onOk` | 确认按钮点击（非受控自动关闭） |
| `onCancel` | 取消/关闭按钮/遮罩/Esc 关闭 |
| `onVisibleChange` | 显隐变化通知 |
| `afterClose` | 完全关闭后 |
### Events
| 事件 | 说明 |
| --- | --- |
| `onOk` | 确认按钮点击（非受控自动关闭） |
| `onCancel` | 取消/关闭按钮/遮罩/Esc 关闭 |
| `onVisibleChange` | 显隐变化通知 |
| `afterClose` | 完全关闭后 |
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
- key：`Modal.confirm`(确定)、`Modal.cancel`(取消)、`Modal.close`(关闭)。注意 `okText`/`cancelText` 是**组件 prop 名**（对齐 Semi），locale 键则是 `confirm`/`cancel`，勿混用。
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
