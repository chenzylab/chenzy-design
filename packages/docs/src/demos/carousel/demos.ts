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
  entry('01-basic.svelte', '基本用法', '默认自动播放，幻灯片内可放任意内容（Typography 排版）'),
  entry('02-theme.svelte', '主题切换', '默认定义了三种主题：primary、light、dark'),
  entry('03-indicator.svelte', '指示器', '指示器类型（dot/line/columnar）、位置（left/center/right）、尺寸（small/medium）'),
  entry('04-arrow.svelte', '箭头', 'showArrow 控制箭头可见，arrowType 控制展示时机（always/hover）'),
  entry('05-custom-arrow.svelte', '定制箭头', '通过 arrowProps 定制箭头图标与点击事件'),
  entry('06-autoplay.svelte', '播放参数', 'autoPlay 传入 interval 控制间隔，hoverToPause 控制悬停暂停'),
  entry('07-animation.svelte', '动画效果与切换速度', "animation='fade' 渐隐切换，speed 控制切换时长"),
  entry('08-controlled.svelte', '受控的轮播图', 'activeIndex + onChange 受控当前激活索引'),
];
