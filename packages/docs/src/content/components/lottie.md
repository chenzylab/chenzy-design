---
title: Lottie 动画
name: lottie
category: other
brief: 在网页中展示 Lottie 动画，内部基于 lottie-web 渲染。
---

## 使用场景

`Lottie` 组件能够便捷简单地渲染 Lottie 动画，同时提供方式获取到全局 Lottie 和动画实例满足更广泛的配置需求。内部基于 [`lottie-web`](https://github.com/airbnb/lottie-web) 渲染 Lottie 动画。

相较于直接使用 `lottie-web`，使用 Lottie 组件的优势在于：

- 无需关心动画容器的创建与销毁
- 无需关心动画本身的生命周期
- 更易和框架项目结合使用

## Params 常用参数

`params` 会被组件传入 `lottie-web` 的 `lottie.loadAnimation`，可参考 [lottie-web 文档](https://github.com/airbnb/lottie-web?tab=readme-ov-file#usage)。常用参数：

- `container`：渲染容器，不传则由 Lottie 组件自动配置并生成
- `renderer`：渲染方式，默认 `svg`
- `loop`：是否开启循环，默认 `true`
- `autoplay`：是否自动播放，默认 `true`；设为 `false` 时需通过动画实例上的 `play` 方法手动播放
- `path`：动画 JSON 文件的 URL 路径（与 `animationData` 互斥）
- `animationData`：动画的 JSON 对象（与 `path` 互斥）

## 获取动画实例与全局 Lottie

- `getAnimationInstance` 获取当前播放的 `AnimationItem` 实例，实例上含许多方法用于调整动画的各项参数（播放暂停、获取当前帧序号、调整播放速度等）
- `getLottie` prop 或具名导出 `getLottie()` 获取全局 lottie 包（含 `setQuality` 等全局方法）

具体方法请参考 [lottie-web 文档](https://github.com/airbnb/lottie-web?tab=readme-ov-file#usage)。

## 无障碍

- `Lottie` 为纯动画展示容器，本身无内建 `role` / `aria` 语义；由动画传达的状态（如"成功"）须由外部文本或静态图标同时表达，屏幕阅读器用户不依赖动画
- 自动循环动画不应有强闪烁（≤ 3 次/秒），规避光敏性 WCAG 2.3.1
- 尊重用户 `prefers-reduced-motion: reduce` 偏好时，可通过 `params.autoplay=false` 关闭自动播放
