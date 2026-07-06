/**
 * Machine-readable component metadata for AI/docs consumption.
 * Resizable family (single + split group) — see
 * specs/components/other/Resizable.spec.md.
 */
export const meta = {
  name: 'Resizable',
  category: 'basic',
  stage: 'M6',
  semiEquivalent: 'Resizable',
  description:
    '可伸缩组件族：Resizable 单体容器（4 边 + 4 角共 8 个可选把手，拖拽改自身宽/高，支持 min/max、锁比例、网格吸附、缩放/像素比修正）与 ResizeGroup/ResizeItem/ResizeHandler 分栏组（水平/垂直多面板，相邻两项联动一增一减、总和守恒，各项 min/max clamp 后重分配）。core 沉淀通用拖拽原语 createResizeDrag（单次拖拽生命周期，命令式绑/解全局监听）+ computeGroupResize（分栏联动几何），供 Table 列宽拖拽、SideBar Container 复用。把手 role=separator + aria-orientation + aria-value* + 键盘 ←→/↑↓/Home/End + RTL 镜像。',
  exports: ['Resizable', 'ResizeGroup', 'ResizeItem', 'ResizeHandler'],
  relatedTo: ['Table', 'SideBar', 'Slider'],
  a11yPattern: 'separator',
  keyboardMap: {
    ArrowLeft: '横向把手：减小尺寸（RTL 镜像）',
    ArrowRight: '横向把手：增大尺寸（RTL 镜像）',
    ArrowUp: '纵向把手：减小尺寸',
    ArrowDown: '纵向把手：增大尺寸',
    Home: '收到最小尺寸',
    End: '放到最大尺寸',
  },
  subComponents: [
    {
      name: 'Resizable',
      props: [
        { name: 'size', type: '{ width?: string|number; height?: string|number }', default: 'undefined', desc: '受控尺寸' },
        { name: 'defaultSize', type: 'Size', default: 'undefined', desc: '非受控初始尺寸' },
        { name: 'enable', type: 'Partial<Record<Direction, boolean>> | false', default: '全 true', desc: '启用哪些把手；false 全禁用' },
        { name: 'minWidth', type: 'string | number', default: 'undefined' },
        { name: 'minHeight', type: 'string | number', default: 'undefined' },
        { name: 'maxWidth', type: 'string | number', default: 'undefined' },
        { name: 'maxHeight', type: 'string | number', default: 'undefined' },
        { name: 'lockAspectRatio', type: 'boolean | number', default: 'false', desc: '锁定宽高比' },
        { name: 'grid', type: '[number, number]', default: 'undefined', desc: '吸附网格步长' },
        { name: 'scale', type: 'number', default: '1', desc: '画布缩放系数' },
        { name: 'ratio', type: 'number | [number, number]', default: '1', desc: '像素比修正' },
        { name: 'keyboardStep', type: 'number', default: '10 或 grid', desc: '键盘步长' },
        { name: 'onResizeStart', type: '(e, dir) => void | boolean', default: 'undefined', desc: '返回 false 取消本次拖拽' },
        { name: 'onChange', type: '(size, event, direction) => void', default: 'undefined', desc: '拖拽中，载荷顺序对齐 Semi' },
        { name: 'onResizeEnd', type: '(size, event, direction) => void', default: 'undefined' },
      ],
    },
    {
      name: 'ResizeGroup',
      props: [
        { name: 'direction', type: "'horizontal' | 'vertical'", default: '必填', desc: '分栏方向' },
        { name: 'class', type: 'string', default: 'undefined' },
      ],
    },
    {
      name: 'ResizeItem',
      props: [
        { name: 'defaultSize', type: 'string | number', default: 'undefined', desc: '初始尺寸（%/px/比例数）' },
        { name: 'min', type: 'string', default: 'undefined' },
        { name: 'max', type: 'string', default: 'undefined' },
        { name: 'onResizeStart', type: '(e, dir) => void | boolean', default: 'undefined' },
        { name: 'onChange', type: '(size, event, direction) => void', default: 'undefined' },
        { name: 'onResizeEnd', type: '(size, event, direction) => void', default: 'undefined' },
      ],
    },
    {
      name: 'ResizeHandler',
      props: [
        { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用该把手' },
        { name: 'keyboardStep', type: 'number', default: '10', desc: '键盘步长（px）' },
      ],
    },
  ],
  examples: [
    { title: '右边缘调宽', code: "<Resizable enable={{ right: true }} defaultSize={{ width: 240, height: 160 }} minWidth={120} maxWidth={480}>…</Resizable>" },
    { title: '四角自由缩放', code: "<Resizable enable={{ topRight: true, bottomRight: true, bottomLeft: true, topLeft: true }} defaultSize={{ width: 200, height: 200 }}>…</Resizable>" },
    { title: '锁定比例', code: "<Resizable lockAspectRatio enable={{ bottomRight: true }} defaultSize={{ width: 200, height: 100 }}>…</Resizable>" },
    { title: '网格吸附', code: "<Resizable grid={[20, 20]} enable={{ right: true, bottom: true }} defaultSize={{ width: 200, height: 200 }}>…</Resizable>" },
    { title: '水平分栏', code: "<ResizeGroup direction=\"horizontal\"><ResizeItem defaultSize=\"30%\" min=\"120px\">A</ResizeItem><ResizeHandler /><ResizeItem>B</ResizeItem></ResizeGroup>" },
    { title: '垂直分栏', code: "<ResizeGroup direction=\"vertical\"><ResizeItem defaultSize=\"40%\">Top</ResizeItem><ResizeHandler /><ResizeItem>Bottom</ResizeItem></ResizeGroup>" },
  ],
  doNot: [
    '不要用它做 slider（值语义用 Slider，Resizable 改的是元素尺寸）',
    '不要漏把手键盘（把手是 separator，需 ←→/↑↓/Home/End）',
    '不要用响应式 attachment 读几何（拖拽用命令式几何，红线 #3）',
  ],
} as const;
