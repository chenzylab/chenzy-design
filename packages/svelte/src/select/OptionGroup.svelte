<!--
  Select.OptGroup — 组合式分组声明（对齐 Semi Select.OptGroup），与配置式
  `optionList` 分组写法（{ label, options }）并存。不渲染任何可见 DOM：向 Select
  根收集器注册自身、拿到「组内收集器」并 setContext 下发给自己的 <Select.Option>
  children（setContext 须 init 期完成，故 register 也在 init 期）。Semi 不支持
  分组嵌套分组，故本组件不再向下提供根收集器。
-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { getRootOptionsContext, setGroupOptionsContext } from './context.js';

  interface Props {
    label: string;
    children?: Snippet;
  }

  let { label, children }: Props = $props();

  const rootCtx = getRootOptionsContext();
  // 初始化期注册用初始 label（对齐 Table Column.svelte 的 register 模式）；
  // label 后续变化由下方 effect 里的 updateGroupLabel 同步给父收集器。
  const reg = rootCtx ? rootCtx.registerGroup(untrack(() => label)) : undefined;
  if (reg) setGroupOptionsContext(reg.collector);

  $effect(() => {
    if (!reg || !rootCtx) return;
    rootCtx.updateGroupLabel(reg.id, label);
  });

  $effect(() => {
    return () => {
      if (reg && rootCtx) rootCtx.unregisterGroup(reg.id);
    };
  });
</script>

{#if children}{@render children()}{/if}
