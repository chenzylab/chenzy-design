---
'@chenzy-design/core': patch
---

fix: 修复嵌套浮层同时响应 Escape 键的问题

`useDismiss` 此前每个实例各自独立在 `document` 上挂一个 `keydown` 监听器，
互不知道彼此存在。当一个浮层组件（如 Modal）内嵌另一个自带浮层的组件
（如 DatePicker/Select/Cascader，只要底层用了 `useDismiss` 且
`closeOnEsc`/`escape` 生效），按一次 Escape 会让两个监听器同时触发，内层
面板和外层浮层一起关闭——而非只关最上层（最后打开）的那一个。

`DatePicker` 等组件的 `stopPropagation` prop 对此无效：它只作用于鼠标点击
事件的 DOM 冒泡链，两个独立挂在 `document` 上的 `keydown` 监听器之间没有
冒泡关系可言。

修复：`useDismiss` 内部改为维护一个全局的 Escape 挂载顺序栈，只在栈非空时
挂一个共享的 `document` keydown 监听器，Escape 触发时只分发给栈顶（最后
挂载、逻辑上最内层）的实例；该实例卸载出栈后，才轮到次栈顶（外层）响应。
`escape: false` 的实例不入栈，不受影响。`outsideClick`（`pointerdown`）
不受此问题影响，未改动——它靠真实点击位置和 DOM 包含关系判断，多个实例
各自独立判定天然正确。
