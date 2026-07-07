import type { Component } from 'svelte';

const mods = import.meta.glob<{ default: Component }>('./*.svelte', { eager: true });
const sources = import.meta.glob('./*.svelte', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

export interface DemoEntry {
  title: string;
  description?: string;
  component: Component;
  code: string;
}

function entry(file: string, title: string, description?: string): DemoEntry {
  return {
    title,
    description,
    component: mods[`./${file}`].default,
    code: (sources[`./${file}`] as string).trim(),
  };
}

export const demos: DemoEntry[] = [
  entry('01-single-edge.svelte', '单体右边缘调宽', 'enable={{ right: true }} + minWidth/maxWidth clamp'),
  entry('06-callbacks.svelte', '拖拽回调', 'onResizeStart / onChange / onResizeEnd 三阶段回调，实时显示尺寸与状态'),
  entry('07-all-handles.svelte', '八方向把手', '不设 enable 时四边 + 四角八个把手全部启用'),
  entry('02-corners.svelte', '四角自由缩放', '四个角把手，宽高各自 min/max 约束'),
  entry('03-lock-grid.svelte', '锁比例 / 网格吸附', 'lockAspectRatio 锁定宽高比；grid 吸附步长'),
  entry('15-snap.svelte', '吸附到指定尺寸', 'snap 吸附到指定像素档位，snapGap 控制吸附生效间隙'),
  entry('14-bound-element.svelte', '边界约束', 'boundElement="parent" 限制伸缩框不超出父容器'),
  entry('08-controlled.svelte', '受控尺寸', 'size 受控：按钮与拖拽经 onChange 双向同步'),
  entry('10-keyboard.svelte', '键盘无障碍', '把手 role=separator + aria-value*，方向键/Home/End 调节（本库相较 Semi 额外强调）'),
  entry('09-custom-handle.svelte', '自定义把手', 'handleNode 自定义某方向把手内容'),
  entry('04-group-horizontal.svelte', '水平分栏', 'ResizeGroup direction="horizontal"，相邻两项联动一增一减、总和守恒'),
  entry('05-group-vertical.svelte', '垂直分栏', 'direction="vertical"，拖把手上下面板联动'),
  entry('13-multi-pane.svelte', '多面板 / 锁定把手', '三面板两把手，ResizeHandler disabled 锁定其中一个'),
  entry('16-collapsible.svelte', '双击折叠面板', 'ResizeHandler collapsible：双击折叠/展开左侧面板（本库相较 Semi 额外提供）'),
  entry('11-nested.svelte', '嵌套分栏', '水平分栏内嵌垂直分栏，典型 IDE 三区布局'),
  entry('12-dynamic-direction.svelte', '动态方向', '运行时切换 horizontal / vertical'),
];
