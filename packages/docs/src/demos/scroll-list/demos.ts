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
  entry('01-basic.svelte', '基本使用', '滚轮三列（时段 / 小时 / 分钟），滚动或点击选择，选中项吸附到中央选区；header/footer 自定义头尾。'),
  entry('02-normal.svelte', '普通列表模式', 'mode="normal" 不吸附居中，点击项即选中并高亮背景（对齐 Semi ScrollList 演示）。'),
  entry('03-single-cycled.svelte', '单列无限循环', 'cycled 到头尾可继续翻动、无缝衔接；奇数项禁用会被滚动落定跳过；motion=false 直达无缓动。'),
  entry('04-transform.svelte', '选中项文案变换', 'transform 对选中项文案变换（加单位）；项级 transform 优先于列级公共 transform。'),
  entry('05-body-height.svelte', '自定义 body 高度', 'bodyHeight 收窄可视高度，wheel 列按实测高度自适应居中吸附。'),
  entry('06-date.svelte', '日期三列联动', '年 / 月 / 日三 wheel 列，改年/月时日列天数联动重算并夹回合法日。'),
];
