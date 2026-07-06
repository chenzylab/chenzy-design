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
  seeAlso?: { text: LocalizedText; component: string };
}

function entry(
  file: string,
  title: LocalizedText,
  description?: LocalizedText,
  seeAlso?: DemoEntry['seeAlso'],
): DemoEntry {
  return {
    title,
    description,
    component: mods[`./${file}`].default,
    code: (sources[`./${file}`] as string).trim(),
    seeAlso,
  };
}

export const demos: DemoEntry[] = [
  entry(
    '01-basic.svelte',
    { zh: '基础用法', en: 'Basic' },
    {
      zh: '纯图标按钮：通过 icon snippet 传入图标，ariaLabel 必填以提供可访问名。等价于 Button 传 icon 且无文字。',
      en: 'Icon-only button: pass the icon via the icon snippet; ariaLabel is required for the accessible name. Equivalent to Button with icon and no text.',
    },
    { text: { zh: 'Button', en: 'Button' }, component: 'Button' },
  ),
  entry(
    '02-type.svelte',
    { zh: '按钮类型', en: 'Type' },
    {
      zh: '复用 Button 的五种语义类型：primary / secondary / tertiary / warning / danger。',
      en: 'Reuses Button’s five semantic types: primary / secondary / tertiary / warning / danger.',
    },
  ),
  entry(
    '03-theme.svelte',
    { zh: '按钮主题', en: 'Theme' },
    {
      zh: '复用 Button 的四种视觉变体：light / solid / borderless / outline。',
      en: 'Reuses Button’s four visual themes: light / solid / borderless / outline.',
    },
  ),
  entry(
    '04-size.svelte',
    { zh: '尺寸', en: 'Size' },
    {
      zh: '三档尺寸 large / default / small；纯图标下命中区随尺寸收成方形。',
      en: 'Three sizes large / default / small; the icon-only hit area squares up with the size.',
    },
  ),
  entry(
    '05-circle.svelte',
    { zh: '圆形按钮', en: 'Circle' },
    {
      zh: 'circle 让按钮呈正圆（border-radius:50%），配合 icon-only 的方形尺寸得到正圆。circle 同样可用于 Button。',
      en: 'circle renders a perfect round button (border-radius:50%), combined with the square icon-only size. circle is also available on Button.',
    },
  ),
  entry(
    '06-loading-disabled.svelte',
    { zh: '加载与禁用', en: 'Loading & Disabled' },
    {
      zh: 'loading 用旋转图标替换并禁止点击（aria-busy）；disabled 降低不透明度并禁止交互。',
      en: 'loading swaps in a spinner and blocks clicks (aria-busy); disabled lowers opacity and blocks interaction.',
    },
  ),
  entry(
    '07-colorful.svelte',
    { zh: 'AI 风格 - 多彩', en: 'AI Style - Colorful' },
    {
      zh: 'colorful 在各主题下用品牌蓝→紫渐变，营造 AI 风格；可与 circle 组合。',
      en: 'colorful applies a blue→purple gradient across themes for an AI feel; combinable with circle.',
    },
  ),
];
