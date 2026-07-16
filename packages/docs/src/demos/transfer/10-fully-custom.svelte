<script lang="ts">
  import { Transfer, Input } from '@chenzy-design/svelte';

  const data = Array.from({ length: 12 }, (_, i) => ({
    key: `${i}`,
    label: `选项 ${i}`,
  }));

  let value = $state<(string | number)[]>(['1', '2']);
</script>

<!-- 完全自定义渲染：renderSourcePanel 接管左侧、renderSelectedPanel 接管右侧 -->
<Transfer dataSource={data} {value} onChange={(keys) => (value = keys)}>
  {#snippet renderSourcePanel({ filterData, inputValue, onSearch, onSelectOrRemove, value: selected })}
    <section style="flex:1;display:flex;flex-direction:column;border-right:1px solid var(--cd-color-border)">
      <div style="padding:8px">
        <Input value={inputValue} placeholder="搜索" onInput={onSearch} />
      </div>
      <div style="flex:1;overflow:auto">
        {#each filterData as item (item.key)}
          <label style="display:flex;align-items:center;gap:8px;padding:6px 12px;cursor:pointer">
            <input type="checkbox" checked={selected.includes(item.key)} onchange={() => onSelectOrRemove(item)} />
            <span>{item.label}</span>
          </label>
        {/each}
      </div>
    </section>
  {/snippet}
  {#snippet renderSelectedPanel({ selectedData, onRemove, onClear })}
    <section style="flex:1;display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;padding:8px 12px;font-weight:600">
        <span>已选 {selectedData.length}</span>
        <button type="button" onclick={onClear} style="border:none;background:transparent;cursor:pointer;color:var(--cd-color-primary)">清空</button>
      </div>
      <div style="flex:1;overflow:auto">
        {#each selectedData as item (item.key)}
          <div style="display:flex;justify-content:space-between;padding:6px 12px">
            <span>{item.label}</span>
            <button type="button" onclick={() => onRemove(item)} style="border:none;background:transparent;cursor:pointer">✕</button>
          </div>
        {/each}
      </div>
    </section>
  {/snippet}
</Transfer>
