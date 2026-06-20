<!--
  Transfer — see specs/components/input/Transfer.spec.md
  Basic subset: type='list' two-column transfer, checkbox multi-select,
  move buttons, local search filter. Controlled / uncontrolled `value`.
  groupList: `dataSource` accepts grouped `{ title, items }[]` (or flat items
  with an optional `group` field) — each side renders group headers + items.
  TODO: treeList, draggable, virtualize, oneWay, remote onSearch.
-->
<script lang="ts">
  import Checkbox from '../checkbox/Checkbox.svelte';
  import Input from '../input/Input.svelte';
  import Button from '../button/Button.svelte';
  import { useLocale } from '../locale-provider/index.js';
  import type { TransferGroup, TransferItem, TransferRenderGroup } from './types.js';
  import { buildGroups, hasGroups, normalizeData } from './group.js';

  type TransferKey = string | number;
  type Size = 'small' | 'default' | 'large';
  type Status = 'default' | 'warning' | 'error';

  interface Props {
    value?: TransferKey[];
    defaultValue?: TransferKey[];
    dataSource?: TransferItem[] | TransferGroup[];
    filter?: boolean;
    searchPlaceholder?: string;
    size?: Size;
    status?: Status;
    disabled?: boolean;
    showPanelTitle?: boolean;
    titles?: [string, string];
    onChange?: (targetKeys: TransferKey[]) => void;
  }

  let {
    value,
    defaultValue = [],
    dataSource = [],
    filter = true,
    searchPlaceholder,
    size = 'default',
    status = 'default',
    disabled = false,
    showPanelTitle = true,
    titles,
    onChange,
  }: Props = $props();

  const loc = useLocale();

  const searchPlaceholderText = $derived(
    searchPlaceholder ?? loc().t('Transfer.searchPlaceholder'),
  );

  const isControlled = $derived(value !== undefined);
  let inner = $state<TransferKey[]>(getInitialValue());
  // Controlled (`value=`): parent owns the value; we never write the prop, only
  // propagate via `onChange`. Uncontrolled: keep our own state in sync.
  const current = $derived(isControlled ? (value ?? []) : inner);

  function getInitialValue(): TransferKey[] {
    return [...defaultValue];
  }

  // Local checked sets — purely local UI state, independent of `value`.
  let leftChecked = $state<TransferKey[]>([]);
  let rightChecked = $state<TransferKey[]>([]);

  // Local search queries — local UI state.
  let leftQuery = $state('');
  let rightQuery = $state('');

  // Normalize grouped `{ title, items }[]` or flat items into one flat list,
  // tagging each item with `group`. Backward compatible: flat data is untouched.
  const items = $derived(normalizeData(dataSource));
  const grouped = $derived(hasGroups(items));

  const leftItems = $derived(items.filter((item) => !current.includes(item.key)));
  const rightItems = $derived(items.filter((item) => current.includes(item.key)));

  function matches(label: string, query: string): boolean {
    return label.toLowerCase().includes(query.trim().toLowerCase());
  }

  const leftVisible = $derived(
    filter && leftQuery ? leftItems.filter((i) => matches(i.label, leftQuery)) : leftItems,
  );
  const rightVisible = $derived(
    filter && rightQuery ? rightItems.filter((i) => matches(i.label, rightQuery)) : rightItems,
  );

  // Render groups — pure derivations. Empty groups vanish because the input is
  // the post-filter visible list. Fallback bucket reuses the panel title.
  const sourceFallback = $derived(titles?.[0] ?? loc().t('Transfer.titleSource'));
  const targetFallback = $derived(titles?.[1] ?? loc().t('Transfer.titleTarget'));
  const leftGroups = $derived(buildGroups(leftVisible, sourceFallback));
  const rightGroups = $derived(buildGroups(rightVisible, targetFallback));

  /** Movable (non-disabled, checked) keys within one render group. */
  function groupMovable(
    side: 'left' | 'right',
    group: TransferRenderGroup,
  ): TransferKey[] {
    const checked = side === 'left' ? leftChecked : rightChecked;
    return group.items.filter((i) => !i.disabled && checked.includes(i.key)).map((i) => i.key);
  }

  /** Tri-state for a group's header checkbox. */
  function groupCheckState(
    side: 'left' | 'right',
    group: TransferRenderGroup,
  ): { checked: boolean; indeterminate: boolean } {
    const checked = side === 'left' ? leftChecked : rightChecked;
    const selectable = group.items.filter((i) => !disabled && !i.disabled);
    if (selectable.length === 0) return { checked: false, indeterminate: false };
    const picked = selectable.filter((i) => checked.includes(i.key)).length;
    return { checked: picked === selectable.length, indeterminate: picked > 0 && picked < selectable.length };
  }

  function toggleGroup(side: 'left' | 'right', group: TransferRenderGroup) {
    if (disabled) return;
    const keys = group.items.filter((i) => !i.disabled).map((i) => i.key);
    if (keys.length === 0) return;
    const checked = side === 'left' ? leftChecked : rightChecked;
    const allOn = keys.every((k) => checked.includes(k));
    const set = new Set(checked);
    if (allOn) keys.forEach((k) => set.delete(k));
    else keys.forEach((k) => set.add(k));
    if (side === 'left') leftChecked = [...set];
    else rightChecked = [...set];
  }

  function commit(next: TransferKey[]) {
    if (!isControlled) inner = next;
    onChange?.(next);
  }

  function toggleChecked(side: 'left' | 'right', key: TransferKey) {
    if (side === 'left') {
      leftChecked = leftChecked.includes(key)
        ? leftChecked.filter((k) => k !== key)
        : [...leftChecked, key];
    } else {
      rightChecked = rightChecked.includes(key)
        ? rightChecked.filter((k) => k !== key)
        : [...rightChecked, key];
    }
  }

  function moveToRight() {
    if (disabled) return;
    const movable = leftItems
      .filter((i) => !i.disabled && leftChecked.includes(i.key))
      .map((i) => i.key);
    if (movable.length === 0) return;
    commit([...current, ...movable]);
    leftChecked = [];
  }

  function moveToLeft() {
    if (disabled) return;
    const movable = rightItems
      .filter((i) => !i.disabled && rightChecked.includes(i.key))
      .map((i) => i.key);
    if (movable.length === 0) return;
    const remove = new Set(movable);
    commit(current.filter((k) => !remove.has(k)));
    rightChecked = [];
  }

  const moveRightDisabled = $derived(
    disabled ||
      leftItems.filter((i) => !i.disabled && leftChecked.includes(i.key)).length === 0,
  );
  const moveLeftDisabled = $derived(
    disabled ||
      rightItems.filter((i) => !i.disabled && rightChecked.includes(i.key)).length === 0,
  );

  const cls = $derived(
    ['cd-transfer', `cd-transfer--${size}`, `cd-transfer--${status}`, disabled && 'cd-transfer--disabled']
      .filter(Boolean)
      .join(' '),
  );
