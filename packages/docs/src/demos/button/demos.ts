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
  entry('01-type.svelte', '按钮类型', '支持 primary / secondary / tertiary / warning / danger 五种语义类型。'),
  entry('02-theme.svelte', '按钮主题', 'solid / light / borderless / outline 四种主题（填充方式），与类型正交组合。'),
  entry('03-size.svelte', '尺寸', '提供 large / default / small 三种尺寸。'),
  entry('04-block.svelte', '块级按钮', 'block 让按钮撑满容器宽度，常用于表单/移动端主操作。'),
  entry('05-icon.svelte', '图标按钮', '通过 icon snippet 加图标，iconPosition 控制左右；纯图标按钮需提供 ariaLabel。'),
  entry('06-link.svelte', '链接按钮', '提供 href 时渲染为 <a>，禁用时移除 href 不可激活。'),
  entry('07-disabled.svelte', '禁用状态', 'disabled 在各主题下统一降低不透明度并禁止交互。'),
  entry('08-loading.svelte', '加载状态', 'loading 自动带旋转图标并禁止点击，可与文字或纯图标组合。'),
  entry('09-colorful.svelte', 'AI 风格 - 多彩按钮', 'colorful 在所有主题下用品牌蓝→紫渐变，营造 AI 风格；type 仅 primary/tertiary。'),
  entry('10-group.svelte', '按钮组合', 'ButtonGroup 横向拼接多个 Button，组级 type/theme/size 经 context 透传，单个按钮仍可覆盖。'),
  entry('11-split.svelte', '分裂按钮组合', 'SplitButtonGroup 左侧主操作 + 右侧箭头触发下拉，下拉复用 Dropdown 的 items API。'),
];
