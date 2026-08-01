<!--
  SideBarMCPConfigure — MCP 工具配置面板（P3）。see specs/components/show/SideBar.spec.md §4/§6/§9。
  外层复用 SideBarContainer 浮层壳（透传全部 Container props，title 默认走 i18n mcpConfigure）。
  内部结构（对齐 Semi mcpConfigure/content，但双列表并列展示而非 radio 二选一）：
    顶部计数（「已激活 MCP 数: N/总数」，对齐 Semi activeMCPNumber）+ 搜索框（Input，前缀放大镜 + aria-label）
    → 「内置工具」分组列表（options）
    → 「自定义工具」分组列表（customOptions），空态显示「添加自定义工具」按钮。
  每项：前置图标（string→img / Snippet）+ label + desc + 动作按钮（内置 configure=true 显示配置；
  自定义显示编辑）+ 启用开关（Switch，原生 role=switch + aria-checked，disabled 项锁定 + tooltip）。

  headless（core）：filterMcpOptions（搜索过滤，支持自定义 filter）/ toggleMcpOptionActive
  （切换 active 产出新数组，不改原数组）/ countActiveMcpOptions（计数）。本组件只持有
  受控输入值 inputValue（$state），列表/计数全为纯派生 → 无自建订阅、无 render 期写 state（§9.3）。

  受控（红线 #1）：options/customOptions/active 均受控，启用变化只经 onStatusChange 上抛
  产出的「下一份数组 + custom 标记」，绝不回写 prop（Switch 亦不 bind）。

  a11y（spec §6）：
  - 启用开关用本库 Switch（原生 <button role="switch"> + aria-checked），aria-label 走 i18n（含工具名）。
  - 搜索框 Input aria-label 走 i18n（mcpSearchLabel）。
  - 每个列表用 role="list" / 项 role="listitem"；动作按钮 aria-label 走 i18n（含工具名）。
  - 空态 / 无结果有文本提示。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    filterMcpOptions,
    toggleMcpOptionActive,
    countActiveMcpOptions,
  } from '@chenzy-design/core';
  import Input from '../input/Input.svelte';
  import Switch from '../switch/Switch.svelte';
  import { useLocale } from '../locale-provider/index.js';
  import SideBarContainer from './SideBarContainer.svelte';
  import type { SideBarMCPOption } from './types.js';

  interface Props {
    // —— Content props（对齐 Semi MCPConfigureContentReactProps）——
    /** 内置 MCP 工具列表（受控）。 */
    options?: SideBarMCPOption[];
    /** 自定义 MCP 工具列表（受控）。 */
    customOptions?: SideBarMCPOption[];
    /** 自定义搜索过滤谓词（覆盖默认 label/value 包含匹配）。 */
    filter?: (input: string, option: SideBarMCPOption) => boolean;
    /** 搜索占位（覆盖 i18n searchPlaceholder）。 */
    placeholder?: string;
    /** 搜索输入回调（input 值 + 当前是否聚焦自定义组，本组件双列表恒传 false）。 */
    onSearch?: (input: string, custom: boolean) => void;
    /** 启用/关闭变化回调：产出该组「下一份数组」+ custom 标记（不回写 prop）。 */
    onStatusChange?: (options: SideBarMCPOption[], custom: boolean) => void;
    /** 自定义组「添加」按钮回调。 */
    onAddClick?: (e: MouseEvent) => void;
    /** 内置工具「配置」按钮回调。 */
    onConfigureClick?: (e: MouseEvent, option: SideBarMCPOption) => void;
    /** 自定义工具「编辑」按钮回调。 */
    onEditClick?: (e: MouseEvent, option: SideBarMCPOption) => void;
    /** 自定义单项渲染（覆盖默认项，custom 标记该项来自自定义组）。 */
    renderItem?: Snippet<[{ option: SideBarMCPOption; custom: boolean }]>;

    // —— Container props（透传 SideBarContainer，MCPConfigure 继承 Container）——
    /** 是否可见（受控，不回写；仅经 onCancel 通知）。 */
    visible?: boolean;
    /** 标题（默认走 i18n mcpConfigure）。 */
    title?: string | Snippet;
    /** 关闭回调。 */
    onCancel?: (e: Event) => void;
    /** 动画结束后触发。 */
    afterVisibleChange?: (v: boolean) => void;
    /** 展开/收起动画。默认 true。 */
    motion?: boolean;
    /** 宽度可拖拽。默认 true。 */
    resizable?: boolean;
    /** 最小宽度。默认 150。 */
    minWidth?: string | number;
    /** 最大宽度。 */
    maxWidth?: string | number;
    /** 默认尺寸。 */
    defaultSize?: { width?: string | number; height?: string | number };
    /** 显示关闭按钮。默认 true。 */
    showClose?: boolean;
    /** 自定义头部（覆盖 title + 关闭按钮）。 */
    renderHeader?: Snippet;
    /** 面板自定义类名。 */
    class?: string;
    /** 面板自定义内联样式。 */
    style?: string;
  }

  let {
    options = [],
    customOptions = [],
    filter,
    placeholder,
    onSearch,
    onStatusChange,
    onAddClick,
    onConfigureClick,
    onEditClick,
    renderItem,
    visible,
    title,
    onCancel,
    afterVisibleChange,
    motion,
    resizable,
    minWidth,
    maxWidth,
    defaultSize,
    showClose,
    renderHeader,
    class: className,
    style,
  }: Props = $props();

  const loc = useLocale();

  // 受控搜索输入值（本组件唯一 $state；列表/计数纯派生自它 + props）。
  let inputValue = $state('');

  const resolvedTitle = $derived<string | Snippet>(
    title ?? loc().t('SideBar.mcpConfigure'),
  );
  const resolvedPlaceholder = $derived(
    placeholder ?? loc().t('SideBar.searchPlaceholder'),
  );

  // 过滤后的两组列表（纯派生）。
  const shownBuiltin = $derived(
    filterMcpOptions(inputValue, options, filter),
  );
  const shownCustom = $derived(
    filterMcpOptions(inputValue, customOptions, filter),
  );

  const activeCount = $derived(countActiveMcpOptions(options, customOptions));
  const totalCount = $derived(options.length + customOptions.length);
  // 对齐 Semi `{locale.activeMCPNumber} {activatedCount}/{总数}`：文案本身不含占位符，
  // 计数作为独立文本拼在后面（Semi zh 值就是「已激活 MCP 数:」）。
  const countLabel = $derived(
    `${loc().t('SideBar.activeMCPNumber')} ${activeCount}/${totalCount}`,
  );

  const hasCustom = $derived(customOptions.length > 0);
  const noResult = $derived(
    inputValue.trim().length > 0 &&
      shownBuiltin.length === 0 &&
      shownCustom.length === 0,
  );

  function handleSearch(v: string): void {
    inputValue = v;
    onSearch?.(v, false);
  }

  function handleStatusChange(
    option: SideBarMCPOption,
    next: boolean,
    custom: boolean,
  ): void {
    if (option.disabled) return;
    const source = custom ? customOptions : options;
    const nextList = toggleMcpOptionActive(source, option.value, next);
    onStatusChange?.(nextList, custom);
  }

  // 收集已定义键值，避免 exactOptionalPropertyTypes 下把显式 undefined 透传给
  // 不接受 undefined 的下游 props（SideBarContainer）。
  function definedOnly<T extends Record<string, unknown>>(
    obj: T,
  ): { [K in keyof T]?: Exclude<T[K], undefined> } {
    const out: { [K in keyof T]?: Exclude<T[K], undefined> } = {};
    for (const key of Object.keys(obj) as (keyof T)[]) {
      const v = obj[key];
      if (v !== undefined) out[key] = v as Exclude<T[typeof key], undefined>;
    }
    return out;
  }

  const containerProps = $derived(
    definedOnly({
      visible,
      onCancel,
      afterVisibleChange,
      motion,
      resizable,
      minWidth,
      maxWidth,
      defaultSize,
      showClose,
      renderHeader,
      style,
    }),
  );
