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
  entry('01-basic.svelte', '基础用法', '拖拽上传区与 picture-card 缩略图网格两种交互方式。'),
  entry('02-drag.svelte', '拖拽上传', '通过 drag 开启拖拽区，自定义主/副文案。'),
  entry('03-picture-card.svelte', '图片卡片列表', 'listType="picture-card" 缩略图网格，受控管理图片列表。'),
  entry('04-limit-accept.svelte', '限制数量与类型', '用 limit 限制数量、accept 限制类型，超限/不符触发回调提示。'),
  entry('05-manual.svelte', '手动上传', '不传 action，仅收集文件，点击按钮统一手动触发上传。'),
  entry('06-fail-retry.svelte', '失败态与重试', '文本列表红底失败卡片、图片卡片失败角标/描边，hover 显示重试按钮（对齐 Semi 状态态）。'),
  entry('07-crop.svelte', '图片裁切', 'crop 开启后图片先进裁切弹窗（Modal + Cropper），确认后用裁切结果替换原文件再上传；传对象自定义圆形/宽高比。'),
  entry('08-render-family.svelte', '自定义渲染', 'renderFileItem 自定义列表项、showPicInfo + renderPicInfo 图片信息浮层（对标 Semi render 家族）。'),
  entry('BasicDemo.svelte', '完整示例', '尺寸变体、校验态、并发控制、beforeUpload 拦截、目录上传等高级用法。'),
];
