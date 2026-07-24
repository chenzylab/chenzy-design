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
  entry('01-basic.svelte', '基本输入框'),
  entry('02-basic-2.svelte', '基本输入框'),
  entry('03-inner-buttons.svelte', '隐藏步进器'),
  entry('04-hide-buttons.svelte', '隐藏步进器'),
  entry('05-size.svelte', '尺寸'),
  entry('06-format.svelte', '自定义显示格式与解析方式'),
  entry('07-pure-number.svelte', '纯数字输入框'),
  entry('08-currency-locale.svelte', '货币展示'),
  entry('09-currency-display.svelte', '货币展示'),
  entry('10-currency-symbol.svelte', '货币展示'),
  entry('11-scientific.svelte', '科学计数法'),
];
