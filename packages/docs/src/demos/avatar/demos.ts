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
  entry('01-size.svelte', '尺寸', 'size 支持 extra-extra-small 到 extra-large 共 7 档，默认 medium。'),
  entry('02-color.svelte', '颜色', '支持默认色板 16 种颜色（默认 grey），也可用 style 自定义颜色。'),
  entry('03-gap.svelte', '自适应字符大小', '字符头像字号随宽度自适应，gap 调整字符距左右两侧的像素。'),
  entry('04-image.svelte', '图片', '通过 src 设置图片格式的头像，加载失败自动降级。'),
  entry('05-shape.svelte', '形状', '支持 circle、square 两种形状，默认 circle。'),
  entry('06-event.svelte', '事件', 'onClick / onMouseEnter / onMouseLeave；hover 时通过 hoverMask 传入覆盖层内容。'),
  entry('07-top-slot.svelte', '顶部 Slot', 'topSlot 对象配置顶部渐变标记（gradientStart/gradientEnd/text）。'),
  entry('08-bottom-slot.svelte', '底部 Slot', 'bottomSlot 对象配置底部圆形/方形标记（shape/bgColor/text）。'),
  entry('16-combo.svelte', '组合效果', '图片头像叠加边框呼吸动画、内容动效、顶部直播气泡与底部圆形图标（抖音直播头像）。'),
  entry('09-border.svelte', '额外边框', 'border 渲染一圈额外描边环，对象形式可定制 color。'),
  entry('10-content-motion.svelte', '额外动效', 'border={{ motion: true }} 与 contentMotion 开启边框与内容区域动效。'),
  entry('11-group.svelte', '头像组', 'AvatarGroup 将多个头像叠加展示为组。'),
  entry('12-group-max.svelte', 'maxCount 折叠', '通过 maxCount 设置展示数量，超出折叠为 +N。'),
  entry('13-render-more.svelte', '自定义 more', 'renderMore 自定义 +N 溢出头像，可结合 Popover 展开剩余成员。'),
  entry('14-overlap-from.svelte', '覆盖方式', 'overlapFrom 控制层叠压盖方向：start=前压后，end=后压前。'),
];
