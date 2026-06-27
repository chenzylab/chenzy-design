---
title: Avatar 头像
name: avatar
category: show
brief: Avatar 用于展示用户、实体或资源的视觉标识。
---

## 使用场景

Avatar 用于展示用户、实体或资源的视觉标识，支持图片、图标与文字三种内容形式，以及圆形与方形两种形状。典型使用场景包括用户信息区、评论列表、成员列表以及 AvatarGroup 多人聚合展示。

Avatar 支持在图片加载失败时自动降级为图标或文字，避免出现破图。AvatarGroup 用于批量展示多个头像，超出数量时以 +N 气泡折叠，可进一步展开查看全部成员。

## 何时使用

在需要直观标识用户身份或实体的场景中使用 Avatar，例如个人信息卡片、消息列表、协作成员列表。当需要成组展示多人时使用 AvatarGroup。不适合在需要承载大量文字信息的场景中单独使用，也不应用于主操作按钮。

## 无障碍

- 文字或图标型 Avatar 添加 `role="img"` 并设置 `aria-label` 描述内容，纯装饰型加 `aria-hidden="true"`。
- 可点击的 Avatar 使用 `role="button"` 并具备 `tabindex="0"`，支持 Enter/Space 键激活。
- AvatarGroup 根容器使用 `role="group"` 并配置 `aria-label`；+N 折叠按钮使用 `role="button"` 并设置 `aria-haspopup`。
- 组内使用 roving tabindex 管理键盘焦点，确保键盘用户可逐一访问。
