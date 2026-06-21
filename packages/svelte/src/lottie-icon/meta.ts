/**
 * Machine-readable component metadata for AI/docs consumption.
 * LottieIcon — see specs/components/other/LottieIcon.spec.md
 */
export const meta = {
  name: 'LottieIcon',
  category: 'other',
  description:
    'Lottie 动画图标：依赖注入 player 工厂（库不绑定 lottie-web，用户自带），data 内联 JSON 或 src URL 异步 fetch（AbortController + 加载中 skeleton / 失败 error 态），size/color/trigger(auto/hover/manual)/loop/speed 播放控制，segments 帧段([start,end]或命名 marker)，flipRtl RTL 水平镜像，命令式 play/pause/stop，prefers-reduced-motion 降级首帧静止，decorative aria-hidden / 功能性 role=img+label；本子集 visible/canvas 延后。',
  exports: ['LottieIcon'],
  props: [
    {
      name: 'data',
      type: 'unknown',
      default: 'undefined',
      desc: 'Lottie JSON 数据（内联）；与 src 二选一，同时存在时 data 优先',
    },
    {
      name: 'src',
      type: 'string',
      default: 'undefined',
      desc: 'Lottie JSON 动画 URL，异步 fetch 加载（AbortController + 加载中/失败态）',
    },
    {
      name: 'player',
      type: 'LottiePlayerFactory',
      default: 'undefined',
      desc: '必填：用户注入的 player 工厂（包装 lottie-web 等），库不内置',
    },
    {
      name: 'segments',
      type: '[number, number] | string',
      default: 'undefined',
      desc: '播放指定帧段：[start,end] 帧对或命名 marker（按动画 markers 解析）',
    },
    {
      name: 'flipRtl',
      type: 'boolean',
      default: 'false',
      desc: 'RTL 场景水平镜像动画（transform scaleX(-1)）',
    },
    {
      name: 'size',
      type: "'small'|'default'|'large'|number",
      default: "'default'",
      desc: '尺寸 token 或 px 数值',
    },
    {
      name: 'color',
      type: 'string',
      default: 'undefined',
      desc: '可着色图层色，默认继承 --cd-lottieicon-color',
    },
    {
      name: 'trigger',
      type: "'auto'|'hover'|'manual'",
      default: "'auto'",
      desc: '播放触发方式',
    },
    { name: 'autoplay', type: 'boolean', default: 'true', desc: 'auto 触发时是否自动播放' },
    { name: 'loop', type: 'boolean|number', default: 'true', desc: '循环开关或循环次数' },
    { name: 'speed', type: 'number', default: '1', desc: '播放速度' },
    {
      name: 'reducedMotion',
      type: 'boolean',
      default: 'undefined',
      desc: '强制降级开关；未设跟随系统 prefers-reduced-motion',
    },
    {
      name: 'onLoad',
      type: '(data: unknown) => void',
      default: 'undefined',
      desc: 'src 加载成功回调',
    },
    {
      name: 'onError',
      type: '(err: unknown) => void',
      default: 'undefined',
      desc: 'src 加载失败回调',
    },
    {
      name: 'decorative',
      type: 'boolean',
      default: 'true',
      desc: 'true 装饰性 aria-hidden；false 时必须给 label',
    },
    {
      name: 'label',
      type: 'string',
      default: 'undefined',
      desc: '功能性图标无障碍名（decorative=false 必填）',
    },
  ],
  events: [
    { name: 'onPlay', desc: '开始播放回调' },
    { name: 'onPause', desc: '暂停回调' },
    { name: 'onLoad', desc: 'src 加载成功回调（透出动画数据）' },
    { name: 'onError', desc: 'src 加载失败回调' },
  ],
  slots: [],
  a11y: {
    hasRole: true,
    focusable: false,
    note: 'decorative=true 时 aria-hidden；decorative=false 时 role=img + aria-label；不可聚焦（无 tabindex）；reduced-motion 时不播放，渲染静止首帧。',
  },
  tokens: [
    '--cd-lottieicon-size',
    '--cd-lottieicon-size-small',
    '--cd-lottieicon-size-large',
    '--cd-lottieicon-color',
    '--cd-lottieicon-color-hover',
    '--cd-lottieicon-bg-skeleton',
    '--cd-lottieicon-radius',
    '--cd-lottieicon-error-color',
    '--cd-lottieicon-valign',
  ],
  responsive: false,
  examples: [
    {
      title: 'auto 自动播放',
      code: '<LottieIcon {data} player={makePlayer} />',
    },
    {
      title: 'hover 触发',
      code: '<LottieIcon {data} player={makePlayer} trigger="hover" />',
    },
    {
      title: 'reduced-motion 降级（首帧静止）',
      code: '<LottieIcon {data} player={makePlayer} reducedMotion />',
    },
    {
      title: 'src URL 异步加载',
      code: '<LottieIcon src="/anim/like.json" player={makePlayer} />',
    },
    {
      title: 'segments 帧段播放',
      code: '<LottieIcon {data} player={makePlayer} segments={[10, 60]} />',
    },
    {
      title: 'flipRtl RTL 镜像',
      code: '<LottieIcon {data} player={makePlayer} flipRtl />',
    },
  ],
} as const;
