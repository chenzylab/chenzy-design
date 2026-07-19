<script lang="ts">
  import { Input } from '@chenzy-design/svelte';
  import { IconSearch } from '@chenzy-design/icons';
</script>

<div style="display:flex;flex-direction:column;gap:12px;max-width:320px">
  <!-- prefix：具名图标（对齐 Semi 前缀图标用法） -->
  <Input showClear placeholder="搜索">
    {#snippet prefix()}<IconSearch />{/snippet}
  </Input>
  <!-- prefix / suffix：文字单位 -->
  <Input placeholder="金额">
    {#snippet prefix()}
      <span style="color:var(--cd-color-text-2)">¥</span>
    {/snippet}
    {#snippet suffix()}
      <span style="color:var(--cd-color-text-2)">元</span>
    {/snippet}
  </Input>
</div>
