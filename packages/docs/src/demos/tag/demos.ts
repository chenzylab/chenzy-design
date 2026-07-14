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
  entry(
    '01-basic.svelte',
    '基本用法',
    '内容用 Tag 包裹即可；closable 变为可关闭标签，点击 x 触发 onClose，在 onClose 内 preventDefault 可阻止默认隐藏。',
  ),
  entry('02-size.svelte', '尺寸', '默认定义大、小（默认）两种尺寸。'),
  entry('03-shape.svelte', '形状', '支持 square（默认）与 circle 两种形状。'),
  entry('04-icon.svelte', '配置图标', '通过 prefixIcon / suffixIcon 在内容前后添加图标。'),
  entry('05-color.svelte', '颜色', '支持默认色板的 16 种颜色和 white，也可通过 style 自定义颜色。'),
  entry(
    '06-colorful.svelte',
    'AI 风格 - 多彩标签',
    '设置 colorful 获得多彩标签（字重与非多彩不同）；gradient 区分渐变色与单色，与 type 组合。',
  ),
  entry('07-type.svelte', '样式类型', '三种样式类型：light 浅色底、ghost 白色底、solid 深色底。默认 light。'),
  entry('08-avatar.svelte', '头像标签', '设置 avatarSrc 生成头像标签，avatarShape 调整头像形状（square / circle）。'),
  entry('09-visible.svelte', '不可见的', '通过 visible 属性控制标签是否可见。'),
  entry(
    '10-taggroup.svelte',
    'TagGroup 使用',
    '在 TagGroup 内通过 tagList 传入配置并设置 maxTagCount，超出显示为 +N；showPopover 控制 hover +N 时是否 Popover 弹层展示剩余。',
  ),
  entry(
    '11-taggroup-closable.svelte',
    'TagGroup 可删除',
    'TagGroup 中标签可删除时，在 onTagClose 中依据回传的 tagKey 处理 tagList（对齐 Semi onTagClose(tagChildren, e, tagKey)）。',
  ),
  entry(
    '12-splittaggroup.svelte',
    'SplitTagGroup 组合标签',
    '使用 SplitTagGroup 将多个标签组合成整体：首尾标签圆角、中间圆角为 0，形成连续视觉效果。',
  ),
  entry(
    '13-splittaggroup-style.svelte',
    'SplitTagGroup 样式组合',
    '子 Tag 保留自身颜色 / 类型，连接外观纯视觉不影响语义（light / ghost）。',
  ),
];
