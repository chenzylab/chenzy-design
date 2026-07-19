# SPEC · VideoPlayer

> 分类：show · 阶段：M4（富媒体补齐）
> 对标 Semi：[VideoPlayer](https://semi.design/zh-CN/plus/videoPlayer) —— Semi 底层**无第三方媒体库**，纯封装原生 `<video>` + 自建控件（已从 semi-foundation 坐实：仅依赖 lodash + semi-icons + 自己的 foundation/progressFoundation）。
> 对齐原则：API 命名、prop 语义、默认值、控件项、键盘全部对齐 Semi。

## 1. 概述
基于原生 `<video>` 的视频播放器。传 `src` + `poster` 即用，控件全自建（播放/进度/音量/倍速/清晰度/线路/镜像/画中画/全屏/章节标记/字幕）。

## 2. 设计语义
- **用**：站内视频播放，需要统一控件样式与主题。
- **不用**：直播/HLS/DASH 自适应码流（Semi 也不含，需使用方自接 hls.js 等到 `src`）。

## 3. 分层实现
- **headless（core/）**：`packages/core/src/video-player/createVideoPlayer.ts`（或单文件 `video-player.ts`）——对齐 Semi `VideoPlayerFoundation`：状态（isPlaying/currentTime/totalTime/buffered/volume/muted/playbackRate/quality/route/isMirror/showControls/isError/notification）、方法（handlePlayOrPause/handleTimeChange/handleVolumeChange/handleFullscreen/handleRateChange/handleQualityChange/handleRouteChange/handleMirror/handlePictureInPicture/handleBodyKeyDown 等）。框架无关，adapter 注入 DOM 读写（getVideo/getVideoWrapper）与 notify 回调。进度条子逻辑对齐 `progressFoundation`（拖拽定位 → 时间换算）。
- **渲染（svelte/）**：破坏性对齐 Semi。`VideoPlayer.svelte` + `VideoProgress.svelte`（自建进度条镜像 Semi videoProgress.tsx：markers 多段/缓冲/已播放三层/handle/Tooltip 两行预览）+ `ErrorSvg.svelte`（错误态插画镜像 Semi ErrorSvg.tsx）。**复用 Button/Popover/Dropdown/AudioSlider + 11 具名图标**（IconPlay/Pause/Restart/Volume1/Volume2/Mute/FlipHorizontal/Maximize/Minimize/MiniPlayer/PlayCircle），**删自造 VolumeControl/ControlMenu**（改用 Popover+AudioSlider / Dropdown）。DOM 前缀 `cd-videoPlayer`（驼峰对齐 Semi semi-videoPlayer）。`<video bind:this>`，`$effect` 注册/注销原生事件（timeupdate/durationchange/progress/ended/error/canplay/waiting/stalled/leavepictureinpicture + document keydown/fullscreenchange，**绑同一函数引用——不复刻 Semi remove 无效泄漏 bug**）。销毁时清 timer + 事件。
- **照搬 Semi 缺陷**（用户决策，与 lottie/audio-player 同标准）：`clickToPlay` 为死 prop（声明未消费，onClick 无条件 handlePlayOrPause）、`next` 控件绑 play/pause（非下一集，图标 IconRestart rotate=180）、多处硬编码色（token 层照搬 controls-bg/text/popup-hover）、音量键盘调节不实现。

## 4. API（对齐 Semi，完整）
### Props
| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| src | `string` | - | 视频地址 |
| poster | `string` | - | 封面图 |
| width | `string \| number` | - | 宽 |
| height | `string \| number` | - | 高 |
| autoPlay | `boolean` | `false` | 自动播放 |
| loop | `boolean` | `false` | 循环 |
| muted | `boolean` | `false` | 静音 |
| volume | `number` | `100` | 初始音量 0–100 |
| clickToPlay | `boolean` | `true` | 点击画面播放/暂停 |
| seekTime | `number` | `10` | ←→ 快进快退秒数 |
| theme | `'dark' \| 'light'` | `'dark'` | 主题（仅背景色） |
| controlsList | `string[]` | 全部 | 展示的控件项：`['play','next','time','volume','playbackRate','quality','route','mirror','fullscreen','pictureInPicture']` |
| playbackRateList | `{label:string;value:number}[]` | 6 档默认 | 倍速列表 |
| defaultPlaybackRate | `number` | `1` | 默认倍速 |
| qualityList | `{label:string;value:string}[]` | - | 清晰度列表 |
| defaultQuality | `string` | - | 默认清晰度 |
| routeList | `{label:string;value:string}[]` | - | 线路列表 |
| defaultRoute | `string` | - | 默认线路 |
| markers | `{start:number;title:string}[]` | - | 章节标记 |
| captionsSrc | `string` | - | 字幕资源 |
| crossOrigin | `'anonymous' \| 'use-credentials'` | - | CORS |
| class / style | | - | |
### Events（对齐 Semi 回调）
| 事件 | 载荷 | 说明 |
|---|---|---|
| onPlay | `() => void` | 播放 |
| onPause | `() => void` | 暂停 |
| onQualityChange | `(quality: string) => void` | 切清晰度（使用方据此更新 src） |
| onRouteChange | `(route: string) => void` | 切线路 |
| onRateChange | `(rate: number) => void` | 切倍速 |
| onVolumeChange | `(volume: number) => void` | 调音量 |
### 其它
- `forwardRef`/暴露原生 `<video>` 元素（对齐 Semi 用 ref 多视频同步）：Svelte 侧用 `bind:videoEl` 或暴露方法。
### Slots
无（内容由 props 提供）。

## 5. 主题 / Token
**68 个 token 严格镜像 Semi videoPlayer variables.scss(63) + animation.scss(5)**（名+值对应）：命名 `--cd-{category}-videoPlayer-{part}`（Semi `$color-videoPlayer_theme_dark-bg` → `--cd-color-videoPlayer-theme-dark-bg`，`_` 段分隔映射 `-`，videoPlayer 驼峰整名保留）。值 `rgba(var(--semi-x-n),a)` → alpha=1 用 `var(--cd-color-x-n)`、alpha<1 用 color-mix；`var(--semi-color-*)` → `var(--cd-color-*)`（`--semi-color-default` 映射真实值 grey-0）；**硬编码 RGB/#fff 照搬 Semi**（controls-bg=rgba(28,31,35,.8) / controls-text=#fff / popup-hover=rgba(67,68,74,1) / handle-bg=#fff，Semi 未 token 化，照搬缺陷）。分组：Color 20 + WH 11 + Spacing 19 + Radius 5 + Font 8 + Animation 5 = 68。`theme` 只切 wrapper/error 背景色（对齐 Semi）。（禁写死其余；深浅两主题各一套色。）

> **对齐优先**：a11y 以 Semi 实际行为为基线，不改变 Semi 的交互语义。下列「增强」仅在**不偏离 Semi 行为**前提下附加（如纯 aria 标注），Semi 没有的键位默认**不**加。
- 播放器容器可聚焦（`tabindex`），键盘（焦点在容器内时）：`Space` 播放/暂停、`←/→` 跳转 `seekTime`（**严格对齐 Semi handleBodyKeyDown**）。`↑/↓` 音量 Semi 源码注释掉了 → **默认不实现**（保持对齐）；如实现须登记偏离。
- 每个控件按钮 `aria-label` 走 i18n（播放/暂停/静音/全屏/画中画/镜像…）——这是 Semi 之上的纯 aria 增强，不改行为。
- 进度条：对齐 Semi 的进度条 DOM/交互；在其上补 `role=slider` + `aria-value*`（纯标注增强，不改拖拽行为）。
- reduced-motion：控件动画降级。RTL：跟随 Semi。

## 7. 国际化
- **对齐 Semi 9 key**（通知文案/mediaError）：`VideoPlayer.{rateChange,qualityChange,routeChange,mirror,cancelMirror,loading,stall,noResource,videoError}`；`rateChange/qualityChange/routeChange` 用 `${rate}`/`${quality}`/`${route}` 插值。
- **本库无障碍必需的 aria-label 超集**（Semi 控制栏按钮无 aria-label，属 Semi 缺陷；本库补齐）：`VideoPlayer.{play,pause,mute,unmute,volume,fullscreen,exitFullscreen,pictureInPicture,progress}`。
- 移除旧超集 key（replay/playbackRate/quality/route/error/mirrorOn/mirrorOff）。文案全走 locale，不硬编码（除照搬 Semi 硬编码色的 token）。

## 8. 文案
- 控件 tooltip/aria 文案简洁，遵循 content-guidelines。

## 9. 性能（见 performance.spec.md）
### Perf Budget
| 指标 | 预算 |
|---|---|
| gzip 体积 | ≤ 9 KB（破坏性对齐 Semi 后复用 Button/Popover/Dropdown/AudioSlider + 11 具名图标，实测 7.83 KB，2026-07 校准，仍达标） |
| 运行时 | mousemove 控件显隐 throttle；timeupdate 不做重渲染，只更进度 |
- 无第三方媒体库（原生 `<video>`），主要体积是控件逻辑 + 具名图标。

## 10. AI 元数据
提供 `meta.ts`：props/events/tokens/a11y/examples。

## 11. 测试
- 单测（core）：foundation 状态机——playOrPause 切换、timeChange 边界钳制、volumeChange 钳制 0–100、rate/quality/route change 触发 notify、键盘键位。
- e2e/dom：渲染控件项按 controlsList 增删；进度条拖拽；全屏/画中画调用（jsdom 打桩）。
- a11y：axe + 键盘（Space/←→）+ 进度条 slider 语义。

## 12. 验收标准
- [ ] 分层正确 · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过
- [ ] i18n 无硬编码 · [ ] 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页完成
