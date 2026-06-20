/**
 * Machine-readable component metadata for AI/docs consumption.
 * Image — see specs/components/show/Image.spec.md
 */
export const meta = {
  name: 'Image',
  category: 'show',
  description:
    '图片：支持懒加载（原生 loading=lazy 或 IntersectionObserver）、object-fit/position、占位（骨架或 LQIP 模糊占位图 + 主图淡入）、加载失败降级（降级图/默认破图/自定义 slot）与点击全屏预览（portal 遮罩 + 缩放/旋转 + Esc 关闭）。配合 Image.PreviewGroup 包裹多张图可在预览态左右切换（← → 按钮 + 键盘箭头）。',
  exports: ['Image', 'Image.PreviewGroup'],
  props: [
    { name: 'src', type: 'string', default: '—', desc: '图片地址（必填）' },
    { name: 'alt', type: 'string', default: "''", desc: '替代文本' },
    { name: 'width', type: 'number|string', default: 'undefined', desc: '容器宽，number 视为 px' },
    { name: 'height', type: 'number|string', default: 'undefined', desc: '容器高，number 视为 px' },
    {
      name: 'fit',
      type: "'fill'|'contain'|'cover'|'none'|'scale-down'",
      default: "'fill'",
      desc: 'object-fit',
    },
    { name: 'position', type: 'string', default: "'center'", desc: 'object-position' },
    { name: 'lazy', type: 'boolean', default: 'true', desc: '是否懒加载' },
    {
      name: 'lazyMode',
      type: "'native'|'observer'",
      default: "'native'",
      desc: '懒加载方式：原生属性或 IntersectionObserver',
    },
    { name: 'rootMargin', type: 'string', default: "'200px'", desc: 'observer 模式预加载边距' },
    {
      name: 'placeholder',
      type: 'string|boolean',
      default: 'true',
      desc: 'true=骨架占位；string=LQIP 低质占位图 src（CSS blur 模糊，主图加载完成后淡入清晰）；false=无占位',
    },
    {
      name: 'fallback',
      type: 'string|boolean',
      default: 'true',
      desc: 'true=默认破图占位；string=降级图 src；false=用 errorSlot',
    },
    { name: 'preview', type: 'boolean', default: 'false', desc: '点击图片打开全屏预览' },
    { name: 'class', type: 'string', default: "''", desc: '根类名透传' },
    { name: 'errorSlot', type: 'Snippet', default: 'undefined', desc: 'fallback=false 时的错误内容' },
    { name: 'placeholderSlot', type: 'Snippet', default: 'undefined', desc: '自定义占位内容' },
  ],
  events: [],
  subComponents: [
    {
      name: 'Image.PreviewGroup',
      desc: '预览组：包裹多个 <Image preview>，共享一个预览浮层，点任一图进入组预览可左右切换。',
      props: [
        { name: 'current', type: 'number', default: 'undefined', desc: '受控：当前预览图索引（不回写，仅 onChange 回调）' },
        { name: 'visible', type: 'boolean', default: 'undefined', desc: '受控：预览是否可见（不回写，仅 onVisibleChange 回调）' },
        { name: 'onChange', type: '(index: number) => void', default: 'undefined', desc: '当前预览图索引变化回调' },
        { name: 'onVisibleChange', type: '(visible: boolean) => void', default: 'undefined', desc: '预览开关变化回调' },
        { name: 'children', type: 'Snippet', default: 'undefined', desc: '组内的 <Image> 列表' },
      ],
    },
  ],
  slots: [
    { name: 'errorSlot', desc: '加载失败自定义内容（fallback=false 时）' },
    { name: 'placeholderSlot', desc: '加载中自定义占位内容' },
  ],
  a11y: {
    role: 'img',
    keyboard: ['Enter', 'Space', 'Escape', 'ArrowLeft', 'ArrowRight'],
    focusable: true,
    notes: [
      'img 必传 alt 语义；默认破图占位用 role=img + aria-label',
      'preview 触发器为原生 button，可键盘聚焦与触发',
      '预览遮罩 role=dialog、aria-modal=true，portal 到 body 并自动聚焦，Esc 关闭，关闭按钮有 aria-label',
      '组预览左右切换：← → 按钮（aria-label 经 locale）+ 键盘左右箭头，到边界按钮 disabled',
      '装饰性占位/遮罩文案、页码计数器 aria-hidden=true',
    ],
  },
  tokens: [
    '--cd-image-bg',
    '--cd-image-radius',
    '--cd-image-placeholder-color',
    '--cd-image-mask-bg',
    '--cd-image-mask-color',
    '--cd-image-preview-overlay',
    '--cd-image-preview-z',
    '--cd-focus-ring',
    '--cd-radius-full',
    '--cd-motion-duration-fast',
  ],
  examples: [
    { title: '基础', code: '<Image src="/a.jpg" alt="示例" width={200} />' },
    {
      title: '懒加载 observer + 预览',
      code: '<Image src="/big.jpg" alt="大图" lazy lazyMode="observer" preview />',
    },
    {
      title: 'LQIP 模糊占位',
      code: '<Image src="/hi-res.jpg" placeholder="/lqip-tiny.jpg" alt="高清图" />',
    },
    {
      title: '预览组多图切换',
      code: '<Image.PreviewGroup>\n  <Image src="/a.jpg" alt="A" preview />\n  <Image src="/b.jpg" alt="B" preview />\n  <Image src="/c.jpg" alt="C" preview />\n</Image.PreviewGroup>',
    },
  ],
} as const;
