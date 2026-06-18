<!--
  Tabs — see specs/components/navigation/Tabs.spec.md
  基础子集：line/card 类型、top 位置、数据驱动 tabList + 声明式 TabPane、
  roving tabindex + 键盘、closable。
  TODO(延后): tabPosition left/right/bottom、overflow scroll/dropdown、
  lazy/destroyInactiveTabPane、addable、button 类型、renderTabBar、纯声明式自动收集标签。

  约束：声明式 TabPane 仅提供「内容」，标签栏始终由 tabList 数据驱动；
  使用声明式 TabPane 时同样需传 tabList 定义标签（避免挂载时写响应式数组 → render 期读取
  造成 effect_update_depth_exceeded 死循环，见红线 #2）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useId } from '@chenzy-design/core';
  import { setTabsContext } from './context.js';
  import type { TabItem } from './types.js';

  type TabKey = string | number;
  type TabType = 'line' | 'card';
  type TabSize = 'small' | 'default' | 'large';
  type KeyboardActivation = 'auto' | 'manual';

  interface Props {
    value?: TabKey;
    defaultValue?: TabKey;
    type?: TabType;
    size?: TabSize;
    tabList?: TabItem[];
    closable?: boolean;
    keyboardActivation?: KeyboardActivation;
    onChange?: (key: TabKey) => void;
    onTabClose?: (key: TabKey) => void;
    children?: Snippet;
  }

  let {
    value,
    defaultValue,
    type = 'line',
    size = 'default',
    tabList = [],
    closable = false,
    keyboardActivation = 'auto',
    onChange,
    onTabClose,
    children,
  }: Props = $props();

  const baseId = useId('cd-tabs');

  // --- 受控 value (红线 #1)：不无条件回写 value，仅 onChange ---
  const isControlled = $derived(value !== undefined);
  let inner = $state<TabKey | undefined>(getInitialValue());

  function getInitialValue(): TabKey | undefined {
    if (defaultValue !== undefined) return defaultValue;
    return tabList[0]?.itemKey;
  }

  const activeKey = $derived<TabKey | undefined>(isControlled ? value : inner);

  function setActive(key: TabKey) {
    if (key === activeKey) return;
    if (!isControlled) inner = key;
    onChange?.(key);
  }

  // 声明式 TabPane 通过 context 读取激活 key 决定显隐（红线 #2：getter，非数组注册）。
  setTabsContext({ getActiveKey: () => activeKey });

  function tabId(key: TabKey): string {
    return `${baseId}-tab-${key}`;
  }
  function panelId(key: TabKey): string {
    return `${baseId}-panel-${key}`;
  }

  function isClosable(item: TabItem): boolean {
    return item.closable ?? closable;
  }

  function onTabClick(item: TabItem) {
    if (item.disabled) return;
    setActive(item.itemKey);
  }

  function closeTab(e: MouseEvent, item: TabItem) {
    e.stopPropagation();
    if (item.disabled) return;
    onTabClose?.(item.itemKey);
  }

  // --- 键盘导航 (红线 #2)：roving tabindex 仅由 activeKey 决定，不读挂载数组 ---
  // tablist 内移动焦点到相邻未禁用 tab；auto 聚焦即激活，manual 需 Enter/Space。
  function enabledIndexes(): number[] {
    const out: number[] = [];
    for (let i = 0; i < tabList.length; i += 1) {
      if (!tabList[i]?.disabled) out.push(i);
    }
    return out;
  }

  function focusTab(index: number) {
    const item = tabList[index];
    if (!item) return;
    const el = document.getElementById(tabId(item.itemKey));
    el?.focus();
    if (keyboardActivation === 'auto') setActive(item.itemKey);
  }

  function onTabKeydown(e: KeyboardEvent, item: TabItem) {
    const enabled = enabledIndexes();
    if (enabled.length === 0) return;
    const currentIdx = enabled.indexOf(tabList.indexOf(item));
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        const next = enabled[(currentIdx + 1) % enabled.length];
        if (next !== undefined) focusTab(next);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        const prev = enabled[(currentIdx - 1 + enabled.length) % enabled.length];
        if (prev !== undefined) focusTab(prev);
        break;
      }
      case 'Home': {
        e.preventDefault();
        const first = enabled[0];
        if (first !== undefined) focusTab(first);
        break;
      }
      case 'End': {
        e.preventDefault();
        const lastIdx = enabled[enabled.length - 1];
        if (lastIdx !== undefined) focusTab(lastIdx);
        break;
      }
      case 'Enter':
      case ' ': {
        if (keyboardActivation === 'manual') {
          e.preventDefault();
          setActive(item.itemKey);
        }
        break;
      }
      default:
        break;
    }
  }

  const cls = $derived(
    ['cd-tabs', `cd-tabs--${type}`, `cd-tabs--${size}`].join(' '),
  );
