<script lang="ts">
  import { Transfer, Input, Spin, Button } from '@chenzy-design/svelte';
  import { IconSearch } from '@chenzy-design/icons';
  import type { TransferItem } from '@chenzy-design/svelte';

  const dataSource = Array.from({ length: 100 }, (_, i) => ({
    label: `海底捞门店 ${i}`,
    value: i,
    disabled: false,
    key: `key-${i}`,
  }));

  function renderItem(
    type: 'source' | 'selected',
    item: TransferItem,
    onItemAction: (item: TransferItem) => void,
    selectedItems?: Map<string | number, TransferItem>,
  ) {
    let buttonText = '删除';
    if (type === 'source') {
      const checked = selectedItems?.has(item.key) ?? false;
      buttonText = checked ? '删除' : '添加';
    }
    return { item, buttonText };
  }
</script>

<Transfer class="component-transfer-demo-custom-panel" dataSource={dataSource} onChange={(values) => console.log(values)}>
  {#snippet renderSourcePanel({ loading, noMatch, filterData, selectedItems, allChecked, onAllClick, inputValue, onSearch, onSelectOrRemove })}
    <section class="source-panel">
      <div class="panel-header sp-font">门店列表</div>
      <div class="panel-main">
        <Input style="width: 454px; margin: 12px 14px" onInput={onSearch} showClear>
          {#snippet prefix()}<IconSearch />{/snippet}
        </Input>
        <div class="panel-controls sp-font">
          <span>待选门店: {filterData.length}</span>
          <Button onclick={onAllClick} theme="borderless" size="small">
            {allChecked ? '取消全选' : '全选'}
          </Button>
        </div>
        <div class="panel-list">
          {#if loading}
            <Spin spinning />
          {:else if noMatch}
            <div class="empty sp-font">{inputValue ? '无搜索结果' : '暂无内容'}</div>
          {:else}
            {#each filterData as item (item.key)}
              {@const r = renderItem('source', item, onSelectOrRemove, selectedItems)}
              <div class="cd-transfer-item panel-item">
                <p>{r.item.label}</p>
                <Button
                  theme="borderless"
                  type="primary"
                  onclick={() => onSelectOrRemove(r.item)}
                  class="panel-item-remove"
                  size="small"
                >
                  {r.buttonText}
                </Button>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </section>
  {/snippet}
  {#snippet renderSelectedPanel({ selectedData, onClear, onRemove })}
    <section class="selected-panel">
      <div class="panel-header sp-font">
        <div>已选同步门店: {selectedData.length}</div>
        <Button theme="borderless" type="primary" onclick={onClear} size="small">清空</Button>
      </div>
      <div class="panel-main">
        {#if !selectedData.length}
          <div class="empty sp-font">暂无数据，请从左侧筛选</div>
        {:else}
          {#each selectedData as item (item.key)}
            {@const r = renderItem('selected', item, onRemove)}
            <div class="cd-transfer-item panel-item">
              <p>{r.item.label}</p>
              <Button
                theme="borderless"
                type="primary"
                onclick={() => onRemove(r.item)}
                class="panel-item-remove"
                size="small"
              >
                {r.buttonText}
              </Button>
            </div>
          {/each}
        {/if}
      </div>
    </section>
  {/snippet}
</Transfer>

<style>
  :global(.component-transfer-demo-custom-panel) .sp-font {
    color: var(--cd-color-grey-9);
    font-size: 12px;
    font-weight: 500;
    line-height: 20px;
  }
  :global(.component-transfer-demo-custom-panel) .empty {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  :global(.component-transfer-demo-custom-panel) .panel-item {
    flex-shrink: 0;
    height: 56px;
    border-radius: 4px;
    padding: 8px 12px;
    flex-wrap: wrap;
    background-color: rgba(22, 24, 35, 0.03);
    display: flex;
    align-items: center;
  }
  :global(.component-transfer-demo-custom-panel) .panel-item p {
    margin: 0 12px;
    flex-basis: 100%;
  }
  :global(.component-transfer-demo-custom-panel .panel-item-remove) {
    cursor: pointer;
    color: var(--cd-color-primary);
  }
  :global(.component-transfer-demo-custom-panel) .panel-header {
    padding: 10px 12px;
    border: 1px solid rgba(22, 24, 35, 0.16);
    border-radius: 4px 4px 0 0;
    height: 38px;
    box-sizing: border-box;
    background-color: var(--cd-color-fill-1);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  :global(.component-transfer-demo-custom-panel) .source-panel {
    display: flex;
    flex-direction: column;
    width: 482px;
    height: 353px;
    margin-right: 16px;
  }
  :global(.component-transfer-demo-custom-panel) .source-panel .panel-main {
    border: 1px solid var(--cd-color-border);
    border-top: none;
  }
  :global(.component-transfer-demo-custom-panel) .source-panel .panel-list {
    display: flex;
    flex-wrap: wrap;
    row-gap: 8px;
    column-gap: 8px;
    overflow-y: auto;
    height: 214px;
    margin-left: 12px;
    margin-right: 12px;
    padding-bottom: 8px;
  }
  :global(.component-transfer-demo-custom-panel) .source-panel .panel-controls {
    margin: 10px 12px;
    font-size: 12px;
    line-height: 20px;
  }
  :global(.component-transfer-demo-custom-panel) .source-panel .panel-item {
    width: 176px;
  }
  :global(.component-transfer-demo-custom-panel) .selected-panel {
    width: 200px;
    height: 353px;
  }
  :global(.component-transfer-demo-custom-panel) .selected-panel .panel-main {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 12px;
    border: 1px solid var(--cd-color-border);
    border-top: none;
    height: 323px;
    box-sizing: border-box;
    row-gap: 8px;
  }
</style>
