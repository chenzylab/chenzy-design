<!--
  Collapse.Panel — 单面板，对齐 Semi collapse/item.tsx 的 DOM 结构与 handleClick 逻辑。
  经 context 读父级展开态（isActive，纯派生只读，红线 #2）与配置；点击调父 onClick
  （受控仅 onChange 不回写，红线 #1，在父级落实）。content 用 <Collapsible> 原语做高度
  折叠/展开过渡（keepDOM / lazyRender / motion / reCalcKey 透传，红线 #3 由原语负责）。

  DOM 镜像 Semi：
    .cd-collapse-item (.cd-collapse-item-active)
      div.cd-collapse-header (role=button, tabindex=0, aria-expanded/-disabled/-owns)
        string header → <span>{header}</span> + .cd-collapse-header-right(<span>{extra}</span> + icon)
        node   header → icon(left) + {head} + icon(right)
      <Collapsible> .cd-collapse-content(aria-hidden, id) > .cd-collapse-content-wrapper
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import { IconChevronDown, IconChevronUp } from '@chenzy-design/icons';
  import Collapsible from '../collapsible/Collapsible.svelte';
  import { getCollapseContext } from './context.js';

  interface Props {
    /** 必填且唯一，选中状态匹配 activeKey / defaultActiveKey。 */
    itemKey: string;
    /** 面板头文本内容（string 时渲染 header-right + extra，对齐 Semi）。 */
    header?: string;
    /** 面板头富内容插槽（ReactNode 语义，优先于 header 文本；此时 extra 不单独渲染）。 */
    head?: Snippet;
    /** 自定义渲染右上角辅助内容（仅当 header 为 string、未用 head 时生效）。 */
    extra?: Snippet | string;
    /** 面板是否被禁用。 */
    disabled?: boolean;
    /** 是否展示箭头。 */
    showArrow?: boolean;
    /** reCalcKey 改变时重算内容高度（透传 Collapsible，动态内容用）。 */
    reCalcKey?: number | string;
    /** 动画结束回调。 */
    onMotionEnd?: () => void;
    /** 样式类名。 */
    class?: string;
    /** 内联 CSS 样式。 */
    style?: string;
    /** 面板内容。 */
    children?: Snippet;
  }

  let {
    itemKey,
    header,
    head,
    extra,
    disabled = false,
    showArrow = true,
    reCalcKey,
    onMotionEnd,
    class: className,
    style,
    children,
  }: Props = $props();

  const ctx = getCollapseContext();

  // 展开态由父派生（纯函数），跨 context 读 getter 保持响应性（红线 #2 只读）。
  const active = $derived(ctx?.isActive(itemKey) ?? false);
  const iconPosition = $derived(ctx?.getIconPosition() ?? 'right');
  const keepDOM = $derived(ctx?.getKeepDOM() ?? false);
  const motion = $derived(ctx?.getMotion() ?? true);
  const lazyRender = $derived(ctx?.getLazyRender() ?? false);
  const clickHeaderToExpand = $derived(ctx?.getClickHeaderToExpand() ?? true);
  const customExpandIcon = $derived(ctx?.getExpandIcon());
  const customCollapseIcon = $derived(ctx?.getCollapseIcon());

  // aria-owns 关联内容区（对齐 Semi ariaID）。
  const ariaID = useId('cd-collapse');

  // 图标是否「可用」（对齐 Semi expandIconEnable）：有内容且未禁用时，展开/收起切换两个图标；
  // 否则恒显 expandIcon 并加 -header-iconDisabled。
  const iconEnable = $derived(children !== undefined && !disabled);
  const iconPosLeft = $derived(iconPosition === 'left');

  // header-icon 引用：用于判定点击是否落在箭头上（clickHeaderToExpand=false 时仅箭头可触发）。
  let iconEl = $state<HTMLElement | null>(null);

  // 对齐 Semi handleClick：clickHeaderToExpand 或点击目标在 icon 内才触发切换。
  function handleClick(event: MouseEvent): void {
    if (disabled) return;
    if (clickHeaderToExpand || iconEl?.contains(event.target as Node)) {
      ctx?.onClick(itemKey, event);
    }
  }

  const itemCls = $derived(
    ['cd-collapse-item', active && 'cd-collapse-item-active', className]
      .filter(Boolean)
      .join(' '),
  );
  const headerCls = $derived(
    [
      'cd-collapse-header',
      disabled && 'cd-collapse-header-disabled',
      iconPosLeft && 'cd-collapse-header-iconLeft',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<!-- 默认展开图标（收起态显示）：IconChevronDown（对齐 Semi，两图标切换非 rotate）。 -->
{#snippet defaultExpand()}
  <IconChevronDown size="inherit" aria-hidden="true" />
{/snippet}
<!-- 默认折叠图标（展开态显示）：IconChevronUp（对齐 Semi，两图标切换非 rotate）。 -->
{#snippet defaultCollapse()}
  <IconChevronUp size="inherit" aria-hidden="true" />
{/snippet}

{#snippet iconSpan()}
  <span
    bind:this={iconEl}
    aria-hidden="true"
    class={['cd-collapse-header-icon', !iconEnable && 'cd-collapse-header-iconDisabled']
      .filter(Boolean)
      .join(' ')}
  >
    {#if iconEnable && active}
      {#if customCollapseIcon}{@render customCollapseIcon()}{:else}{@render defaultCollapse()}{/if}
    {:else if customExpandIcon}{@render customExpandIcon()}{:else}{@render defaultExpand()}{/if}
  </span>
{/snippet}

<div class={itemCls} {style}>
  <div
    role="button"
    tabindex={0}
    class={headerCls}
    aria-disabled={disabled}
    aria-expanded={active ? 'true' : 'false'}
    aria-owns={ariaID}
    onclick={handleClick}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(e as unknown as MouseEvent);
      }
    }}
  >
    {#if head}
      <!-- 富内容 header：icon 直接夹在 head 两侧（对齐 Semi node header 分支）。 -->
      {#if showArrow && iconPosLeft}{@render iconSpan()}{/if}
      {@render head()}
      {#if showArrow && !iconPosLeft}{@render iconSpan()}{/if}
    {:else}
      <!-- string header：header-right 承载 extra + icon（对齐 Semi string header 分支）。 -->
      {#if showArrow && iconPosLeft}{@render iconSpan()}{/if}
      <span>{header}</span>
      <span class="cd-collapse-header-right">
        {#if extra !== undefined}
          <span>{#if typeof extra === 'string'}{extra}{:else}{@render extra()}{/if}</span>
        {/if}
        {#if showArrow && !iconPosLeft}{@render iconSpan()}{/if}
      </span>
    {/if}
  </div>
  {#if children !== undefined}
    <Collapsible isOpen={active} {keepDOM} {motion} {lazyRender} {reCalcKey} {onMotionEnd}>
      <div class="cd-collapse-content" aria-hidden={!active} id={ariaID}>
        <div class="cd-collapse-content-wrapper">
          {@render children()}
        </div>
      </div>
    </Collapsible>
  {/if}
</div>
