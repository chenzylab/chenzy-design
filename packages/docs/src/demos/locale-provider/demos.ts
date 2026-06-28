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
  entry('01-basic.svelte', '基础国际化', '切换语言后子组件内置文案随之变化'),
  entry(
    '02-string-code.svelte',
    '字符串语言码',
    'locale 传内置字符串码（zh-CN / en-US），Empty 与 Pagination 等组件内置文案同步切换',
  ),
  entry(
    '03-nested-override.svelte',
    '嵌套覆盖局部文案',
    '内层 Provider 默认 inherit 深合并外层语言包，仅覆盖指定 key，其余继承父级',
  ),
  entry(
    '04-register-custom.svelte',
    '注册自定义语言包',
    'registerLocale 将自定义包注册到字符串码，之后 locale 直接传该码即可解析',
  ),
];
