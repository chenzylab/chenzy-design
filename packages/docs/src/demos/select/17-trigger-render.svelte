<script lang="ts">
  import { Select } from '@chenzy-design/svelte';

  let val = $state<string | number | undefined>('a');
  const optionList = [
    { label: '选项 A', value: 'a' },
    { label: '选项 B', value: 'b' },
    { label: '选项 C', value: 'c' },
  ];
</script>

<div style="max-width:280px">
  <!-- triggerRender：完全自定义触发器；复用 params 的 open/toggle/onTriggerKeydown 保持键盘可达 -->
  <Select {optionList} value={val} onChange={(v) => (val = v as string | number)}>
    {#snippet triggerRender({ selectedOptions, placeholder, open, toggle, onTriggerKeydown })}
      <button
        type="button"
        style="display:flex;align-items:center;gap:8px;padding:6px 12px;border:1px dashed var(--cd-color-primary);border-radius:6px;background:transparent;cursor:pointer"
        aria-haspopup="listbox"
        aria-expanded={open}
        onclick={toggle}
        onkeydown={onTriggerKeydown}
      >
        <span>🎯</span>
        <span>{selectedOptions[0]?.label ?? placeholder}</span>
      </button>
    {/snippet}
  </Select>
</div>
