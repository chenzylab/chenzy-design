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
  entry('01-basic.svelte', '基础用法', '支持图片、文字降级三种形态。'),
  entry('02-shape-size.svelte', '形状与尺寸', '提供 circle / square 两种形状，extra-small 到 extra-large 五种尺寸。'),
  entry('03-color.svelte', '配色', 'color="auto" 按文字哈希取色；也可用预设 16 档语义色名（对齐 Semi）。'),
  entry('04-dot.svelte', '状态点', '设置 dot 在右下角显示状态点，通过 status 控制颜色语义。'),
  entry('05-group.svelte', '头像组', 'AvatarGroup 将多个头像叠加展示，超出 maxCount 时折叠为 +N 头像。'),
  entry('06-border.svelte', '呼吸描边环', 'border 渲染一圈描边环；对象形式可定制 color 并用 motion 开启呼吸动画。'),
];
