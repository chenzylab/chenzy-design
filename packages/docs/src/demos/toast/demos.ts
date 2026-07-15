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
  entry('01-basic.svelte', '普通提示', '调用 Toast 相关 method 弹出提示；推荐 stack 堆叠、Hover 展开，避免多条并列干扰。'),
  entry('02-types.svelte', '其他提示类型', '成功、失败、警告：Toast.success / warning / error。'),
  entry('03-theme.svelte', '多色样式', "theme='light' 浅色填充样式提高对比，默认 'normal' 白色模式。"),
  entry('04-link.svelte', '链接文本', '配合 Typography 自定义链接文本（content 支持 Snippet），适配更复杂场景。'),
  entry('05-duration.svelte', '修改延时', '自定义时长 10s，默认时长为 3s。'),
  entry('06-manual-close.svelte', '手动关闭', 'duration 设为 0 时不自动关闭，须经 Toast.close(id) 手动关闭。'),
  entry('07-update.svelte', '更新消息内容', '通过唯一的 id 对已存在 toast 原地更新内容与类型。'),
  entry('08-destroy-all.svelte', '销毁所有', 'Toast.destroyAll() 全局销毁全部 toast。'),
  entry('09-use-toast.svelte', '消费 Context', 'Toast.useToast 创建 contextHolder，toast 渲染在 ToastHolder 所在节点，继承其上下文。'),
  entry('10-factory.svelte', '创建不同配置', 'ToastFactory.create(config) 创建带独立 config 的新 Toast，如 getPopupContainer 指定容器。'),
  entry('11-options.svelte', '更多选项', 'textMaxWidth 限制内容宽度、showClose 隐藏关闭按钮、icon 自定义图标。'),
];
