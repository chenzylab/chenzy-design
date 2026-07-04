/**
 * Machine-readable component metadata for AI/docs consumption.
 * Cropper — see specs/components/show/Cropper.spec.md
 */
export const meta = {
  name: 'Cropper',
  category: 'show',
  description:
    '图片裁切：容器 + 底图 + 遮罩 + 裁切框（含裁切视图 + 8 resize 角点）。几何逻辑委托 @chenzy-design/core 的 CropperFoundation（框架无关，纯原生 DOM/canvas，不引第三方）。支持 rect/round/roundRect 三形状、aspectRatio 比例约束、8 角点自由/约束 resize、裁切框拖拽、遮罩拖拽移动底图、滚轮以指针为中心缩放（min/max/step 钳制）、受控 rotate/zoom、容器 resize 重排、preview 实时预览、getCropperCanvas() ref 取裁切结果 canvas。受控 aspectRatio/rotate/zoom 只读不回写，onZoomChange 仅通知。',
  exports: ['Cropper'],
  props: [
    { name: 'src', type: 'string', default: 'undefined', desc: '待裁切图片地址' },
    {
      name: 'shape',
      type: "'rect'|'round'|'roundRect'",
      default: "'rect'",
      desc: '裁切框形状；round 仅渲染 4 个边中点角点并圆形裁切',
    },
    {
      name: 'aspectRatio',
      type: 'number',
      default: 'undefined',
      desc: '受控裁切比例(w/h)；设置后角点 resize 走比例约束（只读不回写）',
    },
    {
      name: 'defaultAspectRatio',
      type: 'number',
      default: '1',
      desc: '图片加载时裁切框初始比例（仅 aspectRatio 未设时生效）',
    },
    { name: 'rotate', type: 'number', default: '0', desc: '受控旋转角度(deg)，变化经 core 重算图片中心（只读不回写）' },
    {
      name: 'zoom',
      type: 'number',
      default: '1',
      desc: '受控缩放；图片加载后先做适配缩放，此值在其基础上再缩放（只读不回写）',
    },
    { name: 'minZoom', type: 'number', default: '0.1', desc: '滚轮缩放下限' },
    { name: 'maxZoom', type: 'number', default: '3', desc: '滚轮缩放上限' },
    { name: 'zoomStep', type: 'number', default: '0.1', desc: '每次滚轮缩放步长' },
    { name: 'showResizeBox', type: 'boolean', default: 'true', desc: '是否显示裁切框 resize 角点' },
    { name: 'cropperBoxStyle', type: 'string', default: 'undefined', desc: '裁切框附加内联样式' },
    { name: 'cropperBoxClassName', type: 'string', default: 'undefined', desc: '裁切框附加类名' },
    {
      name: 'fill',
      type: 'string',
      default: "'rgba(0, 0, 0, 0)'",
      desc: '裁切结果中非图片区域的填充色',
    },
    {
      name: 'preview',
      type: '() => HTMLElement | null | undefined',
      default: 'undefined',
      desc: '返回预览容器元素；提供后实时渲染裁切预览',
    },
    { name: 'imgProps', type: 'Record<string, unknown>', default: 'undefined', desc: '透传给底图 <img> 的属性' },
    { name: 'onZoomChange', type: '(zoom: number) => void', default: 'undefined', desc: '缩放变化回调' },
    { name: 'ariaLabel', type: 'string', default: 'undefined', desc: '容器 aria-label（未设走 locale Cropper.container）' },
    { name: 'class', type: 'string', default: 'undefined', desc: '容器附加类名' },
    { name: 'style', type: 'string', default: 'undefined', desc: '容器附加内联样式' },
  ],
  events: [{ name: 'onZoomChange', desc: '滚轮缩放导致 zoom 变化时触发' }],
  slots: [],
  methods: [
    {
      name: 'getCropperCanvas',
      desc: '按当前裁切框/图片/rotate/zoom 生成裁切结果 canvas（HTMLCanvasElement）；需真实 canvas 2D 上下文',
    },
  ],
  a11y: {
    hasRole: true,
    focusable: false,
    note: '容器 role=group + aria-label（走 locale Cropper.container 或 ariaLabel）；底图/裁切视图 img 为装饰(alt="")；角点/遮罩/裁切框 role=presentation，交互经鼠标/滚轮（对齐 Semi 原生实现，无键盘 resize）。',
  },
  tokens: [
    '--cd-cropper-mask-bg',
    '--cd-cropper-box-outline-color',
    '--cd-cropper-box-outline-width',
    '--cd-cropper-corner-bg',
    '--cd-cropper-corner-size',
  ],
  responsive: true,
  examples: [
    { title: '基础裁切', code: '<Cropper src="/avatar.png" />' },
    {
      title: '固定 16:9 比例',
      code: '<Cropper src="/banner.jpg" aspectRatio={16 / 9} />',
    },
    {
      title: '圆形头像裁切 + 取结果',
      code: '<Cropper bind:this={cropper} src="/avatar.png" shape="round" defaultAspectRatio={1} />',
    },
    {
      title: '受控缩放',
      code: '<Cropper src="/img.png" {zoom} onZoomChange={(z) => (zoom = z)} maxZoom={5} />',
    },
  ],
} as const;
