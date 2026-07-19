/**
 * Machine-readable component metadata for AI/docs consumption.
 * VideoPlayer — aligned to Semi Design VideoPlayer (native <video>, no media lib).
 */
export const meta = {
  name: 'VideoPlayer',
  category: 'plus',
  description:
    '视频播放器：原生 <video> + 框架无关状态机（@chenzy-design/core），无第三方媒体库，严格对齐 Semi VideoPlayer。DOM 镜像 Semi（cd-videoPlayer 驼峰前缀：wrapper/video + poster img + 中央播放键 IconPlayCircle + ErrorSvg 插画 + notification + controls(VideoProgress + menu-left/right)）。复用 Button/Popover/Dropdown/AudioSlider + 11 具名图标。支持播放/暂停、进度拖拽跳转（含章节 markers 多段+缓冲/已播放双层+hover 放大+Tooltip 预览）、音量（Popover 竖向 AudioSlider，0–100 静音派生 0↔50）、倍率/清晰度/线路 Dropdown 切换（切后回跳原播放位置）、镜像、画中画、全屏、瞬时通知。controlsList 控制控件增删，theme 仅切换容器背景。键盘：Space 播放/暂停、←/→ 按 seekTime 跳转（焦点在播放器内时）。照搬 Semi 缺陷：clickToPlay 死 prop、next 控件绑 play/pause、硬编码色、音量键盘不实现；不复刻 Semi keydown 泄漏 bug。',
  exports: ['VideoPlayer'],
  props: [
    { name: 'src', type: 'string', default: 'undefined', desc: '视频播放地址' },
    { name: 'poster', type: 'string', default: 'undefined', desc: '封面图地址' },
    { name: 'captionsSrc', type: 'string', default: 'undefined', desc: '字幕/captions 轨道地址' },
    { name: 'width', type: 'number|string', default: 'undefined', desc: '容器宽，number 视为 px' },
    { name: 'height', type: 'number|string', default: 'undefined', desc: '容器高，number 视为 px' },
    { name: 'autoPlay', type: 'boolean', default: 'false', desc: '是否自动播放' },
    { name: 'loop', type: 'boolean', default: 'false', desc: '是否循环播放' },
    { name: 'muted', type: 'boolean', default: 'false', desc: '是否静音播放（初始）' },
    { name: 'clickToPlay', type: 'boolean', default: 'true', desc: '点击视频画面是否切换播放' },
    { name: 'volume', type: 'number', default: '100', desc: '初始音量，区间 0–100' },
    { name: 'seekTime', type: 'number', default: '10', desc: '←/→ 键快进快退时间（秒）' },
    {
      name: 'controlsList',
      type: 'string[]',
      default:
        "['play','next','time','volume','playbackRate','quality','route','mirror','fullscreen','pictureInPicture']",
      desc: '控件栏展示项（对齐 Semi shouldShowControlItem，控制增删）',
    },
    {
      name: 'playbackRateList',
      type: '{ label: string; value: number }[]',
      default: '[2.0x,1.5x,1.25x,1.0x,0.75x]',
      desc: '倍率菜单选项，默认 Semi 5 档',
    },
    { name: 'defaultPlaybackRate', type: 'number', default: '1', desc: '默认倍率' },
    {
      name: 'qualityList',
      type: '{ label: string; value: string }[]',
      default: 'undefined',
      desc: '清晰度菜单选项',
    },
    { name: 'defaultQuality', type: 'string', default: 'undefined', desc: '默认清晰度' },
    {
      name: 'routeList',
      type: '{ label: string; value: string }[]',
      default: 'undefined',
      desc: '线路菜单选项',
    },
    { name: 'defaultRoute', type: 'string', default: 'undefined', desc: '默认线路' },
    {
      name: 'markers',
      type: '{ start: number; title?: string }[]',
      default: '[]',
      desc: '进度条章节标记点',
    },
    {
      name: 'theme',
      type: "'dark'|'light'",
      default: "'dark'",
      desc: '主题，仅影响容器背景色（对齐 Semi）',
    },
    {
      name: 'crossOrigin',
      type: "'anonymous'|'use-credentials'",
      default: 'undefined',
      desc: '原生 crossorigin，CORS 取视频',
    },
    { name: 'class', type: 'string', default: "''", desc: '根类名透传' },
    {
      name: 'videoRef',
      type: 'HTMLVideoElement|null',
      default: 'null',
      desc: 'bindable：拿到原生 video 元素以做更灵活的控制（如多视频同步）',
    },
    { name: 'onPlay', type: '() => void', default: 'undefined', desc: '播放回调' },
    { name: 'onPause', type: '() => void', default: 'undefined', desc: '暂停回调' },
    {
      name: 'onVolumeChange',
      type: '(volume: number) => void',
      default: 'undefined',
      desc: '调整音量回调',
    },
    { name: 'onRateChange', type: '(rate: number) => void', default: 'undefined', desc: '切换倍率回调' },
    {
      name: 'onQualityChange',
      type: '(quality: string) => void',
      default: 'undefined',
      desc: '切换清晰度回调（在此更新 src）',
    },
    {
      name: 'onRouteChange',
      type: '(route: string) => void',
      default: 'undefined',
      desc: '切换线路回调（在此更新 src）',
    },
  ],
  events: [
    { name: 'onPlay', desc: '开始播放' },
    { name: 'onPause', desc: '暂停' },
    { name: 'onVolumeChange', desc: '音量变化' },
    { name: 'onRateChange', desc: '倍率变化' },
    { name: 'onQualityChange', desc: '清晰度变化' },
    { name: 'onRouteChange', desc: '线路变化' },
  ],
  slots: [],
  a11y: {
    role: 'application',
    keyboard: ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Escape'],
    focusable: true,
    notes: [
      'Space 播放/暂停、←/→ 按 seekTime 跳转，仅当焦点在播放器容器内时响应（Semi handleBodyKeyDown，避免劫持页面其他控件键位）；音量键盘调节照搬 Semi 未实现',
      '控件为本库 Button，aria-label 走 locale（play/pause/mute/unmute/fullscreen/exitFullscreen/pictureInPicture/mirror/volume）',
      '进度条 role=slider，aria-valuemin/max/now 为秒；章节标记多段（markers）',
      '音量为 Popover 内竖向 AudioSlider（role=slider 0–100）；静音按钮 aria-pressed',
      '倍率/清晰度/线路为 Dropdown：触发块补 role=button + aria-haspopup=menu/aria-expanded（修 axe），Dropdown.Item active 标注选中',
      '加载/卡顿通知 aria-live=polite；错误态 role=alert（ErrorSvg 插画 + 文案）',
    ],
  },
  // 68 个 token 严格镜像 Semi videoPlayer variables.scss(63) + animation.scss(5)。
  // 命名 --cd-{category}-videoPlayer-{part}（驼峰段保留）。此处列关键代表，全量见 tokens/components/video-player.ts。
  tokens: [
    '--cd-color-videoPlayer-theme-dark-bg',
    '--cd-color-videoPlayer-theme-light-bg',
    '--cd-color-videoPlayer-controls-bg',
    '--cd-color-videoPlayer-controls-text',
    '--cd-color-videoPlayer-pause-bg',
    '--cd-color-videoPlayer-notification-bg',
    '--cd-color-videoPlayer-progress-bar-bg-played',
    '--cd-color-videoPlayer-progress-bar-bg-loaded',
    '--cd-color-videoPlayer-progress-bar-bg-unplayed',
    '--cd-color-videoPlayer-progress-bar-handle-bg',
    '--cd-height-videoPlayer-controls-menu-default',
    '--cd-height-videoPlayer-progress-bar-hover',
    '--cd-radius-videoPlayer-progress-bar',
    '--cd-animation-duration-videoPlayer-controls-show',
    '--cd-animation-function-videoPlayer-slider-in',
  ],
  examples: [
    {
      title: '基础',
      code: '<VideoPlayer src="/demo.mp4" poster="/poster.jpg" height={360} />',
    },
    {
      title: '设置控件栏 + 循环',
      code: "<VideoPlayer\n  src=\"/demo.mp4\"\n  loop\n  controlsList={['play', 'time', 'volume', 'playbackRate', 'fullscreen']}\n/>",
    },
    {
      title: '清晰度切换',
      code: '<VideoPlayer\n  src={src}\n  defaultQuality="1080p"\n  qualityList={[{ label: \'1080p\', value: \'1080p\' }, { label: \'480p\', value: \'480p\' }]}\n  onQualityChange={(q) => (src = pick(q))}\n/>',
    },
    {
      title: '章节标记',
      code: "<VideoPlayer src=\"/demo.mp4\" markers={[{ start: 0, title: '片头' }, { start: 38, title: '正片' }]} />",
    },
    {
      title: 'ref 控制多视频同步',
      code: '<VideoPlayer bind:videoRef={v1} src="/a.mp4" />\n<VideoPlayer bind:videoRef={v2} src="/a.mp4" />\n<button onclick={() => { v1?.play(); v2?.play(); }}>同时播放</button>',
    },
  ],
} as const;
