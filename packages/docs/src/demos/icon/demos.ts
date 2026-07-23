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
  /** 跳过 DemoBox 裸渲染。 */
  raw?: boolean;
  /** 置于「如何引入」之前的页首区块（隐含 raw，不进 TOC）。 */
  pageHead?: boolean;
}

function entry(
  file: string,
  title: string,
  description?: string,
  opts?: { raw?: boolean; pageHead?: boolean },
): DemoEntry {
  return {
    title,
    description,
    component: mods[`./${file}`].default,
    code: (sources[`./${file}`] as string).trim(),
    ...opts,
  };
}

export const demos: DemoEntry[] = [
  // —— 图标列表：页首区块，置于「如何引入」之前，裸渲染无源码框，不进 TOC（对齐 Semi）——
  entry(
    '10-icon-list.svelte',
    '图标列表',
    '@chenzy-design/icons（面性/线性 + AI 单/双/多色）与 @chenzy-design/icons-lab（彩色）全量列表，点击复制图标名。',
    { pageHead: true },
  ),
  // —— 代码演示（顺序对齐 Semi basic/icon）——
  entry('07-named-basic.svelte', '基础使用', '从 @chenzy-design/icons 引入具名图标组件，用法同 Semi：<IconHome />。'),
  entry('11-named-rotate.svelte', '旋转', '具名图标自带 size 尺寸、rotate 静态旋转、spin 持续旋转（受 reduced-motion 抑制）。'),
  entry('12-named-size.svelte', '尺寸', 'Icon 封装 size 属性：extra-small(8) / small(12) / default(16) / large(20) / extra-large(24)，也可用 inherit 继承上下文字号。'),
  entry('13-named-color.svelte', '颜色', '单色图标自动继承外部容器 CSS color；也可通过 style 修改图标颜色。'),
  entry('08-two-tone.svelte', '双色图标', '双色 AI 图标（IconAI*Level2）通过 fill 属性设置颜色，支持 string 与 string[]。'),
  entry('09-multi-tone.svelte', '多色按钮', '多色 AI 图标（IconAI*Level3）四色渐变，缺省用默认多彩色，也可通过 fill 传 string[] 自定义。'),
  entry('14-custom.svelte', '自定义图标', '自定义图标传入 Icon 组件（svg={snippet}，对齐 Semi svg={<CustomIcon />}），支持 size、rotate、spin 等属性。'),
  entry('05-source-a11y.svelte', '使用 SVG 字符串作为图标源', '以 Vite ?raw 导入 svg 字符串传给 svg prop；提供 type 后 role=img + aria-label；fill 覆盖填充色。'),
  // —— 本库补充（Semi 无）：UnoCSS 纯 class 路径 ——
  entry('06-preset-icons.svelte', 'UnoCSS 图标（纯 class）', '不经过 Icon 组件，直接用 UnoCSS preset-icons 的 i-lucide-* class。图标数据来自本地 @iconify-json/lucide，颜色/尺寸走工具类。'),
  // —— Accessibility ——
  entry('15-aria-label.svelte', 'ARIA', '具名图标默认 aria-label 为文件名（IconHome → home），可通过 aria-label 覆盖为更语义化的名字。'),
];
