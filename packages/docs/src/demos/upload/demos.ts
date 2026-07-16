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
  entry('01-basic.svelte', '基础用法', '拖拽上传区与 picture 照片墙缩略图网格两种交互方式。'),
  entry('02-drag.svelte', '拖拽上传', '通过 draggable 开启拖拽区，自定义主/副文案。'),
  entry('03-picture-card.svelte', '照片墙', 'listType="picture" 缩略图网格，受控管理图片列表。'),
  entry('04-limit-accept.svelte', '限制数量与类型', '用 limit 限制数量、accept 限制类型，超限/不符触发回调提示。'),
  entry('05-manual.svelte', '手动上传', '配合 showClear + fileListTitle 收集文件，点击按钮统一处理。'),
  entry('06-fail-retry.svelte', '失败态与重试', 'list 红底失败卡片、picture 失败角标/描边，hover 显示重试按钮（对齐 Semi 状态态）。'),
  entry('07-crop.svelte', '图片裁切', 'crop 开启后图片先进裁切弹窗（Modal + Cropper），确认后用裁切结果替换原文件再上传；传对象自定义圆形/宽高比。'),
  entry('08-render-family.svelte', '自定义渲染', 'renderFileItem 自定义列表项、showPicInfo + renderPicInfo 图片信息浮层（对标 Semi render 家族）。'),
  entry('09-avatar-trigger.svelte', '头像触发上传', '以 Avatar 作为触发器（showUploadList=false + hoverMask 遮罩），点击头像换图的完整观感。'),
  entry('10-upload-data.svelte', '自定义上传属性', 'data 函数式按当前文件生成附加字段，headers 附加请求头，name 自定义字段名。'),
  entry('11-controlled.svelte', '受控组件', 'fileList + onChange 完全受控，外部按钮直接增删列表证明受控。'),
  entry('12-preview.svelte', '图片墙放大预览', 'onPreviewClick 点击缩略图触发 ImagePreview 放大预览（对齐 Semi）。'),
  entry('13-default-list.svelte', '默认文件列表', 'defaultFileList 传入已上传项（含 url 预览、status:success），非受控。'),
  entry('14-disabled.svelte', '禁用', 'disabled 下 list 与 picture 两态：触发器不可点、列表项不可移除。'),
  entry('15-custom-request.svelte', '自定义请求', 'customRequest 完全接管上传，模拟 onProgress 进度后置成功/失败。'),
  entry('16-replace-hide-list.svelte', '替换与隐藏列表', 'showReplace 已上传项替换按钮（list/picture），showUploadList=false 隐藏列表。'),
  entry('17-file-list-title.svelte', '自定义列表标题', 'fileListTitle 的 string 形式与 Snippet 形式（入参 onClear/clearText 自绘清空）。'),
  entry('18-tooltip.svelte', '文件名省略提示', '超长文件名省略，showTooltip 对象式（type:tooltip）hover 展示完整名称。'),
  entry('19-on-progress.svelte', '进度回调', 'onProgress 回调把每个文件的 percent 回传外部展示。'),
  entry('20-imperative.svelte', '命令式操作', 'bind:this 拿 ref，insert(files, index) 指定位置插入、openFileDialog() 打开选择器。'),
  entry('21-clear-confirm.svelte', '批量清空确认', 'showClear 批量清空按钮 + beforeClear 二次确认拦截。'),
  entry('22-hotspot-location.svelte', '照片墙热区位置', 'hotSpotLocation 切换加号瓦片位置：start 前置 / end 后置（对齐 Semi）。'),
  entry('23-prompt.svelte', '添加提示文本', 'prompt 提示文本 + promptPosition 位置（left / right / bottom，对齐 Semi 默认 right）。'),
  entry('24-directory.svelte', '上传文件夹', 'directory 递归选择整个目录下所有文件，保留相对路径（对齐 Semi）。'),
  entry('25-pic-size.svelte', '照片墙宽高', 'picWidth / picHeight 统一定制照片墙缩略图与添加瓦片宽高（对齐 Semi v2.42+）。'),
  entry('26-after-upload.svelte', '上传后更新信息', 'afterUpload 上传成功后据返回对象更新文件项状态 / 校验信息 / 文件名（对齐 Semi）。'),
  entry('27-before-upload.svelte', '上传前校验', 'beforeUpload 异步校验（validating 中间态）返回富对象拦截大文件 + transformFile 转换（对齐 Semi）。'),
  entry('28-custom-drag-area.svelte', '自定义拖拽区', 'draggable + children 完全自定义拖拽区外观（对齐 Semi）。'),
  entry('29-min-max-size.svelte', '限制文件大小', 'maxSize / minSize 限制单文件体积（KB），超限标 validateFail 并触发 onSizeError（对齐 Semi）。'),
  entry('BasicDemo.svelte', '完整示例', '照片墙、校验态、beforeUpload 异步拦截、目录上传等高级用法。'),
];
