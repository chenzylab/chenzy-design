<!--
  Column — 组合式列定义，配合 Table 使用（对齐 Semi Table.Column）。与配置式
  `columns` prop 并存（照本库 Tabs/TabPane、Steps/Step 双写法惯例）。

  <Column> 不渲染任何数据 DOM：只把自身 props 收集成与配置式 ColumnDef 等价的
  列树（经 context），喂给 Table 内部现有派生，渲染管道零改动。嵌套 <Column>
  即表头合并（父列 children）：本组件在初始化期向父收集器注册自身、拿到「自己
  名下的子列收集器」并 setContext 下发给它的 children（setContext 必须在 init 期，
  故 register 也在 init 期直接调用，而非 effect）。

  红线 #2：register 在 init 期一次（拿 id + 下发子收集器）；unregister 在 effect
  cleanup（unmount）；元数据同步在独立 effect（读响应式 props 写父收集器，去重）。
  均只写父收集器、不读父快照 → 无 effect 自循环。

  用 rest props 收集全部列字段（= Omit<ColumnDef,'children'>），避免逐字段手写
  遗漏（spec §4 契约）；ColumnDef 新增字段自动支持。children slot 是嵌套 Column
  的容器（被 Table 在隐藏宿主里 render 以触发子注册），不是 ColumnDef.children。
-->
<script lang="ts" generics="T extends Record<string, unknown>">
  import { type Snippet } from 'svelte';
  import {
    getColumnsContext,
    setColumnsContext,
    type ColumnRegistration,
  } from './context.js';

  let {
    children,
    ...rest
  }: ColumnRegistration<T> & { children?: Snippet } = $props();

  const ctx = getColumnsContext<T>();

  // rest 即列字段快照（title/dataIndex/width/fixed/render/sorter/filters... 全字段）。
  const buildReg = (): ColumnRegistration<T> => ({ ...rest }) as ColumnRegistration<T>;

  // 初始化期注册（setContext 须在 init 期，故 register 也在此）：拿 id + 子列收集器，
  // 把子收集器下发给本 Column 的 children，形成收集树。register 在 init 期跑一次。
  const colId = ctx ? ctx.register(buildReg()) : -1;
  if (ctx && colId !== -1) {
    setColumnsContext(ctx.getChildCollector(colId));
  }

  // unmount 时注销（effect cleanup）。
  $effect(() => {
    return () => {
      if (ctx && colId !== -1) ctx.unregister(colId);
    };
  });

  // 元数据变化 → 同步给父（独立 effect，读响应式 rest 并写父；update 内去重）。
  $effect(() => {
    if (colId === -1 || !ctx) return;
    ctx.update(colId, buildReg());
  });
</script>

{#if children}{@render children()}{/if}
