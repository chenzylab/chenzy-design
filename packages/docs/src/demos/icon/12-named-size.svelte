<script lang="ts">
  // Icon 封装 size 属性：extra-small(8x8) / small(12x12) / default(16x16) /
  // large(20x20) / extra-large(24x24)；size='inherit' 时继承上下文字号。
  // 严格复刻 Semi：7 类图标 × 5 档尺寸，每行 marginBottom 4。
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

{#each types as IconComp}
  <div style="margin-bottom: 4px;">
    {#each sizes as size}
      <IconComp {size} />
    {/each}
  </div>
{/each}
