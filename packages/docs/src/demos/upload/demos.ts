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
  entry('09-avatar-trigger.svelte', '头像触发上传', '以 Avatar 作为触发器（showUploadList=false + hoverMask 遮罩），点击头像换图的完整观感。'),
  entry('10-upload-data.svelte', '自定义上传属性', 'uploadData 函数式按当前文件生成附加字段，headers 附加请求头，uploadName 自定义字段名。'),
  entry('11-controlled.svelte', '受控组件', 'value + onChange 完全受控，外部按钮直接增删列表证明受控。'),
  entry('12-preview.svelte', '图片墙放大预览', 'renderPicPreviewIcon 自定义 hover 预览图标，配合 onPreviewClick 触发预览。'),
  entry('13-default-list.svelte', '默认文件列表', 'defaultValue 传入已上传项（含 url 预览、status:success），非受控。'),
  entry('14-disabled.svelte', '禁用', 'disabled 下 text 与 picture-card 两态：触发器不可点、列表项不可移除。'),
  entry('15-custom-request.svelte', '自定义请求', 'customRequest 完全接管上传，模拟 onProgress 进度后置成功/失败。'),
  entry('16-replace-hide-list.svelte', '替换与隐藏列表', 'showReplace 已上传项替换按钮（text/picture-card），showUploadList=false 隐藏列表。'),
  entry('17-file-list-title.svelte', '自定义列表标题', 'fileListTitle 的 string 形式与 Snippet 形式（入参 onClear/clearText 自绘清空）。'),
  entry('18-tooltip.svelte', '文件名省略提示', '超长文件名省略，showTooltip 对象式（type:tooltip）hover 展示完整名称。'),
  entry('19-on-progress.svelte', '进度回调', 'onProgress 回调把每个文件的 percent 回传外部展示。'),
  entry('20-imperative.svelte', '命令式操作', 'bind:this 拿 ref，insert(files, index) 指定位置插入、openFileDialog() 打开选择器。'),
  entry('21-clear-confirm.svelte', '批量清空确认', 'showClear 批量清空按钮 + beforeClear 二次确认拦截。'),
  entry('BasicDemo.svelte', '完整示例', '尺寸变体、校验态、并发控制、beforeUpload 拦截、目录上传等高级用法。'),
];
