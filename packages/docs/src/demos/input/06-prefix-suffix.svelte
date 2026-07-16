<script lang="ts">
  import { Input } from '@chenzy-design/svelte';
</script>

<div style="display:flex;flex-direction:column;gap:12px;max-width:320px">
  <!-- prefix / suffix 在输入框内渲染前后缀内容（Snippet） -->
  <Input showClear placeholder="搜索">
    {#snippet prefix()}
      <span style="color:var(--cd-color-text-2)">🔍</span>
    {/snippet}
  </Input>
  <Input placeholder="金额">
    {#snippet prefix()}
      <span style="color:var(--cd-color-text-2)">¥</span>
    {/snippet}
    {#snippet suffix()}
      <span style="color:var(--cd-color-text-2)">元</span>
    {/snippet}
  </Input>
</div>
