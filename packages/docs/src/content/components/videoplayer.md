---
title: VideoPlayer 视频播放器
name: videoplayer
category: plus
brief: 用于播放视频。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/video-player/01-basic.svelte';
  import basicSrc from '../../demos/video-player/01-basic.svelte?raw';
  import Controls from '../../demos/video-player/02-controls.svelte';
  import controlsSrc from '../../demos/video-player/02-controls.svelte?raw';
  import Loop from '../../demos/video-player/03-loop.svelte';
  import loopSrc from '../../demos/video-player/03-loop.svelte?raw';
  import SeekTime from '../../demos/video-player/04-seek-time.svelte';
  import seekTimeSrc from '../../demos/video-player/04-seek-time.svelte?raw';
  import PlaybackRate from '../../demos/video-player/05-playback-rate.svelte';
  import playbackRateSrc from '../../demos/video-player/05-playback-rate.svelte?raw';
  import Volume from '../../demos/video-player/06-volume.svelte';
  import volumeSrc from '../../demos/video-player/06-volume.svelte?raw';
  import Quality from '../../demos/video-player/07-quality.svelte';
  import qualitySrc from '../../demos/video-player/07-quality.svelte?raw';
  import Markers from '../../demos/video-player/08-markers.svelte';
  import markersSrc from '../../demos/video-player/08-markers.svelte?raw';
  import Theme from '../../demos/video-player/09-theme.svelte';
  import themeSrc from '../../demos/video-player/09-theme.svelte?raw';
  import RefDemo from '../../demos/video-player/10-ref.svelte';
  import refSrc from '../../demos/video-player/10-ref.svelte?raw';
  import NoResource from '../../demos/video-player/11-no-resource.svelte';
  import noResourceSrc from '../../demos/video-player/11-no-resource.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { VideoPlayer } from '@chenzy-design/svelte';
```

### 基本用法

基本使用，通过 `src` 传入视频地址，通过 `poster` 传入视频封面地址。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 设置菜单栏功能

通过 `controlsList` 设置菜单栏的展示项，该项接受值为数组，默认值为 `['play', 'next', 'time', 'volume', 'playbackRate', 'quality', 'route', 'mirror', 'fullscreen', 'pictureInPicture']`。

<DemoBox code={controlsSrc}><Controls /></DemoBox>

### 循环播放

通过 `loop` 设置循环播放。

<DemoBox code={loopSrc}><Loop /></DemoBox>

### 快进快退

通过 `seekTime` 设置快进快退时间，通过键盘左右键执行快进快退。

<DemoBox code={seekTimeSrc}><SeekTime /></DemoBox>

### 播放速率

通过 `playbackRateList` 设置速率选择列表。

<DemoBox code={playbackRateSrc}><PlaybackRate /></DemoBox>

### 音量设置

通过 `volume` 设置初始音量，值区间为 0 - 100，设置 `muted` 为 `true` 可以静音播放。

<DemoBox code={volumeSrc}><Volume /></DemoBox>

### 清晰度切换

通过 `qualityList` 设置清晰度选择列表，`defaultQuality` 设置初始选择的清晰度，`onQualityChange` 设置点击后更新的 `src` 逻辑。

线路切换同理，通过 `routeList` 设置线路选择列表，`defaultRoute` 设置初始选择的线路，`onRouteChange` 设置点击后更新的 `src` 逻辑。

<DemoBox code={qualitySrc}><Quality /></DemoBox>

### 章节标记

通过 `markers` 设置章节标记点。

<DemoBox code={markersSrc}><Markers /></DemoBox>

### 主题

通过 `theme` 设置主题，主题仅影响背景色。

<DemoBox code={themeSrc}><Theme /></DemoBox>

### 使用 ref 控制

通过 `videoRef` 获取原生 video 元素，可以实现更灵活的控制，例如多个视频同步播放/暂停。

> Semi 该 prop 名为 `forwardRef`（React ref 转发）；Svelte 无 ref 转发概念，本库改为 `videoRef` 回调，在 video 元素挂载时回传原生元素。

<DemoBox code={refSrc}><RefDemo /></DemoBox>

### 无资源态

不传 `src` 时展示无资源提示。

<DemoBox code={noResourceSrc}><NoResource /></DemoBox>

### API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| autoPlay | 是否自动播放 | boolean | false |
| captionsSrc | 字幕资源 | string | - |
| class | 类名 | string | - |
| clickToPlay | 是否启用点击以播放 | boolean | true |
| controlsList | 设置菜单栏展示控件，默认展示所有控件 | `string[]` | `['play', 'next', 'time', 'volume', 'playbackRate', 'quality', 'route', 'mirror', 'fullscreen', 'pictureInPicture']` |
| crossOrigin | 指明是否使用 CORS 来获取相关视频。允许 CORS 的资源可在 canvas 元素中被重用，而不会被污染 | `'anonymous' \| 'use-credentials'` | - |
| defaultPlaybackRate | 默认倍率 | number | 1 |
| defaultQuality | 默认视频清晰度 | string | - |
| defaultRoute | 默认线路 | string | - |
| height | 高度 | `string \| number` | - |
| loop | 是否启用循环播放 | boolean | false |
| markers | 节点标记 | `Marker[]` | - |
| muted | 是否静音播放 | boolean | false |
| onPause | 暂停回调 | `() => void` | - |
| onPlay | 播放回调 | `() => void` | - |
| onQualityChange | 切换清晰度回调 | `(quality: string) => void` | - |
| onRateChange | 切换速率回调 | `(rate: number) => void` | - |
| onRouteChange | 切换线路回调 | `(route: string) => void` | - |
| onVolumeChange | 调整音量回调 | `(volume: number) => void` | - |
| playbackRateList | 速率列表，默认展示 6 种播放速率，分别为 0.5、0.75、1.0、1.25、1.5 和 2.0 | `Array<{ label: string; value: number }>` | - |
| poster | 封面图 | string | - |
| qualityList | 清晰度列表 | `Array<{ label: string; value: string }>` | - |
| routeList | 线路列表 | `Array<{ label: string; value: string }>` | - |
| seekTime | 快进快退时间 | number | 10 |
| src | 视频播放地址 | string | - |
| style | 样式 | string | - |
| theme | 主题设置，不同主题组件的背景色不同 | `'dark' \| 'light'` | `dark` |
| videoRef | 原生 video 元素挂载时回传（对应 Semi 的 `forwardRef`） | `(el: HTMLVideoElement) => void` | - |
| volume | 默认音量 | number | 100 |
| width | 宽度 | `string \| number` | - |

#### Marker

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| start | 起始时间点 | number | - |
| title | 标题 | string | - |
