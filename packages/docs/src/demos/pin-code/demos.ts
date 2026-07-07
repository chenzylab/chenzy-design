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
  entry('01-basic.svelte', '基础用法', '6 位数字验证码，受控值绑定，逐格自动跳格。'),
  entry('02-count-format.svelte', '位数与格式', 'count 设定位数，format 设定单字符可输入范围。'),
  entry('03-size.svelte', '尺寸', 'size 控制每格大小（small / default / large）。'),
  entry('04-status-disabled.svelte', '校验态与禁用', 'status 透传各格边框语义，disabled 置灰不可输入。'),
  entry('05-complete.svelte', '完成回调', '填满末格自动 blur 并触发 onComplete。'),
  entry('06-format-advanced.svelte', '字符格式', 'format 四种：number / mixed / RegExp（只大写）/ 函数（只小写）逐字符校验。'),
  entry('07-focus-method.svelte', '命令式聚焦', 'bind:this 拿组件实例，focus(index) / blur(index) 聚焦/失焦指定格。'),
  entry('08-controlled-random.svelte', '受控', 'value 由外部持有，配合 onChange，可编程式随机填入。'),
];
