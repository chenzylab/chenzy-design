/**
 * Machine-readable component metadata for AI/docs consumption.
 * Carousel — see specs/components/show/Carousel.spec.md
 */
export const meta = {
  name: 'Carousel',
  category: 'show',
  description:
    '走马灯：单/多 slide 同屏展示（slidesToShow/slidesToScroll），支持 slide/fade 动画、autoplay（含 hoverToPause）、loop 循环、dot 指示器、prev/next 箭头、vertical 纵向方向、pointer 拖拽手势与受控 value。slide 通过 Snippet[] 传入。',
  exports: ['Carousel'],
  props: [
    { name: 'slides', type: 'Snippet[]', default: '[]', desc: '每项一张幻灯片的 Snippet 数组' },
    { name: 'value', type: 'number', default: 'undefined', desc: '受控当前索引（不回写）' },
    { name: 'defaultActiveIndex', type: 'number', default: '0', desc: '非受控初始索引' },
    { name: 'autoplay', type: 'boolean', default: 'false', desc: '自动播放' },
    { name: 'interval', type: 'number', default: '3000', desc: '自动播放间隔（ms）' },
    { name: 'loop', type: 'boolean', default: 'true', desc: '循环（取模）；false 时 clamp 边界' },
    { name: 'animation', type: "'slide'|'fade'", default: "'slide'", desc: '切换动画' },
    { name: 'speed', type: 'number', default: '300', desc: '切换动画时长（ms）' },
    { name: 'slidesToShow', type: 'number', default: '1', desc: '一屏同时展示的 slide 数（>1 强制 slide 轨道）' },
    { name: 'slidesToScroll', type: 'number', default: '1', desc: '每次切换滚动的 slide 数（步长）' },
    { name: 'vertical', type: 'boolean', default: 'false', desc: '纵向滚动方向（指示器移至右侧、箭头改上/下）' },
    { name: 'draggable', type: 'boolean', default: 'true', desc: 'pointer 拖拽/滑动切换（拖过半张进位，否则回弹）' },
    { name: 'showIndicator', type: 'boolean', default: 'true', desc: '显示底部 dot 指示器（按页数渲染）' },
    { name: 'showArrow', type: 'boolean', default: 'true', desc: '显示左右箭头' },
    { name: 'hoverToPause', type: 'boolean', default: 'true', desc: '悬停暂停自动播放' },
    { name: 'height', type: 'number|string', default: '240', desc: '容器高度（数字按 px）' },
    { name: 'onChange', type: '(index: number) => void', default: 'undefined', desc: '索引变更回调' },
    { name: 'class', type: 'string', default: "''", desc: '根类名透传' },
  ],
  events: [{ name: 'onChange', desc: '当前索引变更（index）' }],
  slots: [{ name: 'slides', desc: '幻灯片 Snippet 数组，每项一张' }],
  a11y: {
    role: 'region',
    focusable: true,
    notes: [
      '根 role=region aria-roledescription="carousel"',
      'slide 区 aria-live=polite；autoplay 播放中降级为 off',
      '视口 role=group aria-roledescription="slides" 承载拖拽手势',
      '每张 role=group aria-roledescription="slide"，非可见窗口内的张 aria-hidden',
      '指示器按钮 aria-label「第 N 张」；箭头按钮 aria-label 上一张/下一张',
      'reduced-motion 下切换过渡时长归零',
    ],
  },
  tokens: [
    '--cd-carousel-radius',
    '--cd-carousel-indicator-color',
    '--cd-carousel-indicator-color-active',
    '--cd-carousel-indicator-gap',
    '--cd-carousel-arrow-bg',
    '--cd-carousel-arrow-color',
    '--cd-carousel-arrow-size',
    '--cd-radius-full',
    '--cd-focus-ring',
    '--cd-motion-duration-fast',
    '--cd-motion-ease-standard',
    '--cd-spacing-2',
  ],
  examples: [
    {
      title: '基础',
      code:
        '{#snippet s1()}<img src="/1.jpg" alt="" />{/snippet}\n{#snippet s2()}<img src="/2.jpg" alt="" />{/snippet}\n<Carousel slides={[s1, s2]} autoplay />',
    },
  ],
} as const;
