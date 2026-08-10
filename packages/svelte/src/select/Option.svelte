<!--
  Select.Option — 组合式候选项声明（对齐 Semi Select.Option），与配置式
  `optionList` prop 并存（照本库 Tabs/TabPane、Steps/Step、Table/Column 双写法惯例）。
  不渲染任何可见 DOM：只把自身 props 注册进最近的收集器（<Select.OptGroup> 内则
  注册进组收集器，否则注册进 Select 根收集器），实际渲染委托 Select 内部 optionRow
  统一负责（含 activeIndex / 键盘 / 虚拟化等）。label 为必填 prop（Svelte snippet
  无法像 React.Children 那样同步读出 children 纯文本兜底，故不支持 Semi 的
  `label || children` 降级；同本库 TabPane 用显式 `tab` prop 而非 children 的做法）。

  children 若提供，写入 OptionData._content（Snippet 引用）随其余字段一并注册进收集器，
  由 optionRow 读出渲染为该行内容、替代默认纯文本 label（对齐 Semi `<Select.Option>
  {customContent}</Select.Option>` 用法，如头像+多行文本的自定义候选项）——并非丢弃，
  只是渲染权收拢到 optionRow 统一处理键盘/虚拟化/点击选中等横切逻辑。

  ...rest 透传任意额外数据字段（对齐 Semi `<Select.Option {...item}>` 的 JSX 属性展开）：
  Semi 的 Select.Option 是普通组件，未声明的 props 天然落进 optionNode，renderSelectedItem
  等回调因此能读到 avatar/email 等业务字段。Svelte 组件没有等价的隐式行为，需显式收集 rest
  写入 OptionData，才能让 renderSelectedTag/renderSelectedItem/renderOptionItem 里的 option
  参数拿到这些自定义字段。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getRootOptionsContext, getGroupOptionsContext } from './context.js';
  import type { OptionValue } from './types.js';

  interface Props {
    value: OptionValue;
    label: string;
    disabled?: boolean;
    /** 整行容器（.cd-select-option）的内联样式，对齐 Semi Select.Option style（挂 role=option 外层 div，非 children 内部）。 */
    style?: string;
    /** 整行容器（.cd-select-option）追加的类名，对齐 Semi Select.Option className。 */
    className?: string;
    /**
     * 是否显示选中对勾占位（对齐 Semi Select.Option showTick）。仅在提供 children 自定义渲染
     * 时生效——默认（无 children）路径本组件已恒为 true（对齐 Semi Select 内部 renderOption
     * 对配置式 optionList 每项强制 showTick 的行为，见 optionRow default 分支注释）；自定义
     * children 场景下 Semi Option 自身无默认值（未显式传即不显示 tick），此处对齐同一语义。
     */
    showTick?: boolean;
    children?: Snippet;
    [key: string]: unknown;
  }

  let { value, label, disabled, style, className, showTick, children, ...rest }: Props = $props();

  const groupCtx = getGroupOptionsContext();
  const rootCtx = getRootOptionsContext();
  const ctx = groupCtx ?? rootCtx;

  const buildData = () => ({
    value,
    label,
    ...(disabled !== undefined ? { disabled } : {}),
    ...(style !== undefined ? { _style: style } : {}),
    ...(className !== undefined ? { _className: className } : {}),
    ...(showTick !== undefined ? { _showTick: showTick } : {}),
    ...(children !== undefined ? { _content: children } : {}),
    ...rest,
  });

  const optId = ctx ? ctx.register(buildData()) : -1;

  $effect(() => {
    if (optId === -1 || !ctx) return;
    ctx.update(optId, buildData());
  });

  $effect(() => {
    return () => {
      if (optId !== -1 && ctx) ctx.unregister(optId);
    };
  });
</script>
