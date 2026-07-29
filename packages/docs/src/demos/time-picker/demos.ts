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

// 章节顺序严格对齐 Semi content/input/timepicker/index.md。
export const demos: DemoEntry[] = [
  entry('01-basic.svelte', '基础使用', '点击 TimePicker，然后可以在浮层中选择或者输入某一时间'),
  entry('02-scroll-wheel.svelte', '无限滚动', 'scrollItemProps 传 mode="wheel" + cycled 应用无限滚动效果'),
  entry('03-controlled.svelte', '受控组件', 'value 与 onChange 配合使用'),
  entry('04-format.svelte', '不同的 Format 格式', '浮层中的列随 format 变化，略去某部分则对应列消失'),
  entry('05-panel-header-footer.svelte', '设置面板头部，底部', 'panelHeader / panelFooter，range 模式可传数组分别指定两端'),
  entry('06-disabled.svelte', '禁用时间选择', 'disabled 禁用全部操作'),
  entry('07-step.svelte', '设置步长', 'hourStep / minuteStep / secondStep 按步长展示可选时分秒'),
  entry('08-use12hours.svelte', '12 小时制', 'use12Hours 时 format 默认为 a h:mm:ss'),
  entry('09-time-range.svelte', '时间范围', 'type="timeRange" 开启时间范围选择'),
  entry('10-disabled-time.svelte', 'Range 模式下分别禁用左右面板', 'disabledTime(value, panelType) 对左右面板应用不同禁用规则'),
  entry('11-trigger-render.svelte', '自定义触发器', 'triggerRender 自定义触发器渲染'),
  entry('12-timezone.svelte', '时区设置', '时区配置收敛在 ConfigProvider 中'),
];
