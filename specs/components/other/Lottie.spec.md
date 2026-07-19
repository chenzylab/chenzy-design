# SPEC · Lottie
> 分类：other · 阶段：M6
> 对标 Semi：Lottie（`@douyinfe/semi-ui` Plus 组件，内部基于 `lottie-web` 渲染动画）

## 1. 概述

`Lottie` 用于在网页中展示 Lottie 动画，内部基于 [`lottie-web`](https://github.com/airbnb/lottie-web) 渲染。严格对齐 Semi Lottie：极简容器组件，不提供播放控制 prop，全部通过 `getAnimationInstance` 拿到的 `AnimationItem` 实例进行控制。

相较于直接使用 `lottie-web`，使用 Lottie 组件的优势在于：
- 无需关心动画容器的创建与销毁
- 无需关心动画本身的生命周期
- 更易和框架项目结合使用

不在范围内：通用 SVG 图标（用 `Icon`）、视频/GIF 播放（用媒体组件）。播放控制（play/pause/setSpeed/goToAndStop 等）交由 `getAnimationInstance` 拿到的实例处理，组件本身不封装。

## 2. API（严格对齐 Semi）

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| params | 用于配置动画相关参数，透传 `lottie.loadAnimation`（path / animationData / renderer / loop / autoplay / container 等） | `LottieParams`（同 lottie-web loadAnimation 入参） | **必填** |
| width | 容器宽度（作用于根 div，如 `"300px"`）；`params.container` 存在时不生效 | `string` | - |
| height | 容器高度（作用于根 div，如 `"300px"`）；`params.container` 存在时不生效 | `string` | - |
| getAnimationInstance | 获取当前动画 `AnimationItem` 实例 | `(animation: AnimationItem \| null) => void` | - |
| getLottie | 获取全局 lottie 包 | `(lottie: LottiePlayer) => void` | - |
| class | 根节点类名 | `string` | - |
| style | 根节点内联样式 | `CSSProperties` / `string` | - |

**静态能力**：具名导出 `getLottie()`（异步函数）返回全局 lottie 包。对齐 Semi 的 `Lottie.getLottie` 静态方法——Svelte 组件无法挂静态方法，故以具名导出提供。

**params 默认值**（loadAnimation）：`renderer: 'svg'` / `loop: true` / `autoplay: true` / `container` 缺省时用组件自管的 div；用户 params 覆盖这些默认。

## 3. 分层实现

- **core**：无。Semi foundation（`semi-foundation/lottie/foundation.ts`）极简且强依赖 `lottie-web`（浏览器），无跨框架复用价值，逻辑内联于 Svelte 层。
- **svelte**：`Lottie.svelte` 单文件。`<script module>` 导出 `getLottie()` 与 `LottieParams` 类型。
  - mount：动态 `import('lottie-web')` → `loadAnimation(loadParams)`，回调 `getAnimationInstance(animation)` + `getLottie(lottie)`
  - params 变（JSON 深比较）：`destroy` 旧实例 → 重新 `loadAnimation` → 回调 `getAnimationInstance`
  - unmount：`destroy`
  - `params.container` 存在 → 渲染 null（用户自管容器）；否则渲染 `<div class="cd-lottie">`
- **tokens**：无。严格对齐 Semi（Semi 仅一个无样式的 `.semi-lottie` class）。
- **locale**：无 i18n 文案。

## 4. DOM 与 SSR

- DOM：`params.container` 缺省时 `<div class="cd-lottie" style="width;height;style">`；`lottie-web` 往容器内注入 svg/canvas。
- SSR：`lottie-web` 依赖 `window`，动态 `import` + `onMount` 加载；服务端只渲染空容器 div，无动画（水合后加载）。

## 5. 无障碍

- `Lottie` 为纯动画展示容器，无内建 role/aria（对齐 Semi）；无障碍名由使用方按场景在容器上补充。
- 由动画传达的状态须由外部文本/静态图标同时表达（reduced-motion 下信息不丢失）。
- 自动循环动画不应有强闪烁（≤ 3 次/秒），规避光敏性 WCAG 2.3.1。
- 尊重 `prefers-reduced-motion: reduce` 时可通过 `params.autoplay=false` 关闭自动播放。

## 6. Demo（对齐 Semi 文档 4 例）

1. 基本用法（path）：`params={{ path: jsonURL }}`
2. animationData 用法：`params={{ animationData: data }}`（打包进代码）
3. 获取当前动画实例：`getAnimationInstance`
4. 获取全局 Lottie：`getLottie` prop / 具名导出 `getLottie()`
