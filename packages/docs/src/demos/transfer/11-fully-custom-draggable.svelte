<script lang="ts">
  import { Transfer, Input } from '@chenzy-design/svelte';
  import type { TransferItem } from '@chenzy-design/svelte';

  const data = Array.from({ length: 12 }, (_, i) => ({
    key: `${i}`,
    label: `选项 ${i}`,
  }));

  let value = $state<(string | number)[]>(['0', '1', '2', '3']);

  // 完全自定义右侧面板内的 HTML5 拖拽重排：把新顺序经 onSortEnd 上报。
  let dragKey = $state<string | number | null>(null);
  function reorder(keys: (string | number)[], from: string | number, to: string | number) {
    const next = keys.filter((k) => k !== from);
    const idx = next.indexOf(to);
    next.splice(idx, 0, from);
    return next;
  }
</script>

<Transfer dataSource={data} {value} draggable onChange={(keys) => (value = keys)}>
  {#snippet renderSourcePanel({ filterData, inputValue, onSearch, onSelectOrRemove, value: selected })}
    <section style="flex:1;display:flex;flex-direction:column;border-right:1px solid var(--cd-color-border)">
      <div style="padding:8px"><Input value={inputValue} placeholder="搜索" onInput={onSearch} /></div>
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
  {#snippet renderSelectedPanel({ selectedData, onSortEnd })}
    <section style="flex:1;display:flex;flex-direction:column">
      <div style="padding:8px 12px;font-weight:600">已选 {selectedData.length}（可拖拽）</div>
      <div style="flex:1;overflow:auto">
        {#each selectedData as item (item.key)}
          <div
            role="listitem"
            draggable="true"
            style="padding:6px 12px;cursor:grab"
            ondragstart={() => (dragKey = item.key)}
            ondragover={(e: DragEvent) => e.preventDefault()}
            ondrop={() => {
              if (dragKey != null && dragKey !== item.key) {
                onSortEnd(reorder(selectedData.map((d: TransferItem) => d.key), dragKey, item.key));
              }
              dragKey = null;
            }}
          >
            ⠿ {item.label}
          </div>
        {/each}
      </div>
    </section>
  {/snippet}
</Transfer>
