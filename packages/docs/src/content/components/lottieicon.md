---
title: LottieIcon 动画图标
name: lottieicon
category: other
brief: 用于在界面中渲染基于 Lottie（Bodymovin JSON）的矢量动画图标，典型场景为导航菜单 hover/active 时的微动效、加载/成功/失败状态反馈、空状态插画级图标、引导高亮。
---

## 使用场景

`LottieIcon` 用于在界面中渲染基于 Lottie（Bodymovin JSON）的矢量动画图标，典型场景为：导航菜单 hover/active 时的微动效、加载/成功/失败状态反馈、空状态插画级图标、引导高亮。它是 `Icon` 的动态扩展：静态图标用 `Icon`，需要播放/暂停/循环/方向控制的图标用 `LottieIcon`。

核心能力：
- 接受 Lottie JSON 数据（`data`）或远程地址（`src`，惰性 fetch + 缓存）
- 播放控制：`autoplay` / `loop` / `speed` / `direction`，命令式 `play()/pause()/stop()/seek()`
- 触发模式 `trigger`：`auto`（挂载即按 autoplay）、`hover`、`click`、`visible`（进入视口播放）、`manual`（仅命令式）
- 段播放 `segments`（指定帧区间），用于把"待机/激活/退出"塞进同一份 JSON
- 尺寸与色彩：`size` 映射到字号体系；`color` 通过 CSS 变量注入到可着色图层
- 关键降级：尊重 `prefers-reduced-motion: reduce` 时不播放动画，渲染首帧或指定的 `staticFrame` 静态画面

不在范围内：通用 SVG 图标集（用 `Icon`）、视频/GIF 播放（用媒体组件）、复杂时间线编排（交由业务层用命令式 API 自行编排）。

## 何时使用

- 导航菜单/选项卡需要 hover 或选中时呈现微动效，强化交互反馈
- 加载、成功、失败等过渡状态需要动态图标配合文案说明
- 空状态页面需要带动画的插画级图标提升趣味性
- 引导气泡/新手任务中需要动态高亮某个功能区域

动效语义注意：动画为"强化反馈"而非"承载信息"——任何由动画传达的状态必须有非动画的等价表达（文本/静态图标/颜色），保证 reduced-motion 下信息不丢失。

## 无障碍

- 装饰性图标（`decorative=true`，默认）根节点 `aria-hidden="true"`，对辅助技术完全隐藏
- 功能性图标（`decorative=false`）必须提供 `label`，根节点添加 `role="img"` + `aria-label`
- 尊重 `prefers-reduced-motion: reduce`：不自动播放、不循环，渲染 staticFrame 或 reducedStatic slot 内容；系统设置变化实时生效并发 `on:reducedMotionChange`
- 自动循环动画不应有强闪烁（≤ 3 次/秒），规避光敏性 WCAG 2.3.1
- 功能性图标关键轮廓与背景对比度 ≥ 3:1（非文本对比 1.4.11）
- 组件自身不可聚焦（非交互控件），不绑定 tabindex；`trigger='hover'/'click'` 仅为视觉强化，真正的可点击行为应由外层 Button/链接承担并提供键盘可达性
- 动画承载的状态（如"成功"）须由 label/外部文本同时表达，屏幕阅读器用户不依赖动画
- RTL：`flipRtl=true` 时对方向性图标做水平镜像（`transform: scaleX(-1)`）
