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
  entry('01-basic.svelte', '基本用法', 'Lottie JSON 在 CDN 上时，params 传入 path=JSON 的 URL'),
  entry(
    '02-animation-data.svelte',
    'animationData 用法',
    'JSON 需打包进网站代码时，params 传入 animationData=JSON 对象',
  ),
  entry(
    '03-animation-instance.svelte',
    '获取当前动画实例',
    'getAnimationInstance 拿到 AnimationItem，实现播放暂停/调速等控制',
  ),
  entry(
    '04-get-lottie.svelte',
    '获取全局 Lottie',
    'getLottie prop 或具名导出 getLottie() 获取全局 lottie 包',
  ),
];
