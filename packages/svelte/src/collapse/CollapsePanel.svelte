<!--
  Collapse.Panel — 声明式单面板，与数据驱动 panels 渲染同一套 .cd-collapse__item 结构，
  从而复用父 Collapse 的 grid 展开动画、箭头位置、边框等全部 CSS，无需在父级建挂载 registry。
  父子状态经 context.ts 传递（参考 Timeline.Item / Form.Field）：
    展开态判断（isActive/shouldRender）为父级纯派生函数，本组件只读不写（红线 #2）；
    点击 header 调父 toggle，受控时仅 onChange 不回写（红线 #1，在父级落实）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getCollapseContext } from './context.js';

  interface Props {
    /** 面板唯一标识，等价数据驱动 panel.key。 */
    itemKey: string;
    /** 头部文本。 */
    header?: string;
    /** 面板级 disabled：该面板不可展开/收起。 */
    disabled?: boolean;
    /** 头部富内容插槽，优先于 header 文本。 */
    head?: Snippet;
    /** 头部右侧额外内容（不触发展开/收起），可为字符串或 Snippet。 */
    extra?: Snippet | string;
    /** 是否显示箭头区域，默认 true。 */
    showArrow?: boolean;
    children?: Snippet;
  }

  let { itemKey, header, disabled = false, head, extra, showArrow = true, children }: Props = $props();

  const ctx = getCollapseContext();

  // 展开态由父派生（纯函数），跨 context 读 getter 保持响应性。
  const active = $derived(ctx?.isActive(itemKey) ?? false);
  // 面板不可用 = 父整体 disabled 或本面板 disabled。
  const itemDisabled = $derived((ctx?.getDisabled() ?? false) || disabled);
  const render = $derived(ctx?.shouldRender(itemKey) ?? true);

  const idBase = $derived(ctx?.getIdBase() ?? 'cd-collapse');
  const headerId = $derived(`${idBase}-h-${itemKey}`);
  const regionId = $derived(`${idBase}-r-${itemKey}`);
  const headingLevel = $derived(ctx?.getHeadingLevel() ?? 3);
  // roving tabindex 由父派生（红线 #2：本组件只读不写父级 $state）。
  const tabindex = $derived(ctx?.headerTabindex(itemKey, disabled) ?? 0);
  const expandIcon = $derived(ctx?.getExpandIcon());
</script>

<div class="cd-collapse__item" class:cd-collapse__item--active={active}>
  <!-- APG Accordion：Header 触发器外层 role=heading + aria-level。 -->
  <span role="heading" aria-level={headingLevel} class="cd-collapse__heading">
  <button
    type="button"
    id={headerId}
    class="cd-collapse__header"
    data-collapse-key={itemKey}
    aria-expanded={active}
    aria-controls={regionId}
    aria-disabled={itemDisabled || undefined}
    disabled={itemDisabled || undefined}
    {tabindex}
    onclick={(e) => ctx?.headerClick(e, itemKey, disabled)}
    onkeydown={(e) => ctx?.onHeaderKeydown(e, itemKey)}
    onfocus={() => ctx?.onHeaderFocus(itemKey)}
  >
    {#if showArrow}
      {#if expandIcon}
        <span class="cd-collapse__arrow" class:cd-collapse__arrow--open={active} aria-hidden="true">
          {@render expandIcon({ isExpanded: active })}
        </span>
      {:else}
        <span class="cd-collapse__arrow" class:cd-collapse__arrow--open={active} aria-hidden="true">
          <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
            <path fill="currentColor" d="M6 4l4 4-4 4V4Z" />
          </svg>
        </span>
      {/if}
    {/if}
    <span class="cd-collapse__title">
      {#if head}{@render head()}{:else}{header}{/if}
    </span>
    {#if extra !== undefined}
      <span class="cd-collapse__extra" onclick={(e) => e.stopPropagation()} role="none">
        {#if typeof extra === 'string'}{extra}{:else}{@render extra()}{/if}
      </span>
    {/if}
  </button>
  </span>
  <div
    id={regionId}
    class="cd-collapse__region"
    role="region"
    aria-labelledby={headerId}
    hidden={!active}
  >
    <div class="cd-collapse__region-inner">
      <div class="cd-collapse__content">
        {#if render}
          {@render children?.()}
        {/if}
      </div>
    </div>
  </div>
</div>
