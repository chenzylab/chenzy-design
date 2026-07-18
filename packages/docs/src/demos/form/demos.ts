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
  entry('01-basic.svelte', '基础校验', 'Form.Input 通过 rules 声明校验规则，onSubmit 返回 { valid, values }。'),
  entry('02-layout.svelte', '标签位置', '支持 left / top / inset 三种标签位置，inset 在聚焦时上浮。'),
  entry('03-controls.svelte', '表单控件', 'Form.Input / Select / DatePicker / Switch / Checkbox 等控件接管数据流，无须手动 value/onChange。'),
  entry('04-validation.svelte', '校验规则', 'required、内置 type、长度 min、自定义 validator（含异步）多种校验规则。'),
  entry('05-dependencies.svelte', '字段联动', 'dependencies 声明依赖字段，被依赖字段变化时自动重校验（如确认密码）。'),
  entry('06-dynamic.svelte', '动态字段', 'Form.List 动态增删行，每行子字段名由 name(item, sub) 拼接。'),
  entry('07-form-api.svelte', '外部操作', 'getFormApi 拿到内部句柄，在表单外部命令式 setValues / validate / reset。'),
  entry('08-section.svelte', '分组', 'Form.Section 把字段按语义分区，带分区标题。'),
  entry(
    '09-more-controls.svelte',
    '更多控件',
    'Form.TextArea / InputNumber / CheckboxGroup / RadioGroup / TimePicker / AutoComplete / PinCode 薄封装接管数据流。'
  ),
];
