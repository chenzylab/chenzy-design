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

// 对齐 Semi Pagination 演示集（navigation/pagination）。
export const demos: DemoEntry[] = [
  entry('01-basic.svelte', '基本', '通过 total 设置总条数、pageSize 设置每页容量。'),
  entry('02-disabled.svelte', '禁用', '通过 disabled 禁用整个分页器。'),
  entry('03-show-total.svelte', '总页数显示', '通过 showTotal 显示总页数文案。'),
  entry('04-default-current.svelte', '指定当前页码', '通过 defaultCurrentPage 指定初始激活的页码（非受控）。'),
  entry('05-size-changer.svelte', '每页容量切换', '开启 showSizeChanger，通过 Select 快速切换每页容量。'),
  entry('06-quick-jumper.svelte', '快速跳转', '开启 showQuickJumper，输入页码回车快速跳转；越界自动跳末页。'),
  entry('07-controlled.svelte', '页码受控', '传入 currentPage 后为受控组件，当前页完全取决于 currentPage。'),
  entry('08-page-size-opts.svelte', '预设每页容量可选值', '通过 pageSizeOpts 指定切换每页容量的可选值。'),
  entry('09-small.svelte', '迷你版本', "size='small' 为紧凑视图；开启 hoverShowPageSelect 可 hover 页码弹出全部页码快速切换。"),
  entry('10-prevent.svelte', '切换每页条数的页码策略', '默认按当前首条数据位置重算页码；preventPageChangeOnPageSizeChange 则保持当前页码不变。'),
];
