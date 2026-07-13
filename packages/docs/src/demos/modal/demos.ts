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
  entry('01-basic.svelte', '基本', '通过 visible 控制显隐，onOk / onCancel 处理确认与取消，afterClose 在完全关闭后回调。'),
  entry('02-footer-fill.svelte', '底部撑满', '设置 footerFill 为 true 可使 Modal footer 底部按钮撑满排列。'),
  entry('03-mask-closable.svelte', '点击遮罩层不可关闭', '修改 maskClosable 为 false 则不可通过点击遮罩层来关闭对话框。'),
  entry('04-custom-text.svelte', '自定义按钮文字', '通过 okText 与 cancelText 属性可自定义按钮显示的文字。'),
  entry('05-button-props.svelte', '自定义按钮属性', '通过 okButtonProps 与 cancelButtonProps 属性可自定义按钮的属性（size / type / disabled 等）。'),
  entry('06-custom-header-footer.svelte', '自定义对话框头部和页脚', '通过 header 自定义头部（设为 null 不展示），footer 自定义页脚按钮（设为 null 不展示）。'),
  entry('07-custom-style.svelte', '自定义对话框的样式', '通过 style 自定义位置（如 top），centered 居中显示，maskStyle 自定义遮罩，bodyStyle 自定义内容样式。'),
  entry('08-fully-custom.svelte', '自定义的对话框', '灵活使用 header / footer 等属性实现完全自定义的对话框。'),
  entry('09-fullscreen.svelte', '全屏 Modal', '使用 fullScreen 可以开启全屏对话框（会覆盖 width / height）。'),
  entry('10-imperative.svelte', '命令式调用', '使用 Modal.confirm / info / success / warning / error 命令式弹出，支持自定义 icon 及所有 Modal props。'),
  entry('11-hooks.svelte', 'Hooks 用法', '通过 Modal.useModal 创建 [modal, holder]，配合 <ModalContextHolder> 让命令式弹窗继承 context（如 LocaleProvider）。'),
  entry('12-draggable.svelte', '可拖拽 Modal', '通过 modalRender 自定义渲染 Modal 内容，用 DragMove 组件包裹实现可拖拽。'),
];
