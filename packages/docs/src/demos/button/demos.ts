import type { Component } from 'svelte';

const mods = import.meta.glob<{ default: Component }>('./*.svelte', { eager: true });
const sources = import.meta.glob('./*.svelte', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

/** 可本地化文本：纯字符串（仅中文）或 { zh, en } 双语对象。 */
type LocalizedText = string | { zh: string; en: string };

export interface DemoEntry {
  title: LocalizedText;
  description?: LocalizedText;
  component: Component;
  code: string;
}

function entry(file: string, title: LocalizedText, description?: LocalizedText): DemoEntry {
  return {
    title,
    description,
    component: mods[`./${file}`].default,
    code: (sources[`./${file}`] as string).trim(),
  };
}

export const demos: DemoEntry[] = [
  entry(
    '01-type.svelte',
    { zh: '按钮类型', en: 'Type' },
    {
      zh: '支持 primary / secondary / tertiary / warning / danger 五种语义类型。',
      en: 'Five semantic types: primary / secondary / tertiary / warning / danger.',
    },
  ),
  entry(
    '01b-type-colors.svelte',
    { zh: '关于类型字体色值', en: 'Type Color Variables' },
    {
      zh: '每种 type 的语义色都是 CSS 变量，可直接用于自定义元素：--cd-color-primary（主要）、--cd-color-secondary（次要）、--cd-color-tertiary（第三）、--cd-color-warning（警告）、--cd-color-danger（危险）。',
      en: 'Each type maps to a semantic color CSS variable you can reuse: --cd-color-primary (primary), --cd-color-secondary (secondary), --cd-color-tertiary (tertiary), --cd-color-warning (warning), --cd-color-danger (danger).',
    },
  ),
  entry(
    '02-theme.svelte',
    { zh: '按钮主题', en: 'Theme' },
    {
      zh: '目前可用的主题（theme）为：light（浅色背景）、solid（深色背景）、borderless（无背景）、outline（边框模式），与类型正交组合。默认主题为 light。',
      en: 'Available themes: light (light background), solid (dark background), borderless (no background), outline (bordered), orthogonal to type. Default is light.',
    },
  ),
  entry(
    '02a-theme-light.svelte',
    { zh: '浅色背景', en: 'Light' },
    {
      zh: 'theme="light"：浅色语义底 + 语义文字，适合次级/常规操作。',
      en: 'theme="light": tinted semantic background with semantic text, for secondary/regular actions.',
    },
  ),
  entry(
    '02b-theme-solid.svelte',
    { zh: '深色背景', en: 'Solid' },
    {
      zh: 'theme="solid"：语义实心底 + 反相文字，视觉最强，适合主操作。',
      en: 'theme="solid": solid semantic fill with inverse text, the strongest emphasis for primary actions.',
    },
  ),
  entry(
    '02c-theme-borderless.svelte',
    { zh: '无背景', en: 'Borderless' },
    {
      zh: 'theme="borderless"：透明底 + 语义文字，无边框，最轻量。',
      en: 'theme="borderless": transparent background with semantic text and no border, the lightest weight.',
    },
  ),
  entry(
    '02d-theme-outline.svelte',
    { zh: '边框模式', en: 'Outline' },
    {
      zh: 'theme="outline"：透明底 + 语义边框 + 语义文字，介于 light 与 borderless 之间。',
      en: 'theme="outline": transparent background with a semantic border and text, between light and borderless.',
    },
  ),
  entry(
    '03-size.svelte',
    { zh: '尺寸', en: 'Size' },
    { zh: '提供 large / default / small 三种尺寸。', en: 'Three sizes: large / default / small.' },
  ),
  entry(
    '04-block.svelte',
    { zh: '块级按钮', en: 'Block' },
    {
      zh: 'block 让按钮撑满容器宽度，常用于表单/移动端主操作。',
      en: 'block stretches the button to full container width, common for forms / mobile.',
    },
  ),
  entry(
    '05-icon.svelte',
    { zh: '图标按钮', en: 'Icon' },
    {
      zh: '通过 icon snippet 加图标，iconPosition 控制左右；纯图标按钮需提供 ariaLabel。',
      en: 'Add an icon via the icon snippet; iconPosition sets side. Icon-only buttons need ariaLabel.',
    },
  ),
  entry(
    '06-link.svelte',
    { zh: '链接按钮', en: 'Link' },
    {
      zh: '提供 href 时渲染为 <a>，禁用时移除 href 不可激活。',
      en: 'With href it renders as <a>; when disabled the href is removed.',
    },
  ),
  entry(
    '07-disabled.svelte',
    { zh: '禁用状态', en: 'Disabled' },
    {
      zh: 'disabled 在各主题下统一降低不透明度并禁止交互。',
      en: 'disabled lowers opacity and blocks interaction across all themes.',
    },
  ),
  entry(
    '08-loading.svelte',
    { zh: '加载状态', en: 'Loading' },
    {
      zh: 'loading 自动带旋转图标并禁止点击，可与文字或纯图标组合。',
      en: 'loading shows a spinner and blocks clicks; works with text or icon-only.',
    },
  ),
  entry(
    '09-colorful.svelte',
    { zh: 'AI 风格 - 多彩按钮', en: 'AI Style - Colorful' },
    {
      zh: 'colorful 在所有主题下用品牌蓝→紫渐变，营造 AI 风格；type 仅 primary/tertiary。',
      en: 'colorful applies a blue→purple gradient across all themes for an AI feel; type is primary/tertiary only.',
    },
  ),
  entry(
    '10-group.svelte',
    { zh: '按钮组合', en: 'ButtonGroup' },
    {
      zh: 'ButtonGroup 横向拼接多个 Button，组级 type/theme/size 经 context 透传，单个按钮仍可覆盖。',
      en: 'ButtonGroup joins buttons horizontally; group-level type/theme/size flow via context, each button can override.',
    },
  ),
  entry(
    '11-split.svelte',
    { zh: '分裂按钮组合', en: 'SplitButtonGroup' },
    {
      zh: 'SplitButtonGroup 左侧主操作 + 右侧箭头触发下拉，下拉复用 Dropdown 的 items API。',
      en: 'SplitButtonGroup: primary action on the left, arrow on the right opens a Dropdown (reusing its items API).',
    },
  ),
];
