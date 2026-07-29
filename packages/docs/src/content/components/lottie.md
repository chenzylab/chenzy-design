---
title: Lottie 动画
name: lottie
category: other
brief: 在网页中展示 Lottie 动画。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/lottie/01-basic.svelte';
  import basicSrc from '../../demos/lottie/01-basic.svelte?raw';
  import AnimationData from '../../demos/lottie/02-animation-data.svelte';
  import animationDataSrc from '../../demos/lottie/02-animation-data.svelte?raw';
  import AnimationInstance from '../../demos/lottie/03-animation-instance.svelte';
  import animationInstanceSrc from '../../demos/lottie/03-animation-instance.svelte?raw';
  import GetLottie from '../../demos/lottie/04-get-lottie.svelte';
  import getLottieSrc from '../../demos/lottie/04-get-lottie.svelte?raw';
</script>

## 使用场景

Lottie 组件能够便捷简单地渲染 Lottie 动画，同时提供方式获取到全局 Lottie 和 动画实例满足更广泛的配置需求。内部基于 `lottie-web` 渲染 Lottie 动画。
相较于直接使用 `lottie-web`，使用 Lottie 组件的优势在于

- 无需关心动画容器的创建与销毁
- 无需关心动画本身的生命周期
- 更易和框架项目结合使用

## 代码演示

### 如何引入

```jsx
import { Lottie } from '@chenzy-design/svelte';
```

### 基本用法

**当 Lottie 动画资源 JSON 在 CDN 上时**

向 `params` props 里传入 path= 你的 lottie json 的 URL 即可

<DemoBox code={basicSrc}><Basic /></DemoBox>

**当 Lottie 动画资源 JSON 需要被打包到网站代码中时**

向 `params` props 里传入 animationData= 你的 lottie json 对象即可 (下方 Demo 请求 JSON 是仅作为演示，实际项目中 json 应当被手动 import，而不是通过网络请求获取，这样 JSON 动画资源才会被打包进网站代码)

<DemoBox code={animationDataSrc}><AnimationData /></DemoBox>

### Params 其他常用参数

`params` 会被组件传入 `lottie-web` 的 `lottie.loadAnimation` 中，可以参考 `lottie-web` [文档](https://github.com/airbnb/lottie-web?tab=readme-ov-file#usage)

常用参数

```json
//params
{
    container: element, // 渲染容器，不传则由 Lottie 组件自动配置并生成
    renderer: 'svg', // 渲染方式， 默认 SVG
    loop: true, // 是否开启循环，默认 true
    autoplay: true, // 是否自动播放，默认 true，设置为 false 时需要通过动画实例上的 play 方法手动播放
    path: 'data.json' // 动画 JSON 文件的 URL 路径 （与 animationData 互斥）
    animationData: {/*...*/} // 动画的 JSON 对象 （与 path 互斥）
    /*...*/
}
```

### 获取当前动画实例

使用 `getAnimationInstance` 获取当前播放的动画的 animation 实例，实例上含有许多方法用于调整动画的各项参数，例如播放暂停，获取当前帧序号，调整播放速度等。

关于动画实例上含有的方法，更多信息可以参考 `lottie-web` [文档](https://github.com/airbnb/lottie-web?tab=readme-ov-file#usage)

<DemoBox code={animationInstanceSrc}><AnimationInstance /></DemoBox>

### 获取全局 Lottie

使用 `getLottie` Props 获取全局 lottie，也可以使用具名导出 `getLottie` 来获取全局 lottie。

> Semi 通过组件静态方法 `Lottie.getLottie` 获取全局 lottie；Svelte 组件无法挂载静态方法，本库等价能力以具名导出 `getLottie()` 提供（返回 `Promise`，内部动态 import `lottie-web`）。

关于全局 lottie 上含有的方法，更多信息可以参考 `lottie-web` [文档](https://github.com/airbnb/lottie-web?tab=readme-ov-file#usage)

<DemoBox code={getLottieSrc}><GetLottie /></DemoBox>

### API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| getAnimationInstance | 获取当前动画 AnimationItem | (animation: AnimationItem \| null) => void | - |
| getLottie | 获取全局 Lottie | (lottie: LottiePlayer) => void | - |
| height | 容器高度（`params.container` 存在时不生效） | string | - |
| params | 用于配置动画相关参数 | 同 lottie-web lottie.loadAnimation 入参 | - |
| style | 样式 | string | - |
| width | 容器宽度（`params.container` 存在时不生效） | string | - |

### 具名导出

| 名称 | 说明 | 类型 |
| --- | --- | --- |
| getLottie | 获取全局 lottie 包（含 `setQuality` 等全局方法） | `() => Promise<LottiePlayer>` |

## 无障碍

- `Lottie` 为纯动画展示容器，本身无内建 `role` / `aria` 语义；由动画传达的状态（如"成功"）须由外部文本或静态图标同时表达，屏幕阅读器用户不依赖动画
- 自动循环动画不应有强闪烁（≤ 3 次/秒），规避光敏性 WCAG 2.3.1
- 尊重用户 `prefers-reduced-motion: reduce` 偏好时，可通过 `params.autoplay=false` 关闭自动播放
