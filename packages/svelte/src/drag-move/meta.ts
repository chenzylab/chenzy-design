/**
 * Machine-readable component metadata for AI/docs consumption.
 * DragMove — 通用拖拽移动容器。见 specs/components/other/DragMove.spec.md。
 */
export const meta = {
  name: 'DragMove',
  category: 'plus',
  stage: 'M6',
  semiEquivalent: 'DragMove',
  description:
    '通用拖拽移动容器（严格对齐 Semi Design dragMove，纯逻辑组件无样式层）：包裹单个子元素使其可被拖拽在页面/约束区内自由移动（与 Resizable 改尺寸正交，DragMove 改位置）。core 沉淀通用拖拽原语 createDragMove（命令式绑/解全局监听，pointerdown 记录起点→document 绑 move/up→计算 clamp 到 constrainer 的 top/left→customMove 或写 style→up 解绑+卸载兜底），供 Modal 可拖拽标题栏、Cropper 画布拖拽后续复用。init 强制 element position:absolute + handler cursor:move（对齐 Semi foundation）。约束区支持 parent/自定义 DOM/无约束；allowMove 谓词拦截；allowInputDrag 控制是否从表单元素发起。鼠标/触摸双通道，touch-action:none 支持触屏。无 token/scss/className（对齐 Semi）；Svelte 无 cloneElement 故用一层透明 wrapper 承载几何（框架必要适配）。',
  relatedTo: ['Resizable', 'Modal', 'Cropper'],
  props: [
    {
      name: 'handler',
      type: '() => HTMLElement',
      default: 'undefined',
      desc: '拖拽触发元素（缺省为整个被包裹子元素）',
    },
    {
      name: 'constrainer',
      type: "(() => HTMLElement | null) | 'parent'",
      default: 'undefined',
      desc: "移动约束区。'parent'=父元素，或返回具体容器 DOM；缺省不约束",
    },
    {
      name: 'allowMove',
      type: '(e, element) => boolean',
      default: 'undefined',
      desc: '谓词：本次是否允许拖拽，返回 false 取消',
    },
    {
      name: 'customMove',
      type: '(el: HTMLElement, top: number, left: number) => void',
      default: 'undefined',
      desc: '自定义位置应用（缺省组件直接写 el.style.top/left）',
    },
    {
      name: 'allowInputDrag',
      type: 'boolean',
      default: 'false',
      desc: '是否允许从 input/textarea 等表单元素上发起拖拽',
    },
    { name: 'class', type: 'string', default: "''" },
    { name: 'style', type: 'string', default: 'undefined' },
    { name: 'onMouseDown', type: '(e: MouseEvent) => void', default: 'undefined', desc: '鼠标按下透传' },
    { name: 'onMouseMove', type: '(e: MouseEvent) => void', default: 'undefined', desc: '鼠标移动透传' },
    { name: 'onMouseUp', type: '(e: MouseEvent) => void', default: 'undefined', desc: '鼠标抬起透传' },
    { name: 'onTouchStart', type: '(e: TouchEvent) => void', default: 'undefined', desc: '触摸开始透传' },
    { name: 'onTouchMove', type: '(e: TouchEvent) => void', default: 'undefined', desc: '触摸移动透传' },
    { name: 'onTouchEnd', type: '(e: TouchEvent) => void', default: 'undefined', desc: '触摸结束透传' },
    { name: 'onTouchCancel', type: '(e: TouchEvent) => void', default: 'undefined', desc: '触摸取消透传' },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '被拖拽移动的子元素' },
  ],
  tokens: [],
  examples: [
    {
      title: '基础拖动卡片',
      code: '<DragMove><div class="card">拖我</div></DragMove>',
    },
    {
      title: '约束在父容器',
      code: '<div style="position:relative;height:300px"><DragMove constrainer="parent"><div class="card">被约束</div></DragMove></div>',
    },
    {
      title: 'handler 指定把手',
      code: '<DragMove handler={() => titleEl}><div class="panel"><div bind:this={titleEl} class="title">标题栏（把手）</div>正文</div></DragMove>',
    },
    {
      title: 'customMove 自定义应用',
      code: '<DragMove customMove={(el, top, left) => el.style.transform = `translate(${left}px,${top}px)`}>…</DragMove>',
    },
  ],
  doNot: [
    '不要用它做 resize（改元素尺寸用 Resizable，DragMove 改的是位置）',
    '不要用响应式 attachment 读几何（拖拽用命令式几何，红线 #3）',
  ],
} as const;
