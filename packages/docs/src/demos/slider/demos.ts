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
  entry('01-basic.svelte', '基础用法', '受控单值滑块，onChange 回调返回当前值。'),
  entry('02-range.svelte', '区间选择', '设置 range 启用双滑块，onChange 返回 [min, max] 数组。'),
  entry('03-disabled.svelte', '禁用与边界值', 'disabled 禁用交互，showBoundary 在轨道两端显示 min/max 标签。'),
  entry('04-with-input.svelte', '与输入框联动', 'Slider 与 InputNumber 双向同步，两者共享同一状态。'),
  entry('05-tip-formatter.svelte', '自定义提示', 'tipFormatter 自定义气泡文案，返回 null 可隐藏气泡；getAriaValueText 提供读值。'),
  entry('06-marks.svelte', '刻度标签', 'marks 定义刻度标签；included=false 时刻度不随选区高亮。'),
  entry('07-rail-gradient.svelte', '分段背景', 'railStyle 传入 linear-gradient，随选区动态更新形成分段着色。'),
  entry('08-vertical.svelte', '垂直方向', 'vertical 启用垂直布局，verticalReverse 翻转方向，height 控制高度。'),
  entry('09-handle-dot.svelte', '手柄圆点', 'handleDot 为手柄叠加圆点，range 时可用数组分别配置两个手柄。'),
  entry('10-controlled.svelte', '受控组件', '滑块位置由 value 控制，配合 onChange 使用；外部按钮可直接改变 value。'),
];
