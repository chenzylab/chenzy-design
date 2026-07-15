<script lang="ts">
  import { Spin } from '@chenzy-design/svelte';
  import { IconLoading } from '@chenzy-design/icons';
</script>

<div style="margin-left:30px">
  <div>A spin with customized indicator.</div>
  <Spin>
    {#snippet indicator()}
      <IconLoading />
    {/snippet}
  </Spin>
</div>
