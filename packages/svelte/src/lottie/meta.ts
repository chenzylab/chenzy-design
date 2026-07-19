/**
 * Machine-readable component metadata for AI/docs consumption.
 * Lottie — 严格对齐 Semi Design Lottie（semi-ui/lottie）。内部基于 lottie-web 渲染动画。
 * 零 token（Semi 仅一个无样式 .semi-lottie class）；无播放控制 prop，全部经 getAnimationInstance→AnimationItem。
 */
export const meta = {
  name: 'Lottie',
  category: 'plus',
  stage: 'M6',
  semiEquivalent: 'Lottie',
  description:
    '在网页中展示 Lottie 动画，内部基于 lottie-web 渲染（严格对齐 Semi）。相较直接用 lottie-web，无需关心动画容器的创建与销毁、动画本身的生命周期。params 透传 lottie.loadAnimation（path CDN / animationData 打包 / renderer / loop / autoplay / container 等）；getAnimationInstance 获取当前 AnimationItem（含 play/pause/setSpeed 等方法）实现播放控制；getLottie 获取全局 lottie 包，亦可用静态方法 Lottie.getLottie()。params.container 存在时组件不渲染 DOM（用户自管容器）。',
  exports: ['Lottie'],
  props: [
    {
      name: 'params',
      type: 'LottieParams',
      default: '—',
      desc: '必填。用于配置动画相关参数，透传 lottie.loadAnimation（path / animationData / renderer / loop / autoplay / container 等，默认 renderer:svg / loop:true / autoplay:true）',
    },
    {
      name: 'width',
      type: 'string',
      default: 'undefined',
      desc: '容器宽度（作用于根 div，如 "300px"）；params.container 存在时不生效',
    },
    {
      name: 'height',
      type: 'string',
      default: 'undefined',
      desc: '容器高度（作用于根 div，如 "300px"）；params.container 存在时不生效',
    },
    {
      name: 'getAnimationInstance',
      type: '(animation: AnimationItem | null) => void',
      default: 'undefined',
      desc: '获取当前动画 AnimationItem 实例（含 play/pause/setSpeed/goToAndStop 等方法）；mount 及 params 变更后回调',
    },
    {
      name: 'getLottie',
      type: '(lottie: LottiePlayer) => void',
      default: 'undefined',
      desc: '获取全局 lottie 包（含 setQuality 等全局方法）；mount 时回调。等价具名导出 getLottie()',
    },
    { name: 'class', type: 'string', default: 'undefined', desc: '根节点类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '根节点内联样式' },
  ],
  events: [],
  slots: [],
  staticMembers: [
    {
      name: 'getLottie',
      desc: '具名导出（异步函数），返回全局 lottie 包（lottie-web 的 default 导出）。对齐 Semi Lottie.getLottie 静态方法；Svelte 组件无法挂静态方法，故以具名导出提供',
    },
  ],
  a11y: {
    hasRole: false,
    focusable: false,
    note: 'Semi Lottie 为纯动画展示容器，无内建 role/aria；无障碍名由使用方按场景在容器上补充。',
  },
  // 零 token —— 严格对齐 Semi（仅一个无样式 .semi-lottie class）。
  tokens: [],
  responsive: false,
  examples: [
    {
      title: 'path CDN 基本用法',
      code: '<Lottie params={{ path: jsonURL }} width="300px" height="300px" />',
    },
    {
      title: 'animationData 打包用法',
      code: '<Lottie params={{ animationData: data }} width="300px" height="300px" />',
    },
    {
      title: '获取当前动画实例',
      code: '<Lottie params={{ path: jsonURL }} getAnimationInstance={(a) => console.log(a)} />',
    },
    {
      title: '获取全局 Lottie',
      code: '<Lottie params={{ path: jsonURL }} getLottie={(l) => console.log(l)} />',
    },
  ],
} as const;
