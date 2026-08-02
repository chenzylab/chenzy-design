---
title: AudioPlayer 音频播放器
name: audioplayer
category: plus
brief: 用于播放音频
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/audio-player/01-basic.svelte';
  import basicSrc from '../../demos/audio-player/01-basic.svelte?raw';
  import HideToolbar from '../../demos/audio-player/02-hide-toolbar.svelte';
  import hideToolbarSrc from '../../demos/audio-player/02-hide-toolbar.svelte?raw';
  import Theme from '../../demos/audio-player/03-theme.svelte';
  import themeSrc from '../../demos/audio-player/03-theme.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { AudioPlayer } from '@chenzy-design/svelte';
```

### 基本用法

基本使用，通过 `audioUrl` 传入音频地址。
audioUrl 可以传入字符串，字符串数组，对象，对象数组，具体参数参考 [AudioPlayer](#audioplayer)

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 隐藏工具栏

showToolbar 设置为 false，则隐藏工具栏

<DemoBox code={hideToolbarSrc}><HideToolbar /></DemoBox>

### 主题

通过 `theme` 设置音频播放器主题，支持 `light` 和 `dark`，默认 `dark`

<DemoBox code={themeSrc}><Theme /></DemoBox>

## API 参考

### AudioPlayer

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| audioUrl | 音频地址 | `string \| string[] \| AudioInfo \| AudioInfo[]` | - |
| autoPlay | 自动播放 | boolean | false |
| class | 类名 | string | - |
| showToolbar | 是否显示工具栏 | boolean | true |
| skipDuration | 跳转时间 | number | 10 |
| style | 内联样式 | string | - |
| theme | 主题，可选值：`dark` 和 `light` | string | `dark` |

### AudioInfo

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| cover | 封面图片 | string | - |
| src | 音频地址 | string | - |
| title | 音频标题 | string | - |
