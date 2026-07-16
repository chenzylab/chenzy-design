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
  entry('01-basic.svelte', '基础用法', 'activeKey 受控，onChange 回调返回新 key；默认选中第一项。'),
  entry('02-type.svelte', '类型', '支持 line / card / button / slash 四种视觉风格。'),
  entry('03-size.svelte', '尺寸', 'small / medium / large 三档，默认 large。'),
  entry('04-icon.svelte', '带图标', '每个 Tab 可在文字前渲染图标（<Tabs.Pane icon={...}> 或 tabList 的 TabItem.icon）。'),
  entry('05-more.svelte', '更多收入 More', 'more 传数字，把末尾若干 Tab 收入「更多」下拉。'),
  entry('06-more-advanced.svelte', 'More 高级配置', 'more 传对象：count 控数量、render 自定义触发器、dropdownProps 透传下拉参数。'),
  entry('07-vertical.svelte', '垂直标签栏', 'tabPosition="left" 竖向标签栏，支持 line / card / button 三型。'),
  entry('08-collapsible.svelte', '滚动折叠', 'collapsible 横向溢出时显示前/后切换箭头，可滚动查看被裁切的标签。'),
  entry('09-render-arrow.svelte', '自定义滚动箭头', 'renderArrow 自定义折叠模式下的前/后切换箭头渲染。'),
  entry('10-arrow-position.svelte', '箭头位置', 'arrowPosition 控制折叠切换箭头渲染位置：start / both / end。'),
  entry('11-collapsible-auto.svelte', '自动溢出检测', 'collapsible="auto" 自动检测溢出，溢出才折叠，容器变宽/标签变少能全显时自动退出。'),
  entry('12-disabled.svelte', '禁用', '禁用标签栏中的某一个标签页。'),
  entry('13-extra.svelte', '标签栏内容扩展', 'tabBarExtraContent 在标签栏右侧添加附加操作。'),
  entry('14-render-tabbar.svelte', '标签栏二次封装', 'renderTabBar 完全自绘标签栏；面板内容仍按 activeKey 显隐。'),
  entry('15-dynamic.svelte', '动态更新', '通过绑定事件动态增删标签页。'),
  entry('16-closable.svelte', '关闭', '卡片样式支持关闭；单项 closable 控制是否可关，onTabClose 由父组件移除。'),
  entry('17-tablist.svelte', '数据驱动 tabList', '传 tabList 数组定义标签，内容由单节点按 activeKey 渲染（对齐 Semi 每次只渲染当前项）。'),
  entry('18-keepdom.svelte', 'keepDOM / lazyRender', 'keepDOM（默认 true）保留隐藏面板 DOM；lazyRender 仅激活过才挂载。'),
];
