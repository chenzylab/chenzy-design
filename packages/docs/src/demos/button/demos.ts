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
    '02-theme.svelte',
    { zh: '按钮主题', en: 'Theme' },
    {
      zh: 'solid / light / borderless / outline 四种主题（填充方式），与类型正交组合。',
      en: 'Four themes (fill modes): solid / light / borderless / outline, orthogonal to type.',
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
