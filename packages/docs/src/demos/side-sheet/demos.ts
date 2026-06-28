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
  entry('01-basic.svelte', '基础侧边栏', '右侧滑入面板，受控 open，支持 Esc/遮罩关闭并回调关闭原因。'),
  entry('02-placement.svelte', '弹出方位', 'placement 控制从 left/right/top/bottom 四边滑入。'),
  entry('03-size.svelte', '尺寸控制', 'size 预设（small/large）或 width 显式数值，显式优先于预设。'),
  entry('04-no-mask.svelte', '非模态协作', 'mask=false：无遮罩、不锁滚动、不抢焦点，可与主页面同时操作，outsideClosable 点击外部关闭。'),
  entry('05-footer.svelte', '带 Footer 操作', 'footer 暴露 close()，由取消/应用按钮关闭面板。'),
];
