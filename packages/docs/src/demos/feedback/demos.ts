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
  entry('01-basic.svelte', '基本使用', '通过 visible 设置是否显示。默认反馈内容是 emoji 形式，可通过 onValueChange 获取当前选择。'),
  entry('02-text.svelte', '文字类型', '设置 type 为 text 可获得多行输入框形式，可通过 textAreaProps 设置多行输入框参数。'),
  entry('03-radio.svelte', '单选反馈', '设置 type 为 radio 可获得单选形式，可通过 radioGroupProps 设置单选参数。'),
  entry('04-checkbox.svelte', '多选反馈', '设置 type 为 checkbox 可获得多选形式，可通过 checkboxGroupProps 设置多选参数。'),
  entry('05-custom.svelte', '自定义反馈内容', '设置 type 为 custom，通过 children 设置内容；需自行经 okButtonProps.disabled 控制提交禁用。'),
  entry('06-modal.svelte', '模态对话框形式', '通过 mode 切换反馈形式，默认 popup，设为 modal 可获得模态对话框形式。'),
  entry('07-thanks.svelte', '反馈完成提示', '反馈完成后，可切换展示信息提示用户本次反馈已经完成。'),
];
