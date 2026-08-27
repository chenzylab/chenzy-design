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
  import { throttle } from 'lodash-es';
  import {
    filterMcpOptions,
    toggleMcpOptionActive,
    countActiveMcpOptions,
  } from '@chenzy-design/core';
  import { IconEdit, IconMinus, IconPlus, IconSearch, IconSetting } from '@chenzy-design/icons';
  import {
    IllustrationNoContent,
    IllustrationNoContentDark,
  } from '@chenzy-design/illustrations';
  import Input from '../input/Input.svelte';
  import { Button } from '../button/index.js';
  import Empty from '../empty/Empty.svelte';
  import { Radio, RadioGroup } from '../radio/index.js';
  import Tooltip from '../tooltip/Tooltip.svelte';
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

  const isCustomMode = $derived(mcpMode === 'custom');
  const sourceOptions = $derived(isCustomMode ? customOptions : options);

  // 对齐 Semi state.showOptions（mcpCofContentFoundation.ts updateShowOptions）：只维护
  // 「当前模式的那一份」过滤结果，且更新经 lodash throttle(300) 节流——本库原来是纯 $derived
  // 每次按键立即刷新，Semi 每 300ms 才刷新一次。节流函数只创建一次（跨调用保持时间窗口），
  // 在受影响的输入变化时命令式调用（红线 #3：不在 $derived/$effect 里做有副作用的节流）。
  // svelte-ignore state_referenced_locally
  let showOptions = $state<SideBarMCPOption[]>(sourceOptions);
  const updateShowOptions = throttle((value: string, source: SideBarMCPOption[]) => {
    showOptions = filterMcpOptions(value, source, filter);
  }, 300);
  $effect(() => () => updateShowOptions.cancel());
  $effect(() => {
    updateShowOptions(inputValue, sourceOptions);
  });

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

  function handleSearch(v: string): void {
    inputValue = v;
    // custom 标记随当前模式（本库原来双列表并列，这里恒传 false，语义丢了）。
    onSearch?.(v, isCustomMode);
  }

  // 对齐 Semi handleModeChange（mcpCofContentFoundation.ts:75-80）：切模式只换源列表，
  // 不清空 inputValue——沿用当前搜索词对新模式的源列表重新过滤（本库原来会清空搜索词，
  // Semi 没有这个行为，已移除）。
  function handleModeChange(next: 'inner' | 'custom'): void {
    mcpMode = next;
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
         此时连搜索框都不渲染）。Semi 用 Empty + IllustrationNoContent(Dark) 插画，
         本库原来只是纯文字，没有用 Empty 组件也没有插画。 -->
    <Empty
      class="cd-sidebar-mcp-configure-content-custom-empty"
      description={loc().t('SideBar.emptyCustomMcpInfo')}
      imageSlot={emptyImage}
      darkModeImageSlot={emptyImageDark}
    >
      <Button theme="solid" type="primary" onclick={(e) => onAddClick?.(e)}>
        {#snippet icon()}<IconPlus />{/snippet}
        {loc().t('SideBar.newMcpAdd')}
      </Button>
    </Empty>
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
       -item-container 一层，没有分组标题，无匹配结果时就是空列表，没有提示文案；
       本库原来自造了 noResult 分支渲染「无结果」提示，Semi 没有，已移除）。 -->
  {#if !showCustomEmpty}
    <ul class="cd-sidebar-mcp-configure-content-item-container" role="list">
      {#each showOptions as option (option.value)}
        {@render itemRow(option, isCustomMode)}
      {/each}
    </ul>
  {/if}
</SideBarContainer>

{#snippet emptyImage()}
  <IllustrationNoContent style="width: 150px; height: 150px;" />
{/snippet}
{#snippet emptyImageDark()}
  <IllustrationNoContentDark style="width: 150px; height: 150px;" />
{/snippet}

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
        <!-- Semi 用 Button(theme=borderless type=tertiary) + 具名 IconSetting
             （mcpConfigure/content.tsx），本库原为裸 button + 手写 svg。 -->
        <Button
          class="cd-sidebar-mcp-configure-content-item-button cd-sidebar-mcp-configure-content-item-button-configure"
          theme="borderless"
          type="tertiary"
          aria-label={loc().t('SideBar.mcpConfigureItem', { name: option.label })}
          onclick={(e) => onConfigureClick?.(e, option)}
        >
          {#snippet icon()}<IconSetting />{/snippet}
        </Button>
      {/if}

      {#if custom}
        <!-- Semi 用具名 IconEdit（mcpConfigure/content.tsx），本库原为手写 svg。 -->
        <Button
          class="cd-sidebar-mcp-configure-content-item-button cd-sidebar-mcp-configure-content-item-button-configure"
          theme="borderless"
          type="tertiary"
          aria-label={loc().t('SideBar.mcpEditItem', { name: option.label })}
          onclick={(e) => onEditClick?.(e, option)}
        >
          {#snippet icon()}<IconEdit />{/snippet}
        </Button>
      {/if}

      <!-- 对齐 Semi renderStatusButton：Button(theme=active?light:solid type=primary +
           IconMinus/IconPlus) 而非开关组件；disabled 项用 Tooltip 包裹（非裸 title）。 -->
      {#if option.disabled}
        <Tooltip content={loc().t('SideBar.defaultMcpInfo')}>
          {@render statusButtonSnippet(option, custom)}
        </Tooltip>
      {:else}
        {@render statusButtonSnippet(option, custom)}
      {/if}
    {/if}
  </li>
{/snippet}

{#snippet statusButtonSnippet(option: SideBarMCPOption, custom: boolean)}
  <Button
    class="cd-sidebar-mcp-configure-content-item-button"
    theme={option.active ? 'light' : 'solid'}
    type="primary"
    disabled={option.disabled ?? false}
    aria-label={loc().t('SideBar.mcpEnable', { name: option.label })}
    onclick={() => handleStatusChange(option, !option.active, custom)}
  >
    {#snippet icon()}
      {#if option.active}<IconMinus />{:else}<IconPlus />{/if}
    {/snippet}
  </Button>
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
  .cd-sidebar-mcp-configure-content-item-container {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  /* 对齐 Semi sidebar.scss:129-133：扁平行 + 一条 border-bottom 分隔，无边框/圆角/背景色
     （本库原来在裸 item 上手造了整套卡片视觉——边框/圆角/底色/悬浮底色，Semi 没有）。
     图标容器 -sign 同样只有尺寸+间距，Semi 没有背景色/圆角（本库原来自造了灰色方块）。 */
  .cd-sidebar-mcp-configure-content-item {
    display: flex;
    align-items: center;
    padding: var(--cd-sidebar-mcp-item-padding-y) var(--cd-sidebar-mcp-item-padding-x);
    border-block-end: var(--cd-width-sidebar-mcp-item-border-bottom) solid
      var(--cd-color-sidebar-mcp-item-border-bottom);
  }
  .cd-sidebar-mcp-configure-content-item-sign {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-sidebar-mcp-item-sign);
    block-size: var(--cd-sidebar-mcp-item-sign);
    margin-inline-end: var(--cd-sidebar-mcp-item-sign-margin-right);
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
  /* Semi sidebar.scss:167-178：&-item-button 只覆盖 flex-shrink + icon-only 专属尺寸
     （&.semi-button.semi-button-with-icon-only { width/height }），圆角/背景/hover/颜色
     全部由 Button 组件自身承担。本库原来在裸 button 上手造了整套视觉去模拟 Button——
     现在真用 Button 组件了，这些都是多余的。 */
  :global(.cd-sidebar-mcp-configure-content-item-button) {
    flex-shrink: 0;
  }
  :global(.cd-sidebar-mcp-configure-content-item-button.cd-button-with-icon-only) {
    /* Semi $width-sidebar_mcp_item_button = 24px（本库原来是自造的 28px）。 */
    inline-size: var(--cd-sidebar-mcp-item-button);
    block-size: var(--cd-sidebar-mcp-item-button);
  }
  /* 配置/编辑按钮右外边距（对齐 Semi &-item-button-configure）。 */
  :global(.cd-sidebar-mcp-configure-content-item-button-configure) {
    margin-inline-end: var(--cd-sidebar-mcp-item-button-configure-margin-right);
  }
</style>
