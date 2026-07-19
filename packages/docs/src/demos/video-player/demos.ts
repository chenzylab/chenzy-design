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
  entry('01-basic.svelte', '基本用法', '传入 src / poster / height 即可播放。'),
  entry('02-controls.svelte', '设置菜单栏功能', 'controlsList 控制展示哪些控件及顺序。'),
  entry('03-loop.svelte', '循环播放', 'loop 开启循环播放。'),
  entry('04-seek-time.svelte', '快进快退', 'seekTime 设置键盘左右键快进快退秒数。'),
  entry('05-playback-rate.svelte', '播放速率', 'playbackRateList 自定义倍速档位。'),
  entry('06-volume.svelte', '音量设置', 'volume 初始音量 / muted 初始静音。'),
  entry('07-quality.svelte', '清晰度切换', 'qualityList + onQualityChange 切换时更新 src。'),
  entry('08-markers.svelte', '章节标记', 'markers 在进度条上标注章节点。'),
  entry('09-theme.svelte', '主题', 'theme="light" 浅色主题（默认 dark）。'),
  entry('10-ref.svelte', '使用 ref 控制', 'bind videoRef 拿到原生 video，命令式同步 play/pause。'),
];