</script>

<SideBarContainer
  {...containerProps}
  title={resolvedTitle}
  class={['cd-sidebar-mcp', className].filter(Boolean).join(' ')}
>
  <div class="cd-sidebar-mcp-count">{countLabel}</div>

  <div class="cd-sidebar-mcp-search">
  <Input
    value={inputValue}
    placeholder={resolvedPlaceholder}
    aria-label={loc().t('SideBar.mcpSearchLabel')}
    onInput={handleSearch}
  >
    {#snippet prefix()}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.3" />
        <path
          d="M10.5 10.5 14 14"
          stroke="currentColor"
          stroke-width="1.3"
          stroke-linecap="round"
        />
      </svg>
    {/snippet}
  </Input>
  </div>

  <!-- 内置工具组 -->
  <section class="cd-sidebar-mcp-group">
    <h3 class="cd-sidebar-mcp-group-title">
      {loc().t('SideBar.mcpBuiltinGroup')}
    </h3>
    {#if shownBuiltin.length > 0}
      <ul class="cd-sidebar-mcp-list" role="list">
        {#each shownBuiltin as option (option.value)}
          {@render itemRow(option, false)}
        {/each}
      </ul>
    {:else if !noResult}
      <div class="cd-sidebar-mcp-empty">
        {loc().t('SideBar.mcpEmptyBuiltin')}
      </div>
    {/if}
  </section>

  <!-- 自定义工具组 -->
  <section class="cd-sidebar-mcp-group">
    <div class="cd-sidebar-mcp-group-head">
      <h3 class="cd-sidebar-mcp-group-title">
        {loc().t('SideBar.mcpCustomGroup')}
      </h3>
      {#if hasCustom}
        <button
          type="button"
          class="cd-sidebar-mcp-add"
          aria-label={loc().t('SideBar.newMcpAdd')}
          title={loc().t('SideBar.newMcpAdd')}
          onclick={(e) => onAddClick?.(e)}
        >
          {@render plusIcon()}
        </button>
      {/if}
    </div>
    {#if shownCustom.length > 0}
      <ul class="cd-sidebar-mcp-list" role="list">
        {#each shownCustom as option (option.value)}
          {@render itemRow(option, true)}
        {/each}
      </ul>
    {:else if !hasCustom}
      <div class="cd-sidebar-mcp-empty cd-sidebar-mcp-empty-custom">
        <span>{loc().t('SideBar.emptyCustomMcpInfo')}</span>
        <button
          type="button"
          class="cd-sidebar-mcp-add-cta"
          onclick={(e) => onAddClick?.(e)}
        >
          {@render plusIcon()}
          <span>{loc().t('SideBar.newMcpAdd')}</span>
        </button>
      </div>
    {/if}
  </section>

  {#if noResult}
    <div class="cd-sidebar-mcp-empty">{loc().t('SideBar.mcpNoResult')}</div>
  {/if}
</SideBarContainer>

{#snippet plusIcon()}
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 3.5v9M3.5 8h9"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
{/snippet}

{#snippet itemRow(option: SideBarMCPOption, custom: boolean)}
  <li class="cd-sidebar-mcp-item" role="listitem">
    {#if renderItem}
      {@render renderItem({ option, custom })}
    {:else}
      {#if option.icon}
        {#if typeof option.icon === 'string'}
          <img
            class="cd-sidebar-mcp-icon"
            src={option.icon}
            alt=""
            aria-hidden="true"
          />
        {:else}
          <span class="cd-sidebar-mcp-icon">{@render option.icon()}</span>
        {/if}
      {:else}
        <span class="cd-sidebar-mcp-icon" aria-hidden="true"></span>
      {/if}

      <div class="cd-sidebar-mcp-content">
        <div class="cd-sidebar-mcp-label">{option.label}</div>
        {#if option.desc}
          <div class="cd-sidebar-mcp-desc">{option.desc}</div>
        {/if}
      </div>

      {#if option.configure}
        <button
          type="button"
          class="cd-sidebar-mcp-action"
          aria-label={loc().t('SideBar.mcpConfigureItem', { name: option.label })}
          title={loc().t('SideBar.mcpConfigureItem', { name: option.label })}
          onclick={(e) => onConfigureClick?.(e, option)}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.2" />
            <path
              d="M8 1.5v1.6M8 12.9v1.6M14.5 8h-1.6M3.1 8H1.5M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1M12.6 12.6l-1.1-1.1M4.5 4.5 3.4 3.4"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      {/if}

      {#if custom}
        <button
          type="button"
          class="cd-sidebar-mcp-action"
          aria-label={loc().t('SideBar.mcpEditItem', { name: option.label })}
          title={loc().t('SideBar.mcpEditItem', { name: option.label })}
          onclick={(e) => onEditClick?.(e, option)}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M11 2.5 13.5 5 5.5 13H3v-2.5L11 2.5Z"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      {/if}

      <span
        class="cd-sidebar-mcp-switch"
        {...option.disabled
          ? { title: loc().t('SideBar.defaultMcpInfo') }
          : {}}
      >
        <Switch
          checked={option.active ?? false}
          disabled={option.disabled ?? false}
          aria-label={loc().t('SideBar.mcpEnable', { name: option.label })}
          onChange={(v) => handleStatusChange(option, v, custom)}
        />
      </span>
    {/if}
  </li>
{/snippet}

<style>
  :global(.cd-sidebar-mcp .cd-sidebar-container-body) {
    display: flex;
    flex-direction: column;
    gap: var(--cd-sidebar-mcp-gap);
  }
  .cd-sidebar-mcp-count {
    color: var(--cd-sidebar-mcp-count-color);
    font-size: var(--cd-sidebar-mcp-count-size);
  }
  .cd-sidebar-mcp-search {
    inline-size: 100%;
  }
  .cd-sidebar-mcp-group {
    display: flex;
    flex-direction: column;
    gap: var(--cd-sidebar-mcp-item-gap);
  }
  .cd-sidebar-mcp-group-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .cd-sidebar-mcp-group-title {
    margin: 0;
    color: var(--cd-sidebar-mcp-group-title-color);
    font-size: var(--cd-sidebar-mcp-group-title-size);
    font-weight: var(--cd-font-weight-medium, 500);
  }
  .cd-sidebar-mcp-add {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 24px;
    block-size: 24px;
    padding: 0;
    border: none;
    border-radius: var(--cd-sidebar-close-radius);
    background: transparent;
    color: var(--cd-sidebar-mcp-action-color);
    cursor: pointer;
  }
  .cd-sidebar-mcp-add:hover {
    background: var(--cd-sidebar-mcp-action-hover-bg);
    color: var(--cd-sidebar-mcp-label-color);
  }
  .cd-sidebar-mcp-add:focus-visible,
  .cd-sidebar-mcp-action:focus-visible,
  .cd-sidebar-mcp-add-cta:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-sidebar-mcp-list {
    display: flex;
    flex-direction: column;
    gap: var(--cd-sidebar-mcp-item-gap);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-sidebar-mcp-item {
    display: flex;
    align-items: center;
    gap: var(--cd-sidebar-mcp-item-gutter);
    padding: var(--cd-sidebar-mcp-item-padding);
    border: 1px solid var(--cd-sidebar-mcp-item-border);
    border-radius: var(--cd-sidebar-mcp-item-radius);
    background: var(--cd-sidebar-mcp-item-bg);
  }
  .cd-sidebar-mcp-item:hover {
    background: var(--cd-sidebar-mcp-item-bg-hover);
  }
  .cd-sidebar-mcp-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-sidebar-mcp-icon-size);
    block-size: var(--cd-sidebar-mcp-icon-size);
    border-radius: var(--cd-sidebar-mcp-icon-radius);
    background: var(--cd-sidebar-mcp-icon-bg);
    color: var(--cd-sidebar-mcp-label-color);
    object-fit: cover;
    overflow: hidden;
  }
  .cd-sidebar-mcp-content {
    flex: 1;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .cd-sidebar-mcp-label {
    overflow: hidden;
    color: var(--cd-sidebar-mcp-label-color);
    font-size: var(--cd-sidebar-mcp-label-size);
    font-weight: var(--cd-font-weight-medium, 500);
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-sidebar-mcp-desc {
    overflow: hidden;
    color: var(--cd-sidebar-mcp-desc-color);
    font-size: var(--cd-sidebar-mcp-desc-size);
    /* Semi sidebar.scss:159 @include font-size-small → 16px */
    line-height: var(--cd-line-height-small);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .cd-sidebar-mcp-action {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    inline-size: 28px;
    block-size: 28px;
    padding: 0;
    border: none;
    border-radius: var(--cd-sidebar-close-radius);
    background: transparent;
    color: var(--cd-sidebar-mcp-action-color);
    cursor: pointer;
  }
  .cd-sidebar-mcp-action:hover {
    background: var(--cd-sidebar-mcp-action-hover-bg);
    color: var(--cd-sidebar-mcp-label-color);
  }
  .cd-sidebar-mcp-switch {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
  }
  .cd-sidebar-mcp-empty {
    padding: var(--cd-spacing-tight, 8px) 0;
    color: var(--cd-sidebar-mcp-empty-color);
    font-size: var(--cd-font-size-small);
    text-align: center;
  }
  .cd-sidebar-mcp-empty-custom {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--cd-spacing-tight, 8px);
  }
  .cd-sidebar-mcp-add-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px solid var(--cd-sidebar-mcp-item-border);
    border-radius: var(--cd-sidebar-mcp-item-radius);
    background: transparent;
    color: var(--cd-sidebar-mcp-label-color);
    font-size: var(--cd-font-size-small);
    cursor: pointer;
  }
  .cd-sidebar-mcp-add-cta:hover {
    background: var(--cd-sidebar-mcp-item-bg-hover);
  }
</style>
