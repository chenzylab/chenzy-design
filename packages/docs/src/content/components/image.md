---
title: Image 图片
name: image
category: show
brief: Image 是增强型图片展示组件，用于展示和预览图片。
---

## 使用场景

Image 是增强型图片展示组件，用于替代原生 `<img>` 标签。在原生图片基础上，提供加载占位、加载失败降级、渐进加载、点击放大预览（lightbox）等能力。适合产品图片展示、内容配图、用户上传图片预览、图片画廊等场景。

单图点击进入全屏预览；`ImagePreview` 包裹多个 `Image` 可实现多图联动预览，也可脱离 `Image` 独立通过 `src` + `visible` 编程式调用。预览模式下支持缩放（滚轮以指针为锚点、拖动缩放条、加减号按钮）、旋转、原始尺寸↔适应页面切换、下载、超出容器时拖拽平移、左右切换、无限循环，并可通过 `renderHeader` / `renderPreviewMenu` / `renderCloseIcon` 等自定义顶部、底部与图标。

## 何时使用

在需要展示图片并可能需要用户放大查看细节的场景中使用 Image。相比原生 `<img>`，Image 提供了更完善的加载状态管理、预览交互与无障碍支持。如果只需要展示纯装饰图（不需要可访问名称），使用原生 `<img alt="">` 即可。

## 无障碍

- 所有图片应提供 `alt`；纯装饰图使用 `alt=""`，内容图使用描述性文案。
- 预览浮层使用 `role="dialog"` + `aria-modal="true"`，portal 到 `getPopupContainer`（默认 body），通过 `useFocusTrap` 将焦点限制在弹层内循环，`useScrollLock` 锁定背景滚动。
- 预览键盘交互：Esc 关闭，←/→ 切换上一张/下一张（到边界隐藏切换按钮，`infinite` 时循环）；关闭后焦点归还触发元素。
- 关闭按钮为原生 `button`，带 `aria-label`；翻页经 LiveAnnouncer polite 播报「第 m 张，共 n 张」。
