/**
 * Machine-readable component metadata for AI/docs consumption.
 * LottieIcon — see specs/components/other/LottieIcon.spec.md
 */
export const meta = {
  name: 'LottieIcon',
  category: 'other',
  description:
    'Lottie 动画图标：依赖注入 player 工厂（库不绑定 lottie-web，用户自带），data 内联 JSON + size/color/trigger(auto/hover/manual)/loop/speed 播放控制，命令式 play/pause/stop，prefers-reduced-motion 降级首帧静止，decorative aria-hidden / 功能性 role=img+label；本子集 src fetch/visible/segments/canvas/flipRtl 延后。',
  exports: ['LottieIcon'],
  props: [
    { name: 'data', type: 'unknown', default: 'undefined', desc: 'Lottie JSON 数据（必填，内联）' },
    {
      name: 'player',
      type: 'LottiePlayerFactory',
      default: 'undefined',
      desc: '必填：用户注入的 player 工厂（包装 lottie-web 等），库不内置',
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
  ],
} as const;
