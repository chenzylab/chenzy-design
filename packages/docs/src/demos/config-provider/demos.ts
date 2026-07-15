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
    '01-timezone.svelte',
    '基本用法（时区）',
    '通过 timeZone 为时间类组件统一配置时区，切换时区后 DatePicker / TimePicker 的显示随之按新时区呈现。',
  ),
  entry(
    '02-consumer.svelte',
    '手动获取值',
    '组件内部通常自动消费 ConfigProvider 的值；特殊场景可用 getConfigContext（等价 Semi ConfigConsumer）手动读取合并后的配置。',
  ),
  entry(
    '03-responsive.svelte',
    '响应式断点监听',
    '开启 responsiveObserve 后，子组件经 onBreakpoint 订阅断点变化；responsiveMap 自定义断点，默认关闭时不注册任何 matchMedia。',
  ),
  entry(
    '04-direction.svelte',
    'RTL / LTR',
    '全局配置 direction 改变组件文本方向；rtl 时渲染 cd-rtl 包裹层驱动组件镜像，可在 ltr / rtl 间切换。',
  ),
  entry(
    '05-popup-container.svelte',
    '全局浮层容器',
    'getPopupContainer 经 context 提供全局默认浮层容器，Dropdown 等浮层未传自身 prop 时统一 portal 到此宿主。',
  ),
];
