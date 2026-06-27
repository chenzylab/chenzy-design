---
title: Upload 上传
name: upload
category: input
brief: Upload 用于将本地文件上传至服务端，支持点击选择与拖拽两种触发方式，提供上传列表、进度反馈、单文件/批量校验与重试能力。
---

## 使用场景

Upload 用于将本地文件上传至服务端，支持点击选择与拖拽两种触发方式，提供上传列表、进度反馈、单文件/批量校验与重试能力。它是表单密集场景（资料提交、附件、头像、图片墙）的核心输入组件。

核心场景：
- 单文件 / 多文件上传，受控或非受控管理文件列表。
- 拖拽区域（drag-and-drop），支持目录拖入（`directory`）与拖拽区高亮态。
- 上传进度（确定进度条 + 不确定 indeterminate）、成功 / 失败 / 上传中 / 校验失败状态。
- 文件预上传校验（类型 `accept`、大小、数量上限、自定义 `beforeUpload`），校验失败进入 error 列表项而非静默丢弃。
- 列表形态：默认列表 `list` / 图片墙 `picture` / 头像 `avatar` / 自定义渲染。
- 重试、删除、预览、暂停（基于可中断的请求实现）。

非目标：不内置文件分片/断点续传协议（通过 `customRequest` 暴露给业务实现）；不内置裁剪（由独立 ImageCrop 组件组合）。

## 何时使用

- 需要用户上传文件至服务端时使用，支持点击选择与拖拽两种方式。
- 需要展示上传进度、成功/失败状态、支持重试时使用。
- 文件分片/断点续传等复杂协议需通过 `customRequest` 自行实现。

## 无障碍

- 触发区渲染为原生 `<button>`（或 `role="button"`），`aria-disabled` 反映 `disabled`；拖拽区提供等效的点击选择路径（拖拽不是唯一手段）。
- 文件列表使用 `<ul role="list">`，每项 `role="listitem"`；删除/重试/预览为带 `aria-label`（含文件名）的按钮，如「移除 报表.xlsx」。
- 进度条使用 `role="progressbar"` 配合 `aria-valuenow/valuemin/valuemax`；通过 `useLiveAnnouncer`（polite）播报上传进度与结果。
- 键盘：Tab 进入触发区与各操作按钮，Enter/Space 触发文件选择；移除某项后焦点移至相邻项或触发区；内置预览浮层使用 `useFocusTrap` + `useDismiss`（Esc 关闭归还焦点）。
