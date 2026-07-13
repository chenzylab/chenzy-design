---
name: overlay-inheritance-chain-tooltip-popover-popconfirm
description: Semi 浮层三件套是继承链 Tooltip←Popover←Popconfirm，对齐时必须让 Popover 封装 Tooltip、Popconfirm 封装 Popover，勿各自造轮子
metadata:
  type: project
---

Semi Design 的浮层三件套是**继承链**，不是三个独立组件：
- `Popover extends Tooltip`（`content={renderPopCard}` 复用 Tooltip 全部定位/触发/焦点/dismiss/12方位/箭头基建）
- `Popconfirm` 底层基于 Tooltip/Popover 封装（渲染 title/content/icon/双按钮的卡片）

**对齐 Semi 时必须复刻这条链**：让 Popover 封装我们的 Tooltip、Popconfirm 封装 Popover，而不是每个组件各自 new floating/useDismiss/useFocusTrap。否则改一处（spacing/12方位/SVG箭头/condition）要在三个组件里各做一遍，返工三次。

关键落点（本仓库 packages/svelte/src）：
- Tooltip 是唯一浮层基座：`position` 用 Semi 12 方位命名（tooltip/placement.ts 映射到 core 的 side+align Placement）、`spacing`/`margin`/`condition`/`clickToHide`/`keepDOM`/`onVisibleChange`/`onClickOutSide`/`rePosKey`、`role` prop（tooltip/dialog）+ focus-trap（guardFocus 随 dialog）。
- 箭头是 **SVG 双 path**（外层 border 色 + 内层 bg 色，vertical 24×7 / horizontal 7×24），非 CSS 方块旋转；对齐 Semi TriangleArrow。`arrowStyle{borderColor,backgroundColor,borderOpacity}` 定制。
- Popover 复用 Tooltip：传 `role=dialog`(click/custom)/`tooltip`(hover)、`content` snippet 渲染 `.cd-popover` light 卡片（bg 对齐 Semi bg-3，**非** bg-0）、缺省 `arrowStyle` 给 popover 箭头色（带边框）。用 `.cd-popover-host` class 把 Tooltip 的 dark 卡面重置透明。
- Semi Tooltip **无** theme/status/maxWidth；Semi Popover **无** size/关闭按钮/footer/ok-cancel（那些属 Popconfirm）。对齐时这些越界 prop/token 全删。

参考 [[typecheck-must-be-recursive-not-single-pkg]]（改公开类型后跑根级递归 typecheck）、[[verify-in-real-browser-not-just-static]]（浮层交互/箭头必真机肉眼验）。
