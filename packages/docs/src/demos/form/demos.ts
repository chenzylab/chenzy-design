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
  entry('01-basic.svelte', '基本写法', '从 Form 导出控件并加 field 属性即接管数据流；label 可传字符串或对象形态（extra / optional）。'),
  entry('02-controls.svelte', '已支持的表单控件', 'Input / InputNumber / Select / DatePicker / TimePicker / TreeSelect / Cascader / TagInput / TextArea / CheckboxGroup / RadioGroup / Slider / Rating / Switch 全家福。'),
  entry('03-value-binding.svelte', '控件值的绑定', 'field 支持含 . 或 [] 的多级嵌套路径；children 带参 snippet 实时映射 formState.values。'),
  entry('04-layout.svelte', '表单布局', 'labelPosition（top / left）与 labelAlign（left / right）控制 label 位置与文本对齐。'),
  entry('05-section.svelte', '表单分组', 'Form.Section 把字段按语义分区，带分区标题（仅影响布局，不影响数据结构）。'),
  entry('06-no-label.svelte', '隐藏 Label', 'noLabel 关闭自动 Label（保留 ErrorMessage）；pure 连 wrapper 也不插，DOM 与原控件一致。'),
  entry('07-inset-label.svelte', '内嵌 Label', "labelPosition='inset' 把 Label 内嵌在控件内部左侧（Input / InputNumber / DatePicker / TimePicker / Select / TreeSelect / Cascader / TagInput 支持）。"),
  entry('08-help-extra.svelte', 'helpText、extraText', 'helpText 与校验信息共用区块（校验信息优先）；extraText 常显额外提示，extraTextPosition 控制位置。'),
  entry('09-slot.svelte', 'Form.Slot', '放置自定义组件并保持与 Field 一致的布局；Form 的 labelWidth / labelAlign 自动作用于 Slot。'),
  entry('10-input-group.svelte', 'InputGroup 组合多个 Field', '把多个控件组合为一组，仅需一个属于整组的 Label，控件无缝拼接，GroupError 聚合组内错误。'),
  entry('11-validation.svelte', '初始值与校验规则', 'initValues 统一设初始值，rules 声明校验规则（基于 async-validator）；stopValidateWithError 命中首条错误即停。'),
  entry('12-async-validate.svelte', '自定义校验（异步）', 'rules[].validator 可返回 Promise 做异步校验，返回错误消息字符串或 undefined。'),
  entry('13-modal.svelte', 'Modal 中的表单', '通过 getFormApi 拿到句柄，在弹窗确认时调用 formApi.validate() 集中校验。'),
];
