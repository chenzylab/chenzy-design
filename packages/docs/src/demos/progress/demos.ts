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
  entry('01-line.svelte', '标准的进度条', '通过 stroke 控制填充色、percent 控制进度、size 控制尺寸；size 不满足时可用 style 传入 height 自定义高度。'),
  entry('02-info.svelte', '展示百分比文本', 'showInfo 控制是否展示百分比数字，format 可格式化展示文本。'),
  entry('03-vertical.svelte', '垂直的进度条', 'direction="vertical" 展示垂直进度条，可通过 style 传入 width 控制宽度。'),
  entry('04-circle.svelte', '环形进度条', 'type="circle" 展示环形进度条，默认尺寸 72×72，可通过 width 控制大小。'),
  entry('05-circle-small.svelte', '小号的环形进度条', 'size="small" 小号环形进度条默认尺寸 24×24，不显示中心文本。'),
  entry('06-dynamic-line.svelte', '动态改变进度', 'percent 变化时数字平滑滚动（线性插值动画）。'),
  entry('07-dynamic-circle.svelte', '动态改变进度（环形）', '环形进度条同样支持动态改变 percent。'),
  entry('08-format.svelte', '自定义中心文字内容', 'format 自定义中心文字，入参为当前百分比；showInfo={false} 或 format 返回空串则不显示。'),
  entry('09-linecap.svelte', '圆角/方角边缘', 'strokeLinecap 控制环形进度条边缘形状（round / square），仅 type=circle 生效。'),
  entry('10-stroke-array.svelte', '自定义进度条颜色', 'stroke 传入 Array<{percent, color}>，按当前 percent 落入的区间取色，支持 Hex / Hsl / Rgb / Design Token。'),
  entry('11-stroke-gradient.svelte', '自动补齐颜色区间', 'strokeGradient=true 时自动补齐颜色区间生成渐变。'),
];
