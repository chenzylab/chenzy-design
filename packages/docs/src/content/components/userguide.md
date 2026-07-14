---
title: UserGuide 用户引导
name: userguide
category: show
brief: 用于页面对新用户进行功能引导。支持 popup 气泡逐个高亮目标元素（spotlight 聚光）与 modal 居中图文引导两种模式，内置遮罩、聚光挖孔、步进控制与进度指示。
---

## 使用场景

UserGuide（用户引导）用于**在首次进入或功能上线时，分步骤引导用户熟悉界面与关键操作**。它按顺序聚焦一组目标元素，逐个呈现标题、描述与可选封面，帮助用户建立对界面的心智模型。典型场景：新用户 onboarding、复杂表单/工作台首访引导、新功能发布的图文介绍。

核心能力：

- **两种模式**：`popup` 气泡模式围绕目标元素定位并用聚光（spotlight）挖孔高亮；`modal` 居中弹窗模式适合图文并茂的整体介绍。
- **聚光高亮**：popup 模式下在遮罩上按目标元素轮廓挖孔，`spotlightPadding` 控制留白，让焦点区域自然凸显。
- **步进控制**：内置上一步 / 下一步 / 跳过 / 完成按钮，`showPrevButton`、`showSkipButton`、`finishText` 可裁剪，`nextButtonProps` / `prevButtonProps` 可定制按钮外观。
- **受控 / 非受控**：不传 `current` 时组件自管步骤；传入 `current` 即进入受控模式，须配合 `onChange` 写回，便于与外部状态或埋点联动。
- **进度指示**：popup 模式在底部渲染 `当前步 / 总步数` 文本，modal 模式（含封面时）底部渲染步骤指示点，用户可感知总进度。
- **主题与定位**：`theme`（default / primary）、`position`（12 种方位）、`mask`、`zIndex`、`getPopupContainer` 均可配置，逐步骤亦可覆盖 `position` / `theme` / `spotlightPadding` / `showArrow`。

## 何时使用

- 首次进入某个界面、需要按顺序讲解多个功能点时。
- 新功能上线，需要图文并茂地向用户说明变化时（用 modal 模式 + `cover`）。
- 需要把用户注意力精确聚焦到某个控件、屏蔽其余干扰时（用 popup + 遮罩聚光）。

## 何时不用

- 单个控件的即时说明 → 用 Tooltip / Popover 悬浮提示即可，无需分步流程。
- 持久可查的操作手册 / 帮助文档 → 用独立文档页或 SideSheet，引导流程强调「一次性、按序」，不适合反复查阅。
- 需要用户输入或做出选择的多步流程 → 那是分步表单（Steps + Form），UserGuide 只做只读讲解。

## 无障碍

严格对齐 Semi 的引导实现：

- **气泡对话框语义**：popup 复用 Popover（`trigger="custom"`），浮层以对话框语义暴露，触发锚点承载可访问名。
- **聚光挖孔可交互**：spotlight 高亮区通过四块透明矩形让出指针事件，用户仍可点击被高亮的目标元素（「点这里」场景）。
- **步进控制**：上一步 / 下一步 / 跳过 / 完成均为标准 Button，可键盘聚焦与激活。
- **对比度**：气泡文字、按钮与背景对比度 ≥ 4.5:1；聚光挖孔不依赖颜色单独传达焦点。
- **reduced-motion**：`prefers-reduced-motion` 下移除 spotlight 移动过渡。