</script>

{#snippet itemRow(side: 'left' | 'right', item: TransferItem)}
  <li class="cd-transfer__item">
    <Checkbox
      {size}
      checked={(side === 'left' ? leftChecked : rightChecked).includes(item.key)}
      disabled={disabled || (item.disabled ?? false)}
      onChange={() => toggleChecked(side, item.key)}
    >
      {item.label}
    </Checkbox>
  </li>
{/snippet}

{#snippet panelList(side: 'left' | 'right', visible: TransferItem[], groups: TransferRenderGroup[])}
  <ul class="cd-transfer__list">
    {#if grouped}
      {#each groups as group (group.title)}
        {@const state = groupCheckState(side, group)}
        <li class="cd-transfer__group">
          <div class="cd-transfer__group-header">
            <Checkbox
              {size}
              checked={state.checked}
              indeterminate={state.indeterminate}
              disabled={disabled || group.items.every((i) => i.disabled)}
              onChange={() => toggleGroup(side, group)}
            >
              {group.title}
            </Checkbox>
            <span class="cd-transfer__group-count">{group.items.length}</span>
          </div>
          <ul class="cd-transfer__group-list">
            {#each group.items as item (item.key)}
              {@render itemRow(side, item)}
            {/each}
          </ul>
        </li>
      {:else}
        <li class="cd-transfer__empty">{loc().t('Transfer.empty')}</li>
      {/each}
    {:else}
      {#each visible as item (item.key)}
        {@render itemRow(side, item)}
      {:else}
        <li class="cd-transfer__empty">{loc().t('Transfer.empty')}</li>
      {/each}
    {/if}
  </ul>
{/snippet}

<div class={cls} role="group" aria-disabled={disabled || undefined}>
  <div class="cd-transfer__panel">
    {#if showPanelTitle}
      <div class="cd-transfer__panel-header">
        <span class="cd-transfer__panel-title">{titles?.[0] ?? loc().t('Transfer.titleSource')}</span>
        <span class="cd-transfer__panel-count">{loc().t('Transfer.itemsUnit', { count: leftItems.length })}</span>
      </div>
    {/if}
    {#if filter}
      <div class="cd-transfer__panel-search">
        <Input
          {size}
          value={leftQuery}
          placeholder={searchPlaceholderText}
          clearable
          disabled={disabled}
          ariaLabel={searchPlaceholderText}
          onInput={(v) => (leftQuery = v)}
        />
      </div>
    {/if}
    {@render panelList('left', leftVisible, leftGroups)}
  </div>

  <div class="cd-transfer__ops">
    <Button
      type="primary"
      size="small"
      ariaLabel={loc().t('Transfer.moveToRight')}
      disabled={moveRightDisabled}
      onclick={moveToRight}
    >
      &gt;
    </Button>
    <Button
      type="primary"
      size="small"
      ariaLabel={loc().t('Transfer.moveToLeft')}
      disabled={moveLeftDisabled}
      onclick={moveToLeft}
    >
      &lt;
    </Button>
  </div>

  <div class="cd-transfer__panel">
    {#if showPanelTitle}
      <div class="cd-transfer__panel-header">
        <span class="cd-transfer__panel-title">{titles?.[1] ?? loc().t('Transfer.titleTarget')}</span>
        <span class="cd-transfer__panel-count">{loc().t('Transfer.itemsUnit', { count: rightItems.length })}</span>
      </div>
    {/if}
    {#if filter}
      <div class="cd-transfer__panel-search">
        <Input
          {size}
          value={rightQuery}
          placeholder={searchPlaceholderText}
          clearable
          disabled={disabled}
          ariaLabel={searchPlaceholderText}
          onInput={(v) => (rightQuery = v)}
        />
      </div>
    {/if}
    {@render panelList('right', rightVisible, rightGroups)}
  </div>
</div>

<style>
  .cd-transfer {
    display: inline-flex;
    align-items: stretch;
    gap: var(--cd-transfer-gap);
    color: var(--cd-color-text-0);
  }
  .cd-transfer--disabled {
    opacity: 0.6;
  }
  .cd-transfer__panel {
    display: flex;
    flex-direction: column;
    inline-size: var(--cd-transfer-panel-width);
    block-size: var(--cd-transfer-panel-height);
    border: 1px solid var(--cd-transfer-panel-border);
    border-radius: var(--cd-transfer-panel-radius);
    overflow: hidden;
  }
  .cd-transfer__panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-block: var(--cd-spacing-2);
    padding-inline: var(--cd-spacing-3);
    background: var(--cd-transfer-panel-header-bg);
    border-block-end: 1px solid var(--cd-transfer-panel-border);
    font-weight: var(--cd-font-weight-medium);
  }
  .cd-transfer__panel-count {
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-1);
    font-weight: var(--cd-font-weight-regular);
  }
  .cd-transfer__panel-search {
    padding: var(--cd-spacing-2);
    border-block-end: 1px solid var(--cd-transfer-panel-border);
  }
  .cd-transfer__list {
    flex: 1 1 auto;
    margin: 0;
    padding: 0;
    list-style: none;
    overflow-y: auto;
  }
  .cd-transfer__item {
    display: flex;
    align-items: center;
    min-block-size: var(--cd-transfer-item-height);
    padding-inline: var(--cd-spacing-3);
  }
  .cd-transfer__item:hover {
    background: var(--cd-transfer-item-bg-hover);
  }
  .cd-transfer__group {
    display: block;
  }
  .cd-transfer__group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-block-size: var(--cd-transfer-item-height);
    padding-inline: var(--cd-spacing-3);
    background: var(--cd-transfer-panel-header-bg);
    font-weight: var(--cd-font-weight-medium);
  }
  .cd-transfer__group-count {
    color: var(--cd-color-text-2);
    font-size: var(--cd-font-size-1);
    font-weight: var(--cd-font-weight-regular);
  }
  .cd-transfer__group-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-transfer__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-block: var(--cd-spacing-4);
    color: var(--cd-color-text-3);
    font-size: var(--cd-font-size-1);
  }
  .cd-transfer__ops {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--cd-spacing-2);
  }
</style>