</script>

<div class={cls}>
  <div class="cd-tabs__bar" role="tablist">
    {#each tabList as item (item.itemKey)}
      {@const selected = item.itemKey === activeKey}
      <div
        class="cd-tabs__tab"
        class:cd-tabs__tab--active={selected}
        class:cd-tabs__tab--disabled={item.disabled}
      >
        <button
          type="button"
          class="cd-tabs__tab-btn"
          role="tab"
          id={tabId(item.itemKey)}
          aria-selected={selected}
          aria-controls={panelId(item.itemKey)}
          tabindex={selected ? 0 : -1}
          disabled={item.disabled ?? false}
          onclick={() => onTabClick(item)}
          onkeydown={(e) => onTabKeydown(e, item)}
        >
          {item.tab}
        </button>
        {#if isClosable(item)}
          <button
            type="button"
            class="cd-tabs__close"
            aria-label={`关闭 ${item.tab}`}
            tabindex={selected ? 0 : -1}
            onclick={(e) => closeTab(e, item)}
          >
            <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M9.1 8l3.2-3.2-1.1-1.1L8 6.9 4.8 3.7 3.7 4.8 6.9 8l-3.2 3.2 1.1 1.1L8 9.1l3.2 3.2 1.1-1.1L9.1 8Z"
              />
            </svg>
          </button>
        {/if}
      </div>
    {/each}
  </div>

  {#if children}
    <div class="cd-tabs__content">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .cd-tabs {
    display: flex;
    flex-direction: column;
    font-size: var(--cd-tabs-tab-font-size);
  }
  .cd-tabs__bar {
    display: flex;
    flex-direction: row;
    align-items: stretch;
  }
  .cd-tabs--line .cd-tabs__bar {
    border-block-end: 1px solid var(--cd-tabs-bar-border);
  }
  .cd-tabs__tab {
    display: inline-flex;
    align-items: center;
    gap: var(--cd-spacing-1);
  }
  .cd-tabs--card .cd-tabs__tab {
    background: var(--cd-tabs-card-bg);
    border-radius: var(--cd-tabs-card-radius) var(--cd-tabs-card-radius) 0 0;
  }
  .cd-tabs--card .cd-tabs__tab--active {
    background: var(--cd-tabs-card-bg-active);
  }
  .cd-tabs__tab-btn {
    margin: 0;
    padding: var(--cd-tabs-tab-padding);
    border: none;
    background: transparent;
    color: var(--cd-tabs-tab-color);
    font: inherit;
    cursor: pointer;
    transition: color var(--cd-motion-duration-fast) var(--cd-motion-ease-standard);
  }
  .cd-tabs--line .cd-tabs__tab-btn {
    border-block-end: var(--cd-tabs-ink-height) solid transparent;
  }
  .cd-tabs__tab--active .cd-tabs__tab-btn {
    color: var(--cd-tabs-tab-color-active);
  }
  .cd-tabs--line .cd-tabs__tab--active .cd-tabs__tab-btn {
    border-block-end-color: var(--cd-tabs-ink-color);
  }
  .cd-tabs__tab-btn:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-1);
  }
  .cd-tabs__tab--disabled .cd-tabs__tab-btn {
    color: var(--cd-tabs-tab-color-disabled);
    cursor: not-allowed;
  }
  .cd-tabs__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-inline-end: var(--cd-spacing-2);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--cd-tabs-tab-color);
    cursor: pointer;
  }
  .cd-tabs__close:hover {
    color: var(--cd-tabs-tab-color-active);
  }
  .cd-tabs__close:focus-visible {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-radius-1);
  }
  .cd-tabs__content {
    padding-block-start: var(--cd-spacing-3);
  }
  @media (prefers-reduced-motion: reduce) {
    .cd-tabs__tab-btn {
      transition: none;
    }
  }
</style>
