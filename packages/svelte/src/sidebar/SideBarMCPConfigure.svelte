<!--
  SideBarMCPConfigure — MCP 工具配置面板（P3）。see specs/components/show/SideBar.spec.md §4/§6/§9。
  外层复用 SideBarContainer 浮层壳（透传全部 Container props，title 默认走 i18n mcpConfigure）。
  内部结构逐层对齐 Semi mcpConfigure/content：
    头部：RadioGroup(type=button) 在 INNER（MCP Servers）/ CUSTOM（自定义）两模式间切换
          + 已激活计数（「已激活 MCP 数: N/总数」，对齐 Semi activeMCPNumber）
    搜索区：INNER 只有搜索框；CUSTOM 且已有自定义项时，搜索框右侧多一个「新增」按钮；
            CUSTOM 且一条都没有时，整块换成空态 + 新增按钮（此时不渲染搜索框）
    列表：只渲染当前模式那一份（Semi 的 state.showOptions 只维护一份，不是两份并列）
  注：本库早期实现是「内置/自定义两个分组同屏堆叠」，没有模式概念，与 Semi 不符，已重写。
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
  import { IconPlus, IconSearch } from '@chenzy-design/icons';
  import Input from '../input/Input.svelte';
  import Switch from '../switch/Switch.svelte';
  import { Button } from '../button/index.js';
  import { Radio, RadioGroup } from '../radio/index.js';
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

  // 受控搜索输入值。
  let inputValue = $state('');
  // 当前模式（对齐 Semi state.mode，默认 INNER）：INNER 看内置 MCP、CUSTOM 看自定义 MCP。
  // Semi 用 RadioGroup(type=button) 在两者间切换，两模式渲染的列表/搜索区/按钮都不同。
  let mcpMode = $state<'inner' | 'custom'>('inner');

  const resolvedTitle = $derived<string | Snippet>(
    title ?? loc().t('SideBar.mcpConfigure'),
  );
  const resolvedPlaceholder = $derived(
    placeholder ?? loc().t('SideBar.searchPlaceholder'),
  );

  // 当前模式对应的源列表 + 过滤结果（对齐 Semi state.showOptions：
  // 它只维护「当前模式的那一份」，不是两份并列）。
  const isCustomMode = $derived(mcpMode === 'custom');
  const sourceOptions = $derived(isCustomMode ? customOptions : options);
  const showOptions = $derived(filterMcpOptions(inputValue, sourceOptions, filter));

  const activeCount = $derived(countActiveMcpOptions(options, customOptions));
  const totalCount = $derived(options.length + customOptions.length);
  // 对齐 Semi `{locale.activeMCPNumber} {activatedCount}/{总数}`：文案本身不含占位符，
  // 计数作为独立文本拼在后面（Semi zh 值就是「已激活 MCP 数:」）。
  const countLabel = $derived(
    `${loc().t('SideBar.activeMCPNumber')} ${activeCount}/${totalCount}`,
  );

  const hasCustom = $derived(customOptions.length > 0);
  // CUSTOM 模式且一条自定义都没有 → 走 Empty 空态（对齐 Semi renderSearch 的 else 分支）。
  const showCustomEmpty = $derived(isCustomMode && !hasCustom);
  const noResult = $derived(
    inputValue.trim().length > 0 && showOptions.length === 0 && !showCustomEmpty,
  );

  function handleSearch(v: string): void {
    inputValue = v;
    // custom 标记随当前模式（本库原来双列表并列，这里恒传 false，语义丢了）。
    onSearch?.(v, isCustomMode);
  }

  // 切模式时清空搜索：Semi 的 showOptions 由 mode 决定源列表，
  // 沿用上一个模式的搜索词会让人以为「新模式里没有匹配项」。
  function handleModeChange(next: 'inner' | 'custom'): void {
    if (next === mcpMode) return;
    mcpMode = next;
    inputValue = '';
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
  <!-- 头部：RadioGroup 切模式 + 已激活计数（对齐 Semi mcpConfigure/content.tsx:250-260）。
       本库原来没有模式概念，把内置/自定义当两个分组同屏堆叠，也没有这个头部。 -->
  <div class="cd-sidebar-mcp-configure-content-header">
    <RadioGroup
      type="button"
      value={mcpMode}
      onChange={(e) => handleModeChange(e.target.value as 'inner' | 'custom')}
    >
      <Radio value="inner">MCP Servers</Radio>
      <Radio value="custom">{loc().t('SideBar.newMcpAdd')}</Radio>
    </RadioGroup>
    <span class="cd-sidebar-mcp-configure-content-header-count">{countLabel}</span>
  </div>

  {#if showCustomEmpty}
    <!-- CUSTOM 模式且无自定义项：整块换成空态 + 添加按钮（对齐 Semi renderSearch 的 else 分支，
         此时连搜索框都不渲染）。 -->
    <div class="cd-sidebar-mcp-configure-content-custom-empty">
      <span>{loc().t('SideBar.emptyCustomMcpInfo')}</span>
      <Button theme="solid" type="primary" onclick={(e) => onAddClick?.(e)}>
        {#snippet icon()}<IconPlus />{/snippet}
        {loc().t('SideBar.newMcpAdd')}
      </Button>
    </div>
  {:else}
    <!-- Semi 同一个 div 上挂两个类：-search（外边距）与 -search-container（列间距），
         见 mcpConfigure/content.tsx:219。本库原来只有前者。
         INNER 模式只有搜索框；CUSTOM 模式搜索框右侧还有「新增」按钮。 -->
    <div
      class="cd-sidebar-mcp-configure-content-search cd-sidebar-mcp-configure-content-search-container"
    >
      <Input
        value={inputValue}
        placeholder={resolvedPlaceholder}
        aria-label={loc().t('SideBar.mcpSearchLabel')}
        onInput={handleSearch}
      >
        {#snippet prefix()}
          <IconSearch />
        {/snippet}
      </Input>
      {#if isCustomMode}
        <Button theme="solid" type="primary" onclick={(e) => onAddClick?.(e)}>
          {#snippet icon()}<IconPlus />{/snippet}
          {loc().t('SideBar.newMcpAdd')}
        </Button>
      {/if}
    </div>
  {/if}

  <!-- 单一列表：渲染当前模式对应的那一份（对齐 Semi renderContent —— 它只有
       -item-container 一层，没有分组标题）。 -->
  {#if !showCustomEmpty}
    <ul class="cd-sidebar-mcp-configure-content-item-container" role="list">
      {#each showOptions as option (option.value)}
        {@render itemRow(option, isCustomMode)}
      {/each}
    </ul>
    {#if noResult}
      <div class="cd-sidebar-mcp-empty">{loc().t('SideBar.mcpNoResult')}</div>
    {/if}
  {/if}
</SideBarContainer>


{#snippet itemRow(option: SideBarMCPOption, custom: boolean)}
  <li class="cd-sidebar-mcp-configure-content-item" role="listitem">
    {#if renderItem}
      {@render renderItem({ option, custom })}
    {:else}
      {#if option.icon}
        {#if typeof option.icon === 'string'}
          <img
            class="cd-sidebar-mcp-configure-content-item-sign"
            src={option.icon}
            alt=""
            aria-hidden="true"
          />
        {:else}
          <span class="cd-sidebar-mcp-configure-content-item-sign">{@render option.icon()}</span>
        {/if}
      {:else}
        <span class="cd-sidebar-mcp-configure-content-item-sign" aria-hidden="true"></span>
      {/if}

      <div class="cd-sidebar-mcp-configure-content-item-content">
        <div class="cd-sidebar-mcp-configure-content-item-content-label">{option.label}</div>
        {#if option.desc}
          <div class="cd-sidebar-mcp-configure-content-item-content-desc">{option.desc}</div>
        {/if}
      </div>

      {#if option.configure}
        <button
          type="button"
          class="cd-sidebar-mcp-configure-content-item-button cd-sidebar-mcp-configure-content-item-button-configure"
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
          class="cd-sidebar-mcp-configure-content-item-button cd-sidebar-mcp-configure-content-item-button-configure"
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
  :global(.cd-sidebar-mcp .cd-sidebar-container-content) {
    display: flex;
    flex-direction: column;
    gap: var(--cd-sidebar-mcp-gap);
  }
  .cd-sidebar-mcp-configure-content-header-count {
    color: var(--cd-sidebar-mcp-count-color);
    font-size: var(--cd-sidebar-mcp-count-size);
  }
  /* Semi &-search 只管外边距，&-search-container 管 flex + 列间距（两个类同挂一个 div）。 */
  .cd-sidebar-mcp-configure-content-search {
    inline-size: 100%;
    margin: var(--cd-sidebar-mcp-search-margin-y) var(--cd-sidebar-mcp-search-margin-x);
  }
  .cd-sidebar-mcp-configure-content-search-container {
    display: flex;
    column-gap: var(--cd-sidebar-mcp-search-container-column-gap);
  }
  .cd-sidebar-mcp-configure-content-item-button:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
  }
  .cd-sidebar-mcp-configure-content-item-container {
    display: flex;
    flex-direction: column;
    gap: var(--cd-sidebar-mcp-item-gap);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  /* padding / 图标间距取 Semi 值（$spacing-sidebar_mcp_item-paddingY|X、
     $spacing-sidebar_mcp_item_sign-marginRight）。
     边框/圆角/底色是本库的卡片观感 —— Semi 那边是扁平行 + 一条 border-bottom。 */
  .cd-sidebar-mcp-configure-content-item {
    display: flex;
    align-items: center;
    gap: var(--cd-sidebar-mcp-item-sign-margin-right);
    padding: var(--cd-sidebar-mcp-item-padding-y) var(--cd-sidebar-mcp-item-padding-x);
    border: 1px solid var(--cd-sidebar-mcp-item-border);
    border-radius: var(--cd-sidebar-mcp-item-radius);
    background: var(--cd-sidebar-mcp-item-bg);
  }
  .cd-sidebar-mcp-configure-content-item:hover {
    background: var(--cd-sidebar-mcp-item-bg-hover);
  }
  .cd-sidebar-mcp-configure-content-item-sign {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-sidebar-mcp-item-sign);
    block-size: var(--cd-sidebar-mcp-item-sign);
    border-radius: var(--cd-sidebar-mcp-icon-radius);
    background: var(--cd-sidebar-mcp-icon-bg);
    color: var(--cd-sidebar-mcp-label-color);
    object-fit: cover;
    overflow: hidden;
  }
  .cd-sidebar-mcp-configure-content-item-content {
    flex: 1;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .cd-sidebar-mcp-configure-content-item-content-label {
    overflow: hidden;
    color: var(--cd-sidebar-mcp-label-color);
    font-size: var(--cd-sidebar-mcp-label-size);
    font-weight: var(--cd-font-weight-medium, 500);
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .cd-sidebar-mcp-configure-content-item-content-desc {
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
  .cd-sidebar-mcp-configure-content-item-button {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    /* Semi $width-sidebar_mcp_item_button = 24px（本库原来是自造的 28px）。 */
    inline-size: var(--cd-sidebar-mcp-item-button);
    block-size: var(--cd-sidebar-mcp-item-button);
    padding: 0;
    border: none;
    border-radius: var(--cd-sidebar-close-radius);
    background: transparent;
    color: var(--cd-sidebar-mcp-action-color);
    cursor: pointer;
  }

  /* 配置/编辑按钮右外边距（对齐 Semi &-item-button-configure）。
     该 token 早就按 Semi 建好了，但没有任何消费方。 */
  .cd-sidebar-mcp-configure-content-item-button-configure {
    margin-right: var(--cd-sidebar-mcp-item-button-configure-margin-right);
  }
  .cd-sidebar-mcp-configure-content-item-button:hover {
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
  .cd-sidebar-mcp-configure-content-custom-empty {
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
