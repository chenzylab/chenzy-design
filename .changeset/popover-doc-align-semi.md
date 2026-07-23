---
'@chenzy-design/svelte': patch
'@chenzy-design/core': patch
---

feat(popover): 文档整页对齐 Semi + 补齐浮层键盘无障碍（onEscKeyDown / 方向键移焦 / initialFocusRef 内层聚焦）

Popover 文档 inline 化，9 个 demo 严格复刻 Semi（注意事项 children 类型 / 基本使用 / 12 方位 / 受控 custom / condition / showArrow / arrowPointAtCenter / 设置浮层背景色 / 初始化弹出层焦点）。demo 用 Empty + IllustrationSuccess 复刻 Semi 的 content 卡片。

同时补齐三处**跨浮层组件**（Tooltip / Popover / Popconfirm 全受益）的 Semi 键盘无障碍能力：

- **onEscKeyDown**：新增回调 prop，在 trigger 或浮层按 Esc 时触发，与 `closeOnEsc` 是否关闭相互独立（对齐 Semi）。`useDismiss` 的 `onDismiss` 回调补 event 第二参以透传原始事件。
- **ArrowUp/Down 键盘移焦**：浮层打开后在触发器按 ⬇️ 焦点移入浮层首个可交互元素、⬆️ 移到最后一个（对齐 Semi `_handleTriggerArrowUp/DownKeydown`），对所有 trigger 生效（hover/focus 的 tooltip 同样支持）。
- **initialFocusRef 内层聚焦**：`content` 函数形态的 `initialFocusRef` 绑定到自身不可聚焦的元素（如包裹 Input 组件的 span）时，聚焦其内部首个可聚焦元素（对齐 Semi ref 绑组件时聚焦真实 input 的行为）。

新增 Popover 键盘 e2e 测试覆盖方向键移焦与 onEscKeyDown 回调（closeOnEsc=false 下 Esc 触发回调但不关闭）。
