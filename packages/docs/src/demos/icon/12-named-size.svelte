<script lang="ts">
  // Icon 封装 size 属性：extra-small(8) / small(12) / default(16) / large(20) / extra-large(24)，
  // size='inherit' 时继承上下文字号（对齐 Semi）。
  import {
    IconSearch,
    IconHelpCircle,
    IconAlertCircle,
    IconMinusCircle,
    IconPlusCircle,
    IconPlus,
    IconRefresh,
  } from '@chenzy-design/icons';
  import type { Component } from 'svelte';

  const types: Component[] = [
    IconSearch,
    IconHelpCircle,
    IconAlertCircle,
    IconMinusCircle,
    IconPlusCircle,
    IconPlus,
    IconRefresh,
  ];
  const sizes = ['extra-small', 'small', 'default', 'large', 'extra-large'] as const;
</script>

<div style="display: flex; flex-direction: column; gap: 8px;">
  {#each types as IconComp}
    <div style="display: flex; gap: 16px; align-items: center;">
      {#each sizes as size}
        <IconComp {size} />
      {/each}
    </div>
  {/each}
</div>
