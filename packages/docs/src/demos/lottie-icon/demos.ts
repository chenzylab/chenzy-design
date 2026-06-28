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
  entry('01-basic.svelte', '基础 Lottie 图标', '注入 player 工厂，支持自动播放、悬停触发及降级静止'),
  entry('02-playback.svelte', '播放控制', 'autoplay/loop 自动循环，speed 调节播放速度'),
  entry('03-size.svelte', '尺寸', 'small/default/large 预设及自定义数值尺寸'),
  entry('04-manual-control.svelte', '手动控制', 'trigger="manual" + bind:this 命令式 play/pause/stop'),
];
