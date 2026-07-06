/**
 * Machine-readable component metadata for AI/docs consumption.
 * AudioPlayer — see specs/components/show/AudioPlayer.spec.md（对齐 Semi AudioPlayer）。
 */
export const meta = {
  name: 'AudioPlayer',
  category: 'plus',
  description:
    '基于原生 <audio> 的音频播放器（对齐 Semi，无第三方媒体库）。audioUrl 接受 string | string[] | AudioInfo | AudioInfo[] 四形态并归一为曲目列表；多曲显示上/下曲。工具栏含播放/暂停、快退/快进（按 skipDuration）、上/下曲、重播、进度、时间、倍速、音量；深/浅双主题（默认 dark）。',
  exports: ['AudioPlayer'],
  props: [
    {
      name: 'audioUrl',
      type: 'string | string[] | AudioInfo | AudioInfo[]',
      default: 'undefined',
      desc: '音频地址（四形态，AudioInfo = { src; title?; cover? }），归一为曲目列表',
    },
    { name: 'autoPlay', type: 'boolean', default: 'false', desc: '自动播放' },
    { name: 'theme', type: "'dark' | 'light'", default: "'dark'", desc: '主题（对齐 Semi 默认 dark）' },
    { name: 'showToolbar', type: 'boolean', default: 'true', desc: '是否显示工具栏' },
    { name: 'skipDuration', type: 'number', default: '10', desc: '快进/快退步长（秒）' },
    {
      name: 'rates',
      type: 'PlaybackRate[]',
      default: '[0.5x, 1.0x, 1.5x, 2.0x]',
      desc: '倍速可选项（PlaybackRate = { label; value }）',
    },
    { name: 'class', type: 'string', default: "''", desc: '根元素类名' },
    { name: 'style', type: 'string', default: "''", desc: '根元素内联样式' },
  ],
  events: [],
  slots: [
    {
      name: 'cover',
      type: 'Snippet<[{ track: AudioTrack | undefined }]>',
      desc: '自定义封面区，覆盖默认封面/标题渲染',
    },
  ],
  a11y: {
    role: 'group',
    focusable: false,
    notes: [
      '工具栏各按钮为原生 <button type=button>，aria-label 走 i18n（播放/暂停/上/下曲/快进/快退/重播/音量/倍速）',
      '播放/暂停按钮带 aria-pressed 反映播放态',
      '进度条为原生 range input，补 aria-valuemin/max/now + aria-valuetext（当前/总时长）纯标注',
      '首/末曲时上/下曲按钮 disabled（对齐 headless 无环绕边界）',
      '播放出错时用 role=status / aria-live=polite live region 播报错误文案',
      '图标不依赖颜色单通道，语义由 aria-label 承载',
    ],
  },
  tokens: [
    '--cd-audio-player-bg',
    '--cd-audio-player-radius',
    '--cd-audio-player-border',
    '--cd-audio-player-shadow',
    '--cd-audio-player-toolbar-bg',
    '--cd-audio-player-icon',
    '--cd-audio-player-icon-hover',
    '--cd-audio-player-icon-disabled',
    '--cd-audio-player-progress-track',
    '--cd-audio-player-progress-played',
    '--cd-audio-player-progress-thumb',
    '--cd-audio-player-progress-height',
    '--cd-audio-player-title',
    '--cd-audio-player-time',
    '--cd-audio-player-time-font-size',
    '--cd-audio-player-cover-size',
    '--cd-audio-player-cover-radius',
    '--cd-audio-player-motion-duration',
  ],
  examples: [
    { title: '单曲', code: '<AudioPlayer audioUrl="/audio/song.mp3" />' },
    {
      title: '带封面/标题',
      code: '<AudioPlayer audioUrl={{ src: "/a.mp3", title: "标题", cover: "/cover.png" }} />',
    },
    {
      title: '多曲列表',
      code: '<AudioPlayer audioUrl={[{ src: "/a.mp3", title: "A" }, { src: "/b.mp3", title: "B" }]} />',
    },
    { title: '浅色主题', code: '<AudioPlayer audioUrl="/a.mp3" theme="light" />' },
  ],
} as const;
