# SPEC · AudioPlayer

> 分类：show · 阶段：M4（富媒体补齐）
> 对标 Semi：[AudioPlayer](https://semi.design/zh-CN/plus/audioPlayer) —— Semi 底层**无第三方媒体库**，纯封装原生 `<audio>` + 自建工具栏（已从 semi-foundation 坐实：仅依赖 lodash + semi-icons + 自己的 foundation）。
> **最高约束：一切以 Semi 实现为准**。API 命名、prop 语义、默认值、工具栏项、主题、DOM/class 命名严格对齐 Semi，不擅自增删或改语义。Semi 没有的行为默认不加；如加须在本 spec 登记偏离。

## 1. 概述
基于原生 `<audio>` 的音频播放器。传 `audioUrl` 即用；支持单曲/列表、封面、标题、工具栏（播放/上下曲/进度/时间/倍速/音量/跳转/刷新）。

## 2. 设计语义
- **用**：站内音频播放、播客、音频列表。
- **不用**：需要波形可视化/剪辑 → 超出范围（Semi 也不含）。

## 3. 分层实现
- **headless（core/）**：`packages/core/src/audio-player.ts` —— 对齐 Semi `AudioPlayerFoundation`：状态（isPlaying/currentTime/totalTime/volume/playbackRate/currentTrackIndex/isError）、方法（handleStatusClick 播放暂停、handleTimeUpdate、handleTrackChange 'next'|'prev'、handleTimeChange、handleSpeedChange、handleSeek(direction) 按 skipDuration 跳转、handleRefresh 重播、handleVolumeChange、resetAudioState、initAudioState、endHandler、errorHandler）。框架无关，adapter 注入 `<audio>` 读写。**严格照 Semi 方法签名与行为**。
- **渲染（svelte/）**：`AudioPlayer.svelte` + `AudioSlider.svelte`（自建滑块，镜像 Semi audioSlider.tsx，不复用通用 Slider）。DOM 单行布局镜像 Semi：`.cd-audio-player.-{theme}` > `<audio>` + control(播放/上下曲) + info-container(封面/标题/进度) + control(工具栏)。复用 `Button/Dropdown/Popover/Tooltip/Image` + 具名图标（IconPlay/Pause/Backward/FastForward/Restart/Refresh/Volume2/VolumnSilent/AlertCircle）。`<audio bind:this>`，`$effect` 注册原生事件（timeupdate/ended/error/loadedmetadata），销毁时注销。`audioUrl` 归一：`string | string[] | AudioInfo | AudioInfo[]`（对齐 Semi），多曲显示上/下曲。
- **对齐 Semi 关键行为**：`handleTrackChange` 取模**循环**（`(i±1+len)%len`，末曲 next 绕回首曲，非无环绕）；`endHandler` 数组时无条件切下一曲（循环连播）；切曲自动播放（`resetAudioState`：isPlaying=true/currentTime=0/rate=1x）；`handleRefresh` 无错误时仅 currentTime 归零（不自动播放），错误时 `audio.load()` 重载；静音 `handleVolumeSilent` 切换 0↔50%（**照搬 Semi 缺陷**，不记忆原音量）。rateOptions 5 档硬编码（0.5/0.75/1.0/1.5/2.0，无 prop 可配，对齐 Semi）。

## 4. API（对齐 Semi，完整）
### Props
| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| audioUrl | `string \| string[] \| AudioInfo \| AudioInfo[]` | - | 音频地址（对齐 Semi 四种形态） |
| autoPlay | `boolean` | `false` | 自动播放 |
| theme | `'dark' \| 'light'` | `'dark'` | 主题 |
| showToolbar | `boolean` | `true` | 是否显示工具栏 |
| skipDuration | `number` | `10` | 跳转秒数 |
| class / style | | - | |
### AudioInfo（对齐 Semi）
| 名称 | 类型 | 说明 |
|---|---|---|
| src | `string` | 音频地址 |
| title | `string` | 标题 |
| cover | `string` | 封面图 |
### Events
> Semi 文档 API 表未列 onChange 类回调（以受控/内部状态为主）。**对齐 Semi：不擅自新增事件**；如内部需要暴露播放状态，仅在确有对齐依据时加，并登记。
### Slots
无。

## 5. 主题 / Token
**40 个 token 严格镜像 Semi `variables.scss`**（名+值对应）：命名 `--cd-{category}-audio-player-{part}`（如 `--cd-color-audio-player-background`）；值 `rgba(var(--semi-x-n),a)` → alpha=1 用 `var(--cd-color-x-n)`、alpha<1 用 `color-mix`；`var(--semi-color-*)` → `var(--cd-color-*)`（`--semi-color-default` 无对应，映射到其真实值 `--cd-color-grey-0`）；字面量原样。深/浅双主题各一套色值（Semi `-light` 后缀区分）。分组：dark 色 5 + light 色 4 + 字号 1 + gap 3 + 尺寸 9 + 圆角 3 + 小字号/行高 2 + slider 尺寸 2 + 其它色 6 + 补充色 5 = 40。（禁写死；`--cd-` 中间层是本库惯例，值一一映射 Semi。）

## 6. 无障碍（见 a11y.spec.md）
> 对齐优先：以 Semi 行为为基线，仅附加不改行为的纯 aria 标注。
- 工具栏各按钮 `aria-label` 走 i18n（播放/暂停/上一曲/下一曲/快进/快退/刷新/静音…）。
- 进度条对齐 Semi 交互，补 `role=slider` + `aria-value*`（纯标注）。
- 播放/错误状态用 live region 播报（若 Semi 无对应播报，作为不改行为的增强）。
- reduced-motion / RTL：跟随 Semi。

## 7. 国际化
- i18n key（对齐 Semi 7 key + 本库 slider a11y 必需的 progress）：`AudioPlayer.{backward,forward,prev,next,loop,volume,mediaError,progress}`。文案对齐 Semi 措辞（prev='上一首'/next='下一首'/backward='后退 {seconds} 秒'/forward='前进 {seconds} 秒'/loop='循环播放'）。`loop` 定义以对齐 Semi API 但当前无 UI；`mediaError` 定义但组件照搬 Semi 硬编码文案未引用。移除旧超集 key（play/pause/refresh/speed/loading/error——现靠 Tooltip + 具名图标承载）。

## 8. 文案
- 工具栏 aria/tooltip 文案遵循 content-guidelines。

## 9. 性能（见 performance.spec.md）
### Perf Budget
| 指标 | 预算 |
|---|---|
| gzip 体积 | ≤ 5.5 KB（破坏性对齐 Semi 后复用 Button/Dropdown/Popover/Tooltip/Image + 自建 slider，实测 5.14 KB，2026-07 校准） |
| 运行时 | timeupdate 只更进度，不重渲染 |
- 无第三方媒体库（原生 `<audio>`）。

## 10. AI 元数据
提供 `meta.ts`：props/tokens/a11y/examples。

## 11. 测试
- 单测（core）：foundation——statusClick 播放/暂停、trackChange 上下曲边界、timeChange/seek 钳制、speedChange、refresh 重播、volumeChange 钳制、audioUrl 四形态归一。
- e2e/dom：渲染工具栏（showToolbar 开关）；多曲显示上下曲；封面/标题渲染。
- a11y：axe + 工具栏 aria-label + 进度 slider 语义。

## 12. 验收标准
- [ ] 分层正确 · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过
- [ ] i18n 无硬编码 · [ ] 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页完成
