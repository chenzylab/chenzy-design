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
  entry('01-type.svelte', '按钮类型', '支持 primary / secondary / tertiary / warning / danger 五种类型。'),
  entry('02-theme.svelte', '按钮主题', 'solid / light / borderless / outline 四种主题样式。'),
  entry('03-size.svelte', '尺寸', '提供 large / default / small 三种尺寸。'),
  entry('04-state.svelte', '状态', '支持禁用、加载中、块级（block）等状态。'),
  entry('05-icon.svelte', '图标按钮', '通过 icon snippet 加图标，iconPosition 控制左右；纯图标按钮需提供 ariaLabel。'),
  entry('06-link.svelte', '链接按钮', '提供 href 时渲染为 <a>，禁用时移除 href 不可激活。'),
  entry('07-block.svelte', '块级按钮', 'block 让按钮撑满容器宽度，常用于表单/移动端主操作。'),
  entry('08-colorful.svelte', 'AI 多彩', 'colorful 在 solid/light 主题下用品牌渐变，营造 AI 风格。'),
  entry('09-group.svelte', '按钮组', 'ButtonGroup 横向拼接多个 Button，组级 type/theme/size 经 context 透传，单个按钮仍可覆盖。'),
  entry('10-split.svelte', '分裂按钮', 'SplitButtonGroup 左侧主操作 + 右侧箭头触发下拉，下拉复用 Dropdown 的 items API。'),
];
