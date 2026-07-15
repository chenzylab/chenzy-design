/**
 * Machine-readable component metadata for AI/docs consumption.
 * Resizable family (single + split group) — strictly aligned with Semi Design.
 */
export const meta = {
  name: 'Resizable',
  category: 'basic',
  stage: 'M6',
  semiEquivalent: 'Resizable',
  description:
    '可伸缩组件族：Resizable 单体容器（4 边 + 4 角共 8 个可选把手，拖拽改自身宽/高，支持 min/max、锁比例、网格吸附、缩放/像素比修正、边界限制）与 ResizeGroup/ResizeItem/ResizeHandler 分栏组（水平/垂直多面板，相邻两项联动一增一减、总和守恒，各项 min/max clamp 后重分配）。严格对齐 Semi Design：把手是裸 div（无 role/aria/tabindex/键盘），ResizeHandler 默认渲染 IconHandle。core 沉淀通用拖拽原语 createResizeDrag（单次拖拽生命周期，命令式绑/解全局监听）+ computeGroupResize（分栏联动几何），供 Table 列宽拖拽、SideBar Container 复用。',
  exports: ['Resizable', 'ResizeGroup', 'ResizeItem', 'ResizeHandler'],
  relatedTo: ['Table', 'SideBar', 'Slider'],
  subComponents: [
    {
      name: 'Resizable',
      props: [
        { name: 'size', type: '{ width?: string|number; height?: string|number }', default: 'undefined', desc: '受控尺寸（数字或 px/vw/vh/% 字符串）' },
        { name: 'defaultSize', type: 'Size', default: 'undefined', desc: '非受控初始尺寸' },
        { name: 'enable', type: 'Partial<Record<Direction, boolean>> | false', default: '全 true', desc: '启用哪些把手；false 全禁用' },
        { name: 'minWidth', type: 'string | number', default: 'undefined' },
        { name: 'minHeight', type: 'string | number', default: 'undefined' },
        { name: 'maxWidth', type: 'string | number', default: 'undefined' },
        { name: 'maxHeight', type: 'string | number', default: 'undefined' },
        { name: 'lockAspectRatio', type: 'boolean | number', default: 'false', desc: '锁定宽高比' },
        { name: 'lockAspectRatioExtraWidth', type: 'number', default: '0', desc: '锁定比例时宽度额外补偿' },
        { name: 'lockAspectRatioExtraHeight', type: 'number', default: '0', desc: '锁定比例时高度额外补偿' },
        { name: 'grid', type: '[number, number] | number', default: '[1, 1]', desc: '吸附网格步长；单数字归一为 [n,n]' },
        { name: 'snap', type: '{ x?: number[]; y?: number[] }', default: 'undefined', desc: '吸附到指定像素尺寸' },
        { name: 'snapGap', type: 'number', default: '0', desc: '吸附生效的最小间隙，0=总吸附到最近目标' },
        { name: 'boundElement', type: "'parent' | 'window' | HTMLElement", default: 'undefined', desc: '限制伸缩范围的边界元素' },
        { name: 'boundsByDirection', type: 'boolean', default: 'undefined', desc: '按方向计算边界（对齐 Semi）' },
        { name: 'scale', type: 'number', default: '1', desc: '画布缩放系数' },
        { name: 'ratio', type: 'number | [number, number]', default: '1', desc: '像素比修正' },
        { name: 'class', type: 'string', default: 'undefined', desc: '根节点类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '根节点内联样式' },
        { name: 'handleWrapperClass', type: 'string', default: 'undefined', desc: '把手 wrapper 层类名' },
        { name: 'handleWrapperStyle', type: 'string', default: 'undefined', desc: '把手 wrapper 层内联样式' },
        { name: 'handleClass', type: 'Partial<Record<Direction, string>>', default: 'undefined', desc: '各向把手自定义类名' },
        { name: 'handleStyle', type: 'Partial<Record<Direction, string>>', default: 'undefined', desc: '各向把手自定义内联样式' },
        { name: 'handleNode', type: 'Partial<Record<Direction, Snippet>>', default: 'undefined', desc: '各向把手自定义内容' },
        { name: 'onResizeStart', type: '(e, dir) => void | boolean', default: 'undefined', desc: '返回 false 取消本次拖拽' },
        { name: 'onChange', type: '(size, event, direction) => void', default: 'undefined', desc: '拖拽中，载荷顺序对齐 Semi' },
        { name: 'onResizeEnd', type: '(size, event, direction) => void', default: 'undefined' },
      ],
    },
    {
      name: 'ResizeGroup',
      props: [
        { name: 'direction', type: "'horizontal' | 'vertical'", default: "'horizontal'", desc: '分栏方向' },
        { name: 'class', type: 'string', default: 'undefined' },
        { name: 'style', type: 'string', default: 'undefined' },
      ],
    },
    {
      name: 'ResizeItem',
      props: [
        { name: 'defaultSize', type: 'string | number', default: 'undefined', desc: '初始尺寸；%/px 或纯数字/数字表示按比例分配剩余空间' },
        { name: 'min', type: 'string', default: 'undefined', desc: '最小尺寸（百分比或像素）' },
        { name: 'max', type: 'string', default: 'undefined', desc: '最大尺寸（百分比或像素）' },
        { name: 'class', type: 'string', default: 'undefined' },
        { name: 'style', type: 'string', default: 'undefined' },
        { name: 'onResizeStart', type: '(e, dir) => void | boolean', default: 'undefined' },
        { name: 'onChange', type: '(size, event, direction) => void', default: 'undefined' },
        { name: 'onResizeEnd', type: '(size, event, direction) => void', default: 'undefined' },
      ],
    },
    {
      name: 'ResizeHandler',
      props: [
        { name: 'disabled', type: 'boolean', default: 'false', desc: '禁用该把手' },
        { name: 'class', type: 'string', default: 'undefined' },
        { name: 'style', type: 'string', default: 'undefined' },
        { name: 'children', type: 'Snippet', default: 'IconHandle', desc: '自定义把手内容，缺省渲染 IconHandle' },
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
    '不要给把手加 role/aria/键盘（严格对齐 Semi，把手是裸命中区）',
    '不要用响应式 attachment 读几何（拖拽用命令式几何，红线 no.3）',
  ],
} as const;
